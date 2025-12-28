# Development Plan: ReCoffee E-Commerce Implementation

**Created**: 2025-12-28
**Developer**: Lead Developer
**Based on**: SPEC-004, ID-006
**Status**: Ready for Execution

---

## Executive Summary

This development plan outlines the systematic implementation of a complete e-commerce system for ReCoffee, including product catalog, shopping cart, and checkout flow. The plan is organized into 5 phases with clear dependencies, deliverables, and acceptance criteria.

**Total Estimated Effort**: ~40-50 hours
**Timeline**: 2-3 weeks (part-time development)
**Priority**: High (Core business functionality)

---

## Phase 1: Foundation & Infrastructure
**Duration**: 4-6 hours
**Priority**: Critical (Blocking)
**Status**: ✅ COMPLETE

### 1.1 Dependencies Installation ✅
**Task**: Install required npm packages
```bash
npm install react-router-dom@6
```

**Acceptance Criteria**:
- ✅ React Router v6 installed
- ✅ No dependency conflicts
- ✅ Package.json updated

### 1.2 Routing Infrastructure ✅
**Task**: Set up React Router structure

**Files Created**:
- ✅ `src/App.jsx` (updated with Router)

**Implementation**:
```jsx
// Implemented with BrowserRouter, Routes, and 6 route definitions
// Placeholder components created for Shop, ProductDetail, Cart, Checkout, CheckoutSuccess
```

**Acceptance Criteria**:
- ✅ All routes defined
- ✅ Navigation works between pages
- ✅ Header/Footer persist across routes
- ⏳ 404 handling (deferred to Phase 5)

### 1.3 Product Data Structure ✅
**Task**: Create product data JSON

**Files Created**:
- ✅ `src/data/products.json`

**Sample Structure**:
- ✅ 8 products created (Mass Appeal, Thesis, Gedeb Yirgacheffe, Brazil Santos, Espresso Blend, Kenya AA, Decaf Colombia, Seasonal Microlot)

**Acceptance Criteria**:
- ✅ At least 6-8 products defined
- ✅ All required fields populated
- ✅ Images accessible
- ✅ Mix of categories (single-origin, blend, limited)

### 1.4 Cart Context ✅
**Task**: Implement CartContext with LocalStorage persistence

**Files Created**:
- ✅ `src/contexts/CartContext.jsx`

**Implementation**:
- ✅ CartProvider component with useState and useEffect
- ✅ LocalStorage sync on mount and cart changes
- ✅ addToCart, removeFromCart, updateQuantity, clearCart functions
- ✅ getCartTotal, getCartCount, getDeliveryFee, getGrandTotal helpers

**Acceptance Criteria**:
- ✅ Cart state persists across page refreshes
- ✅ Add/remove/update operations work
- ✅ Cart count calculation accurate
- ✅ Total calculation accurate
- ✅ LocalStorage sync working

### 1.5 Translation Updates ✅
**Task**: Add e-commerce translations to bg.json and en.json

**Files Updated**:
- ✅ `src/lib/translations/bg.json`
- ⏳ `src/lib/translations/en.json` (deferred - Bulgarian is primary)

**Acceptance Criteria**:
- ✅ All shop translations added
- ✅ All product translations added
- ✅ All cart translations added
- ✅ All checkout translations added
- ✅ All order translations added

---

## Phase 2: Shop & Product Pages
**Duration**: 10-12 hours
**Priority**: High
**Dependencies**: Phase 1 complete ✅
**Status**: ✅ COMPLETE

### 2.1 Shop Page Layout ✅
**Task**: Create Shop page with product grid

**Files Created**:
- ✅ `src/pages/Shop.jsx`
- ✅ `src/components/shop/ProductCard.jsx`
- ✅ Filter sidebar (integrated in Shop.jsx)
- ✅ Sort dropdown (integrated in Shop.jsx)

**Acceptance Criteria**:
- ✅ Product grid responsive (1/2/3 columns)
- ✅ Products display correctly
- ✅ Filters sidebar functional
- ✅ Sort dropdown works
- ✅ Empty state handled

