-- ============================================================================
-- ReCoffee — guest order lookup.
--
-- The SELECT policy on `orders` is `using (user_id = auth.uid())`. A guest
-- order stores `user_id = null`, and `null = auth.uid()` evaluates to NULL —
-- never true. So a guest order has been invisible to everyone except admins,
-- permanently, with no lookup-by-order-number anywhere in the app.
--
-- The policy is deliberately NOT loosened. Adding `or user_id is null` would
-- expose every guest order to every anonymous caller. Instead this function
-- runs as definer and demands **both** the order number and the exact email
-- stored on that order. The order number alone is 32^6 ≈ 1.07e9 — fine against
-- a targeted guess, not fine against a scripted sweep — so it is treated as
-- half a credential, never the whole one.
--
-- Enumeration: every failure mode returns zero rows and nothing else. A wrong
-- email, a wrong number, an email with no number, and an order that does not
-- exist are indistinguishable to the caller. Matching is `=` on normalised
-- text, never LIKE, so no wildcard reaches the comparison.
--
-- Idempotent, like every file in this directory: re-running it is safe.
-- ============================================================================

drop function if exists public.lookup_order(text, text);

create function public.lookup_order(
  p_order_number text,
  p_email        text
)
returns table (
  order_number  text,
  status        text,
  subtotal      numeric,
  delivery_fee  numeric,
  total         numeric,
  created_at    timestamptz,
  client_info   jsonb,
  delivery_info jsonb,
  payment_info  jsonb,
  items         jsonb
)
language sql
stable
security definer
set search_path = public
as $fn$
  select
    o.order_number,
    o.status,
    o.subtotal,
    o.delivery_fee,
    o.total,
    o.created_at,
    -- The caller has already proven they know the email on this order, so the
    -- name, phone and address it carries are theirs to see — that is what a
    -- "track my order" page renders.
    o.client_info,
    o.delivery_info,
    o.payment_info,
    coalesce(
      (
        select jsonb_agg(
                 jsonb_build_object(
                   'product_id',   i.product_id,
                   'product_name', i.product_name,
                   'quantity',     i.quantity,
                   'unit_price',   i.unit_price,
                   'grind_type',   i.grind_type
                 )
                 -- order_items has no line-ordinal column, so the original cart
                 -- order cannot be recovered; name keeps it at least stable
                 -- between calls.
                 order by i.product_name nulls last, i.id
               )
        from order_items i
        where i.order_id = o.id
      ),
      '[]'::jsonb
    )
  from orders o
  where coalesce(trim(p_order_number), '') <> ''
    and coalesce(trim(p_email), '') <> ''
    -- Order numbers are generated uppercase; a customer reading one off an
    -- email should not be punished for typing it in lower case. Email is
    -- matched case-insensitively for the same reason.
    and o.order_number = upper(trim(p_order_number))
    and lower(o.client_info ->> 'email') = lower(trim(p_email));
$fn$;

revoke all    on function public.lookup_order(text, text) from public;
grant  execute on function public.lookup_order(text, text) to anon, authenticated;
