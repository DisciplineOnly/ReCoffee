-- ============================================================================
-- ReCoffee — the subscription quote stops being the requester's to decide.
--
-- src/pages/Subscription.jsx used to send
-- `details.pricePerDelivery`, computed in the browser from a discount constant
-- that lives in the bundle. No money moves on an inquiry, so this was never a
-- payment defect — but `src/pages/admin/Inquiries.jsx` renders `details`
-- verbatim, and staff quote from what they read. A requester could name their
-- own price and have it read back to the person who would honour it.
--
-- The fix is to stop carrying the number at all. A subscription inquiry now
-- stores the *choice* — frequency and quantity, both validated against the ids
-- the page actually offers — and the price is derived from that wherever it is
-- displayed, from src/lib/subscription.js.
--
-- Projection, like place_order()'s treatment of client_info (20260727000011):
-- anything else in `details` for a subscription is dropped rather than stored.
-- `contact` and `b2b` inquiries are untouched; their `details` is already size
-- capped and carries no money.
--
-- Idempotent, like every file in this directory: re-running it is safe.
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
  -- Mirrors SUBSCRIPTION_FREQUENCIES / SUBSCRIPTION_QUANTITIES in
  -- src/lib/subscription.js. If a plan is added there, add it here or the
  -- request is refused.
  c_freqs constant text[] := array['weekly', 'biweekly', 'monthly'];
  c_sizes constant text[] := array['250', '500', '1000'];
  v_details jsonb;
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

  -- A subscription request carries a plan, not a quote. Validate the two ids
  -- and store only those: a `pricePerDelivery` in the payload — or anything
  -- else — does not reach the column, so the admin view has nothing
  -- attacker-controlled to read back as a price.
  if p_type = 'subscription' then
    if coalesce(p_details ->> 'frequency', '') <> all (c_freqs)
       or coalesce(p_details ->> 'quantity', '') <> all (c_sizes) then
      raise exception 'INQUIRY_INVALID_PLAN'
        using detail = 'frequency must be weekly|biweekly|monthly and quantity 250|500|1000';
    end if;

    v_details := jsonb_build_object(
      'frequency', p_details ->> 'frequency',
      'quantity',  p_details ->> 'quantity'
    );
  else
    v_details := p_details;
  end if;

  perform enforce_rate_limit('inquiry', 5, interval '1 hour');

  -- `status` is never accepted from the caller; it defaults to 'new'.
  insert into inquiries (type, name, company, email, phone, message, details)
  values (p_type, v_name, v_company, v_email, v_phone, v_message, v_details);
end
$fn$;