### 2.2 Product Card Component ✅
**Task**: Build reusable ProductCard component

**Features**:
- ✅ Product image with category badge
- ✅ Product name and details
- ✅ Roast level indicator
- ✅ Price display
- ✅ Add to Cart button
- ✅ Hover effects

**Acceptance Criteria**:
- ✅ Card matches design spec
- ✅ Hover animation works
- ✅ Click navigates to product detail
- ✅ Add to Cart opens grind selector

### 2.3 Filter & Sort Implementation ✅
**Task**: Implement filtering and sorting logic

**Filters**:
- ✅ Category (checkbox group)
- ✅ Price range (implemented, slider deferred)
- ✅ Roast level (checkbox group)
- ⏳ Origin (deferred - not enough variety in current data)
- ✅ In stock toggle

**Sort Options**:
- ✅ Price: Low to High
- ✅ Price: High to Low
- ✅ Name: A-Z
- ✅ Newest First
- ✅ Featured First

**Acceptance Criteria**:
- ✅ All filters work independently
- ✅ Multiple filters combine correctly
- ✅ Sort updates product order
- ⏳ Filter state preserved in URL (deferred to Phase 5)
- ✅ Clear filters button works

### 2.4 Product Detail Page ✅
**Task**: Create detailed product view

**Files Created**:
- ✅ `src/pages/ProductDetail.jsx`
- ✅ Image display (gallery deferred - single image)
- ✅ Grind type selector (integrated)
- ✅ Quantity selector (integrated)

**Layout**:
- ✅ Left: Product image
- ✅ Right: Product info, selectors, Add to Cart

**Acceptance Criteria**:
- ✅ Product loads from URL param
- ⏳ Image gallery works (deferred - single image for now)
- ✅ Grind type selection works
- ✅ Quantity selector works (min 1, max 10)
- ✅ Add to Cart updates cart count
- ✅ Success animation on add
- ✅ 404 for invalid product ID

### 2.5 Grind Type Selector Modal ✅
**Task**: Create modal for grind type selection

**Files Created**:
- ✅ `src/components/ui/GrindTypeModal.jsx`

**Options**:
- ✅ Whole Bean (icon + label)
- ✅ Espresso (icon + label)
- ✅ Filter (icon + label)
- ✅ French Press (icon + label)

**Acceptance Criteria**:
- ✅ Modal opens on "Add to Cart" click
- ✅ Visual selection indicator
- ✅ Confirm adds to cart
- ✅ Cancel closes modal
- ✅ Keyboard navigation (ESC to close)

### 2.6 Header Updates ✅
**Task**: Update header with cart badge and navigation

**Files Updated**:
- ✅ `src/components/layout/Header.jsx`

**Features**:
- ✅ Shop link navigates to /shop
- ✅ Logo links to home
- ✅ Cart badge shows count
- ✅ Cart badge animates on update
- ✅ Cart icon links to /cart

**Acceptance Criteria**:
- ✅ Cart count displays
- ✅ Updates in real-time
- ✅ Animation on add to cart
- ✅ Clicks navigate to cart

---

## Phase 3: Shopping Cart
**Duration**: 6-8 hours
**Priority**: High
**Dependencies**: Phase 2 complete ✅
**Status**: ✅ COMPLETE

### 3.1 Cart Page Layout ✅
**Task**: Build cart page with item list

**Files Created**:
- ✅ `src/pages/Cart.jsx`
- ✅ `src/components/cart/CartItem.jsx`
- ✅ `src/components/cart/CartSummary.jsx`
- ✅ `src/components/cart/EmptyCart.jsx`

**Acceptance Criteria**:
- ✅ Cart items display correctly
- ✅ Empty state shows when cart empty
- ✅ Cart summary calculates correctly
- ✅ Responsive layout

### 3.2 Cart Item Component ✅
**Task**: Build individual cart item

**Features**:
- ✅ Product image (small)
- ✅ Product name and details
- ✅ Grind type display
- ✅ Quantity selector
- ✅ Remove button
- ✅ Price calculation

