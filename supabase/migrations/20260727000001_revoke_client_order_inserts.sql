-- ============================================================================
-- ReCoffee — close the direct client write path into orders and order_items.
--
-- The third and last step of the Phase 1 change: T1 added place_order(), T2
-- moved checkout onto it, and nothing in the app inserts into these tables any
-- more (the only remaining references are a SELECT in src/pages/Account.jsx and
-- SELECT + status UPDATE in src/pages/admin/Orders.jsx).
--
-- What was open until now:
--
--   create policy "Anyone can create order items"
--     on order_items for insert to anon, authenticated with check (true);
--
-- No link was enforced between the caller and `order_id`, so anyone holding an
-- order uuid could append line items to *any* order — including another
-- customer's — at any price and quantity. The parent order's totals do not
-- change, so the admin detail view would show lines that no longer reconcile
-- with the totals rendered beside them. The orders policy was narrower
-- (ownership only) but still let a caller pick their own subtotal and total.
--
-- Measured before this migration, with the shipped anon key: a direct insert
-- into `orders` returned HTTP 201 and stored status 'delivered', total 0.01 and
-- zero line items.
--
-- place_order() is unaffected — it is `security definer`, so it inserts as its
-- owner and never needed these grants. SELECT policies are deliberately left
-- alone: customers must still be able to read their own orders, and admins all
-- of them.
--
-- Idempotent, like every file in this directory: re-running it is safe.
-- ============================================================================

drop policy if exists "Anyone can create an order"   on orders;
drop policy if exists "Anyone can create order items" on order_items;

-- The policies alone would not be enough. Supabase's default privileges grant
-- table-level INSERT to anon and authenticated when a table is created in
-- `public`, and a policy is only consulted *after* the privilege check passes.
-- Dropping the policy denies the write; revoking the privilege means the right
-- to attempt it never existed. Both, so neither is load-bearing on its own.
revoke insert on orders      from anon, authenticated;
revoke insert on order_items from anon, authenticated;
