# ReCoffee — completion loop progress

## TASK 1 COMPLETE

**What was built:** Identified all 11 photos in `public/products/` by viewing each one and renamed
them to their product slug (`illy-iperespresso-intenso.jpg`, `saeco-royal-professional.jpg`, …).
This also repaired 10 broken image paths, since `src/data/products.json` already referenced these
names. Added `docs/PRODUCT_IMAGES.md` documenting the image resolution order and four routes for
uploading into the public `products` Supabase bucket.

**Verified by:**
- `npm run build` — passed, 1685 modules, built in 1.37s.
- `npm run lint` — 0 errors, 14 warnings, all pre-existing `react-hooks` warnings in files not
  touched by this task.
- `npm run dev` — started clean on port 5174; `GET /` returned 200.
- Script-checked all 19 image references in `products.json`: 11 local refs, **0 missing**; the only
  unreferenced file is `placeholder.svg`, which is intentional (the fallback in
  `src/lib/productImage.js`).
- `curl`ed all 11 renamed files through the dev server: every one returned **200** with the correct
  `Content-Type` — notably the ex-`.jfif` files now serve as `image/jpeg`, confirming browsers will
  render them.
- Checkout, admin CRUD and DB queries untouched: this task changed only static assets, one JSON
  string, and a new doc.

**Assumptions made:**
- `.jfif` → `.jpg` is a rename, not a conversion. JFIF *is* JPEG; verified by the served
  `Content-Type: image/jpeg`.
- The La Spaziale photo is a real PNG, so `products.json` was pointed at `.png` rather than
  relabelling a PNG as `.jpg`.
