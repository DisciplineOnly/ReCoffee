# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ReCoffee (repo name "ReCaffe") is a Bulgarian coffee e-commerce storefront: a React 18 + Vite SPA
with a Supabase backend (Postgres + Auth + Storage). It has a public shop with cart/checkout and a
password-protected admin dashboard. Everything works except a real payment gateway — checkout's
`PaymentStep` and the `orders.payment_info` jsonb column are the intended integration points.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # production build to dist/
npm run preview  # serve the built dist/
npm run lint     # eslint over the whole tree (no test suite exists)
```

There is no test runner configured. `lint` is the only automated check.

### Database (Supabase CLI, not the MCP connector)

The whole DB is created by nineteen idempotent migrations in `supabase/migrations/`, applied with
`npx supabase db push`:

1. `20260723000000_init_schema.sql` — 11 tables, `is_admin()`, indexes, RLS, `place_order()`, the
   public `products` storage bucket, the order audit triggers. This file is the complete current
   state and is re-runnable.
2. `20260723000001_seed_catalog.sql` — the catalog.
3. `20260723000002_fix_product_names.sql` — one name correction.
4. `20260727000000_place_order_rpc.sql` — `store_settings`, `order_items.product_name` and
   `place_order()`, for databases already created from the files above.
5. `20260727000001_revoke_client_order_inserts.sql` — drops the two insert policies on `orders` /
   `order_items` and revokes the INSERT privilege from `anon` and `authenticated`.
6. `20260727000002_constrain_order_amounts.sql` — CHECK constraints on order money.
7. `20260727000003_guest_order_lookup.sql` — `lookup_order()`.
8. `20260727000004_moderate_reviews.sql` — review moderation and length limits.
9. `20260727000005_rate_limit_public_writes.sql` — size limits and IP rate limiting on the public
   write surface.
10. `20260727000006_neutral_newsletter_signup.sql` — makes newsletter signup non-enumerable.
11. `20260727000007_preserve_order_history.sql` — `order_items.product_id` FK becomes
    `on delete set null`, plus its index.
12. `20260727000008_harden_product_image_bucket.sql` — MIME allowlist and size cap on the
    `products` bucket.
13. `20260727000009_track_order_status_history.sql` — `updated_at` trigger on `orders` and the
    `order_status_history` audit table, written only by an AFTER trigger.
14. `20260727000010_remove_t15_test_order.sql` — data cleanup, not schema: deletes the one synthetic
    order T15 placed to verify the trigger. A no-op on a fresh project, so it is **not** folded into
    file 1.
15. `20260727000011_bound_order_payloads.sql` — `pg_column_size` CHECK constraints on the three
    `orders` jsonb columns, and `place_order()` reissued so it **projects** `client_info` /
    `delivery_info` onto known keys instead of storing the payload it was handed.
16. `20260727000012_remove_t18_test_order.sql` — the same kind of data cleanup as file 14, for T18's
    verification order. Also not folded into file 1.
17. `20260727000013_retention_and_erasure.sql` — `newsletter_subscribers.unsubscribe_token` plus
    `unsubscribe_newsletter()`, and `erase_order_pii()` with the `orders.pii_erased_at/by` columns.
18. `20260727000014_trusted_subscription_quote.sql` — `submit_inquiry()` reissued so a subscription
    request stores the validated plan (`frequency`, `quantity`) and never a client-computed price.
19. `20260727000015_remove_t20_test_inquiries.sql` — data cleanup for T20's verification rows, like
    files 14 and 16. Not folded into file 1.

Files 3-13, 15, 17 and 18 are *also* folded into file 1, so a fresh project bootstraps to the identical state
from file 1 alone. **`place_order()` now exists in three files** — its own migration
(`20260727000000`), the reissue in `20260727000011`, and section 7 of `init_schema.sql`. Only the
latter two are current, and they are kept byte-identical; change both together.

**A change to the schema needs both a new numbered migration and the same change folded into
`init_schema.sql`** — `db push` will not re-run an already-applied file, so an existing database only
gets the new file, while a fresh one only gets `init_schema.sql`.

Orders are **not** insertable from the client — `anon` and `authenticated` have no INSERT privilege
on `orders` or `order_items` and no insert policy, so a direct PostgREST insert returns `42501`.
The only way in is `place_order(p_items, p_client, p_delivery, p_payment_method)`, a
`security definer` RPC that prices every line from `products`, computes the delivery fee from
`store_settings`, pins `status` to `'pending'`, sets `user_id` from `auth.uid()` and writes the
order plus its items in one transaction. It ignores anything price-shaped in its payload.
Rejections come back as stable tokens (`ORDER_PRODUCT_OUT_OF_STOCK`, `ORDER_PRODUCT_UNKNOWN`,
`ORDER_INVALID_LINE`, …) that the frontend maps to locale strings.

`client_info` and `delivery_info` are **projected onto known keys** by `place_order()`, not stored as
handed over — extra keys are dropped and over-length values are rejected as `ORDER_INVALID_DETAILS`.
**If you add a field to the checkout form you must add it to that projection**, or it will be
silently discarded. `pg_column_size` CHECK constraints cap all three jsonb columns as the backstop
for any other writer.

Guest orders store `user_id = null` and the SELECT policy is `user_id = auth.uid()`, so they are
invisible to everyone but admins. **Do not loosen that policy** — `or user_id is null` would expose
every guest order to every anonymous caller. Read one back with
`lookup_order(p_order_number, p_email)`, a definer function requiring both the order number and the
exact email stored on that order; every failure mode returns zero rows.

`orders.updated_at` is maintained by a BEFORE UPDATE trigger — **never set it from a client**; a
value sent in the payload is overwritten. Every status change also writes an `order_status_history`
row (`from_status`, `to_status`, `changed_by = auth.uid()`) from an AFTER trigger. That table is
admin-readable and writable by nobody: INSERT/UPDATE/DELETE are revoked from `anon` and
`authenticated`, so the trail cannot be forged or erased through PostgREST.

**Retention and erasure** follow what `src/data/legalContent.js` promises. Newsletter rows carry an
`unsubscribe_token`; `/unsubscribe?token=…` calls `unsubscribe_newsletter()`, which deletes the row
and says nothing about whether it existed — the same non-enumerable contract as signup. The token is
readable only by admins, so **the unsubscribe URL has to be merged into the newsletter template from
an admin-side export**; nothing in this app sends email. `erase_order_pii()` anonymises an order's
`client_info`/`delivery_info` and nulls `user_id` while keeping the order number, amounts and dates —
the privacy policy commits to an 11-year accounting retention, so an erasure must **never** delete
the order. It refuses orders that are not `delivered` or `cancelled`.

`inquiries` and `newsletter_subscribers` are likewise not directly writable. The public submits via
`submit_inquiry(...)` and `subscribe_newsletter(...)`, definer functions that cap field sizes and
rate-limit to 5 per hour per client IP. The IP comes from the `cf-connecting-ip` header PostgREST
forwards (set at Supabase's Cloudflare edge, so a client cannot forge it) and is stored only as a
salted md5 in `rate_limit_hits`. **Supabase's built-in CAPTCHA setting does not help here** — it
guards the auth endpoints, not PostgREST table writes.

A **subscription** inquiry stores only its validated plan — `{frequency, quantity}`, checked against
the ids in `src/lib/subscription.js` — and never a price. The browser used to send
`details.pricePerDelivery`, which staff then quoted from; the admin view now derives the price from
the stored quantity instead. **Adding a plan means adding it in both places**: the arrays in
`subscription.js` and the `c_freqs` / `c_sizes` constants in `submit_inquiry()`.

Note that a policy is only
consulted *after* the table-privilege check, and Supabase's default privileges grant INSERT on new
`public` tables to `anon`/`authenticated` — so a new write-restricted table needs the `revoke`, not
just the absence of a policy.

- Use `gen_random_uuid()`, never `uuid_generate_v4()` (uuid-ossp is off the migration search_path).
- Never write migration files with PowerShell `Set-Content -Encoding UTF8` — it emits a BOM that
  Postgres rejects. Use the Write tool or a BOM-free encoding.
- `supabase/migrations/_archive/` holds the retired original chain. It **cannot** bootstrap a fresh
  project (it references objects that were made by hand in the dashboard). Do not move it back into
  the migrations root.
- The seed is generated from `src/data/products.json`, so the local fallback catalog and the DB stay
  in sync. Regenerate the seed rather than hand-editing the SQL when products change.
- The claude.ai Supabase MCP connector is a **different, read-only account** that cannot see this
  project. Use the local `supabase` CLI for anything touching the live DB.

## Architecture

**Data flow.** Product data lives in Supabase but ships with a local mirror in
`src/data/products.json`. `src/hooks/useProducts.jsx` fetches from Supabase, maps snake_case DB
columns to the camelCase frontend shape (and derives `onSale`/`effectivePrice`/`isNew` merchandising
flags), and **falls back to the local JSON if the DB call fails**. When you change the product shape,
update both the DB mapping in this hook and `products.json`.

That fallback is **degraded mode**: the hook returns `degraded: true`, `CartProvider` re-exports it as
`catalogDegraded`, `DegradedCatalogBanner` says so on every public page, and **checkout is blocked**
— the prices on screen were baked into the bundle at build time and stock is unknown. A catalog that
returns *zero rows* is not degraded; that is a real answer from a healthy database. Degraded mode
also stops the cart writing itself back to `localStorage`, because the local catalog's ids
(`prod_009`) are not the database's uuids.

**Routing.** `src/App.jsx` is the single source of routes. Two trees inside shared providers:
public routes under `PublicLayout`, admin routes under `/admin` gated by `ProtectedRoute` →
`AdminLayout`. Unknown paths redirect to `/`.

**Auth & admin.** Supabase Auth backs both customers and admins. A valid session is *not* enough for
admin — `ProtectedRoute` (`src/components/admin/ProtectedRoute.jsx`) additionally checks membership in
the `admin_users` table; the real enforcement is RLS via the `is_admin()` SQL function. Customer
signups are ordinary users and get routed to `/account`. Note the deliberate constraint in that file:
no awaited Supabase queries inside the `onAuthStateChange` callback (the client holds an auth lock and
awaiting deadlocks).

**State via Context.** Cart and Wishlist are React Contexts persisted to `localStorage`
(`recoffee_cart`, etc.); checkout is its own `CheckoutContext`. Cart totals, delivery-fee logic
(free over 100 BGN, else 5 BGN), and grand total all live in `CartContext`.

**Product taxonomy.** `src/lib/categories.js` defines a two-level tree (coffee → capsules/grains;
machines → personal/professional). Legacy beans-only category values still exist in the DB, so
**always** route stored category strings through `normalizeCategory` / the helpers
(`isMachine`, `isCoffee`, `hasGrindOptions`) before comparing or filtering — never compare
`product.category` directly.

## Conventions (follow these, don't hardcode)

- **Company / contact / legal data** → `src/lib/siteConfig.js`. Footer, contact, legal pages, and
  checkout all read from it. Change it in one place.
- **Prices** always render through `src/lib/price.js`. Bulgaria is mid BGN→EUR changeover, so prices
  show dual currency (`formatPrice` → "12.90 лв (6.60 €)") at the fixed peg `1.95583`. Never format
  money inline.
- **UI strings** → `src/lib/translations/{bg,en}.json`, accessed via `useTranslation()`'s `t('a.b.c')`.
  **BG is the default locale**; EN is the fallback. New user-facing strings go into *both* files.
- **Long-form BG content** (legal text, Learn articles) → `src/data/` (`legalContent.js`,
  `articles.js`), not inline JSX.
- **Styling** is Tailwind. Brand colors are theme tokens: `brand-primary` (#BF2645),
  `brand-secondary` (#017DC7), `brand-accent` (#9B5440); fonts `font-sans` (Inter) / `font-serif`
  (Playfair Display). Use the tokens, not raw hex.

## Environment

`.env` provides `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Vite exposes only `VITE_`-prefixed
vars to the client). Missing values log an error but don't crash — the app degrades to the local JSON
fallback, which since T14 shows a banner and blocks checkout.

`.env` is **gitignored and untracked**; `.env.example` documents the shape. It was tracked until
2026-07-27 — no secret was exposed, since both values are public-by-design in a Vite SPA, but the
habit is what leaks the next one.

**Server-only secrets must never live in this file at all**, prefix or no prefix. A
`SUPABASE_SERVICE_ROLE_KEY` or a payment-gateway secret bypasses every RLS policy in this repo; put
them in the deployment platform's secret store and read them from an Edge Function or server, never
from the browser bundle. The history still contains the old `.env` commits and that is deliberate —
rewriting history to remove two public keys costs a force-push and buys nothing.
