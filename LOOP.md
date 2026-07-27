# ReCoffee — database hardening loop

Findings from the 2026-07-26 database & data-flow security audit, written as an executable task
queue. Every task is scoped to be fixed, verified and committed on its own.

## How to run this

```
/loop Read LOOP.md and execute the next unchecked task, end to end, following the protocol in the file.
```

Omit an interval so the loop self-paces — each task needs a full read/edit/verify/commit cycle, not
a timer.

## Loop protocol — do this every iteration

1. Read this file. Find the **first** task whose checkbox is `- [ ]`. Work on exactly one task.
2. Read every file the task names before editing. Do not fix from the description alone — the
   descriptions were written on 2026-07-26 and the code may have moved.
3. Implement the change.
4. Verify. Run the task's **Verify** block. `npm run lint` and `npm run build` must pass on every
   task; the repo has no test runner, so these plus the task-specific checks are the whole safety
   net. If a check cannot be run, say so explicitly rather than claiming it passed.
5. Commit with the task's **Commit** message. One task, one commit.
6. Tick the checkbox in this file (`- [ ]` → `- [x]`) and include that edit in the same commit.
7. Append a short entry to `PROGRESS.md` in the existing house style: **What was built**,
   **Verified by**, **Assumptions made**, and — when relevant — **Follow-ups needed**. Be specific
   and honest; that file records failures and corrections too.
8. If a task is genuinely blocked, mark it `- [!]`, write the reason inline under it, commit that,
   and move to the next task. Do not silently skip.
9. When every checkbox is `- [x]` or `- [!]`, stop the loop and report a summary.

## Ground rules

- **Read `CLAUDE.md` first.** Its conventions are binding: prices through `src/lib/price.js`, strings
  through `src/lib/translations/{bg,en}.json` (both files, BG is default), company data from
  `src/lib/siteConfig.js`, category comparisons through `normalizeCategory`, Tailwind brand tokens
  not raw hex.
- **Migrations.** `npx supabase db push` will not re-run an already-applied file, so live-DB changes
  need **new** numbered migration files in `supabase/migrations/`. Also fold the same change into
  `20260723000000_init_schema.sql` so a fresh project still bootstraps to the identical state — that
  file is idempotent by design and re-running it must stay safe. Update CLAUDE.md's "exactly two
  idempotent migrations" wording once the count changes.
  - `gen_random_uuid()`, never `uuid_generate_v4()`.
  - Never write migrations with PowerShell `Set-Content -Encoding UTF8` — the BOM breaks Postgres.
    Use the Write tool.
  - Do not move `supabase/migrations/_archive/` back into the migrations root.
- **The threat model.** This is a pure SPA: `VITE_SUPABASE_ANON_KEY` is in the shipped bundle by
  design, so every table is reachable directly over PostgREST by anyone. UI checks are not controls.
  RLS policies, DB constraints and `security definer` functions are the only enforcement. Any value
  the browser computes is attacker-controlled input.
- **Verify against the real DB where a task touches RLS.** A policy that looks right and a policy
  that behaves right are different things. Test with an anon-key client, not just the admin UI.
- Do not expand scope. If you find something new, add it to the **Discovered during the loop**
  section at the bottom rather than fixing it inline.

---

# Tasks

## Phase 1 — Server-authoritative orders

Tasks 1-3 are one logical change split into three independently safe commits, in this order:
add the RPC (additive, breaks nothing) → switch the frontend to it → revoke the old direct-insert
path. Do not reorder; revoking before the frontend switches takes checkout down.

