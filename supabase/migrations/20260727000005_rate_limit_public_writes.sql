-- ============================================================================
-- ReCoffee — rate limits and size limits on the public write surface.
--
-- `inquiries` and `newsletter_subscribers` both had `with check (true)` insert
-- policies and no size limits on anything. Validation was client-side only (an
-- email regex and `trim`), so both were trivially scriptable: flood the admin
-- inbox, or fill the table with megabyte `message` bodies.
--
-- APPROACH, and why it is neither of the two LOOP.md suggested:
--
--   * "Enable Supabase's built-in CAPTCHA" does not apply. Supabase's CAPTCHA
--     setting protects the **auth** endpoints (signup, signin, recover); it does
--     nothing for arbitrary PostgREST table writes, which is what these forms
--     are. It would have been a control in the wrong place.
--   * An Edge Function rate-limiting by IP would work, but adds a second
--     runtime and a deploy step to a project that currently has none.
--
--   PostgREST forwards the request headers into Postgres, and behind Supabase's
--   Cloudflare front door `cf-connecting-ip` is set by the edge — a client
--   cannot forge it the way it can append to `x-forwarded-for`. So the limit is
--   enforced in the database, next to the constraints, with no new
--   infrastructure. Confirmed live before building: the header arrives.
--
-- The IP is stored only as a salted md5, never in the clear: this is spam
-- control, and it should not quietly become an IP log of everyone who uses the
-- contact form.
--
-- Idempotent, like every file in this directory: re-running it is safe.
-- ============================================================================


-- ============================================================================
-- 1. SIZE LIMITS
--
-- These hold regardless of the rate limiter — a single request should not be
-- able to carry a megabyte, and CHECK constraints apply to every role.
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'inquiries_name_length' and conrelid = 'inquiries'::regclass) then
    alter table inquiries add constraint inquiries_name_length
      check (length(name) between 1 and 120);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'inquiries_email_length' and conrelid = 'inquiries'::regclass) then
    alter table inquiries add constraint inquiries_email_length
      check (length(email) between 3 and 160);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'inquiries_phone_length' and conrelid = 'inquiries'::regclass) then
    alter table inquiries add constraint inquiries_phone_length
      check (phone is null or length(phone) <= 40);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'inquiries_company_length' and conrelid = 'inquiries'::regclass) then
    alter table inquiries add constraint inquiries_company_length
      check (company is null or length(company) <= 160);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'inquiries_message_length' and conrelid = 'inquiries'::regclass) then
    alter table inquiries add constraint inquiries_message_length
      check (message is null or length(message) <= 4000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'inquiries_details_size' and conrelid = 'inquiries'::regclass) then
    alter table inquiries add constraint inquiries_details_size
      check (details is null or pg_column_size(details) < 4096);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'newsletter_email_length' and conrelid = 'newsletter_subscribers'::regclass) then
    alter table newsletter_subscribers add constraint newsletter_email_length
      check (length(email) between 3 and 160);
  end if;
end
$$;


-- ============================================================================
-- 2. RATE LIMITER
-- ============================================================================

