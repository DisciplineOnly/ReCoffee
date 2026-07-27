-- ============================================================================
-- ReCoffee — the newsletter must not confirm who is already subscribed.
--
-- subscribe_newsletter() let the unique violation propagate, so a duplicate
-- came back as 23505 and a fresh address as 204. The Footer branched on that to
-- show "already subscribed" — which means anyone could test whether a given
-- address is on the subscriber list. That is an enumeration leak against the
-- shop's customers, not just against the shop.
--
-- `on conflict (email) do nothing` collapses both cases into one response:
-- HTTP 204, empty body, no error code. The distinction disappears from the
-- response path, not merely from the visible string — an attacker reads the
-- network tab, not the UI.
--
-- Timing is the same class either way: both paths do one index probe and one
-- (attempted) insert inside the same function, after the same rate-limit check.
-- This is not constant-time and does not claim to be; it is comfortably below
-- what is measurable across the public internet.
--
-- Idempotent, like every file in this directory: re-running it is safe.
-- ============================================================================

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

  -- The whole point: already-present and newly-inserted are indistinguishable
  -- to the caller. Do not "improve" this by returning whether a row was
  -- written.
  insert into newsletter_subscribers (email)
  values (v_email)
  on conflict (email) do nothing;
end
$fn$;

revoke all    on function public.subscribe_newsletter(text) from public;
grant  execute on function public.subscribe_newsletter(text) to anon, authenticated;
