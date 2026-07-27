-- ============================================================================
-- ReCoffee — remove the T15 verification order.
--
-- Data cleanup, not schema. T15 placed one order over PostgREST with the anon
-- key to prove that the new AFTER INSERT trigger on `orders` does not break
-- order placement: if `record_order_status_change()` could not write its row,
-- the exception would abort `place_order()` and no order would exist. It does,
-- so one does — and it is a fake order sitting in the admin dashboard.
--
-- This environment has no psql, no `db execute` and no admin session, so a
-- migration is the only channel that can commit a DELETE. It is scoped to the
-- one synthetic email address and is a no-op everywhere else, including on a
-- fresh bootstrap — which is why it is not folded into init_schema.sql.
--
-- `order_items` and `order_status_history` both cascade from `orders`.
-- ============================================================================

delete from orders
where client_info->>'email' = 't15-trigger@example.com';
