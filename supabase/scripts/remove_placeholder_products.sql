-- Remove the 8 placeholder products from a LIVE database.
--
-- These were demo/sample coffees invented during the build (Mass Appeal, Thesis,
-- Gedeb Yirgacheffe, Brazil Santos, Espresso Blend, Kenya AA, Decaf Colombia,
-- Seasonal Microlot). They have been dropped from src/data/products.json and from
-- 20260723000001_seed_catalog.sql, so a *fresh* project will never create them —
-- but an already-seeded database still has the rows and will keep serving them.
--
-- This is NOT a migration. Do not put it in supabase/migrations/. It is a one-off
-- data cleanup for an environment that was seeded before the placeholders were
-- removed. Run it once per such environment.
--
-- Run with:  npx supabase db execute --file supabase/scripts/remove_placeholder_products.sql
-- or paste it into the SQL editor in the Supabase dashboard.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- BEFORE YOU RUN IT
--
-- `order_items.product_id` references products(id) with NO cascade, so if any of
-- these products appears in a real order this DELETE will fail with a foreign key
-- violation rather than quietly destroying order history. That failure is the
-- correct outcome: a product that has been sold is no longer a placeholder, and
-- deleting it would leave orphaned line items in the order record.
--
-- If it does fail, decide per product whether to keep the row (recommended — set
-- in_stock = false and featured = false to hide it from the shop) or to delete the
-- orders too. Do not work around it by adding a cascade.
--
-- `product_flavors` and `reviews` DO cascade, so their rows go automatically.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- Dry run: see exactly what is about to go, and whether anything has been sold.
select
  p.slug,
  p.name_bg,
  count(oi.id) as order_line_items
from products p
left join order_items oi on oi.product_id = p.id
where p.slug in (
  'mass-appeal',
  'thesis',
  'gedeb-yirgacheffe',
  'brazil-santos',
  'espresso-blend',
  'kenya-aa',
  'decaf-colombia',
  'seasonal-microlot'
)
group by p.slug, p.name_bg
order by p.slug;

-- Any row above with order_line_items > 0 will block the delete below.

delete from products
where slug in (
  'mass-appeal',
  'thesis',
  'gedeb-yirgacheffe',
  'brazil-santos',
  'espresso-blend',
  'kenya-aa',
  'decaf-colombia',
  'seasonal-microlot'
);

-- Expect 11 — the real catalog.
select count(*) as remaining_products from products;

commit;
