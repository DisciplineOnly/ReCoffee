-- ============================================================================
-- ReCoffee — remove the T20 verification inquiries.
--
-- Data cleanup, not schema, same as the T15 and T18 order cleanups. T20 sent
-- two subscription requests over PostgREST with the anon key — one honest, one
-- carrying `pricePerDelivery: 0.01` — to prove that submit_inquiry() stores the
-- plan and not the quote. It does; both rows came back byte-identical.
--
-- Note that this migration is the *only* way those rows can be removed:
-- `inquiries` has SELECT and UPDATE policies for admins and no DELETE policy at
-- all, which is the retention gap recorded in LOOP.md's "Discovered during the
-- loop" during T19. Cleaning up after a test is a mild version of the same
-- problem the privacy policy's two-year limit will hit.
--
-- Scoped to the one synthetic email, a no-op on a fresh project, so it is not
-- folded into init_schema.sql.
-- ============================================================================

delete from inquiries
where email = 't20-tamper@example.com';
