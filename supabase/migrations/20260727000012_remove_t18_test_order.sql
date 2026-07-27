-- ============================================================================
-- ReCoffee — remove the T18 verification order.
--
-- Data cleanup, not schema, and the same situation as
-- 20260727000010_remove_t15_test_order.sql: T18 placed one order over PostgREST
-- with the anon key — carrying 450 KB of junk keys — to prove that
-- place_order() stores only the projected fields. It does, and the resulting
-- order is a fake sitting in the admin dashboard.
--
-- Scoped to the one synthetic email address, a no-op everywhere else including
-- on a fresh bootstrap, so it is not folded into init_schema.sql.
-- `order_items` and `order_status_history` cascade from `orders`.
-- ============================================================================

delete from orders
where client_info->>'email' = 't18-payload@example.com';