- `placeholder.svg` is not a product photo and was left in place — it is the neutral fallback, not
  a placeholder *product*. (Placeholder products are Task 3's scope.)
- Image→product matching was done visually, one image per product; every one had exactly one
  plausible match.

**Follow-ups needed:**
- Data discrepancy worth a human decision: the two illy Easy machine photos came from a shop listing
  them as **E.S.E. pod** machines, but `products.json` describes prod_013/prod_014 as
  **iperEspresso capsule** machines. The Easy body is sold in both variants, so the photo is not
  wrong — but the product copy should be confirmed against what is actually being stocked.
- `products.image_url` is `NULL` for every row (by design in the seed). The shop renders from the
  local mirror until someone runs one of the upload options in `docs/PRODUCT_IMAGES.md`.
- `src/components/admin/ImageUpload.jsx` uploads under a random object name rather than the slug, so
  admin-uploaded files won't follow the naming convention established here.

---

## TASK 2 COMPLETE

**What was built:** Added an `admin` section to `bg.json`/`en.json` (145 keys, full BG/EN parity) and
routed every string in the admin dashboard — layout, table, login, products, services, both forms,
orders, inquiries and the image uploader — through `useTranslation()`. Since `useTranslation` is
pinned to `bg`, the dashboard now renders entirely in Bulgarian.

**Verified by:**
- `npm run build` — passed.
- `npm run lint` — 0 errors, **14 warnings, exactly the pre-existing baseline** (my first pass added
  2 `exhaustive-deps` warnings; those are gone after the fix described below).
- Script-checked every `t()` key used across the 10 admin files: **150/150 resolve in both locales**,
  plus all 11 dynamically-built enum keys. bg/en admin key sets are identical (145 each).
- Two regex scans for leftover English literals in JSX text, labels, placeholders, `alt`,
  `aria-label`, `alert()` and `confirm()` — **no matches**.
- Loaded `/admin/login` in a real browser: renders "Административен панел", "Добре дошли", "Влезте в
  профила си", "Електронна поща", "Парола", "Вход". Zero console errors.
- Loaded `/shop` to confirm the shared-translations change is safe: all 19 products render, Bulgarian
  copy and dual-currency prices intact, and the Task 1 renamed images all display.
- Checkout and admin CRUD logic untouched — no Supabase query was modified.

**Assumptions made:**
- "All Bulgarian" is satisfied by the translation layer rather than hardcoded strings. There is no
  language switcher — `useTranslation` returns `lang = 'bg'` unconditionally — so `t()` always yields
  Bulgarian, and this keeps the admin consistent with the CLAUDE.md convention. EN was filled in as
  the documented fallback, not as a shippable admin locale.
- Order/inquiry status values and product category values are **DB data, not copy**. Only their
  labels are translated; every `<option value>` still carries the raw stored string, so status
  updates and category filtering are unaffected.
- Product/service names typed by the shop owner (`name_bg`) are content, not UI copy, and are shown
  as stored.

**Follow-ups needed:**
- I could not log into the admin dashboard itself — no credentials — so the inner pages were verified
  by build, exhaustive key resolution and source scanning rather than visually. Only `/admin/login`
  was confirmed in a browser.
- One shared-file change was needed to keep this correct: `t` is now defined at module scope in
  `src/lib/translations/index.js` instead of being rebuilt inside the hook. It previously returned a
  new closure per render, which made it unusable in any dependency array — listing it would re-run
  the effect forever. Behaviour is identical for all existing callers; it is now stable by reference.

---

## TASK 3 COMPLETE

**What was built:** Removed the 8 demo coffees from `src/data/products.json` and from the catalog
seed (products + their flavour rows), leaving the 11 real products. Wrote the live-DB cleanup to
`supabase/scripts/remove_placeholder_products.sql` for review rather than running it. Removed all 9
Unsplash stock photos; article images are now optional and render through a new `ArticleImage`
component that shows a brand panel instead of a broken image.

**Verified by:**
- `npm run build` — passed. `npm run lint` — 0 errors, 14 warnings (unchanged baseline).
- Grepped `src/`, `public/` and `supabase/` for `unsplash` and the old project ref: **no matches**.
- Seed structurally re-checked: 11 product rows in the VALUES block, 11 UUIDs in the flavour DELETE
  list, block terminators and `ON CONFLICT` intact, zero placeholder UUIDs or slugs remaining.
- `products.json` reparsed cleanly: 11 products, **0 non-local image references** (was 8).
- Browser: `/learn` renders the branded panel where the stock photo was — layout preserved, no
  broken image. Homepage and `/shop` load with **0 broken images**.
- Checkout and admin CRUD untouched.

**Assumptions made:**
- `placeholder.svg` is not a placeholder *product* — it is the fallback in `productImage.js` and was
  kept.
- `supabase/migrations/_archive/` still contains the old placeholder seed. It was left alone: CLAUDE.md
  documents that chain as retired and unable to bootstrap, so it never runs. Editing it would rewrite
  dead history.
- Removing photos without replacements would have left visual holes, so decorative blocks that carry
  layout (Philosophy column, article cards) became brand panels, while purely decorative ones (About
  hero, admin login backdrop) were deleted outright.

**Follow-ups needed:**
- **The 8 placeholders are still live on the site.** Correcting what I predicted when I asked about
  this: they do *not* fall back to grey placeholders. Their DB rows carry their own `image_url`
  (Unsplash and the old `hoirqrkdgbmvpwutwuwj` project), so they still render with photos. `/shop`
  currently shows 19 products — 11 real with local images, 8 placeholders from the DB. Running
  `supabase/scripts/remove_placeholder_products.sql` is what removes them.
- Real photography is needed for the About hero, the Philosophy section and the 6 Learn articles.

---

## TASK 4 COMPLETE

**What was built:** Split the work by what a crawler sees without JavaScript. `index.html` gained a
complete static head (canonical, robots, theme-color, full Open Graph + Twitter, and a Store/WebSite
JSON-LD graph); `useSEO` grew to manage OG, Twitter, an indexing directive and route-scoped JSON-LD;
a new `lib/structuredData.js` builds Product, BreadcrumbList, FAQPage and Article schema, now emitted
by product detail, FAQ and Learn articles. GEO: `robots.txt` names the AI crawlers explicitly and
`public/llms.txt` describes the business in plain Bulgarian. The hand-maintained sitemap is now
generated by `scripts/generate-sitemap.js`.

**Verified by:**
- `npm run build` passed; `npm run lint` 0 errors, 14 warnings (unchanged baseline).
- Product page in a browser: **3 JSON-LD blocks, 0 parse errors** — the static Store+WebSite graph
  plus Product and BreadcrumbList. Product schema carries correct sku, brand, weight, `price
  "79.00"`, `priceCurrency BGN`, `InStock`, and a `seller` `@id` resolving to the static organization.
  `og:type=product`, canonical, and `twitter:card=summary_large_image` all set.
- FAQ page: **all 7 questions** present in FAQPage schema, and every `acceptedAnswer.text` is a
  string — the JSX answer correctly used its plain-text twin.
- **Leak test**: navigated `/faq` → `/about` *within the SPA*. Route-scoped JSON-LD dropped to 0,
  FAQPage gone, static identity graph correctly untouched.
- `/cart` returns `robots: noindex, follow` with a proper title.
- `robots.txt`, `llms.txt`, `sitemap.xml`, `og-image.jpg` all serve 200 with correct content types
  and all ship into `dist/`.
- Sitemap regenerated: 17 URLs → **29**; dead `/locations` removed; **11 product pages added**
  (previously zero); articles carry `lastmod`.
- Checkout logic untouched — the checkout pages gained only a `useSEO` call.

**Assumptions made:**
- `https://recoffee.bg` is the production origin (taken from the existing robots.txt and sitemap) and
  is now recorded once in `siteConfig.url`.
- The static JSON-LD in `index.html` duplicates identity data from `siteConfig`. That duplication is
  deliberate — `index.html` cannot import JS modules — and is flagged in comments on both sides.
- The sitemap generator reads the local `products.json` mirror rather than the database, since it is
  a build-time script with no credentials.
- `og-image.jpg` is a copy of the existing square logo. `hero-coffee.jpg` was rejected for it: at
  747×1024 it is portrait, which crops badly in social previews.

**Follow-ups needed:**
- A purpose-made **1200×630** Open Graph image would render better than the square logo.
- `scripts/generate-sitemap.js` must be re-run when the catalogue changes. Wiring it to a `prebuild`
  script would automate that, but `package.json` has uncommitted changes from before this run, so I
  left it alone rather than entangle them.
- Because there is no SSR, per-route titles, descriptions and schema are invisible to crawlers that
  do not execute JavaScript. Pre-rendering or SSR is the real fix if AI-crawler and social-preview
  coverage of *product* pages matters.
- Unrelated to this task, noticed while adding FAQ schema: a Bulgarian FAQ answer links out with the
  English word "Wholesale" as its link text.

---

## TASK 5 COMPLETE

**What was built:** Three fixes, each reproduced before being fixed.

1. **Shop filter focus loss.** `FilterSidebar` was defined inside `Shop`, making it a new component
   type every render, so React remounted the entire sidebar whenever a filter changed. Hoisted it to
   module scope with an explicit props contract.
2. **Cart state mutation.** `addToCart` did `[...prevCart]` then `newCart[i].quantity += n` — a
   shallow copy shares its item objects, so that wrote into live state. Replaced with a
   non-mutating `map`.
3. **Search param mismatch — my own bug from Task 4.** The `SearchAction` schema and the robots.txt
   rule used `?search=`, but `SearchOverlay` navigates to `/shop?q=` and `Shop` reads `q`.

**Verified by:**
- Focus bug reproduced first: focused a filter checkbox, toggled it, `document.activeElement` became
  `BODY`. After the fix it stays on the `INPUT`. Sidebar behaviour re-checked: group→children
  cascade, indeterminate state, and counts 19 → 12 → 19 with no checkbox left stuck.
- Cart increment checked live: 2 → 3 after one add, total 158.00 лв = 2 × 79.00 before that.
- `npm run build` passed. `npm run lint` **14 → 12 warnings, 0 errors** — the
  `react-hooks/static-components` warning the eslint config itself calls "a genuine bug worth fixing"
  is gone.
- Checkout logic untouched.

**Assumptions made:**
- The hard rule "never touch payment or checkout logic unless the task names it directly" outranks
  "fix any bugs you find". Everything I found inside the purchase flow is reported below, unfixed.
- `CartContext.getDeliveryFee` was left alone for the same reason — it feeds checkout totals.

**Corrections to my own earlier reasoning:**
- I predicted `addToCart`'s mutation would double quantities under StrictMode. I tested it: it does
  **not** reproduce. Two clicks give quantity 2. The mutation is still worth fixing as a correctness
  issue, but it was not the user-visible bug I expected.

**Found but deliberately NOT fixed — all inside the purchase flow:**
*(All four were fixed in Task 6 below. Left here as the record of what this run found.)*

1. **Order numbers can collide.** `generateOrderNumber` is `RC-<year>-<6 random digits>` and
   `orders.order_number` is `unique not null`. At a few thousand orders a year a collision is likely
   (birthday problem), and it surfaces as a failed insert *after* the customer confirms. Needs a
   sequence or a retry.
2. **Checkout breaks in local-fallback mode.** `order_items.product_id` is a `uuid`, but products
   from `src/data/products.json` have ids like `"prod_009"`. If the Supabase fetch fails, the app
   falls back to that JSON, and any resulting order insert fails on an invalid uuid. A cart persisted
   in `localStorage` during a fallback session carries those bad ids afterwards too.
3. **Cart and checkout show BGN only.** Verified: the cart renders `158.00 лв` with **zero**
   dual-currency values, while the shop shows `45.00 лв (23.01 €)`. The cart/checkout components use
   raw `.toFixed(2)` and never import `lib/price.js`, which CLAUDE.md requires. During the euro
   changeover this is the flow where dual pricing matters most.
4. **Delivery thresholds are hardcoded.** `getDeliveryFee` uses literal `100`/`5` and `CartSummary`
   hardcodes `100` again, while `siteConfig.delivery` already holds both. Changing siteConfig would
   silently not apply.

---

## TASK 6 COMPLETE

**What was built:** The four purchase-flow issues Task 5 reported but left alone, plus a fifth found
while verifying them. This task named the checkout directly, so the "don't touch the purchase flow"
rule from Task 5 no longer applied.

1. **Order number collisions.** `generateOrderNumber` now draws 6 Crockford-base32 characters
   (`RC-2026-6XMYJT`) instead of 6 decimal digits — 32^6 ≈ 1.07 billion codes rather than 10^6.
   I/L/O/U are excluded so a number read out over the phone can't be mistyped, and 256 % 32 == 0 so
   indexing a random byte is unbiased. The remaining risk is absorbed by a retry: the insert is
   wrapped in a loop that redraws on a Postgres `23505` unique-violation, up to 5 attempts.
2. **Local-fallback checkout.** Rather than dropping bad ids, `ReviewStep` now *resolves* them. Any
   cart entry whose id is not a uuid is looked up by `slug` — stable across both the DB and
   `products.json` — in one `in.(…)` query just before the insert, and falls back to `null` only if
   the slug is gone. The admin order table already renders a generic label for a missed product join.
3. **Dual currency.** Every raw `.toFixed(2) лв` in the purchase flow now goes through
   `lib/price.js`: `CartItem`, `CartSummary`, `DeliveryStep`, `ReviewStep` and `CheckoutSuccess`.
   Prominent totals follow the existing `ProductCard` pattern (bold BGN, small muted EUR beneath);
   inline and secondary text uses `formatPrice`.
4. **Delivery thresholds.** `CartContext.getDeliveryFee` reads `siteConfig.delivery`, and
   `CartSummary` uses it for the progress hint and bar. `DeliveryStep` held a *third* copy of the same
   `>= 100 ? 0 : 5` literal and now calls `getDeliveryFee()`. Two copy strings that hardcoded "100 лв"
   were also fixed: the marquee (via a `{{amount}}` placeholder, matching the existing
   `admin.orders.totals` pattern) and `useSEO`'s default meta description.
5. **Post-order redirect — found while verifying the above.** Placing an order landed the customer on
   `/cart` instead of `/checkout/success`. React Router v7 wraps location updates in
   `startTransition`, but `clearCart()` is an ordinary `setState`, so the empty-cart render committed
   first while the route was still `/checkout`, mounting `<Navigate to="/cart" replace />`, whose
   effect replaced the in-flight navigation. Fixed with a one-way `orderPlaced` latch on
   `CheckoutContext`: `ReviewStep` sets it immediately before `clearCart()`, and `Checkout` returns
   `null` while it is set instead of evaluating the empty-cart guard.

**Verified by:**
- **Collision rates measured**, 1000 simulated years of 5000 orders each: old format **100.00%**
  chance of at least one collision per year, new format **1.90%**. Alphabet coverage checked at
  32/32 characters with frequencies 9816–10214 against an expected 10000, confirming no modulo bias.
- **Retry proven live** by faking two consecutive `23505` responses: the code attempted
  `RC-2026-GDZ5B2` → `RC-2026-YEGNP3` → `RC-2026-6XMYJT`, three *distinct* numbers, and succeeded
  instead of failing an order the customer had already confirmed.
- **Fallback resolution proven live** with a cart deliberately mixing a real DB uuid and a stale
  `prod_013`: exactly one lookup fired — `products?select=id,slug&slug=in.(illy-easy-red)` — and both
  order items went out with valid uuids. The uuid item triggered no query.
- Cart renders `85.00 лв / 43.46 €`, delivery `5.00 лв (2.56 €)`, hint `Добави още 15.00 лв
  (7.67 €)`; review step and success page dual throughout. A grep for `toFixed(2)`/`лв` across the
  cart and checkout files returns **no matches**.
- **siteConfig actually drives the threshold**: temporarily set to 80/7, an 85 лв cart flipped to free
  delivery, the marquee read "НАД 80.00 ЛВ" and the meta description "над 80 лв". Restored to 100/5.
- **Redirect verified by hooking `history.pushState`/`replaceState`**, so an intermediate bounce would
  be caught even if the final URL looked right. A full run recorded exactly `["push:/checkout/success"]`
  — no `replace:/cart`. The guard never fired.
- Guard regressions checked: `/checkout` with an empty cart still redirects to `/cart` (which also
  proves the latch resets between checkouts — a stuck latch would have rendered `null` and stayed),
  and a direct load of `/checkout` with items stays put, so the lazy-cart-init fix noted in
  `CartContext` still holds.
- `npm run build` passed. `npm run lint` **12 warnings, 0 errors — unchanged baseline**.

**Assumptions made:**
- **Nothing was written to the live database.** I intercepted the REST writes and inspected the
  payloads instead. `orders` has no delete policy in RLS, so a test order would have been permanent
  junk I could not clean up. The slug→uuid lookup was left hitting the real DB, since it is a read.
- Order numbers stay **client-generated with a retry** rather than moving to a DB sequence. A sequence
  default would have to be read back after insert, which entangles this with the RLS question in the
  follow-ups; the retry needs no migration and keeps the displayed number under the client's control.
  PROGRESS.md's own Task 5 note offered either option.
- "Cart and checkout" for dual currency means the customer-facing purchase flow **including the
  success page**. The admin dashboard was left BGN-only — it is an internal tool, not the surface the
  euro changeover is about.
- Item 4 was extended past the two places Task 5 named. The marquee string and the default meta
  description exhibit the *same* silent-mismatch failure the item describes, and both were cheap to
  fix. The topbar string was left alone — it advertises "над 50€" and never quotes the BGN threshold.

**Corrections to Task 5's reasoning:**
- Task 5 called a collision "likely" at a few thousand orders a year. Measured, that understates it:
  at 5000 orders a year the old format collided in **100% of 1000 simulated years**. It was not a
  risk, it was a certainty — the only question was which order failed.

**Follow-ups needed:**
- **Worth verifying against the live DB:** guest checkout does `.insert().select().single()` on
  `orders`, but the SELECT policy is `user_id = auth.uid()`, which does not match a guest row
  (`null = null` is NULL, not true). If PostgREST applies that policy to the `RETURNING`
  representation, a guest's insert cannot read its own row back. I could not test this because I
  intercepted the writes; it predates this task and is unchanged by it.
- Cart lines are keyed by `product.id`, so a cart built during a fallback session and one built
  against the DB can hold two lines for the same product. The insert now resolves both to the same
  uuid so the *order* is correct, but the customer would see the product twice. Keying by `slug` —
  as `WishlistContext` already does — is the fix; not done here because it changes the
  `addToCart`/`removeFromCart`/`updateQuantity` signatures and every caller inside the purchase flow.
- The admin dashboard (`Orders`, `Products`, `Services`) still formats money inline as BGN only.
- `PaymentStep` and `orders.payment_info` remain the payment-gateway integration point, untouched.


---

## LOOP T1 COMPLETE — server-authoritative `place_order()` RPC

**What was built:** `supabase/migrations/20260727000000_place_order_rpc.sql`, a `security definer`
function with `search_path = public` that is now the only way an order gets created. It ignores
anything price-shaped in its payload and recomputes every line from `products` as
`case when sale_price is not null and sale_price < price then sale_price else price end` — the same
rule as `effectivePrice` in `src/hooks/useProducts.jsx:51-52`. It also:

- rejects unknown and out-of-stock products, with unknown ids reported first so a bad id is never
  mislabelled as a stock problem;
- validates each line as `product_id` uuid-shaped + `quantity` a whole number in 1..999, in a
  separate pass *before* any cast, so a malformed payload returns a token rather than an opaque
  `22P02`; caps the cart at 50 lines; validates `grind_type` against the five known values;
- computes the delivery fee from a new `store_settings` row (public read, admin update, no insert or
  delete policy, `check (id = 1)` so it stays a singleton) rather than from anything the browser
  sends;
- hardcodes `status = 'pending'`, writes `payment_info` as `{"method": …}` validated against
  card/cash/bank and nothing else, and takes `user_id` from `auth.uid()` — none of the three is a
  parameter;
- adds `order_items.product_name` and snapshots it at order time, so a rename or delete can no
  longer rewrite history;
- ports the client order-number generator whole: same Crockford base32 alphabet minus I/L/O/U, same
  `RC-<year>-<6>` shape, same 5-attempt retry on `23505`. Randomness comes from
  `decode(replace(gen_random_uuid()::text,'-',''),'hex')` and bytes 0..5, which in a v4 uuid carry no
  version or variant bits — six uniform random bytes, and `256 % 32 = 0`, so the modulus stays
  unbiased. No pgcrypto dependency, consistent with the `gen_random_uuid()` rule in CLAUDE.md;
- writes the order and all its lines in one transaction, closing H2's orphan-order window;
- returns `order_number, subtotal, delivery_fee, total, created_at, items` — enough for T7 to render
  the confirmation page without trusting localStorage.

The same change is folded into `20260723000000_init_schema.sql` so a fresh project bootstraps
identically. `src/lib/siteConfig.js` keeps its `delivery` block, now labelled display-only.
CLAUDE.md's "exactly two idempotent migrations" is updated to four, with the fold-into-init rule
written down.

**Verified by:** all against the **live project** (`mwmgjdcegrcjekkyjnas`) with the shipped anon key
over PostgREST — not the admin UI.

- **4 accepted calls, 10 rejected, and the rejections left zero rows.** Accepted: an over-threshold
  cart (`128.50` subtotal → `0.00` delivery → `128.50`), an under-threshold cart (`49.50` → `5.00` →
  `54.50`), and both tamper attempts. Rejected: out-of-stock (`ORDER_PRODUCT_OUT_OF_STOCK`),
  unknown id (`ORDER_PRODUCT_UNKNOWN`), `quantity: -5`, `quantity: 1000`, `quantity: 1.5`, 51 lines,
  empty cart, `payment_method: 'free'`, `grind_type: '<script>'`, and `product_id: "prod_009"` (the
  local-JSON fallback shape). Counting rows afterwards gave exactly 4 orders from the RPC.
- **Tampering ignored, confirmed on the stored row.** A cart sending `unit_price: 0.01`, `price:
  0.01` and `sale_price: 0.01` on every line stored `49.50` and `79.00` — the catalog prices — and a
  subtotal of `178.00`, not `0.02`. `status`, `user_id` and a full `payment_info` (including a card
  number) forged inside `p_client`/`p_delivery`/the lines were all discarded: the row came back
  `status = 'pending'`, `user_id = null`, `payment_info = {"method": "bank"}`.
- **The sale-price rule is the `<` rule, not `coalesce`.** Set up deliberately: one product with
  `sale_price 49.50 < price 79.00` priced at `49.50`; one with `sale_price 99.00 >= price 79.00`
  priced at `79.00`, not `99.00`.
- **`user_id` really is `auth.uid()`.** Signup could not be used (this project rejects
  non-deliverable domains — `email_address_invalid` on both `.invalid` and a made-up `.dev`), so it
  was tested by setting `request.jwt.claims` to the one existing auth user and calling the function:
  the stored `user_id` matched that user's id exactly.
- **Both files re-applied cleanly**, then the tamper cases were re-run and still behaved — so
  `init_schema.sql` is genuinely still idempotent with the function folded in, and the standalone
  migration is too.
- `npm run build` passed (1.30s). `npm run lint` **0 errors, 12 warnings — unchanged baseline**.
  Only `siteConfig.js` (a comment), `CLAUDE.md` and SQL changed, so this was expected.
- **All test data was removed.** `orders` and `order_items` are back to 0 rows (they were empty
  before), and the three fixture products are back to `sale_price null` / `in_stock true`.

**Assumptions made:**
- **The return signature was extended** beyond the four columns LOOP.md sketched, to
  `+ created_at + items`. The task also required "return enough for the confirmation page to render
  without trusting localStorage", and four scalars are not enough — T7 needs the line items and the
  date. `items` carries the server's own prices and snapshotted names.
- **`store_settings` is a table, not constants in the function.** "Put an authoritative copy in the
  DB" reads either way, but a table lets an admin change the threshold without a migration, and
  public-read means a later task can make the storefront display the live value instead of the
  hardcoded one.
- **`grind_type` is validated**, which LOOP.md did not ask for. It is unconstrained `text` reaching a
  `not null` column straight from the browser, and the allowlist was one line next to the quantity
  check.
- **Errors are stable uppercase tokens** (`ORDER_PRODUCT_OUT_OF_STOCK`, …) in the exception message,
  with human detail in `detail`. Locale strings belong in `bg.json`/`en.json`, not in SQL; T2 maps
  them.
- **The function is duplicated** between the new migration and `init_schema.sql`. That is the rule in
  LOOP.md's ground rules, not an oversight — but it is ~180 lines in two places and will drift, so
  both files now carry a comment saying to change them together.
- **`jsonb` shape validation on `client_info`/`delivery_info` was deliberately left out** — that is
  T18's scope, and doing it here would have widened T1.

**Worth knowing for T2 and T3:**
- **PostgREST refuses unknown top-level RPC arguments outright.** The first attempt at the "tampered
  payload" tests put `subtotal`/`status` alongside `p_items` and got `404 PGRST202`, not a stored
  row — the function is never reached. That is a stronger property than the function's own checks,
  but it also means the realistic attack is tampering *inside* `p_items`/`p_client`, which is how the
  tests were rewritten. T2 must send exactly the four parameters.
- **T3's premise is confirmed empirically.** As a control, a direct anon `insert` into `orders` was
  attempted alongside the RPC tests: **HTTP 201**, storing `status: 'delivered'`, `total: 0.01` and
  **zero line items**. The hole is open exactly as described, and `place_order` does not close it —
  T3 does.

**Follow-ups needed:**
- `place_order` does not decrement stock or hold it. `in_stock` is a boolean, not a count, so there
  is nothing to decrement today; if inventory ever becomes numeric this function is where the
  reservation belongs.
- The `not found` fallback to hardcoded `100`/`5` inside the function is unreachable while the
  seeded row exists, but it is a second copy of the numbers. If `store_settings` ever gains rows for
  multiple stores, delete it rather than letting it drift.

---

## LOOP T2 COMPLETE — checkout routed through `place_order`

**What was built:** `ReviewStep.handlePlaceOrder` no longer touches `orders` or `order_items`. The
two unsynchronised inserts are replaced by one `supabase.rpc('place_order', …)` carrying
`{product_id, quantity, grind_type}` per line and nothing else — no `unit_price`, no `subtotal`, no
`total`, no `status`, no `user_id`. Also:

- **The `PGRST204` legacy fallback is gone.** It retried the insert with `payment_info` and `user_id`
  stripped, which silently turned a logged-in customer's order into a guest order they could never
  see again. Its migration has long been applied.
- **`resolveFallbackProductIds` now fails the checkout** on a query error instead of returning an
  empty Map, and an unresolvable slug throws too. Both used to produce `product_id: null` order
  lines. Kept otherwise, as T2 asked; T14 removes the need for it.
- **The confirmation renders the server's figures.** `recoffee_last_order` now stores
  `order_number`, `created_at`, `subtotal`, `delivery_fee` and `total` straight off the RPC's return
  value, and each line carries the RPC's `product_name` and `unit_price`. `CheckoutSuccess` was
  updated to the new item shape, with a `normalizeOrder` fold-in so an order placed just before this
  shipped still renders from the old `{ product: {...} }` shape.
- **Rejections get a specific message.** `ORDER_ERROR_KEYS` maps the RPC's tokens to six new locale
  strings in **both** `bg.json` and `en.json`; anything unrecognised still falls back to
  `checkout.order_error` rather than showing a raw Postgres error. For `ORDER_PRODUCT_OUT_OF_STOCK`
  the offending product names from the exception's `detail` are appended — the other tokens carry
  uuids or internal limits there, so those stay hidden.
- The client-side order-number generator, its retry loop and the `UNIQUE_VIOLATION` constant are
  deleted — that logic lives in SQL now. `isUuid` stays for the fallback resolver.

**Verified by:** a real dev server (port 5177) driven end to end through the actual UI against the
**live** Supabase project, not a mock.

- **Happy path.** Added a product through the shop UI, filled all three checkout steps, placed the
  order. Landed on `/checkout/success`; the DB row reads `RC-2026-50NP05`, `pending`, subtotal
  `79.00`, delivery `5.00`, total `84.00`, `payment_info {"method":"cash"}`, `user_id null`, one line
  at `unit_price 79.00` with `product_name` populated. The success page rendered the name, the line
  price and all three totals.
- **Tampered cart, and this is the one that matters.** Forged `recoffee_cart` to `price: 0.01`,
  `quantity: 3`. The review step displayed **"Междинна сума 0.03 лв … Общо 5.03 лв"** — and the order
  that was actually stored is subtotal **237.00**, delivery **0.00** (3 × 79.00 crosses the 100 BGN
  threshold, so the fee correctly dropped), total **237.00**, line `unit_price 79.00`. The
  confirmation page rendered 237.00, not 5.03: it is reading the server, not the cart.
- **Rejection leaves nothing behind.** The browser profile turned out to already hold a stale cart
  line from a *different* Supabase project (`mass-appeal`, image URL on `hoirqrkdgbmvpwutwuwj`), so
  the rejection path got tested on real junk rather than something contrived. Result: the alert read
  **"Част от продуктите в количката вече ги няма в каталога…"** — the specific string, not
  `order_error` — the cart was left intact, no navigation fired, no `recoffee_last_order` was
  written, and `select count(*) from orders` was **0**.
- **Task 6 regression re-run.** `history.pushState`/`replaceState` were hooked before each run so an
  intermediate bounce would be caught even if the final URL looked right. Both successful runs
  recorded exactly `["push:/checkout/success"]` — no `replace:/cart`. The empty-cart guard never
  fired.
- Browser console across the whole session: **2 errors, both from the deliberate rejection** (the
  400 from PostgREST and our own `console.error`). Nothing else.
- `npm run lint`: **12 warnings, 0 errors before; 12 warnings, 0 errors after — unchanged.**
  `npm run build` passed in 1.21s. Both locale files re-parsed as valid JSON.
- **Test data removed**: both orders deleted, `orders` and `order_items` back to 0 rows, and the
  browser's `recoffee_cart` / `recoffee_last_order` cleared.

**Assumptions made:**
- **The review step still quotes the local cart.** T2 said to render *the confirmation* from the RPC,
  and that is done. The pre-submit review is an estimate by nature — the order does not exist yet, so
  there is no server figure to show without a dry-run round trip. The consequence is real and was
  observed (5.03 shown, 237.00 charged), so it is logged under *Discovered during the loop* for T8
  rather than papered over.
- **Line-to-photo matching is by array index.** `place_order()` returns its items `order by line_no`,
  which is the order they were sent in, which is cart order — so index *i* of the response is index
  *i* of the cart. The RPC has no reason to return image URLs, and this avoids a second lookup. It is
  commented at the call site because it is a real coupling.
- **Errors still use `alert()`.** Replacing it with inline error UI is a visual-design change T2 did
  not ask for; only the *content* of the message changed.
- **`supabase.auth.getSession()` was dropped from this path.** It existed only to populate `user_id`,
  which the RPC now takes from `auth.uid()`. supabase-js already attaches the session's
  `Authorization` header, so a logged-in customer's order is still attributed — verified in T1.

**Follow-ups needed:**
- Placing an order with an empty cart is prevented by the route guard, not by this code — the RPC
  would reject it with `ORDER_EMPTY_CART` and the string exists, but the path is unreachable today.
  Left in place as a backstop.
- Two entries were added to *Discovered during the loop* for later tasks: the review-step price
  mismatch above (T8), and an unguarded `JSON.parse` in `CheckoutSuccess` that blanks the page on a
  corrupt `recoffee_last_order` instead of redirecting (T7 rewrites that reader anyway).

---

## LOOP T3 COMPLETE — direct client inserts on orders revoked

**What was built:** `supabase/migrations/20260727000001_revoke_client_order_inserts.sql`, the third
and final step of the Phase 1 change. It drops both insert policies and revokes the underlying
privilege:

```sql
drop policy if exists "Anyone can create an order"   on orders;
drop policy if exists "Anyone can create order items" on order_items;
revoke insert on orders      from anon, authenticated;
revoke insert on order_items from anon, authenticated;
```

**Dropping the policies alone would not have been enough**, and this is the part worth remembering:
Supabase's default privileges grant table-level INSERT on new `public` tables to `anon` and
`authenticated`, and a policy is only consulted *after* the privilege check passes. Removing the
policy denies the write; revoking the privilege means the right to attempt it never existed. Both
are applied so neither is load-bearing on its own. The same reasoning is now written into CLAUDE.md,
because the next write-restricted table will hit it too.

Folded into `init_schema.sql`: the two `create policy` statements are gone and the two `revoke`s
added, so a fresh project bootstraps closed rather than open-then-closed. SELECT policies were left
exactly as they were. CLAUDE.md's migration list is now five.

**Verified by:**

- **The hole is measurably shut.** The same direct `insert` into `orders` that returned **HTTP 201**
  during T1 — storing `status: 'delivered'`, `total: 0.01`, zero line items — now returns
  **HTTP 401 / `42501` "permission denied for table orders"**. The direct `insert` into
  `order_items` (H1: append a line at any price to any order, using a foreign `order_id`) returns
  the same. Both over real PostgREST with the shipped anon key.
- **`place_order` is unaffected**, as predicted — it is `security definer` and inserts as its owner.
  Called with the anon key immediately after the revoke: HTTP 200, `RC-2026-3AKECG`, subtotal 79.00,
  delivery 5.00, total 84.00.
- **Checkout still works through the UI.** Full run on a dev server (port 5178): added to cart,
  three checkout steps, placed. Landed on `/checkout/success` with `RC-2026-YMDDFS`, 79.00 / 5.00 /
  84.00, no alerts, and `history` recorded exactly `["push:/checkout/success"]`.
- **The admin dashboard still lists and updates orders.** Tested by running the *actual* queries from
  `src/pages/admin/Orders.jsx` under `set role authenticated` with the real admin's
  `request.jwt.claims` — so table grants and RLS both applied exactly as they do for a logged-in
  admin, rather than as the superuser the CLI normally connects as. The list returned the order, its
  line count and the snapshotted `product_name`; the status `UPDATE` succeeded and read back as
  `processing`.
- **Anon SELECT still behaves**: HTTP 200 with `[]` — the policy is intact and guest orders remain
  invisible, which is exactly the pre-existing state T6 will address.
- **`init_schema.sql` re-applied cleanly**, and the direct-insert test was re-run *afterwards* and
  still returned 42501 — so re-running the bootstrap file does not silently re-open the hole. That
  was the specific risk of folding a `revoke` into a file whose other statements are
  `drop policy` / `create policy` pairs.
- `npm run lint`: **12 warnings, 0 errors — unchanged baseline.** `npm run build` passed in 1.20s.
  No application code changed in this task, so both were expected to be untouched.
- **Test data removed**: all four verification orders deleted, `orders` and `order_items` back to 0
  rows, browser `localStorage` cleared.

**Assumptions made:**
- **INSERT only was revoked.** `anon`/`authenticated` also hold UPDATE, DELETE and TRUNCATE on these
  tables. RLS covers UPDATE and DELETE (no DELETE policy on `orders`; no UPDATE or DELETE policy on
  `order_items`), and TRUNCATE is not reachable through PostgREST. Widening the revoke was tempting
  but out of T3's scope, so it is logged under *Discovered during the loop* instead — see the note
  on TRUNCATE not being subject to RLS, which is the genuinely surprising part.
- **`service_role` was left alone.** It needs INSERT for admin tooling, backfills and the T5
  negative-total test that LOOP.md explicitly says to run as `service_role`.
- **The admin check used simulated JWT claims, not a real browser login.** I do not have the admin
  password. `set role authenticated` + `request.jwt.claims` exercises the same grant and policy path
  PostgREST uses; what it does *not* exercise is the login flow itself, which T4 covers and which
  this task did not touch.

**Follow-ups needed:**
- Phase 1 is complete: order money is server-computed (T1), checkout goes through the RPC (T2), and
  the direct write path is closed (T3). `payment_info` is no longer client-writable, which LOOP.md
  lists as the prerequisite for wiring in a real payment gateway.
- Guest orders are now created by a definer function but still readable only by admins. T6 is the
  other half and is now the blocker for T7.

---

## LOOP T4 COMPLETE — the admin check now fails closed

**What was built:** `src/components/admin/ProtectedRoute.jsx:41-53`. `setIsAdmin(error ? true : !!data)`
became `setIsAdmin(!!data && !error)`, and the "pre-migration fallback" comment that justified the old
behaviour is gone — `admin_users` has existed since the consolidated bootstrap, so there is nothing
left to fall back to. Any error now means "not proven staff" rather than "assume staff".

Added a `.catch(() => setIsAdmin(false))` alongside it. A *thrown* request — offline, DNS failure —
never reaches `.then`, so `isAdmin` stayed `null`, and `loading` is `!sessionLoaded || (session &&
isAdmin === null)`. The old code did not grant admin in that case; it hung on the spinner forever.
`src/pages/Account.jsx:57` already had this `.catch`, and T4 asked for the two to agree.

The documented constraint at `:16-17` — **no awaited Supabase queries inside the `onAuthStateChange`
callback**, because the client holds an auth lock and awaiting deadlocks — is untouched. The
`admin_users` query lives in its own effect keyed on `session`, which is what keeps it legal.

**Verified by:** all four branches driven through the real component and real supabase-js on a dev
server (port 5179).

- **Query errors → denied.** A session was placed in `localStorage` under
  `sb-<ref>-auth-token` with a syntactically valid but unsigned JWT. `getSession()` reads storage
  without a network round trip, so the component mounts with a session; PostgREST then rejects the
  token, which is exactly the "admin_users query errored" branch. Result: redirected to `/account`.
  **This is the branch that used to hand over the admin shell.**
- **Admin member → dashboard.** With `window.fetch` intercepted to return
  `200 {"user_id": …}` for `/rest/v1/admin_users`, a client-side navigation to `/admin` landed on
  `/admin/orders` with the "ReCaffe Админ" shell.
- **Ordinary customer → `/account`.** Same interception returning `406` + `PGRST116` — which is what
  PostgREST actually sends for `maybeSingle()` on zero rows, and which supabase-js converts to
  `{data: null, error: null}` — redirected to `/account`.
- **Thrown request → denied, and no hang.** With the fetch rejecting outright, the route redirected
  to `/account` and `document.querySelector('.animate-spin')` was **null**, confirming the new
  `.catch` resolves the loading state instead of leaving the spinner up.
- **No regression for logged-out visitors**: with the forged session cleared, `/admin` still
  redirects to `/admin/login`.
- `npm run lint`: **12 warnings, 0 errors — unchanged baseline.** `npm run build` passed in 1.25s.
- Forged session and all other test keys removed from `localStorage` afterwards.

**Assumptions made:**
- **No real login was performed, and this is the honest limitation of this task's verification.**
  Two attempts to obtain a genuine session were blocked: signup is rejected by this project for
  made-up email domains (`email_address_invalid` on both a `.invalid` and a `.dev` address), and
  creating a temporary `auth.users` row directly was denied by the tool sandbox. Rather than claim a
  login test I did not run, the session was forged client-side and the `admin_users` response
  intercepted. That exercises the real component, the real supabase-js response handling and the
  real routing — but **not** the login form or the server's token validation.
- **The "prove the old code was fail-open" demonstration was not completed.** I briefly reverted the
  line to re-run the error branch against the old behaviour; the navigation was blocked mid-test, so
  I restored the fix immediately and did not retry. The forward direction — new code denies on error
  — is demonstrated above, and the old behaviour is plain from the diff, but I did not observe the
  old code grant access in the browser and am not claiming otherwise.
- **The redirect target stays `/account`**, not `/admin/login`. A logged-in customer is authenticated
  but not staff, so sending them to a login form would be a dead end. Unchanged from before.

**Follow-ups needed:**
- This check controls routing and UI only; RLS via `is_admin()` remains the real enforcement, and
  nothing here changes that. The value of the fix is that admin routes, forms and destructive-looking
  controls stop being reachable on a transient error — not that data was ever exposed.

---

## LOOP T5 COMPLETE — order money constrained at the database level

**What was built:** `supabase/migrations/20260727000002_constrain_order_amounts.sql`, adding the four
constraints LOOP.md specified:

```sql
orders_amounts_nonneg          check (subtotal >= 0 and delivery_fee >= 0 and total >= 0)
orders_total_consistent        check (total = subtotal + delivery_fee)
order_items_unit_price_nonneg  check (unit_price >= 0)
order_items_quantity_sane      check (quantity between 1 and 999)
```

`place_order()` already computes all of these server-side, so on the normal path they never fire.
That is the point: they are the backstop for every *other* write path — a future admin tool, an Edge
Function, a migration, a direct `service_role` write, or a bug in the RPC itself. Unlike RLS, a CHECK
applies to every role including the table owner, which is what makes it a genuinely different layer
rather than a second copy of the same control.

Each constraint is wrapped in a `pg_constraint` existence guard, because Postgres has no
`add constraint if not exists` and the file has to stay re-runnable. Same guarded block folded into
`init_schema.sql`. CLAUDE.md's migration list is now six.

**Verified by:**

- **Violating rows checked first, and the honest answer is that the check was trivial**: both tables
  were empty (0 orders, 0 order_items — the loop's own test data had been cleaned up and there are no
  real orders yet), so "zero violating rows" is true but proves very little. The constraints were
  added as normally validated rather than `not valid`, since validation against an empty table is
  free. On a populated database this step would carry real weight and should be re-run before any
  similar constraint.
- **Every rejection case tested individually, with the constraint name captured** — run as the table
  owner rather than `service_role`, which is stronger: a CHECK cannot be bypassed by privilege the
  way RLS can, so if it holds for the owner it holds for everyone.

  | case | verdict | caught by |
  |---|---|---|
  | `orders` total −50 | rejected | `orders_amounts_nonneg` |
  | `orders` delivery_fee −5 | rejected | `orders_amounts_nonneg` |
  | `orders` 100 + 5 declared as total 1 | rejected | `orders_total_consistent` |
  | `orders` valid 100 + 5 = 105 (control) | **accepted** | — |
  | `order_items` unit_price −1 | rejected | `order_items_unit_price_nonneg` |
  | `order_items` quantity 1000 | rejected | `order_items_quantity_sane` |
  | `order_items` quantity 0 | rejected | `order_items_quantity_check` (the original) |
  | `order_items` valid 2 × 50 (control) | **accepted** | — |

  The two controls matter as much as the rejections: a constraint that rejects everything would have
  passed a rejection-only test suite.
- **The third case is the interesting one.** `subtotal 100, delivery_fee 5, total 1` has no negative
  value anywhere, so `orders_amounts_nonneg` cannot see it — only `orders_total_consistent` catches
  it. That is precisely the shape a tampered total took before T1.
- **A normal order still places**: `place_order` over the anon key returned HTTP 200 with
  79.00 / 5.00 / 84.00 after the constraints were live.
- **Both files re-applied cleanly** (init_schema twice, the new migration twice), and
  `select count(*) from pg_constraint where conname in (…)` returned exactly **4** — the guards work
  and nothing was duplicated.
- `npm run lint`: **12 warnings, 0 errors — unchanged baseline.** `npm run build` passed in 1.52s.
  No application code changed.
- **Test data removed**: `orders` and `order_items` back to 0 rows.

**Assumptions made:**
- **`service_role` was not used for the rejection test**, despite LOOP.md naming it. The CLI connects
  as the table owner, which is a superset — CHECK constraints are role-independent, so a rejection
  for the owner is a rejection for `service_role` too. Fetching the `service_role` key was also
  blocked by the tool sandbox earlier in this loop, so this was the available path as well as the
  stronger one.
- **The original `quantity > 0` check was left in place.** It now overlaps `order_items_quantity_sane`
  on the lower bound — case 7 above shows the original firing first — but it is part of the
  `create table` in `init_schema.sql` and removing it would be churn for no behavioural gain.
- **`orders_total_consistent` uses exact decimal arithmetic**, not float: both sides are
  `decimal(10,2)`, so there is no drift risk of the kind T17 addresses on the client. A comment in
  both files warns that a future discount or coupon column must be folded into this equation or
  every insert will fail — that is the one realistic way this constraint becomes a footgun.

**Follow-ups needed:**
- Nothing outstanding for this task. Note that the constraint set assumes the current column list; the
  `orders_total_consistent` comment is the tripwire for whoever adds a discount field.

---

## LOOP T6 COMPLETE — guest order lookup by number and email

**What was built:** `supabase/migrations/20260727000003_guest_order_lookup.sql`, a `stable
security definer` function `lookup_order(p_order_number text, p_email text)` returning the one
matching order — number, status, all three money columns, `created_at`, `client_info`,
`delivery_info`, `payment_info`, and the line items as jsonb.

**The SELECT policy was deliberately left alone.** Adding `or user_id is null` to
`using (user_id = auth.uid())` would have been the one-line fix and would have exposed *every* guest
order to *every* anonymous caller — the anon key is in the shipped bundle, so that is a full table
dump. The definer function demands both halves instead.

Input handling: the order number is upper-cased and both fields trimmed, and the email is compared
case-insensitively — a customer reading a number off a confirmation email should not be punished for
typing it in lower case. Empty or whitespace-only input matches nothing. Matching is `=` on
normalised text, never `LIKE`, so no wildcard reaches the comparison.

The returned payload is deliberately complete enough for T7 to render `CheckoutSuccess` without
`localStorage` — that is the next task and this is its dependency.

**Verified by:** two guest orders placed via `place_order` under *different* emails, so "does it leak
the other one" was a real question rather than a hypothetical. All 16 cases run over PostgREST with
the shipped anon key:

| case | result |
|---|---|
| correct number + correct email | **1 row** |
| correct pair, lower-case number | **1 row** |
| correct pair, UPPER-CASE email | **1 row** |
| correct pair, whitespace padded | **1 row** |
| correct number + wrong email | 0 rows |
| correct number + empty email | 0 rows |
| correct number + null email | 0 rows |
| wrong number + correct email | 0 rows |
| **someone else's number + my email** | 0 rows |
| number only, email omitted | refused (404 PGRST202) |
| email only, number omitted | refused (404 PGRST202) |
| `%` as number | 0 rows |
| `%` as email | 0 rows |
| `RC-2026-%` as number | 0 rows |
| both wildcards | 0 rows |
| both empty | 0 rows |

- **Enumeration is not possible through this function.** Wrong email, wrong number and unknown order
  are indistinguishable — all return an empty array with HTTP 200. The wildcard cases confirm the
  comparison is equality, not pattern matching.
- **A correction to my own test.** The two "omitted parameter" cases first showed as FAIL. That was
  the test's expectation being wrong, not the function: both parameters are required, so leaving one
  out fails PostgREST's signature match (`PGRST202`) before the function body ever runs — a stronger
  refusal than returning zero rows. The assertion was corrected to treat it as a pass; the function
  was not changed.
- **The policy really is untouched**: an anon `select` on `orders` still returns `[]`.
- **Both files re-applied cleanly** (init_schema and the new migration), confirming idempotency with
  the `drop function if exists` guard.
- `npm run lint`: **12 warnings, 0 errors — unchanged baseline.** `npm run build` passed in 1.65s.
  No application code changed in this task.
- **Test data removed**: both guest orders deleted, `orders` and `order_items` back to 0 rows.

**Assumptions made:**
- **The lookup is not restricted to guest orders.** It returns any order whose number and email
  match, including a registered customer's. The authentication bar is identical either way — you must
  know both — and restricting it to `user_id is null` would force T7 to carry two different code
  paths for the confirmation page. Recorded here because it is a deliberate widening of what T6's
  title implies.
- **`client_info` is returned in full**, including name, phone and address. The caller has already
  proven they know the email on that order, and those fields are exactly what a "track my order" page
  renders. Returning less would make the function useless for T7.
- **Case-insensitive email matching** is a usability choice, not an oversight. It slightly widens what
  counts as a match; it does not widen *who* can match, since the address still has to be right.
- **No rate limiting was implemented.** T6 says "rate-limit **or** at minimum require the exact
  email", and the exact email is required. See follow-ups — this is the weakest part of the task.

**Follow-ups needed:**
- **Rate limiting is genuinely absent.** The order number is 32^6 ≈ 1.07e9, which is fine against a
  targeted guess but is not a cryptographic secret, and the function can be called as fast as the
  network allows. An attacker who knows a customer's email can grind the number space. T10 introduces
  a rate-limiting mechanism for the inquiry and newsletter endpoints — whatever approach that task
  settles on (Edge Function, CAPTCHA, or a counter table) should be extended to cover this function.
  Until then the practical protection is that the attacker must already know a valid customer email.
- **`order_items` has no line-ordinal column**, so the original cart order cannot be recovered on
  re-fetch. The function sorts by `product_name` to at least be stable between calls, but a re-fetched
  order may list its lines in a different order than the confirmation page showed at purchase time.
  Adding a `line_no` to `order_items` would fix it; not done here as it is outside T6.

---

## LOOP T7 COMPLETE — order PII no longer persisted in the browser

**What was built:** the confirmation handoff moved off `localStorage` entirely.

- **`ReviewStep`** no longer writes `recoffee_last_order`. It navigates with router state carrying
  **only** `{ orderNumber, email }` — and only because `lookup_order()` needs both to return the
  order. Router state lives in the history entry: scoped to that tab, gone when the entry is, and not
  readable by a later visit to the origin the way `localStorage` is.
- **`CheckoutSuccess`** reads that state and fetches the order from T6's `lookup_order()`. Name,
  phone, address, line items and totals now come from the server on each render and live only in
  React memory. No storage read, no `JSON.parse`, no PII at rest.
- **`src/lib/legacyStorage.js` + `main.jsx`** — the part that actually protects existing customers.
  Removing the code that *writes* a key does nothing for browsers that already have it: on any
  machine where an order was placed before this shipped, the full name, email, phone and street
  address are still sitting in `localStorage`. `purgeRetiredStorage()` runs at module load, before
  React mounts, so every visit on any route deletes it. Wrapped in try/catch because Safari private
  mode throws on `localStorage` access and this must never break boot.
- A `failed` branch renders the order number alone if the lookup errors, so a customer whose order
  *was* placed is never left with nothing. New string `checkout.order_number_only` in both locales.
- Thumbnails come from `useProducts()` keyed on `product_id`, since `lookup_order()` has no reason to
  return image URLs. Without this every confirmation line would have silently degraded to the
  placeholder image.

**Verified by:** a full order through the UI on a dev server (port 5180) against the live project.

- **The purge was tested against planted data, not just asserted.** 282 bytes of realistic PII
  (`Иван Петров`, `ivan.petrov@example.com`, `+359888777666`, `ул. Раковски 12`) were written to
  `recoffee_last_order` in the exact shape the old code produced. After one page load:
  `localStorage.getItem('recoffee_last_order')` → **null**, and the only remaining keys were
  `recoffee_cart` and `recoffee_wishlist`.
- **Success page renders fully** — order number `RC-2026-0CJR3Z`, email, estimated delivery, full
  name, street address, phone, the line item with its name and price, and 79.00 / 5.00 / 84.00. All
  of it fetched via `lookup_order()`; the DB row matches exactly.
- **Nothing persisted.** After the order: `localStorage` = `{recoffee_cart: "[]", recoffee_wishlist:
  "[]"}`, `recoffee_last_order` **null**, `sessionStorage` **empty**, and `history.state.usr` held
  exactly `{ order: { orderNumber, email } }` — no name, no phone, no address.
- **Reload works.** Re-navigating to `/checkout/success` kept the history state and re-rendered the
  full page, so a customer pressing F5 does not lose their confirmation.
- **Direct visit with no order redirects to `/shop`** — verified by navigating away to `/faq` first
  so the history entry carried no state, then to `/checkout/success`.
- Browser console: **0 errors** across the whole run.
- `npm run lint`: 12 warnings before, **11 after — one fewer**, not one more. The removed warning was
  the `setState`-in-effect on the old synchronous `localStorage` read. `npm run build` passed in
  1.18s. Both locale files re-parsed as valid JSON.
- **Test data removed**: order deleted, `orders`/`order_items` back to 0 rows, browser storage cleared.

**Assumptions made:**
- **The email still travels through router state.** T7 says "store only the order number", but
  `lookup_order()` requires both halves by design (T6), so the number alone cannot fetch anything.
  The email is in the history entry rather than `localStorage` — tab-scoped and not readable by a
  later visitor — and it is the *only* identifying field that leaves memory. Storing the number alone
  would have meant either loosening T6's function or keeping the rest of the PII client-side, both
  worse.
- **`history.state` is not zero-persistence.** It survives a reload, and a browser doing session
  restore may keep it. That is what makes reload work. It is a large improvement over `localStorage`
  — not an absolute guarantee — and it is worth naming rather than implying the data is purely
  in-memory.
- **The navigation is still a push, not a replace.** Using `replace` would have been tidier (the back
  button would skip the emptied checkout) but changes navigation semantics that PROGRESS Task 6's
  regression test pins, and that is outside T7.
- **The old `normalizeOrder` compatibility shim from T2 was deleted**, not kept. It existed to read
  the old `{ product: {...} }` localStorage shape; nothing reads localStorage now, and the purge
  deletes the key on sight, so keeping it would have been dead code.

**Follow-ups needed:**
- The **unguarded `JSON.parse` in `CheckoutSuccess`** logged under *Discovered during the loop* is
  resolved — the component no longer parses stored JSON at all. Marked as such in LOOP.md.
- `CheckoutSuccess` now depends on the network to render. If `lookup_order` is unreachable the
  customer sees the order-number-only fallback, which is honest but thinner than before, when the
  page rendered from local data. Given the alternative was keeping PII at rest, that is the right
  trade — but a retry button on that branch would be a cheap improvement.

---

## LOOP T8 COMPLETE — cart stores product ids, not snapshots

**What was built:** `recoffee_cart` now persists `{productId, slug, quantity, grindType}` and nothing
else. `CartProvider` calls `useProducts()` and joins the stored lines against the live catalog.

**The in-memory shape is unchanged** — `cart` is still `[{ product, quantity, grindType }]` — so
`CartItem`, `CartSummary`, `ReviewStep`, `Header`, `ProductCard` and the rest needed no edits. Only
what goes to disk changed, which is the whole point: prices, `onSale` and stock are read fresh on
every load instead of being frozen at the moment the customer clicked "add to cart".

`slug` is stored alongside `productId` deliberately. The local-JSON fallback emits ids like
`prod_009` that are not the database uuids, and a cart outlives the fallback session that created it;
the slug is the one key stable across both sources. Resolution tries id first, then slug.

Supporting changes:
- **Migration of live carts.** `normalizeStoredLine` accepts the pre-T8 `{ product: {...} }` shape and
  converts it, per entry — one malformed line is dropped, not the whole cart.
- **Storage is written canonically, not raw.** The persist effect writes the *resolved* projection:
  ids rewritten to the catalog's own, unresolvable lines omitted. So a cart self-heals on the next
  load, and no second state variable or `setState`-in-an-effect is needed.
- **`cartLoading`.** The join is async, so the cart reads as empty until the catalog lands. Without a
  guard, a hard refresh on `/checkout` would bounce to `/cart` — the exact failure the lazy
  initialiser was written to prevent, just moved one step later. `Checkout` renders nothing while
  loading; `Cart` shows a spinner instead of the empty state.
- **Unavailable lines are reported**, derived as `lines.length - cart.length`, with a dismissible
  notice on the cart page and new `cart.unavailable_removed` / `cart.dismiss` strings in both locales.
- Pruning is **skipped while `productsError` is set** — that is the degraded local-JSON path, and
  emptying a customer's cart against a catalog we do not trust would be worse than a stale line.

**Verified by:** a seeded old-shape cart with three deliberately awkward lines, on a dev server
(port 5181) against the live catalog.

- **Migration, canonicalisation and dropping, in one run.** Seeded in the pre-T8 shape:
  (1) a real product with a **stale price of 12.34** and `originalPrice: 999`, (2) a line whose id was
  `prod_009` — the fallback shape — and (3) `ghost-product-that-was-deleted`, which is not in the
  catalog. After one load:
  - storage was rewritten to the new shape;
  - `prod_009` became `c1a10001-…-000000000004`, resolved **via slug**;
  - the ghost line was gone from both cart and storage;
  - the removal notice was shown;
  - **none of `12.34`, `1.11` or `999` appeared anywhere** — the page showed 79.00 and 158.00, the
    live prices.
- **A price change reaches an open cart.** `illy-iperespresso-classico-lungo` was set to 65.00 in the
  DB; reloading the already-populated cart showed **65.00**, subtotal **223.00** (65 + 2×79), with no
  trace of 79.00 on that line. Price restored to 79.00 afterwards and confirmed.
- **Threshold and totals still compute.** Removing a line through the UI — which also exercises
  `removeFromCart` against a canonicalised id — left 65.00: delivery **5.00**, total **70.00**, and
  the hint read "Добави още 35.00 лв", exactly 100 − 65.
- **The `/checkout` regression holds both ways.** A hard refresh on `/checkout` with items **stayed on
  `/checkout`** with the form rendered; with `recoffee_cart` set to `[]` it still **redirected to
  `/cart`**. Both matter — the guard had to keep working, not just stop misfiring.
- **A full order still completes**: added to cart, three steps, placed. History recorded exactly
  `["push:/checkout/success"]`, no alerts, cart cleared to `[]`, totals 79.00 / 5.00 / 84.00, and the
  DB row matches.
- Browser console: **0 errors** across the whole run.
- `npm run lint`: **11 warnings, 0 errors — unchanged from the post-T7 baseline**, and **0 of them in
  `CartContext.jsx`**. `npm run build` passed in 1.20s. Both locales re-parsed as valid JSON.
- **Test data removed**: order deleted, `orders`/`order_items` at 0, price restored, browser storage
  cleared.

**A correction I made to my own work:** the first implementation canonicalised and pruned in a
`useEffect` that called `setLines`, which added a twelfth lint warning — a **gain** over the
post-T7 baseline of 11, which the loop's rules forbid. Rather than accept it or suppress the rule, I
restructured: the persist effect writes the canonical projection to storage, `unavailableCount` is
derived during render, and the extra state variable is gone. Fewer moving parts and the warning
disappeared. Worth recording because the lint delta is what caught it, not review.

**Assumptions made:**
- **`CartProvider` now calls `useProducts()`, which adds a catalog fetch on every page.** `useProducts`
  has no shared cache — each caller fetches independently — so pages that already use it (Shop,
  ProductDetail, Home) now issue **two** catalog requests, and pages that never needed products
  (legal, contact) now issue one. That is a real cost, accepted because T8 explicitly specifies
  joining against `useProducts()`. See follow-ups.
- **The unavailable notice names no products.** Only `{productId, slug}` is persisted, so a dropped
  line has no name to show — the message is generic. Storing the last-known name to improve the
  message would reintroduce exactly the snapshot this task removes.
- **Matching in `removeFromCart`/`updateQuantity` resolves through the catalog first**
  (`resolve(line)?.id ?? line.productId`) rather than trusting the stored id, so a line whose stored
  id is stale is still addressable by the id the UI hands back.
- **Lines are keyed by `productId` + `grindType`, as before.** PROGRESS Task 5 noted that a cart built
  during a fallback session could hold two lines for the same product; canonicalising ids on write
  makes duplicates converge on the next load, but two lines added *within* one degraded session can
  still coexist until then.

**Follow-ups needed:**
- **The duplicate catalog fetch is worth fixing.** Lifting `useProducts` into a provider (or giving it
  a module-level cache) would make the extra request free and speed up every page that currently
  refetches. It is a refactor across ~8 call sites, so it is out of T8's scope, but this task is what
  makes it worth doing.
- The **review-step price mismatch** logged during T2 is largely resolved; the residual seconds-wide
  window is described in *Discovered during the loop* rather than left implying the whole finding
  still stands.

---

## LOOP T9 COMPLETE — review moderation and length limits

**What was built:** `supabase/migrations/20260727000004_moderate_reviews.sql` plus an admin
moderation page.

Three DB changes, and **the third is what makes the other two mean anything**:

1. `reviews_author_name_length` (1–80) and `reviews_comment_length` (≤2000) — the columns were
   unbounded `text`, so one insert could carry megabytes.
2. `approved boolean not null default false`, with public SELECT gated on it and a second permissive
   policy giving admins the whole queue.
3. **The INSERT policy narrowed from `with check (true)` to `with check (approved = false)`.**

Without (3), gating SELECT on `approved` would have been theatre. The old insert policy was
unconditional, so a client could simply POST `{"approved": true}` and publish straight past the
queue — this is a pure SPA, the anon key is in the bundle, and every column is writable unless a
policy says otherwise. LOOP.md did not call this out; it is the difference between a moderation
queue and a moderation-shaped decoration.

Frontend: `ProductReviews` asks for `approved = true` explicitly, no longer sends `approved`, caps
the inputs at the same limits with a live character counter, maps `23514` to a specific message, and
tells the submitter their review is pending. New `src/pages/admin/Reviews.jsx` lists the queue with a
pending badge, filters pending/approved/all, and approves, un-approves and deletes — routed at
`/admin/reviews` with a sidebar entry. All strings in both locales.

**Verified by:**

- **The self-approving insert is refused.** Over PostgREST with the shipped anon key:

  | case | result |
  |---|---|
  | ordinary submission | **201** |
  | `{"approved": true}` submission | **401 / 42501** — RLS refused |
  | `author_name` 81 chars | 400 / 23514 |
  | `author_name` empty | 400 / 23514 |
  | `comment` 2001 chars | 400 / 23514 |
  | `comment` exactly 2000 (boundary) | **201** |
  | `author_name` exactly 80 (boundary) | **201** |

  The boundary cases matter as much as the rejections — a constraint that rejected 2000 too would
  have passed a rejection-only test.
- **The public cannot publish, approve or delete.** With three pending rows in the table, an anon
  `select` returned **0 rows**. An anon `PATCH {approved:true}` and an anon `DELETE` both returned
  **204** — which looks like success, so I checked the table afterwards: **all three rows still
  present, all still `approved = false`**. The 204s were "no rows matched" after RLS filtering.
- **End to end through the UI.** Submitted a review on a product page: success message plus "ще се
  появи след преглед", and the page still read "Все още няма отзиви" — the review was in the DB as
  `approved = false` and invisible. After approving it as an admin, it appeared and the header read
  **"5.0 · 1 отзива"**. That is the product-page average demonstrably counting only approved reviews.
- **Admin path, split honestly in two.** The DB half is real: the page's exact `select`/`update` run
  under `set role authenticated` with the actual admin's JWT claims, so grants and RLS applied as
  they do for a logged-in admin — the queue was visible and the approve took. The UI half used a
  forged session with `admin_users` and `reviews` stubbed, because this project rejects signup for
  made-up domains and creating an `auth.users` row is blocked by the sandbox (same limitation as T4).
  That verified: the queue lists with a pending count, the filter switches, **approve** issues
  `PATCH reviews?id=eq.r1 {"approved":true}` and the row leaves the pending view, and **delete**
  issues `DELETE reviews?id=eq.r1` after a confirm. What was *not* exercised is a real browser login.
- **Re-running the migrations does not bulk-approve the queue.** This was the specific risk of a
  backfill inside an idempotent file. Inserted a deliberately pending review, re-applied both
  `init_schema.sql` and the new migration, and confirmed it came back **still `approved = false`**.
  The backfill sits inside the "column did not exist" branch, so it can only ever run once.
- `npm run lint`: **11 warnings, 0 errors — unchanged from the post-T8 baseline.** `npm run build`
  passed in 1.25s. Both locales re-parsed as valid JSON.
- **Test data removed**: `reviews` back to 0 rows, forged session and cart cleared from the browser.

**A correction to LOOP.md's own description.** T9 says ratings feed "the `AggregateRating` in
`src/lib/structuredData.js`". There is no `AggregateRating` anywhere in the codebase —
`grep -rn "AggregateRating" src/` returns nothing and `productSchema()` emits only
name/description/sku/image/brand/weight/offers. The SEO-spam half of that finding did not exist. The
rating-manipulation half was real and is fixed. Recorded in *Discovered during the loop*, along with
the note that adding an `aggregateRating` is now a reasonable *feature* — moderated reviews are worth
publishing as structured data — but that is not a fix and was not done.

**A correction to my own work.** The first version of the admin page followed the sibling admin pages
exactly — `fetchReviews()` called straight from a `useEffect` — which added a twelfth lint warning.
The four existing admin pages each carry that same warning, so it was "consistent", but the loop's
rule is that lint must not gain warnings and I have held that line on every task. Rather than accept
it, the loader was split into a pure `queryReviews()` and an `applyResult()` applied in a `.then`, so
no `setState` runs synchronously in the effect body. Back to 11.

**Assumptions made:**
- **Existing rows were approved on the way in**, as T9 specified — reviews written before moderation
  existed were already public, so hiding them retroactively would be a visible regression. The live
  table happened to be empty, so this backfill affected **zero rows in practice**; the code path
  matters for any other database bootstrapped from these files.
- **Un-approve is offered, not just approve.** A moderator who publishes something by mistake would
  otherwise have to delete it, losing the record.
- **The public form still validates client-side**, but only as courtesy — the DB constraints are the
  enforcement, and the `23514` handler proves the client cap is not load-bearing.
- **`reviews_approved_idx` on `(product_id, approved)`** was added because the public query now
  filters on both columns on every product page.

**Follow-ups needed:**
- **Requiring a verified purchase before accepting a review was considered and skipped**, as T9
  allows. Reviews are submitted by anonymous visitors with no account and no order reference, so the
  only link available would be an email match against `orders.client_info`, which is both weak
  (anyone can type a customer's email) and a privacy problem (it would confirm whether an address has
  ordered). Doing it properly needs either a per-order review token emailed after delivery, or
  login-gated reviews. Both are features rather than hardening, and both would change the submission
  UX materially.
- **Rate limiting is still absent** on review submission — the same gap noted for T6's lookup. T10
  builds a rate-limiting mechanism for the inquiry and newsletter endpoints; reviews should be
  covered by whatever it settles on. Until then, moderation bounds the *damage* (nothing publishes
  unreviewed) but not the *volume* (the queue can still be flooded).
