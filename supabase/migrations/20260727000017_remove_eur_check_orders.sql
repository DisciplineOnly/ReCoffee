-- ============================================================================
-- ReCoffee — remove the euro-redenomination verification orders.
--
-- Data cleanup, not schema, and the same pattern as files 14, 16 and 19. Two
-- orders were placed over PostgREST with the anon key to prove that
-- place_order() prices in euro and applies the new 50.00 EUR free-delivery
-- threshold: 40.39 was charged a 2.56 fee, 80.78 shipped free. Both are fakes
-- sitting in the admin dashboard.
--
-- Scoped to the one synthetic email, a no-op on a fresh project, so it is not
-- folded into init_schema.sql.
-- ============================================================================

delete from orders
where client_info->>'email' = 'eur-check@example.com';