- [x] **T1 — Add a `place_order()` RPC that computes all order money server-side**

  **Closes findings:** C1 (client-controlled totals), C2 (no stock validation), C3 (client-writable
  `payment_info`), C4 (client-settable `status`), M5 (no product-name snapshot), L6 (delivery-fee
  rules exist only on the client).

  **Problem.** `src/components/checkout/ReviewStep.jsx:108-140` sends `subtotal`, `delivery_fee`,
  `total` and `order_items.unit_price` straight from `CartContext`, which reads them out of
  `localStorage.recoffee_cart`. The RLS policy at `supabase/migrations/20260723000000_init_schema.sql:245-247`
  is `with check (user_id is null or user_id = auth.uid())` — it constrains ownership and nothing
  about money. Editing one number in devtools buys a machine for 0.01 BGN, and the admin dashboard
  renders the fake totals back as self-consistent. Cash on delivery means real goods ship against it.

  **Do.** New migration creating a `security definer` function with a pinned `search_path = public`:

  ```sql
  create or replace function place_order(
    p_items    jsonb,   -- [{product_id uuid, quantity int, grind_type text}, ...]
    p_client   jsonb,
    p_delivery jsonb,
    p_payment_method text
  ) returns table (order_number text, subtotal numeric, delivery_fee numeric, total numeric)
  language plpgsql security definer set search_path = public as $$ ... $$;
  ```

  Requirements on the body:
  - Recompute every line price from `products` as `coalesce(sale_price, price)` where
    `sale_price < price`, matching the `effectivePrice` rule in `src/hooks/useProducts.jsx:51-52`.
    **Ignore anything price-shaped in `p_items`.**
  - `raise exception` if any `product_id` is missing or `in_stock = false`.
  - Validate `quantity` is an integer in 1..999 per line, and cap total line count (50 is ample).
  - Compute the delivery fee server-side. The thresholds currently live only in
    `src/lib/siteConfig.js` (`delivery.freeOverBgn` = 100, `delivery.standardFeeBgn` = 5) and are
    read at `src/contexts/CartContext.jsx:92-95`. Put an authoritative copy in the DB. The client
    copy becomes display-only — leave it in place, do not delete it, and note in `siteConfig.js`
    that the DB is now authoritative.
  - Hardcode `status = 'pending'`. Never accept it from the caller.
  - Write `payment_info` as `{"method": <validated against 'card'|'cash'|'bank'>}` only. Nothing
    else from the client reaches that column.
  - Set `user_id = auth.uid()` (null for guests). Do not accept it as a parameter.
  - Insert the order and all its items **in the one transaction** (this closes H2's orphan-order
    window and H1's unrestricted `order_items` insert in one move).
  - Add `order_items.product_name text` in the same migration and populate it from `products` at
    order time, so renaming or deleting a product can no longer rewrite history.
  - Keep the order-number generation and its unique-violation retry. The existing client generator
    at `ReviewStep.jsx:28-33` is correct (`crypto.getRandomValues`, unbiased modulus, Crockford
    base32) — port the same alphabet and retry-on-`23505` behaviour into the function so the
    property survives the move.
  - Return enough for the confirmation page to render without trusting localStorage.

  **Verify.** Call the RPC from an anon-key client with (a) a valid cart, (b) a tampered cart
  claiming `unit_price: 0.01`, (c) an out-of-stock product, (d) a non-existent product id,
  (e) `quantity: -5`, (f) `status: 'delivered'` smuggled in the payload. Confirm the stored row
  matches the catalog price in every case and that (c)-(e) are rejected. Confirm no order row
  survives a rejected call. `npm run build` and `npm run lint` still pass (this task is DB-only, so
  they should be untouched — say so).

  **Commit.** `feat(recoffee): add server-authoritative place_order RPC`

- [x] **T2 — Switch checkout to the RPC**

  **Problem.** `ReviewStep.handlePlaceOrder` (`src/components/checkout/ReviewStep.jsx:142-219`) does
  two independent inserts with no transaction. If the second fails, the `orders` row survives with
  zero line items and no rollback — the `catch` at `:213` only shows an alert, so the customer
  retries and creates a duplicate.

  **Do.**
  - Replace both `supabase.from(...).insert(...)` calls with a single `supabase.rpc('place_order', …)`.
  - Send only `{product_id, quantity, grind_type}` per line. Stop sending money entirely.
  - Render the confirmation from the RPC's returned totals, not from the local cart.
  - Delete the `PGRST204` legacy fallback at `:127-137`. Its migration is long applied and it
    silently drops `user_id`, turning a logged-in customer's order into a guest order they can never
    see again.
  - Keep `resolveFallbackProductIds` (`:39-59`) for now — it maps non-uuid ids from the local-JSON
    fallback via slug — but make its error path **fail the checkout** instead of returning an empty
    Map, which currently produces order lines with `product_id: null`. T14 revisits this.
  - If the RPC rejects the order (out of stock, unknown product), surface a specific message, not the
    generic `checkout.order_error`. New strings go in **both** `bg.json` and `en.json`.

  **Verify.** Place a real order through the UI end to end and confirm it lands in the DB with
  correct totals and reaches `/checkout/success`. Repeat with a tampered `localStorage.recoffee_cart`
  and confirm the stored total ignores the tampering. Confirm a rejected order leaves **no** row in
  `orders`. Re-run the Task 6 regression from PROGRESS.md: placing an order must land on
  `/checkout/success`, not `/cart`. `npm run lint` must not gain warnings over the current baseline —
  state the before/after counts.

  **Commit.** `fix(recoffee): route checkout through place_order instead of direct inserts`

- [x] **T3 — Revoke direct client writes to orders and order_items**

  **Closes findings:** H1 (`order_items` insert policy is unconditionally `true`), the remainder of
  C1/H2.

  **Problem.** `init_schema.sql:262-263`:

  ```sql
  create policy "Anyone can create order items"
    on order_items for insert to anon, authenticated with check (true);
  ```

  No link is enforced between the caller and `order_id`. Anyone holding an order UUID can append
  line items to **any** order, including another customer's, at any price and quantity. The parent
  order's totals don't change, so the admin detail view shows lines that no longer reconcile with the
  totals it renders beside them (`src/pages/admin/Orders.jsx:172-188`).

  **Do.** Only after T2 is deployed and verified. New migration:
  - `drop policy "Anyone can create an order" on orders;`
  - `drop policy "Anyone can create order items" on order_items;`
  - `revoke insert on orders, order_items from anon, authenticated;`
  - Confirm `place_order` still works — it runs as definer and no longer needs those policies.
  - Leave the SELECT policies alone.

  **Verify.** With an anon-key client, attempt a direct `insert` into `orders` and into `order_items`
  — both must be refused. Then place an order through the UI and confirm it still succeeds. Confirm
  the admin dashboard still lists and updates orders.

  **Commit.** `fix(recoffee): revoke direct client inserts on orders and order_items`

## Phase 2 — Auth, constraints, and order visibility

- [x] **T4 — Fix the fail-open admin check**

  **Problem.** `src/components/admin/ProtectedRoute.jsx:41-46`:

  ```js
  setIsAdmin(error ? true : !!data);
  ```

  Any error — network blip, timeout, PostgREST hiccup — grants the admin shell to any logged-in
  customer. RLS still blocks the underlying data, so this is not a breach, but it is a fail-open auth
  check that exposes admin routes, forms and destructive-looking controls. `src/pages/Account.jsx:57`
  already does this correctly (`.then(({ data }) => setIsAdmin(!!data))`); the two should agree.

  **Do.** `setIsAdmin(!!data && !error)`. Delete the pre-migration fallback comment and behaviour.
  Keep the constraint documented at `:16-17` intact — **no awaited Supabase queries inside the
  `onAuthStateChange` callback**, the client holds an auth lock and awaiting deadlocks.

  **Verify.** Log in as an ordinary customer and confirm `/admin` redirects to `/account`. Log in as
  an `admin_users` member and confirm the dashboard loads. Simulate a failed `admin_users` query
  (offline, or point at a bad table name temporarily) and confirm it now denies rather than grants.

  **Commit.** `fix(recoffee): deny admin access when the admin_users check errors`

- [x] **T5 — Add CHECK constraints on order money**

  **Problem.** `init_schema.sql:87-89` declares `subtotal`, `delivery_fee` and `total` as
  `decimal(10,2) not null` with no `>= 0` and no constraint that they reconcile.
  `order_items.unit_price` is likewise unconstrained; only `quantity > 0` exists, with no upper
  bound. Negative-total orders are insertable today.

  **Do.** New migration. Check existing rows satisfy these first — if any don't, report it rather
  than forcing the constraint, and consider `not valid` plus a follow-up `validate constraint`.

  ```sql
  alter table orders
    add constraint orders_amounts_nonneg
      check (subtotal >= 0 and delivery_fee >= 0 and total >= 0),
    add constraint orders_total_consistent
      check (total = subtotal + delivery_fee);

  alter table order_items
    add constraint order_items_unit_price_nonneg check (unit_price >= 0),
    add constraint order_items_quantity_sane     check (quantity between 1 and 999);
  ```

  **Verify.** Query for violating rows before applying. After applying, confirm a normal order still
  places successfully and that a hand-crafted negative-total insert (as service_role, since anon is
  revoked by T3) is rejected.

  **Commit.** `fix(recoffee): constrain order amounts at the database level`

- [x] **T6 — Give guest orders a lookup path**

  **Problem.** The SELECT policy is `using (user_id = auth.uid())` (`init_schema.sql:249-250`). Guest
  orders store `user_id = null`, and `null = auth.uid()` evaluates to NULL — never true. So a guest
  order is invisible to everyone but admins, permanently, and there is no lookup-by-order-number
  anywhere in the app.

  **Do.** A `security definer` function taking `order_number` **and** the email stored on the order,
  returning that single row only. Both must match. **Do not** loosen the SELECT policy to
  `user_id is null` — that would expose every guest order to everyone. Rate-limit or at minimum
  require the exact email; the order number alone is 32^6 and guessable at scale.

  **Verify.** Look up a guest order with the correct number+email pair and confirm it returns. Wrong
  email, wrong number, and number-only must all return nothing. Confirm it cannot be used to
  enumerate orders.

  **Commit.** `feat(recoffee): add guest order lookup by number and email`

- [x] **T7 — Stop parking customer PII in localStorage**

  **Problem.** `src/components/checkout/ReviewStep.jsx:192-204` writes the full order — name, email,
  phone, street address — to `localStorage.recoffee_last_order`, and
  `src/pages/CheckoutSuccess.jsx:17-26` is the only reader. It is never cleared. On a shared or
  public machine that PII sits there indefinitely, readable by any later visitor to the site and by
  any XSS on the origin.

  **Do.** Depends on T2 and T6. Store only the order number; have `CheckoutSuccess` fetch the rest
  via T6's lookup or T2's RPC return value. Clear the key once the page has rendered. If a minimal
  snapshot must stay for offline print, strip it to non-identifying fields and clear it on unmount.

  **Verify.** Place an order, confirm the success page renders fully, then confirm
  `localStorage.recoffee_last_order` is gone (or contains no name/email/phone/address). Confirm a
  direct visit to `/checkout/success` with no order still redirects to `/shop`.

  **Commit.** `fix(recoffee): stop persisting order PII in localStorage`

- [x] **T8 — Store cart entries by id, not as full product snapshots**

  **Problem.** `src/contexts/CartContext.jsx:33-52` puts the entire `product` object into the cart
  and `:17-26` rehydrates it from localStorage forever. A cart built in January still carries
  January's `price` and `onSale` in March. Nothing revalidates against `products` at any point — not
  on load, not on the cart page, not at checkout. Without any malice: prices drop and old carts
  overpay, sales end and old carts underpay, products go out of stock and the cart still checks out.

  **Do.** Depends on T2 (once the RPC prices the order, this is a display-correctness fix rather
  than a money fix — but the display still has to be right). Persist only
  `{productId, slug, quantity, grindType}`. Join against the live `useProducts()` list for rendering.
  Handle the case where a persisted id no longer exists in the catalog: drop the line and tell the
  user, don't render `undefined`.

  Migrate existing carts — `recoffee_cart` is live in real users' browsers with the old shape. Read
  the old shape, convert, write the new one. Do not let a stale value crash the cart provider; the
  existing try/catch at `:17-26` is the model.

  **Verify.** Seed a cart with the old shape, reload, confirm it migrates and renders. Change a
  product's price in admin and confirm an already-open cart reflects the new price on reload. Confirm
  the free-delivery threshold and totals still compute. Confirm a deleted product's line is handled.

  **Commit.** `fix(recoffee): store cart lines by product id instead of snapshots`

## Phase 3 — Public write surface

- [x] **T9 — Harden and moderate reviews**

  **Problem.** `init_schema.sql:280` is `"Anyone can create a review" ... with check (true)`.
  Anyone can POST unlimited reviews for any `product_id` under any `author_name` — no account, no
  verified purchase, no rate limit, no CAPTCHA, no moderation queue
  (`src/components/shop/ProductReviews.jsx:74-79`). Ratings feed the product-page average
  (`:62-64`) and the `AggregateRating` in `src/lib/structuredData.js`, so this is a direct
  rating-manipulation and SEO-spam vector. Neither `author_name` nor `comment` has a length cap
  (`text`, unbounded), so one insert can carry megabytes. Text renders through React so it is
  escaped — no XSS — but storage and the admin view are still abusable.

  An `"Admins can delete reviews"` policy exists at `:281` but **there is no admin reviews page** —
  `src/App.jsx:47-57` has orders/products/services/inquiries only. Moderation today requires the SQL
  editor.

  **Do.**
  - Length constraints: `check (length(author_name) between 1 and 80)`,
    `check (comment is null or length(comment) <= 2000)`.
  - Add `approved boolean not null default false`; gate the public SELECT policy on it.
  - Build the admin moderation page (approve / delete), routed under `/admin` in `src/App.jsx`,
    following the existing `src/pages/admin/Inquiries.jsx` shape. All strings through
    `useTranslation()` in both locales.
  - Decide on existing rows: default them to `approved = true` so live reviews don't vanish, and say
    so in PROGRESS.md.
  - Consider requiring a matching delivered order before accepting a review. If you skip it, record
    why under **Follow-ups needed**.

  **Verify.** Submit a review and confirm it does **not** appear publicly until approved. Confirm an
  over-length insert is rejected at the DB. Confirm the admin page lists, approves and deletes.
  Confirm the product-page average and `structuredData` only count approved reviews.

  **Commit.** `feat(recoffee): add review moderation and length limits`

- [x] **T10 — Rate-limit the public inquiry and newsletter endpoints**

  **Problem.** `init_schema.sql:288` and `:296` are both `with check (true)`. Call sites:
  `src/pages/Contact.jsx:40`, `src/pages/Wholesale.jsx:57`, `src/pages/Subscription.jsx:64`,
  `src/components/layout/Footer.jsx:24`. Validation is client-side only (an email regex and `trim`),
  with no rate limit, no CAPTCHA, and no size limits on `message` or the `details` jsonb. Trivially
  scriptable to flood the admin inbox (`src/pages/admin/Inquiries.jsx`) or fill the table.

  **Do.** Enable Supabase's built-in CAPTCHA (Turnstile/hCaptcha) on these forms, or front them with
  an Edge Function that rate-limits by IP. Add DB length constraints on `name`, `email`, `message`
  and a `pg_column_size` cap on `details` regardless of which you pick. Pick one approach, implement
  it fully, and record the trade-off in PROGRESS.md.

  **Verify.** Submit each of the four forms successfully. Then script 20 rapid submissions and
  confirm they are refused. Confirm an over-length message is rejected at the DB, not just the UI.

  **Commit.** `fix(recoffee): rate-limit public inquiry and newsletter writes`

- [x] **T11 — Stop the newsletter leaking subscription status**

  **Problem.** `src/components/layout/Footer.jsx:32-35` branches on the Postgres unique violation:

  ```js
  } else if (error.code === '23505') {
      // unique violation — already subscribed
      setStatus('already');
  }
  ```

  That lets anyone test whether a given email address is on your subscriber list — an enumeration
  leak against your customers, not just your system.

  **Do.** Return the same neutral confirmation for both the inserted and already-present cases. The
  distinction must disappear from the response path, not just from the visible string — an attacker
  reads the network tab, not the UI. An `on conflict do nothing` insert behind a function is the
  clean version. Keep `newsletter.already` in the locale files only if something still legitimately
  uses it; otherwise remove it from both `bg.json` and `en.json`.

  **Verify.** Subscribe a fresh address, then subscribe the same address again. Confirm both produce
  an identical response — same status, same body, same timing class — in the network tab.

  **Commit.** `fix(recoffee): stop newsletter signup leaking subscription status`

## Phase 4 — Data integrity

- [x] **T12 — Fix product deletion against order history**

  **Problem.** `init_schema.sql:102` is `product_id uuid references products(id)` with **no
  `on delete` clause**, so it defaults to `NO ACTION`. Any product that has ever been ordered cannot
  be deleted, and the admin gets a raw Postgres FK error in an `alert()`
  (`src/pages/admin/Products.jsx:29-34`). The tempting fix — `on delete cascade` — would silently
  destroy order line items and corrupt historical revenue. Separately, `order_items.product_id` has
  no index (`:180-186` indexes `order_id` only), so the admin orders join and every FK check on
  delete do a sequential scan.

  **Do.** Depends on T1 having added `order_items.product_name`.
  - Change the FK to `on delete set null`. The column is already nullable and
    `src/pages/admin/Orders.jsx:175` already falls back to a generic label when the join misses —
    with `product_name` populated it will show the real historical name instead.
  - `create index if not exists order_items_product_id_idx on order_items(product_id);`
  - Backfill `product_name` for existing rows from the current catalog where the join still resolves.
  - Consider a soft-delete `archived boolean` on `products` instead of hard deletes. If you skip it,
    record why.

  **Verify.** Delete a product that appears in a past order. Confirm the delete succeeds, the order
  still lists the line, and the line shows the historical product name rather than a generic label.
  Confirm `explain` on the admin orders query uses the new index.

  **Commit.** `fix(recoffee): preserve order history when products are deleted`

- [x] **T13 — Harden product image uploads**

  **Problem.** `src/components/admin/ImageUpload.jsx:20-27`:

  ```js
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  ```

  The extension comes straight from the user's filename with no allowlist. `accept="image/*"` is a
  picker hint, trivially bypassed. The bucket (`init_schema.sql:314-316`) has no
  `allowed_mime_types`, no `file_size_limit`, and is public-read. An admin session — or a stolen
  admin token — can upload `.html`/`.svg` served from a public URL on the storage domain (stored XSS,
  though on a different origin than the app), or exhaust the storage quota. `Math.random()` is also
  not a CSPRNG; `crypto.randomUUID()` is free here and matches the good pattern already used for
  order numbers. Deleting a product does not delete its uploaded image, so orphans accumulate.

  **Do.** Set `allowed_mime_types` and `file_size_limit` on the `products` bucket. Validate
  `file.type` and `file.size` client-side with a clear error. Derive the extension from an allowlist
  keyed on the validated MIME type, never from the filename. Switch to `crypto.randomUUID()`. Also
  address the orphan-object cleanup on product delete, or log it as a follow-up.

  Note the pre-existing follow-up from PROGRESS.md Task 1: uploads use a random object name rather
  than the product slug, so admin-uploaded files don't follow the naming convention in
  `docs/PRODUCT_IMAGES.md`. Fix it here if it's cheap; otherwise leave it recorded.

  **Verify.** Upload a valid JPEG and PNG — both succeed and render. Rename an `.html` file to
  `.jpg` and upload — must be rejected on MIME, not extension. Upload an oversized file — rejected.
  Confirm the bucket settings took effect server-side, not just in the client.

  **Commit.** `fix(recoffee): validate product image uploads by MIME type and size`

- [ ] **T14 — Make the local-JSON fallback visible and block checkout in it**

  **Problem.** `src/hooks/useProducts.jsx:82-88` catches indiscriminately — an RLS denial, an outage
  and a schema change all land in the same branch — and silently serves prices baked into the bundle
  at build time. Those prices flow into the cart and into checkout with no indication anything is
  wrong. It also produces non-uuid product ids (`"prod_009"`), which is why
  `resolveFallbackProductIds` exists in `ReviewStep.jsx:39-59`.

  **Do.** Keep the fallback for catalog browsing — it is deliberate and useful. But:
  - Expose a `degraded` flag from the hook.
  - Show a visible banner while it is active. Strings in both locale files.
  - Block checkout entirely while degraded. After T1 the RPC rejects unknown product ids anyway, so
    this is the honest UX in front of a backstop that already exists.
  - Distinguish a genuine outage from an empty catalog, and log which error triggered the fallback
    rather than a bare `console.warn`.

  **Verify.** Force the Supabase call to fail (bad URL in `.env`, or offline). Confirm the catalog
  still renders, the banner appears, and checkout is blocked with a clear message. Restore and
  confirm normal operation returns with no banner.

  **Commit.** `fix(recoffee): surface degraded catalog mode and block checkout in it`

- [ ] **T15 — Maintain `updated_at` and record status changes**

  **Problem.** `orders.updated_at` (`init_schema.sql:96`) has a default but no trigger. Only
  `src/pages/admin/Orders.jsx:50` sets it, and only on a status change, so any other write path
  leaves it stale and it can't be trusted. There is also no record of **which** admin changed a
  status or what the previous value was — a gap for dispute resolution and insider risk alike.

  **Do.** A `moddatetime` trigger for `updated_at`, and an `order_status_history` table
  (`order_id`, `from_status`, `to_status`, `changed_by uuid default auth.uid()`, `changed_at`)
  written by a trigger on `orders`. RLS: admins read, nobody writes directly. Drop the now-redundant
  manual `updated_at` from the admin update call.

  **Verify.** Change an order status in the admin UI. Confirm `updated_at` moves and a history row
  appears with the correct `changed_by`. Confirm a non-admin cannot read or write the history table.

  **Commit.** `feat(recoffee): track order updated_at and status history`

## Phase 5 — Hygiene

- [ ] **T16 — Untrack `.env`**

  **Problem.** `git ls-files` includes `.env`, and `.gitignore` has no `.env` entry. The remote is
  `github-discipline:DisciplineOnly/ReCoffee.git`. Current contents are only `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY`, both public-by-design in a Vite SPA — **there is no live secret exposure
  today**. The risk is structural: the file is tracked, so the first time a
  `SUPABASE_SERVICE_ROLE_KEY` or a payment-gateway secret lands in it — very likely during the
  payment integration — it goes straight to the remote, and history keeps it after removal.

  **Do.** Add `.env` (and `.env.local`, `.env.*.local`) to `.gitignore`. `git rm --cached .env`.
  Commit a `.env.example` with the two variable names and empty values. Note in `CLAUDE.md` that
  server-only secrets must never live in this file at all — Vite exposes `VITE_`-prefixed vars to the
  client, and one shared `.env` is the habit that leaks the rest.

  Do **not** rewrite git history for this — the committed values are public keys and a force-push
  costs more than it buys. Say so explicitly rather than leaving it ambiguous.

  **Verify.** `git status` shows `.env` untracked and ignored. `npm run dev` still starts and the app
  still reaches Supabase (the local `.env` must survive on disk). `.env.example` is committed.

  **Commit.** `chore(recoffee): untrack .env and add .env.example`

- [ ] **T17 — Stop computing money in floats**

  **Problem.** `src/contexts/CartContext.jsx:82,94,98` sum IEEE-754 doubles. Stored values are fine —
  Postgres rounds into `decimal(10,2)` — but the comparison at `:94`,
  `getCartTotal() >= freeOverBgn`, can see 99.99999999999999 for a cart that should total exactly
  100.00 and charge the 5 BGN delivery fee anyway.

  **Do.** Compute in integer stotinki, or round to 2dp before every threshold comparison. Check
  `src/lib/price.js` for an existing helper before adding one. Largely moot for stored values once
  T1 recomputes server-side, but the displayed fee must still be right.

  **Verify.** Build a cart that sums to exactly the threshold and confirm delivery is free. Test just
  above and just below. Include a case with a `.10`/`.20`-style price that triggers the drift.

  **Commit.** `fix(recoffee): compare cart totals without float drift`

- [ ] **T18 — Bound the jsonb payload columns**

  **Problem.** `orders.client_info`, `orders.delivery_info` and `inquiries.details` are `jsonb` with
  no size or shape validation. A direct insert can carry arbitrary keys and megabytes. Values render
  through React so they're escaped — this is storage abuse, not XSS.

  **Do.** Validate shape inside T1's `place_order` (known keys, sane string lengths). Add
  `check (pg_column_size(client_info) < 8192)` and the equivalent for the others. Check existing rows
  fit first.

  **Verify.** Place a normal order and confirm it fits comfortably. Attempt an oversized payload and
  confirm rejection. Confirm no existing row violates the constraint before applying it.

  **Commit.** `fix(recoffee): bound jsonb payload sizes on orders and inquiries`

- [ ] **T19 — Add a retention and erasure path**

  **Problem.** `orders.client_info` holds name, email, phone and address indefinitely, admin-readable,
  with no deletion mechanism. `newsletter_subscribers` has no unsubscribe route — insert-only,
  admin-read-only, with no token-based removal. The site publishes a privacy policy
  (`src/pages/legal/Privacy.jsx`, `src/data/legalContent.js`), so the stated commitments and the
  schema should be reconciled. Bulgaria is in GDPR scope; erasure requests need a supported path.

  **Do.** A token-based unsubscribe link and route for the newsletter. An admin-side erasure action
  that anonymises `client_info` on an order while preserving the financial record (order number,
  totals, dates) — do not hard-delete orders. Read `legalContent.js` and make the code match what the
  policy actually promises; if they disagree, flag the discrepancy rather than quietly picking one.

  **Verify.** Unsubscribe via a generated link and confirm the row is gone and the link is
  single-use. Run an erasure on a test order and confirm PII is gone while totals and order number
  survive, and that the admin list still renders.

  **Commit.** `feat(recoffee): add newsletter unsubscribe and order PII erasure`

- [ ] **T20 — Stop trusting the client-computed subscription quote**

  **Problem.** `src/pages/Subscription.jsx:64-73` writes `details.pricePerDelivery`, computed in the
  browser from `SUBSCRIPTION_DISCOUNT`. It's an inquiry rather than an order so no money moves — but
  staff may quote from it, and it is attacker-controlled.

  **Do.** Either stop storing the number and have the admin view derive it, or recompute it
  server-side. Make it visibly untrusted in `src/pages/admin/Inquiries.jsx` if it stays client-sourced.

  **Verify.** Submit a subscription request with a tampered discount and confirm the admin view shows
  the correct price or no price — never the tampered one.

  **Commit.** `fix(recoffee): stop trusting client-computed subscription pricing`

---

## Discovered during the loop

Add anything new found while working, with file:line and enough detail to act on later. Do not fix
out-of-scope findings inline.

- **Seed drift on the La Spaziale name.** `supabase/migrations/20260723000001_seed_catalog.sql:83-84`
  still seeds `La Spaziale S2 EK — 2 групи` / `La Spaziale S2 EK — 2 Group`, while
  `src/data/products.json:210-211` and the live DB both say `La Spaziale S2 — 2 групи`. A fresh
  bootstrap currently lands on the right name only because `20260723000002_fix_product_names.sql`
  runs after the seed and corrects it. CLAUDE.md says the seed is generated *from* `products.json`,
  so regenerating it would make 20260723000002 a no-op — which is the right end state, but the two
  files disagree until someone does it. Found while recovering 20260723000002 (below).

- **A migration was live but uncommitted.** `20260723000002_fix_product_names` existed in
  `supabase_migrations.schema_migrations` on the live project with no file in the repo, which made
  `supabase db push` refuse to run at all ("Remote migration versions not found in local migrations
  directory"). Recovered verbatim from the ledger's `statements` column and committed as part of T1.
  Worth knowing that the ledger stores the SQL, so this is recoverable rather than fatal — and worth
  a habit of pushing from the repo rather than applying SQL from the dashboard.

- ~~**`order_items` has no `product_id` index**~~ **Resolved by T12**, which also confirmed the
  planner uses it (`Bitmap Index Scan on order_items_product_id_idx`).

- ~~**The review step quotes a price the server may not honour.**~~ **Largely resolved by T8.** The
  cart now stores ids and joins the live catalog, so the review step quotes current prices rather
  than a snapshot — verified by changing a price in the DB and seeing an already-open cart pick it up
  on reload. The *residual* gap is narrower than originally written: a price that changes between the
  review screen rendering and the customer pressing "Поръчай" would still be quoted stale for those
  seconds, because the review step reads the catalog the page loaded with. Closing that fully needs
  either a dry-run price quote from the server or a re-fetch on submit; neither is worth it for a
  seconds-wide window, and `place_order()` remains authoritative either way.

- ~~**`CheckoutSuccess` has an unguarded `JSON.parse`.**~~ **Resolved by T7.** The component no
  longer reads or parses `localStorage` at all — it fetches from `lookup_order()` — so the crash
  path is gone by construction rather than by adding a try/catch.

- **`anon` and `authenticated` hold far more table privilege than they need.** Found while doing
  T3's revoke: on **every** table in `public`, both roles are granted the full
  `SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER` set — Supabase's default, with RLS
  expected to do the actual gating. It mostly does: `orders` has no DELETE policy, `order_items` has
  neither UPDATE nor DELETE, so those are refused. **But `TRUNCATE` is not subject to RLS at all.**
  It is not reachable today because PostgREST only issues SELECT/INSERT/UPDATE/DELETE, so there is no
  live exposure — the exposure would begin the moment any `security definer` function, trigger or
  future endpoint executes SQL under those roles. A blanket
  `revoke truncate on all tables in schema public from anon, authenticated;` costs nothing and
  removes the footgun. T3 revoked INSERT only, as scoped.

- **LOOP.md's own T9 description was partly wrong, and worth correcting for the record.** It states
  that ratings feed "the `AggregateRating` in `src/lib/structuredData.js`". There is **no**
  `AggregateRating` anywhere in the codebase — `grep -rn "AggregateRating" src/` returns nothing, and
  `productSchema()` emits only `name/description/sku/image/brand/weight/offers`. So the SEO half of
  that finding did not exist. The rating-manipulation half was real and is fixed. **Adding an
  `aggregateRating` to `productSchema` is a genuine SEO opportunity** now that reviews are moderated
  and trustworthy — but it is a feature, not a fix, so it is recorded here rather than done.

- **Uploaded product images are still orphaned on delete.** `src/pages/admin/Products.jsx` deletes
  the row but never the storage object, so every replaced or deleted product leaves its file in the
  public `products` bucket forever. T13 hardened *what* can be uploaded but deliberately did not add
  cleanup: doing it safely means deleting by parsed object path on product delete **and** on image
  replace, and getting it wrong deletes a live image. The bucket now has a 5 MB cap so the growth is
  bounded per object, but it is unbounded in count.

- **Admin uploads still do not follow the slug naming convention** in `docs/PRODUCT_IMAGES.md` —
  objects are named `<uuid>.<ext>`, not `<slug>.jpg`. Carried forward from PROGRESS.md Task 1. T13
  kept the random name deliberately: the slug is not known to `ImageUpload` (it is a standalone field
  component, and on the "new product" form the slug may not exist yet), and a predictable name in a
  public bucket lets someone pre-empt or guess uploads. Closing this properly means passing the slug
  in and renaming on save.

- **A cart can hold products from a different Supabase project.** Found in the real browser profile
  during T2: `recoffee_cart` contained a `mass-appeal` line whose `id` was a valid uuid and whose
  image URL pointed at `hoirqrkdgbmvpwutwuwj.supabase.co` — a *previous* project. It passes the
  `isUuid` check, so it reaches the RPC and is correctly rejected as `ORDER_PRODUCT_UNKNOWN`. Before
  T2 it would have hit a raw foreign-key violation and shown the generic error. Nothing to fix — the
  handling is now right — but it is a reminder that `recoffee_cart` in the wild holds arbitrary old
  shapes, which **T8**'s migration path has to survive.

## Not in scope

- The payment gateway itself. T1 and T3 are its prerequisites — `payment_info` must stop being
  client-writable before any gateway is wired in.
- Anything already verified sound in the audit: `is_admin()`'s `security definer` + pinned
  `search_path`, `admin_users` having no write policy, the admin write policies gating on
  `is_admin()` rather than mere authentication, the absence of a DELETE policy on `orders`,
  `order_items` SELECT deriving visibility from the parent order, the order-number generator's
  `crypto.getRandomValues` + unbiased modulus, the absence of any SQL-injection surface (everything
  goes through PostgREST's parameterised builder), and the absence of `dangerouslySetInnerHTML` on
  any DB-sourced value. Do not "fix" these.
