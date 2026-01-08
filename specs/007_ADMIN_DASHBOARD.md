# Admin Dashboard Specification

## 1. Overview
The Admin Dashboard is a secure, restricted area of the ReCaffe application designed to manage the platform's core data entities: Products and Services. It provides a user-friendly interface for full CRUD (Create, Read, Update, Delete) operations, facilitating content management without direct database access.

## 2. Architecture & Routing

### 2.1 Route Structure
The dashboard will exist under the `/admin` path. All routes within this path (except `/admin/login`) must be protected by an authentication guard.

- `/admin/login`: Admin authentication entry point.
- `/admin`: Dashboard Overview (optional stats).
- `/admin/products`: Product List.
- `/admin/products/new`: Create Product.
- `/admin/products/:id`: Edit Product.
- `/admin/services`: Service List.
- `/admin/services/new`: Create Service.
- `/admin/services/:id`: Edit Service.

### 2.2 Security (Auth Guard)
- Implement a `ProtectedRoute` wrapper component.
- Check for a valid Supabase session.
- If no session exists, redirect to `/admin/login`.
- *Future*: Check for `admin` role in metadata (if RLS policies are strict).

## 3. Data Model Enhancements

To support the requirements, the database schema needs partial updates.

### 3.1 Products Table (Update)
The current `products` table relies on local JSON for images. We need to persist image URLs in the database.
- **Add Column**: `image_url` (text, nullable).
- **Add Column**: `is_service` (boolean, default false) - *Optional alternative to a separate table if services are similar to products.* 
  - *Decision*: Since Services likely have different fields (e.g., duration, hourly rate vs unit price), we will use a separate `services` table for clarity, or reuse `products` if the schema is nearly identical.
  - *Refined Decision*: Create a `services` table to avoid polluting the coffee product schema with service-specific logic.

### 3.2 Services Table (New)
- `id`: uuid (PK)
- `name_bg`: text
- `name_en`: text
- `description_bg`: text
- `description_en`: text
- `price`: numeric
- `duration_minutes`: integer (nullable)
- `image_url`: text
- `active`: boolean (default true)
- `created_at`: timestamp

## 4. Component Design

### 4.1 Layout (`src/components/admin/AdminLayout.jsx`)
- **Sidebar**: Fixed width, contains navigation links (Products, Services, Logout).
- **Header**: Branding ("ReCaffe Admin"), current user display.
- **Main Content**: Scrollable area for the active route.

### 4.2 Reusable UI Components
- **`AdminTable`**: A generic table component with headings, row rendering, and action buttons (Edit, Delete).
- **`AdminHeader`**: Page title and "Add New" button.
- **`ImageUpload`**: A component handling file selection, upload to Supabase Storage, and returning the public URL.

### 4.3 Feature Components

#### Products Management
- **`ProductList`**: Fetches all products. Displays Thumbnail, Name (BG/EN), Price, Stock Status, Category.
- **`ProductForm`**: 
  - Validated inputs for all fields.
  - **Tabs/Sections**: 
    - *General*: Names, Descriptions.
    - *Details*: Price, Weight, Roast Level, Category.
    - *Media*: Image Upload.
    - *Flavors*: Tag input for adding/removing flavor notes.

#### Services Management
- **`ServiceList`**: Similar to ProductList.
- **`ServiceForm`**: Simplified fields (Name, Description, Price, Duration).

## 5. Implementation Steps (Developer Checklist)

1. **Database Setup**:
   - Create `services` table in Supabase.
   - Add `image_url` column to `products`.
   - Create Storage Bucket `products` for public image hosting.
   - Update RLS policies to allow authenticated users (Admins) to Insert/Update/Delete.

2. **Authentication**:
   - Build `AdminLogin` page.
   - Implement `AuthProvider` (if not already present) or use `useEffect` with Supabase auth listener.

3. **Routing**:
   - Update `App.jsx` to include Admin routes wrapped in `ProtectedRoute`.

4. **Product CRUD**:
   - Implement `ProductList` with delete functionality.
   - Implement `ProductForm` (handles both Create and Edit).
     - *Note*: For "Edit", fetch product details by ID on mount.
   - Wire up Image Upload using Supabase Storage.

5. **Services CRUD**:
   - Replicate Product pattern for Services.

## 6. Technical Stack & Standards
- **Styling**: Tailwind CSS. Use `bg-slate-50` for admin background, white cards for forms.
- **Icons**: Lucide React (`Package`, `Zap`, `Settings`, `LogOut`).
- **State**: Local state for forms; simplistic fetch-on-mount for lists (no complex caching needed yet).
- **Validation**: Simple HTML5 validation or manual checks before submission.

## 7. Mockups / Visual Guidelines
- **Sidebar**: Dark slate (`bg-slate-900`) text, white text.
- **Active Link**: Accent color background (`bg-brand-primary`).
- **Cards**: White background, subtle shadow (`shadow-sm`), rounded corners (`rounded-lg`).
- **Buttons**:
  - Primary (Save/Add): `bg-brand-primary text-white`.
  - Secondary (Cancel): `bg-white border border-slate-300`.
  - Danger (Delete): `text-red-600 hover:bg-red-50`.
