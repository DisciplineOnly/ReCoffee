# Product images

Catalog photos are named after the product **slug** so a file can always be traced back to
exactly one product. There is no ambiguity and no manual mapping table to keep in sync.

## Where images live

Images are resolved in two places, in this order:

1. **`products.image_url`** in the database — a public Supabase Storage URL. This wins if set.
2. **`public/products/<slug>.<ext>`** — the local mirror, referenced from `src/data/products.json`.

`src/hooks/useProducts.jsx` matches a DB row to its local entry **by slug**, so the local file is
the fallback whenever `image_url` is `NULL` (which is how the seed ships — see
`supabase/migrations/20260723000001_seed_catalog.sql`). If neither exists,
`src/lib/productImage.js` swaps in `/products/placeholder.svg` rather than showing a broken image.

This means the shop renders correctly **before** anything is uploaded to storage. Uploading is an
upgrade (CDN-served, editable from the admin), not a prerequisite.

## Current files

| File in `public/products/` | Product slug | Product |
| --- | --- | --- |
| `illy-iperespresso-classico-espresso.jpg` | `illy-iperespresso-classico-espresso` | illy iperEspresso Classico — Еспресо |
| `illy-iperespresso-classico-lungo.jpg` | `illy-iperespresso-classico-lungo` | illy iperEspresso Classico — Лунго |
| `illy-iperespresso-decaffeinato.jpg` | `illy-iperespresso-decaffeinato` | illy iperEspresso Decaffeinato |
| `illy-iperespresso-intenso.jpg` | `illy-iperespresso-intenso` | illy iperEspresso Intenso |
| `illy-easy-red.jpg` | `illy-easy-red` | illy Easy — Червена |
| `illy-easy-black.jpg` | `illy-easy-black` | illy Easy — Черна |
| `saeco-royal-professional.jpg` | `saeco-royal-professional` | Saeco Royal Professional |
| `fiorenzato-f64-grinder.jpg` | `fiorenzato-f64-grinder` | Fiorenzato F64 — Мелачка |
| `la-piccola-sara.jpg` | `la-piccola-sara` | La Piccola Sara |
| `la-spaziale-s2-2gr.png` | `la-spaziale-s2-2gr` | La Spaziale S2 — 2 групи |
| `pro-2gr-ese-pod-machine.jpg` | `pro-2gr-ese-pod-machine` | Професионална машина за дози — 2 групи |

`placeholder.svg` is not a product photo — it is the neutral fallback used by
`src/lib/productImage.js`. Leave it in place.

## Uploading to the Supabase `products` bucket

The bucket is created by `supabase/migrations/20260723000000_init_schema.sql`:
it is named **`products`**, is **public** (anyone can read), and only members of `admin_users`
can insert, update or delete — enforced by RLS through the `is_admin()` function.

### Option A — through the admin dashboard (recommended)

This is the only route that also writes `products.image_url`, so it is the one that actually
changes what the shop serves.

1. Sign in at `/admin` with an account listed in `admin_users`.
2. Go to **Продукти**, open the product you want, or create it.
3. In the image field, click the upload area and pick the matching file from `public/products/`.
4. Save. `src/components/admin/ImageUpload.jsx` uploads to the `products` bucket, then writes the
   returned public URL into `products.image_url`.

Note: the uploader assigns a **random** object name (`<random>.<ext>`), not the slug. That is fine —
the DB stores the full URL — but it means the object name in the bucket will not match the table
above. If you want the bucket to stay readable, use Option B or C instead and paste the URL.

### Option B — Supabase dashboard (bulk, keeps the filenames)

1. Open the project → **Storage** → **products**.
2. Drag in every file from `public/products/` **except** `placeholder.svg`.
3. For each object use **Copy URL** to get its public URL. The shape is:

   ```
   https://<project-ref>.supabase.co/storage/v1/object/public/products/<filename>
   ```

4. Paste that URL into the product's image field in the admin and save, or set it directly with SQL
   (Option D).

### Option C — Supabase CLI (scripted, keeps the filenames)

From the repo root, with the CLI already linked to the project:

```bash
npx supabase storage cp --recursive public/products ss:///products --exclude placeholder.svg
```

Verify:

```bash
npx supabase storage ls ss:///products
```

### Option D — point the DB at the uploaded files

After Option B or C the objects exist but `products.image_url` is still `NULL`. Because the object
name equals the slug, one statement covers every product:

```sql
update products
set image_url = 'https://<project-ref>.supabase.co/storage/v1/object/public/products/'
                || slug || '.jpg'
where slug in (
  'illy-iperespresso-classico-espresso',
  'illy-iperespresso-classico-lungo',
  'illy-iperespresso-decaffeinato',
  'illy-iperespresso-intenso',
  'illy-easy-red',
  'illy-easy-black',
  'saeco-royal-professional',
  'fiorenzato-f64-grinder',
  'la-piccola-sara',
  'pro-2gr-ese-pod-machine'
);

-- La Spaziale is the one PNG.
update products
set image_url = 'https://<project-ref>.supabase.co/storage/v1/object/public/products/la-spaziale-s2-2gr.png'
where slug = 'la-spaziale-s2-2gr';
```

Replace `<project-ref>` with the value from `VITE_SUPABASE_URL` in `.env`.

Run it from the SQL editor or `npx supabase db execute`. Do **not** add it as a migration — it is
data for one environment, not schema.

## Adding a new product image later

1. Name the file after the product slug: `<slug>.jpg`.
2. Drop it in `public/products/` and reference it as `/products/<slug>.jpg` in
   `src/data/products.json`, so the local fallback stays complete.
3. Upload it to the `products` bucket and set `image_url` by whichever option above you prefer.

Keep JPEG for photographs and PNG only when transparency is needed. Product shots render at roughly
600 px square, so ~1000 px on the long edge is plenty.