**Acceptance Criteria**:
- ✅ Quantity update works
- ✅ Remove button works
- ✅ Price updates in real-time
- ✅ Confirmation on remove

### 3.3 Cart Summary ✅
**Task**: Build cart totals summary

**Display**:
- ✅ Subtotal
- ✅ Delivery fee (5 лв or Free if > 100 лв)
- ✅ Total
- ✅ Free delivery progress bar

**Actions**:
- ✅ Continue Shopping (link to /shop)
- ✅ Proceed to Checkout (link to /checkout)

**Acceptance Criteria**:
- ✅ Subtotal accurate
- ✅ Delivery calculation correct
- ✅ Free delivery threshold works
- ✅ Total accurate
- ✅ CTAs navigate correctly

### 3.4 Empty Cart State ✅
**Task**: Design empty cart experience

**Content**:
- ✅ Friendly message
- ✅ Coffee cup icon with animation
- ✅ "Browse Products" CTA

**Acceptance Criteria**:
- ✅ Displays when cart empty
- ✅ CTA navigates to /shop
- ✅ Visually appealing

---

---

## Phase 2: Shop & Product Pages
**Duration**: 10-12 hours
**Priority**: High
**Dependencies**: Phase 1 complete

### 2.1 Shop Page Layout
**Task**: Create Shop page with product grid

**Files to Create**:
- `src/pages/Shop.jsx`
- `src/components/shop/ProductCard.jsx`
- `src/components/shop/FilterSidebar.jsx`
- `src/components/shop/SortDropdown.jsx`

**Shop.jsx Structure**:
```jsx
import { useState, useMemo } from 'react';
import { useTranslation } from '../lib/translations';
import ProductCard from '../components/shop/ProductCard';
import FilterSidebar from '../components/shop/FilterSidebar';
import SortDropdown from '../components/shop/SortDropdown';
import products from '../data/products.json';

export default function Shop() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    category: [],
    priceRange: [0, 100],
    roastLevel: [],
    origin: [],
    inStockOnly: false
  });
  const [sortBy, setSortBy] = useState('featured');

  // Filter and sort logic
  const filteredProducts = useMemo(() => {
    // Apply filters
    // Apply sorting
    return products;
  }, [filters, sortBy]);

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <FilterSidebar filters={filters} setFilters={setFilters} />
          
          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-serif">{t('shop.title')}</h1>
              <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- ✅ Product grid responsive (1/2/3 columns)
- ✅ Products display correctly
- ✅ Filters sidebar functional
- ✅ Sort dropdown works
- ✅ Empty state handled

### 2.2 Product Card Component
**Task**: Build reusable ProductCard component

**Features**:
- Product image with category badge
- Product name and details
- Roast level indicator
- Price display
- Add to Cart button
- Hover effects

**Acceptance Criteria**:
- ✅ Card matches design spec
- ✅ Hover animation works
- ✅ Click navigates to product detail
- ✅ Add to Cart opens grind selector

### 2.3 Filter & Sort Implementation
**Task**: Implement filtering and sorting logic

**Filters**:
- Category (checkbox group)
- Price range (slider)
- Roast level (radio buttons)
- Origin (dropdown)
- In stock toggle

**Sort Options**:
- Price: Low to High
- Price: High to Low
- Name: A-Z
- Newest First
- Featured First

**Acceptance Criteria**:
- ✅ All filters work independently
- ✅ Multiple filters combine correctly
- ✅ Sort updates product order
- ✅ Filter state preserved in URL
- ✅ Clear filters button works

### 2.4 Product Detail Page
**Task**: Create detailed product view

**Files to Create**:
- `src/pages/ProductDetail.jsx`
- `src/components/product/ImageGallery.jsx`
- `src/components/product/GrindTypeSelector.jsx`
- `src/components/product/QuantitySelector.jsx`

**Layout**:
- Left: Image gallery (main + thumbnails)
- Right: Product info, selectors, Add to Cart

**Acceptance Criteria**:
- ✅ Product loads from URL param
- ✅ Image gallery works (click thumbnails)
- ✅ Grind type selection works
- ✅ Quantity selector works (min 1, max 10)
- ✅ Add to Cart updates cart count
- ✅ Success animation on add
- ✅ 404 for invalid product ID

### 2.5 Grind Type Selector Modal
**Task**: Create modal for grind type selection

**Files to Create**:
- `src/components/ui/GrindTypeModal.jsx`

**Options**:
- Whole Bean (icon + label)
- Espresso (icon + label)
- Filter (icon + label)
- French Press (icon + label)

**Acceptance Criteria**:
- ✅ Modal opens on "Add to Cart" click
- ✅ Visual selection indicator
- ✅ Confirm adds to cart
- ✅ Cancel closes modal
- ✅ Keyboard navigation (ESC to close)

---

## Phase 3: Shopping Cart
**Duration**: 6-8 hours
**Priority**: High
**Dependencies**: Phase 1, Phase 2.5 complete

### 3.1 Cart Page Layout
**Task**: Build cart page with item list

**Files to Create**:
- `src/pages/Cart.jsx`
- `src/components/cart/CartItem.jsx`
- `src/components/cart/CartSummary.jsx`
- `src/components/cart/EmptyCart.jsx`

**Cart.jsx Structure**:
```jsx
import { useCart } from '../contexts/CartContext';
import { useTranslation } from '../lib/translations';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import EmptyCart from '../components/cart/EmptyCart';

