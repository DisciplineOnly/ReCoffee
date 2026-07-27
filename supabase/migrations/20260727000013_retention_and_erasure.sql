-- ============================================================================
-- ReCoffee — retention and erasure.
--
-- The privacy policy (src/data/legalContent.js) already promises two things the
-- schema could not deliver:
--
--   §6 "оттегляне на съгласието по всяко време (за бюлетина — чрез линка за
--       отписване или на имейла ни)" — withdrawal of consent via **the
--       unsubscribe link**. There was no link, no route, and no way off the
--       list: `newsletter_subscribers` was insert-only with an admin-read
--       policy and no delete path for anyone.
--
--   §6 "изтриване („правото да бъдеш забравен“), когато няма законово основание
--       за съхранение" — erasure where no legal basis for retention remains.
--       `orders.client_info` held name, email, phone and address indefinitely
--       with no mechanism to remove them.
--
-- §4 is what shapes the second half: order data is retained for as long as
-- accounting and tax law require (up to 11 years for primary accounting
-- documents). So an erasure must **not** delete the order — it removes the
-- person from the financial record and leaves the record.
--
-- Idempotent, like every file in this directory: re-running it is safe.
-- ============================================================================


-- ── newsletter: a way off the list ──────────────────────────────────────────
-- The token is a per-row capability, not a signature over the email: it can be
-- rotated for one subscriber without touching the rest, and deleting the row
-- invalidates it, which is what makes the link single-use.
alter table newsletter_subscribers
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists newsletter_subscribers_token_idx
  on newsletter_subscribers(unsubscribe_token);

create or replace function public.unsubscribe_newsletter(p_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  -- Deliberately silent about the outcome, for the same reason
  -- subscribe_newsletter() is (20260727000006): a caller who can tell "this
  -- token was live" from "this token never existed" can probe the list. A
  -- second click on the same link is indistinguishable from the first.
  if p_token is null then
    return;
  end if;

  delete from newsletter_subscribers where unsubscribe_token = p_token;
end
$fn$;

revoke all    on function public.unsubscribe_newsletter(uuid) from public;
grant  execute on function public.unsubscribe_newsletter(uuid) to anon, authenticated;


-- ── orders: erase the person, keep the record ───────────────────────────────
alter table orders add column if not exists pii_erased_at timestamptz;
alter table orders add column if not exists pii_erased_by uuid;

create or replace function public.erase_order_pii(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_status   text;
  v_delivery jsonb;
begin
  -- Definer functions run as their owner, so the admin check has to be explicit
  -- — RLS is not consulted for the UPDATE below.
  if not is_admin() then
    raise exception 'ERASE_NOT_PERMITTED';
  end if;

  select status,
         -- `type` and `courier` are logistics, not personal data, and the
         -- financial record reads better with them. The address, the office and
         -- the city go.
         jsonb_strip_nulls(jsonb_build_object(
           'type',    nullif(delivery_info ->> 'type', ''),
           'courier', nullif(delivery_info ->> 'courier', '')
         ))
    into v_status, v_delivery
  from orders
  where id = p_order_id;

  if v_status is null then
    raise exception 'ERASE_ORDER_NOT_FOUND';
  end if;

  -- An order still being fulfilled needs its delivery address to be fulfilled.
  -- GDPR Art. 17(3)(b) covers exactly this: erasure does not override an
  -- obligation still being performed. Cancel or complete it first.
  if v_status <> all (array['delivered', 'cancelled']) then
    raise exception 'ERASE_ORDER_ACTIVE';
  end if;

  update orders
  set client_info   = jsonb_build_object('erased', true),
      delivery_info = v_delivery,
      -- Breaks the link to the account as well; a uuid pointing at auth.users
      -- is still a person. The consequence is that the order leaves that
      -- customer's own order list, which is the intent of an erasure request.
      user_id       = null,
      pii_erased_at = now(),
      pii_erased_by = auth.uid()
  where id = p_order_id;
end
$fn$;

revoke all    on function public.erase_order_pii(uuid) from public;
-- Not granted to anon: erasure is an admin action and the guard above is the
-- enforcement, but there is no reason to hand the entry point to the anonymous
-- role as well.
grant  execute on function public.erase_order_pii(uuid) to authenticated;
