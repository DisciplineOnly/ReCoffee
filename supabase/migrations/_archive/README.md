# Superseded migrations

These four files are the original migration chain. They are kept for history only
— the Supabase CLI ignores subdirectories, so they will not be applied.

They were retired on 2026-07-23 when the Supabase project was recreated from
scratch. The chain could no longer bootstrap an empty project: it referenced a
`services` table, a `products` storage bucket and a `products.image_url` column
that had been created by hand in the dashboard and were never captured in a
migration, so `20260718000000_feature_expansion.sql` fails partway through
against a fresh database.

Everything they did is folded into `../20260723000000_init_schema.sql` and
`../20260723000001_seed_catalog.sql`.