create table if not exists rate_limit_hits (
  id         bigint generated always as identity primary key,
  bucket     text not null,
  -- Salted md5 of the caller's IP, never the IP itself.
  client_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_lookup_idx
  on rate_limit_hits (bucket, client_key, created_at desc);

alter table rate_limit_hits enable row level security;

-- No policies at all, and no privileges: this table is touched exclusively by
-- the definer functions below. A client that could read it would learn who has
-- been submitting; one that could write it could evict its own limit.
revoke all on rate_limit_hits from anon, authenticated;

create or replace function public.rate_limit_client_key()
returns text
language sql
stable
security definer
set search_path = public
as $fn$
  select md5(
    'recoffee-rl-v1:' ||
    coalesce(
      -- Set by Cloudflare at the edge; a client cannot forge it.
      nullif(current_setting('request.headers', true)::jsonb ->> 'cf-connecting-ip', ''),
      -- Fallback for any deployment without that front door. The first token is
      -- the originating client; later ones are proxies.
      nullif(split_part(coalesce(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for', ''), ',', 1), ''),
      'unknown'
    )
  );
$fn$;

create or replace function public.enforce_rate_limit(
  p_bucket text,
  p_limit  int,
  p_window interval
)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_key   text := rate_limit_client_key();
  v_count int;
begin
  -- Prune this caller's expired hits only: indexed, tiny, and it keeps the
  -- window a true sliding window. Keys that go quiet are never revisited, so
  -- the table grows slowly — see the follow-up note in PROGRESS.md.
  delete from rate_limit_hits
  where bucket = p_bucket and client_key = v_key and created_at < now() - p_window;

  select count(*) into v_count
  from rate_limit_hits
  where bucket = p_bucket and client_key = v_key;

  if v_count >= p_limit then
    raise exception 'RATE_LIMITED'
      using detail = format('%s requests per %s', p_limit, p_window);
  end if;

  insert into rate_limit_hits (bucket, client_key) values (p_bucket, v_key);
end
$fn$;

revoke all on function public.rate_limit_client_key()                    from public;
revoke all on function public.enforce_rate_limit(text, int, interval)    from public;


-- ============================================================================
-- 3. THE ONLY WAY IN
-- ============================================================================

create or replace function public.submit_inquiry(
  p_type    text,
  p_name    text,
  p_email   text,
  p_phone   text default null,
  p_company text default null,
  p_message text default null,
  p_details jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  c_types constant text[] := array['contact', 'b2b', 'subscription'];
  v_name    text := nullif(btrim(coalesce(p_name, '')), '');
  v_email   text := lower(nullif(btrim(coalesce(p_email, '')), ''));
  v_phone   text := nullif(btrim(coalesce(p_phone, '')), '');
  v_company text := nullif(btrim(coalesce(p_company, '')), '');
  v_message text := nullif(btrim(coalesce(p_message, '')), '');
begin
  if p_type is null or p_type <> all (c_types) then
    raise exception 'INQUIRY_INVALID_TYPE';
  end if;

  if v_name is null or v_email is null then
    raise exception 'INQUIRY_MISSING_FIELDS';
  end if;

  -- Cheap sanity only. The address is not verified here; nothing downstream
  -- treats it as proven.
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'INQUIRY_INVALID_EMAIL';
  end if;

  if length(v_name) > 120
     or length(v_email) > 160
     or (v_phone is not null and length(v_phone) > 40)
     or (v_company is not null and length(v_company) > 160)
     or (v_message is not null and length(v_message) > 4000)
     or (p_details is not null and pg_column_size(p_details) >= 4096) then
    raise exception 'INQUIRY_TOO_LONG';
  end if;

  perform enforce_rate_limit('inquiry', 5, interval '1 hour');

  -- `status` is never accepted from the caller; it defaults to 'new'.
  insert into inquiries (type, name, company, email, phone, message, details)
  values (p_type, v_name, v_company, v_email, v_phone, v_message, p_details);
end
$fn$;

create or replace function public.subscribe_newsletter(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_email text := lower(nullif(btrim(coalesce(p_email, '')), ''));
begin
  if v_email is null
     or length(v_email) > 160
     or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'NEWSLETTER_INVALID_EMAIL';
  end if;

  perform enforce_rate_limit('newsletter', 5, interval '1 hour');

  -- NOTE: a duplicate still raises 23505 here, which is exactly the
  -- subscriber-enumeration leak T11 is about. Behaviour is deliberately
  -- unchanged in this commit so T10 is purely additive; T11 makes the response
  -- neutral.
  insert into newsletter_subscribers (email) values (v_email);
end
$fn$;

revoke all    on function public.submit_inquiry(text, text, text, text, text, text, jsonb) from public;
grant  execute on function public.submit_inquiry(text, text, text, text, text, text, jsonb) to anon, authenticated;

revoke all    on function public.subscribe_newsletter(text) from public;
grant  execute on function public.subscribe_newsletter(text) to anon, authenticated;


-- ============================================================================
-- 4. CLOSE THE DIRECT PATH
--
-- Same reasoning as T3: dropping the policy denies the write, revoking the
-- privilege means the right to attempt it never existed. Without this the
-- rate limiter is optional — a script would simply POST to the table.
-- ============================================================================

drop policy if exists "Anyone can create an inquiry" on inquiries;
drop policy if exists "Anyone can subscribe"         on newsletter_subscribers;

revoke insert on inquiries              from anon, authenticated;
revoke insert on newsletter_subscribers from anon, authenticated;
