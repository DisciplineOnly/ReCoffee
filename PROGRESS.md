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




