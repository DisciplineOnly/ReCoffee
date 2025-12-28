# Database Implementation Plan
**Dependencies**: Supabase account (or local Docker), Node.js environment.
**Ref**: `specs/005_DATABASE_DESIGN.md`

## 1. Environment Setup
- [ ] **Install Supabase CLI**: `npm install -g supabase` (or use cloud dashboard).
- [ ] **Initialize Project**:
  - If using Cloud: Create new project "ReCaffe".
  - If using Local: `supabase init`, `supabase start`.
- [ ] **Environment Variables**:
  - Create `.env.local`
  - Add `VITE_SUPABASE_URL`
  - Add `VITE_SUPABASE_ANON_KEY`

## 2. Schema Implementation (SQL)
Create `supabase/migrations/20251228000000_initial_schema.sql`:

### 2.1 Enable Extensions
```sql
create extension if not exists "uuid-ossp";
```

### 2.2 Create Tables
1.  **products**:
    *   `id` (uuid, PK, default uuid_generate_v4())
    *   `slug` (text, unique)
    *   `name_bg` (text)
    *   `name_en` (text)
    *   `description_bg` (text)
    *   `description_en` (text)
    *   `price` (decimal(10,2))
    *   `in_stock` (boolean)
    *   `featured` (boolean)
    *   `category` (text)
    *   `roast_level` (int2)
    *   `origin` (text)
    *   `process` (text)
    *   `weight_grams` (int)
    *   `created_at` (timestamptz)

2.  **product_flavors** (Junction):
    *   `product_id` (uuid, FK)
    *   `flavor_name_bg` (text) -- *Simplified from flavor_tags table for Phase 1*
    *   `flavor_name_en` (text)

3.  **orders**:
    *   `id` (uuid, PK)
    *   `order_number` (text, unique)
    *   `status` (text, default 'pending')
    *   `subtotal` (decimal)
    *   `delivery_fee` (decimal)
    *   `total` (decimal)
    *   `client_info` (jsonb)
    *   `delivery_info` (jsonb)
    *   `created_at` (timestamptz)

4.  **order_items**:
    *   `id` (uuid, PK)
    *   `order_id` (uuid, FK)
    *   `product_id` (uuid, FK)
    *   `quantity` (int)
    *   `unit_price` (decimal)
    *   `grind_type` (text)

### 2.3 Row Level Security (RLS)
- **products**:
  - Policy "Public Read": `true` for `SELECT`.
  - Policy "Admin Write": `service_role` only.

- **orders**:
  - Policy "Public Insert": `true` for `INSERT` (Authenticated/Anon).
  - Policy "No Public Read": `false` for `SELECT` (users see success page content from local state return).

## 3. Data Seeding
Create `scripts/seed-db.js`:
- Import `src/data/products.json`.
- Map JSON fields to SQL Columns.
  - *Note*: JSON has `flavorNotes` as array of strings. We will insert into `product_flavors`.
- Use `supabase-js` admin client to batch insert.

## 4. Frontend Integration
1.  **Install Client**: `npm install @supabase/supabase-js`.
2.  **Initialize**: `src/lib/supabase.js`.
3.  **Hooks**:
    - Create `useProducts()` hook to replace direct JSON import in `Shop.jsx`.
    - Create `useProduct(id)` hook for `ProductDetail.jsx`.
4.  **Checkout Refactor**:
    - Update `ReviewStep.jsx` or `CheckoutContext` to `supabase.from('orders').insert(...)` instead of `localStorage`.
    - Ensure `order_items` are inserted in the same transaction or immediately after.

## 5. Validation
- Verify Shop Page loads from DB.
- Verify Product Detail loads from DB.
- Complete a Guest Checkout flow and verify rows in `orders` and `order_items`.