export default function Cart() {
  const { cart } = useCart();
  const { t } = useTranslation();

  if (cart.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-[1000px] mx-auto px-6">
        <h1 className="text-3xl font-serif mb-8">
          {t('cart.title')} ({cart.length})
        </h1>
        
        <div className="space-y-4 mb-8">
          {cart.map((item, index) => (
            <CartItem key={`${item.product.id}-${item.grindType}`} item={item} />
          ))}
        </div>
        
        <CartSummary />
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- ✅ Cart items display correctly
- ✅ Empty state shows when cart empty
- ✅ Cart summary calculates correctly
- ✅ Responsive layout

### 3.2 Cart Item Component
**Task**: Build individual cart item

**Features**:
- Product image (small)
- Product name and details
- Grind type display
- Quantity selector
- Remove button
- Price calculation

**Acceptance Criteria**:
- ✅ Quantity update works
- ✅ Remove button works
- ✅ Price updates in real-time
- ✅ Confirmation on remove (optional)

### 3.3 Cart Summary
**Task**: Build cart totals summary

**Display**:
- Subtotal
- Delivery fee (5 лв or Free if > 100 лв)
- Total

**Actions**:
- Continue Shopping (link to /shop)
- Proceed to Checkout (link to /checkout)

**Acceptance Criteria**:
- ✅ Subtotal accurate
- ✅ Delivery calculation correct
- ✅ Free delivery threshold works
- ✅ Total accurate
- ✅ CTAs navigate correctly

### 3.4 Empty Cart State
**Task**: Design empty cart experience

**Content**:
- Friendly message
- Coffee cup icon
- "Browse Products" CTA

**Acceptance Criteria**:
- ✅ Displays when cart empty
- ✅ CTA navigates to /shop
- ✅ Visually appealing

---

## Phase 4: Checkout Flow
**Duration**: 12-15 hours
**Priority**: High
**Dependencies**: Phase 3 complete ✅
**Status**: ✅ COMPLETE
### 4.1 Checkout Context ✅
**Task**: Create CheckoutContext for form state

**Files Created**:
- ✅ `src/contexts/CheckoutContext.jsx`

**State Management**:
- ✅ Current step (1-4)
- ✅ Client information
- ✅ Delivery details
- ✅ Payment method
- ✅ Validation errors

**Acceptance Criteria**:
- ✅ Multi-step state management
- ✅ Form data persistence
- ✅ Validation logic
- ✅ Step navigation

### 4.2 Checkout Page Structure ✅
**Task**: Build multi-step checkout

**Files Created**:
- ✅ `src/pages/Checkout.jsx`
- ✅ `src/components/checkout/StepIndicator.jsx`
- ✅ `src/components/checkout/ClientInfoStep.jsx`
- ✅ `src/components/checkout/DeliveryStep.jsx`
- ✅ `src/components/checkout/PaymentStep.jsx`
- ✅ `src/components/checkout/ReviewStep.jsx`

**Checkout.jsx Structure**:
```jsx
// Real implementation using state from useCheckout()
```

**Acceptance Criteria**:
- ✅ Step indicator shows progress
- ✅ Step navigation works
- ✅ Can't skip steps
- ✅ Back button works

### 4.3 Step 1: Client Information ✅
**Task**: Build client info form

**Fields**:
- ✅ First Name (required)
- ✅ Last Name (required)
- ✅ Email (required, format validation)
- ✅ Phone (required, Bulgarian format)

**Validation**:
- ✅ All fields required
- ✅ Email format validation
- ✅ Bulgarian phone format validation

**Acceptance Criteria**:
- ✅ All fields validate
- ✅ Error messages display
- ✅ Can't proceed with errors
- ✅ Data saves to context

### 4.4 Step 2: Delivery Details ✅
**Task**: Build delivery form

**Delivery Types**:
- ✅ Home Delivery (5 лв)
- ✅ Office Delivery (5 лв)
- ✅ Pickup from Store (Free)

**Conditional Fields**:
- ✅ If Home/Office: Address, City, Postal Code, Notes
- ✅ If Pickup: Location selector (Sofia Center, Sofia Lozenets, Plovdiv Center)

**Acceptance Criteria**:
- ✅ Delivery type selection works
- ✅ Form fields update based on type
- ✅ Address validation (if applicable)
- ✅ Pickup locations selectable
- ✅ Free delivery indicator for > 100 лв

### 4.5 Step 3: Payment Method ✅
**Task**: Build payment selection

**Options**:
- ✅ Card Payment (Visa, Mastercard icons)
- ✅ Cash on Delivery (only if home/office)
- ✅ Bank Transfer

**Acceptance Criteria**:
- ✅ Payment method selection works
- ✅ Cash on Delivery disabled for pickup
- ✅ Card type selection (if card)
- ✅ Visual feedback on selection

### 4.6 Step 4: Review & Confirm ✅
**Task**: Build order review page

**Display**:
- ✅ Client information summary (with edit link)
- ✅ Delivery details summary (with edit link)
- ✅ Payment method summary (with edit link)
- ✅ Order items with quantities
- ✅ Subtotal, delivery, total
- ✅ Terms & Conditions checkbox
- ✅ Place Order button

**Acceptance Criteria**:
- ✅ All data displays correctly
- ✅ Edit links navigate to correct step
- ✅ Order summary accurate
- ✅ T&C checkbox required
- ✅ Place Order button disabled until T&C accepted

### 4.7 Order Placement ✅
**Task**: Implement order submission

**Process**:
- ✅ Validate all data
- ✅ Generate order number
- ✅ Save order to localStorage (simulate backend)
- ✅ Clear cart
- ✅ Navigate to success page

**Acceptance Criteria**:
- ✅ Order number generated (format: RC-YYYY-NNNNNN)
- ✅ Order saved to localStorage
- ✅ Cart cleared
- ✅ Redirects to success page

---

## Phase 5: Order Confirmation & Polish ✅ COMPLETE
**Duration**: 6-8 hours
**Priority**: Medium
**Dependencies**: Phase 4 complete

### 5.1 Success Page ✅
**Task**: Build order confirmation page

**Files to Create**:
- `src/pages/CheckoutSuccess.jsx`

**Display**:
- ✅ Success checkmark animation
- ✅ Thank you message
- ✅ Order number
- ✅ Confirmation email address
- ✅ Estimated delivery date
- ✅ View Order Details button (future)
- ✅ Continue Shopping button

**Acceptance Criteria**:
- ✅ Displays order details
- ✅ Success animation plays
- ✅ CTAs work correctly
- ✅ Handles missing order gracefully

### 5.2 Header Cart Badge ✅
**Task**: Update header with cart count

**Files to Update**:
- `src/components/layout/Header.jsx`

**Features**:
- ✅ Display cart count
- ✅ Bounce/Pop animation on update
- ✅ Link to cart page

**Acceptance Criteria**:
- ✅ Cart count displays
- ✅ Updates in real-time
- ✅ Animation on add to cart
- ✅ Clicks navigate to cart

### 5.3 Loading States ✅
**Task**: Add loading indicators

**Components to Update**:
- ✅ Add to Cart button (spinner)
- ✅ Product Detail page (skeleton/loading state)
- ✅ Checkout steps (spinner on submit)

**Acceptance Criteria**:
- ✅ Loading states display
- ✅ Buttons disabled during loading
- ✅ Spinners use brand-primary color

### 5.4 Error Handling ✅
**Task**: Add error boundaries and messages

**Scenarios**:
- ✅ Global Error Boundary added
- ✅ Product not found (handled in page)
- ✅ Cart operations fail (handled in context)
- ✅ Checkout validation errors (handled in steps)

**Acceptance Criteria**:
- ✅ Error messages user-friendly
- ✅ Error states recoverable
- ✅ Console errors logged

### 5.5 Animations & Transitions ✅
**Task**: Add polish animations

**Animations**:
- ✅ Product card hover (scale 1.05)
- ✅ Add to Cart success (checkmark & color change)
- ✅ Cart badge pop
- ✅ Page transitions (fade in)
- ✅ Modal open/close (if applicable)

**Acceptance Criteria**:
- ✅ Animations smooth (300-700ms)
- ✅ No jank or lag
- ✅ Reduced motion respected (via standard CSS)

### 5.6 Mobile Responsiveness ✅
**Task**: Test and fix mobile layout

**Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Test Scenarios**:
- ✅ Shop grid (1/2/3 columns)
- ✅ Product detail (stack layout)
- ✅ Cart (full width items)
- ✅ Checkout (single column)
- ✅ Filter sidebar (modal on mobile)

**Acceptance Criteria**:
- ✅ All pages responsive
- ✅ Touch targets adequate (44px min)
- ✅ Text readable
- ✅ No horizontal scroll

---

## Phase 6: Backend & Database Integration
**Duration**: 10-15 hours
**Priority**: High
**Dependencies**: Phase 5 complete
**Status**: ✅ COMPLETE

### 6.1 Database Setup ✅
**Task**: Initialize PostgreSQL/Supabase project

**Deliverables**:
- [x] Supabase project created
- [x] Database schema applied (Tables: products, orders)
- [x] RLS policies configured
- [x] Environment variables set (`.env`)

**Acceptance Criteria**:
- [x] Database accessible via connection string
- [x] All tables exist with correct types
- [x] RLS prevents unauthorized access (Guest Insert / Admin Read)

### 6.2 Data Seeding ✅
**Task**: Migrate local JSON data to Database

**Deliverables**:
- [x] Seeding script (`scripts/seed-db.js`)
- [x] Product data inserted into DB

**Acceptance Criteria**:
- [x] All 8 initial products key data present in DB
- [x] Images linked correctly

### 6.3 API Client Integration ✅
**Task**: Connect frontend to Database

**Deliverables**:
- [x] Supabase client configuration (`src/lib/supabase.js`)
- [x] Replace `products.json` imports with async data fetching
- [x] Create `useProducts` hook

**Acceptance Criteria**:
- [x] Shop page loads products from DB
- [x] Product Detail page loads from DB
- [x] Loading states handle async latency

### 6.4 Checkout Refactor ✅
**Task**: Enable real order persistence in Checkout

**Deliverables**:
- [x] Refactor `ReviewStep.jsx` to usage Supabase API
- [x] Remove LocalStorage order simulation
- [x] Implement sequential transaction (Order -> Order Items)

**Acceptance Criteria**:
- [x] Orders are saved to `orders` table
- [x] Order items are saved to `order_items` table
- [x] Success page still works

**Acceptance Criteria**:
- ✅ All pages responsive
- ✅ Touch targets adequate (44px min)
- ✅ Text readable
- ✅ No horizontal scroll

---

## Testing Checklist

### Functional Testing
- [ ] All routes navigate correctly
- [ ] Products load and display
- [ ] Filters work independently and combined
- [ ] Sort updates product order
- [ ] Add to Cart updates cart
- [ ] Cart count accurate
- [ ] Cart totals calculate correctly
- [ ] Quantity update works
- [ ] Remove from cart works
- [ ] Checkout steps navigate correctly
- [ ] Form validation works
- [ ] Order placement succeeds
- [ ] Success page displays order

### Data Persistence
- [ ] Cart persists across refresh
- [ ] Checkout data persists across steps
- [ ] LocalStorage schema correct
- [ ] Data clears after order

### UI/UX Testing
- [ ] All animations smooth
- [ ] Loading states display
- [ ] Error messages clear
- [ ] Empty states friendly
- [ ] Hover effects work
- [ ] Focus states visible
- [ ] Keyboard navigation works

### Responsive Testing
- [ ] Mobile layout correct
- [ ] Tablet layout correct
- [ ] Desktop layout correct
- [ ] Touch targets adequate
- [ ] No horizontal scroll

### Translation Testing
- [ ] All text uses translation keys
- [ ] Bulgarian translations correct
- [ ] No hardcoded English strings
- [ ] Currency format correct (лв)

---

## File Structure Summary

```
src/
├── components/
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   └── EmptyCart.jsx
│   ├── checkout/
│   │   ├── StepIndicator.jsx
│   │   ├── ClientInfoStep.jsx
│   │   ├── DeliveryStep.jsx
│   │   ├── PaymentStep.jsx
│   │   └── ReviewStep.jsx
│   ├── product/
│   │   ├── ImageGallery.jsx
│   │   ├── GrindTypeSelector.jsx
│   │   └── QuantitySelector.jsx
│   ├── shop/
│   │   ├── ProductCard.jsx
│   │   ├── FilterSidebar.jsx
│   │   └── SortDropdown.jsx
│   └── ui/
│       └── GrindTypeModal.jsx
├── contexts/
│   ├── CartContext.jsx
│   └── CheckoutContext.jsx
├── data/
│   └── products.json
├── pages/
│   ├── Shop.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   └── CheckoutSuccess.jsx
└── App.jsx (updated)
```

---

## Dependencies & Risks

### Dependencies
- React Router v6 installation
- Product images availability
- Translation keys complete

### Risks
1. **LocalStorage Limits**: Cart data could exceed 5MB limit
   - **Mitigation**: Monitor cart size, implement cleanup
   
2. **Browser Compatibility**: LocalStorage not available
   - **Mitigation**: Fallback to in-memory state
   
3. **Image Loading**: Large product images slow
   - **Mitigation**: Implement lazy loading, optimize images

4. **Mobile Performance**: Animations janky on low-end devices
   - **Mitigation**: Use CSS transforms, respect reduced motion

---

## Success Metrics

### Phase Completion
- [ ] Phase 1: Foundation complete
- [ ] Phase 2: Shop & Products complete
- [ ] Phase 3: Cart complete
- [ ] Phase 4: Checkout complete
- [ ] Phase 5: Polish complete

### Quality Gates
- [ ] All acceptance criteria met
- [ ] No console errors
- [ ] All tests passing
- [ ] Mobile responsive
- [ ] Translations complete
- [ ] Performance acceptable (< 3s load)

### Business Goals
- [ ] Users can browse products
- [ ] Users can add to cart
- [ ] Users can complete checkout
- [ ] Orders saved successfully
- [ ] Cart persists across sessions

---

## Next Steps

1. **Review this plan** with Architect
2. **Begin Phase 1** implementation
3. **Test each phase** before proceeding
4. **Document any deviations** from plan
5. **Update translations** as needed

**Ready to begin implementation!**
