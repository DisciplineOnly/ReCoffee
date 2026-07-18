# ReCaffe vs. Bianchi — Website Comparison

_Comparison of the **ReCaffe** storefront (`D:\ReCaffe`) against **Bianchi** (https://bianchi.bg/bg)._

---

## How each site was analyzed

- **ReCaffe** — read directly from the codebase: routing, pages, sections, contexts, Supabase schema, translations, and product data.
- **Bianchi** — scraped with the Firecrawl plugin. The CLI was installed and run on the **keyless free tier** (`init --skip-auth`). Keyless allows `scrape` but **blocks `map`/`crawl`/`agent`** (those need an API key), so a true full-site crawl wasn't possible. Instead the homepage was scraped, its full internal link tree extracted, then the key structural pages were scraped (about, delivery, terms, main categories, business solutions, blog, a product page). Raw output lives in `.firecrawl/` (gitignored).
- With a `FIRECRAWL_API_KEY`, a real `crawl` could capture every product page.

---

## 1. Overview & Tech

| Dimension | ReCaffe | Bianchi (bianchi.bg) | Notes / Recommendation |
|---|---|---|---|
| Type | Boutique/concept specialty-coffee storefront | Established commercial coffee company (Бианчи Трейдинг ЕООД, "Bianchi Coffee") | **Different maturity.** Bianchi is a live business with a deep catalog; ReCaffe is a polished but shallow demo. |
| Platform | Custom React 18 SPA (Vite, Tailwind, React Router, Supabase) | OpenCart (PHP CMS) | ✅ ReCaffe stack is modern/faster & more maintainable. **Recommendation:** keep the stack; you lack breadth, not tech. |
| Languages | BG + EN i18n scaffold (mixed — EN marketing copy, BG product data, some hardcoded BG) | BG (`/bg`) with multi-language routing | ⚠️ ReCaffe i18n is inconsistent. **Fix:** move all hardcoded strings into translation files; pick a real default locale. |
| Currency | BGN (лв) | EUR (€), with pre-VAT price shown | **Nice-to-have:** Bulgaria's euro switch makes EUR (or dual BGN/EUR) worth adding. |
| SEO | SPA, no SSR, generic `index.html` title | Server-rendered, clean slug URLs, PDF policy docs | ❌ ReCaffe will index poorly. **Recommendation:** add SSR/prerender (or per-route meta), sitemap, per-product meta. |

## 2. Structure & Navigation

| Dimension | ReCaffe | Bianchi | Notes / Recommendation |
|---|---|---|---|
| Top nav | Shop, Subscription, Wholesale, Locations, Learn, Account | Mega-menu: Coffee by type, Coffee by brand, Machines, Business solutions, Consumables, Tea | ❌ **Most ReCaffe nav links are dead (`href="#"`)** — Subscription, Wholesale, Locations, Learn, Account, and all footer links. **Priority fix:** build or hide them. |
| Category depth | Flat: 1 catalog, 3 tags (single-origin/blend/limited) | Deep tree: pods, capsules (Nespresso/Dolce Gusto compat.), ground, beans, machines, grinders, vending, tea, chocolate, instant | Bianchi's IA is its biggest strength. **Nice-to-have:** add brand + format axes if the catalog grows. |
| Brand architecture | Single brand | 7 sub-brands (Collezione Nero, Famiglia D'oro, Origins, Caffè Arte, Adore, GUSTO, Professional Selection) | Different business models — informational only. |
| Footer | Link groups, but **all links are `#` placeholders** | Real grouped links + quality-policy PDF, privacy, cookies | ❌ **Fix ReCaffe footer** — it looks complete but nothing works. |

## 3. Catalog & Product Pages

| Dimension | ReCaffe | Bianchi | Notes / Recommendation |
|---|---|---|---|
| Catalog size | 8 seed products | Hundreds across many categories | Expected given stage. |
| Product detail | ✅ Strong: grind-type selector, qty, flavor notes, roast-level meter, origin/process/weight, add-to-cart w/ feedback | Standard OpenCart: buy/qty, description, related products; machines are **"Изпрати запитване"/"По запитване"** (inquiry / price-on-request) | ✅ ReCaffe's PDP UX is arguably **nicer & more modern**. **Nice-to-have from Bianchi:** an "inquiry / price-on-request" mode for high-value or B2B items. |
| Merchandising badges | Featured only | New, "% Оферта", "Save -15%", sale vs. old price | **Recommendation:** add sale price + discount/"new" badges to ReCaffe. |
| Reviews / ratings | ❌ None | Basic (OpenCart reviews) | **Nice-to-have:** add reviews/ratings for trust. |
| Filtering / sorting | ✅ Category, roast level, in-stock, sort (price/name/featured/newest) | Category pages, less rich client-side filtering | ✅ ReCaffe filtering is **better UX** than Bianchi's. |

## 4. E-commerce Features

| Feature | ReCaffe | Bianchi | Notes / Recommendation |
|---|---|---|---|
| Cart | ✅ Yes (localStorage, badge animation) | ✅ Yes | Par. |
| Guest checkout | ✅ Yes (Supabase order insert) | ✅ Yes | Par. |
| Checkout flow | ✅ Polished 4-step: client info → delivery (home/office/pickup) → payment → review | Standard OpenCart checkout | ✅ ReCaffe flow is **cleaner**. |
| Payment | ⚠️ Card/cash/bank **UI only — no real gateway** | Real payment/courier integration | ❌ **Critical gap:** ReCaffe can't actually take card payment. Integrate Stripe/myPOS/Borica. |
| Delivery logic | ✅ Free >100 BGN, pickup locations | Courier (Econt/Speedy-style), stated hours & cutoff | **Add** a courier office picker (Econt/Speedy) — standard BG expectation. |
| Wishlist / favorites | ❌ | ✅ (В любими) | **Nice-to-have.** |
| Product compare | ❌ | ✅ (Сравни) | Nice-to-have (lower priority). |
| Quick view | ❌ | ✅ (Бърз преглед) | Nice-to-have. |
| Search | ⚠️ Icon only, non-functional | ✅ Functional | ❌ **Wire up search** or remove the icon. |
| User accounts | ⚠️ Nav placeholder only (admin auth exists) | ✅ Login/Register, order history | **Recommendation:** add customer accounts + order history. |
| Subscription | ⚠️ Marketed on homepage but **no page/flow** | N/A | ❌ Either build the subscription flow or stop advertising it. |
| Admin panel | ✅ Custom (Products & Services CRUD, image upload, Supabase RLS) | OpenCart admin | ✅ ReCaffe has a clean bespoke admin. |

## 5. Content, Trust & B2B

| Dimension | ReCaffe | Bianchi | Notes / Recommendation |
|---|---|---|---|
| About / story | ⚠️ "Philosophy" section only; "Read our story" link dead | ✅ About (За нас) | **Add** a real About page. |
| Blog / education | ❌ ("Learn" is a dead link) | ✅ Blog + Events (Събития) | **Nice-to-have:** content/SEO engine. |
| Legal pages | ❌ Privacy/Terms are `#` | ✅ Terms, Privacy, Cookies, Quality-policy PDF | ❌ **Required for a real BG shop** (GDPR/consumer law). Add them. |
| Contact / company info | ❌ None visible | ✅ Company name, hours, order cutoff | ❌ **Add** address, phone, email, hours, company/VAT details. |
| B2B / HoReCa / vending | ❌ ("Wholesale" dead) | ✅ Dedicated Business, HoReCa, Vending, Office, Private-label pages + inquiry flow | Big Bianchi strength. **Recommendation:** if you want B2B, build a Wholesale/HoReCa landing + inquiry form. |
| Newsletter | ⚠️ Form present but non-functional | — | **Fix:** connect to an ESP or remove. |
| Locations | ⚠️ "Visit our cafes" with hardcoded US addresses (Annapolis/Bethesda) | — | ❌ Placeholder/inconsistent (US addresses on a BGN store). Make real or remove. |

## 6. Design & UX

| Dimension | ReCaffe | Bianchi | Notes |
|---|---|---|---|
| Visual design | ✅ Modern, editorial, whitespace-rich, animated, mobile-first | Functional but dated OpenCart look, dense mega-menu | ✅ **ReCaffe wins clearly on aesthetics & modern UX.** |
| Performance | Light SPA (but no SSR) | Heavier server-rendered pages | Mixed. |
| Mobile | ✅ Responsive, mobile filter drawer | Responsive but cluttered | ✅ ReCaffe better. |

---

## Bottom line

**Where ReCaffe already wins:** modern stack, product-detail UX (grind selector, flavor notes, roast meter), checkout flow, filtering, admin panel, and overall visual design.

**What Bianchi has that ReCaffe critically lacks (fix these first):**

1. **Real payment integration** (ReCaffe card/bank is fake UI).
2. **Working navigation & footer** — ~90% of ReCaffe's links are `#` placeholders.
3. **Legal + contact + about pages** (mandatory for a real BG shop).
4. **Functional search.**
5. **Consistent content/i18n** — remove US café addresses, USD copy vs. BGN, and the un-built Subscription/Wholesale marketing.

**Nice-to-have (from Bianchi, after the above):** wishlist, reviews/ratings, quick view, sale/discount badges, customer accounts + order history, blog, courier-office delivery picker, and a B2B/HoReCa inquiry flow ("price on request").
