-- Name correction after reviewing the supplier photos.
--
-- The two-group La Spaziale in the product photo carries only an "S2" badge
-- (plus the SPECTIMA distributor mark on the top panel). The "EK" model suffix
-- in the original seed was not visible on the unit and could not be verified,
-- so it is dropped rather than shipped as fact on a storefront.
--
-- Recovered from supabase_migrations.schema_migrations on 2026-07-27: this had
-- been applied to the live project but never committed, which blocked
-- `supabase db push`. Idempotent, like every file here.

UPDATE products
SET name_bg = 'La Spaziale S2 — 2 групи',
    name_en = 'La Spaziale S2 — 2 Group'
WHERE slug = 'la-spaziale-s2-2gr';
