# Specification: E-Commerce Shop & Checkout System

**ID**: SPEC-004
**Created**: 2025-12-28
**Author**: Architect
**Status**: Ready for Implementation

## 1. Objective
Design and implement a complete e-commerce system for ReCoffee, including product catalog, shopping cart, and checkout flow with client information, delivery details, and payment selection.

## 2. System Architecture

### 2.1 State Management Architecture
```
┌─────────────────────────────────────────┐
│         Application Root                │
│  ┌───────────────────────────────────┐  │
│  │       CartProvider                │  │
│  │  - Cart items                     │  │
│  │  - Add/Remove/Update              │  │
│  │  - LocalStorage sync              │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │    CheckoutProvider         │  │  │
│  │  │  - Client info              │  │  │
│  │  │  - Delivery info            │  │  │
│  │  │  - Payment method           │  │  │
│  │  │  - Order processing         │  │  │
│  │  │  └─────────────────────────┘  │  │
│  │  └───────────────────────────────┘  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 2.2 Routing Structure
```
/                    → Home (existing)
/shop                → Product Catalog
/shop/:id            → Product Detail
/cart                → Shopping Cart
/checkout            → Checkout Flow
/checkout/success    → Order Confirmation
```

### 2.3 Data Models

#### Product Model
```typescript
interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  currency: string; // "BGN"
  images: string[];
  category: 'single-origin' | 'blend' | 'limited';
  origin?: string;
  process?: string;
  roastLevel: 1 | 2 | 3 | 4 | 5;
  flavorNotes: string[];
  weight: number; // grams
  inStock: boolean;
  featured: boolean;
}
```

#### Cart Item Model
```typescript
interface CartItem {
  product: Product;
  quantity: number;
  grindType: 'whole-bean' | 'espresso' | 'filter' | 'french-press';
}
```

#### Checkout Model
```typescript
interface CheckoutData {
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  delivery: {
    type: 'home' | 'office' | 'pickup';
    address?: {
      street: string;
      city: string;
      postalCode: string;
      notes?: string;
    };
    pickupLocation?: string;
  };
  payment: {
    method: 'card' | 'cash' | 'bank-transfer';
    cardType?: 'visa' | 'mastercard';
  };
}
```

## 3. Feature Specifications

### 3.1 Shop Page (`/shop`)

#### Layout
- **Grid System**: Responsive product grid (1 col mobile, 2 col tablet, 3-4 col desktop)
- **Filters Sidebar** (Desktop) / **Filter Modal** (Mobile):
  - Category filter (Single Origin, Blend, Limited)
  - Price range slider
  - Roast level selector
  - Origin filter
  - In stock toggle
- **Sort Options**:
  - Price: Low to High
  - Price: High to Low
  - Name: A-Z
  - Newest First
  - Featured First

#### Product Card Design
```
┌─────────────────────────┐
│                         │
│    Product Image        │
│    (aspect 4:5)         │
│                         │
│  ┌─────────────────┐    │
│  │ Category Badge  │    │
│  └─────────────────┘    │
├─────────────────────────┤
│ Product Name            │
│ Origin • Process        │
│ ★★★ Roast Level        │
│                         │
│ 45.00 лв                │
│ [+ Add to Cart]         │
└─────────────────────────┘
```

#### Interactions
- **Hover**: Scale image slightly, show "Quick View" overlay
- **Click Card**: Navigate to product detail
- **Click Add to Cart**: 
  - Show grind type selector modal
  - Add to cart with animation
  - Update cart badge in header

### 3.2 Product Detail Page (`/shop/:id`)

#### Layout (Two-Column)
```
┌──────────────────────────────────────────────────────┐
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │                  │  │  Product Name            │  │
│  │  Image Gallery   │  │  Origin • Process        │  │
│  │  (Main + Thumbs) │  │  ★★★★☆ Roast Level      │  │
│  │                  │  │                          │  │
│  │                  │  │  45.00 лв                │  │
│  │                  │  │                          │  │
│  │                  │  │  [Grind Type Selector]   │  │
│  │                  │  │  [Quantity Selector]     │  │
│  │                  │  │                          │  │
│  │                  │  │  [Add to Cart - Large]   │  │
│  │                  │  │                          │  │
│  └──────────────────┘  │  Description             │  │
│                        │  Flavor Notes            │  │
│                        │  Brewing Tips            │  │
│                        └──────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

#### Features
- **Image Gallery**: 
  - Main image with zoom on hover
  - Thumbnail navigation
  - Swipe support on mobile
- **Grind Type Selector**:
  - Visual radio buttons with icons
  - Options: Whole Bean, Espresso, Filter, French Press
- **Quantity Selector**:
  - Stepper input (-, number, +)
  - Min: 1, Max: 10
- **Add to Cart**:
  - Large, prominent button
  - Loading state during add
  - Success animation
  - Update cart count

### 3.3 Shopping Cart (`/cart`)

#### Layout
```
┌────────────────────────────────────────────────────┐
│  Shopping Cart (3 items)                           │
├────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐  │
│  │ [Img] Product Name                           │  │
│  │       Origin • Grind Type                    │  │
│  │       [- 2 +]  [Remove]         45.00 лв     │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ [Img] Product Name                           │  │
│  │       Origin • Grind Type                    │  │
│  │       [- 1 +]  [Remove]         38.00 лв     │  │
│  └──────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────┤
│                                  Subtotal: 83.00 лв│
│                         Delivery (est.): 5.00 лв   │
│                                    Total: 88.00 лв │
│                                                    │
│  [Continue Shopping]    [Proceed to Checkout →]   │
└────────────────────────────────────────────────────┘
```

#### Features
- **Empty State**: 
  - Friendly message
  - "Browse Products" CTA
- **Item Management**:
  - Quantity adjustment (updates total in real-time)
  - Remove item (with undo toast)
  - Edit grind type
- **Summary**:
  - Subtotal calculation
  - Delivery estimate (free over 100 лв)
  - Total with delivery
- **Actions**:
  - Continue Shopping (back to /shop)
  - Proceed to Checkout (to /checkout)

### 3.4 Checkout Flow (`/checkout`)

#### Multi-Step Form Design
```
Step 1: Client Information
Step 2: Delivery Details
Step 3: Payment Method
Step 4: Review & Confirm
```

#### Step 1: Client Information
```
┌────────────────────────────────────────┐
│  Client Information                    │
├────────────────────────────────────────┤
│  First Name:     [____________]        │
│  Last Name:      [____________]        │
│  Email:          [____________]        │
│  Phone:          [____________]        │
│                                        │
│  [← Back to Cart]    [Continue →]     │
└────────────────────────────────────────┘
```

**Validation**:
- All fields required
- Email format validation
- Phone format validation (Bulgarian: +359...)

#### Step 2: Delivery Details
```
┌────────────────────────────────────────┐
│  Delivery Method                       │
├────────────────────────────────────────┤
│  ○ Home Delivery (5.00 лв)            │
│  ○ Office Delivery (5.00 лв)          │
│  ○ Pickup from Store (Free)           │
│                                        │
│  [If Home/Office selected:]           │
│  Street Address: [____________]        │
│  City:           [____________]        │
│  Postal Code:    [______]              │
│  Notes:          [____________]        │
│                                        │
│  [If Pickup selected:]                │
│  Select Location:                      │
│  ○ Sofia - Center                     │
│  ○ Sofia - Lozenets                   │
│  ○ Plovdiv - Center                   │
│                                        │
│  [← Back]    [Continue →]             │
└────────────────────────────────────────┘
```

**Features**:
- Delivery type selection updates form fields
- Free delivery for orders over 100 лв
- Pickup locations with addresses
- Optional delivery notes

#### Step 3: Payment Method
```
┌────────────────────────────────────────┐
│  Payment Method                        │
├────────────────────────────────────────┤
│  ○ Card Payment                        │
│     [Visa] [Mastercard]                │
│                                        │
│  ○ Cash on Delivery                    │
│     (Available for home/office only)   │
│                                        │
│  ○ Bank Transfer                       │
│     (Order confirmed after payment)    │
│                                        │
│  [← Back]    [Review Order →]         │
└────────────────────────────────────────┘
```

**Features**:
- Visual payment method selection
- Cash on delivery only for home/office
- Bank transfer shows account details after order

#### Step 4: Review & Confirm
```
┌────────────────────────────────────────┐
│  Review Your Order                     │
├────────────────────────────────────────┤
│  Client Information                    │
│  ✓ Emil Petrov                        │
│  ✓ emil@example.com                   │
│  ✓ +359 888 123 456                   │
│                                        │
│  Delivery                              │
│  ✓ Home Delivery                      │
│  ✓ ul. Vitosha 15, Sofia 1000        │
│                                        │
│  Payment                               │
│  ✓ Card Payment (Visa)                │
│                                        │
│  Order Summary                         │
│  - Product 1 (x2)         90.00 лв    │
│  - Product 2 (x1)         45.00 лв    │
│  Subtotal:               135.00 лв    │
│  Delivery:                 0.00 лв    │
│  Total:                  135.00 лв    │
│                                        │
│  ☐ I agree to Terms & Conditions      │
│                                        │
│  [← Back]    [Place Order →]          │
└────────────────────────────────────────┘
```

**Features**:
- Summary of all entered information
- Edit links for each section
- Order summary with line items
- Terms & conditions checkbox
- Place Order button (disabled until T&C accepted)

### 3.5 Order Confirmation (`/checkout/success`)

```
┌────────────────────────────────────────┐
│         ✓ Order Confirmed!             │
├────────────────────────────────────────┤
│  Thank you for your order!             │
│                                        │
│  Order Number: #RC-2024-001234         │
│  Confirmation sent to:                 │
│  emil@example.com                      │
│                                        │
│  Estimated Delivery:                   │
│  January 5, 2025                       │
│                                        │
│  [View Order Details]                  │
│  [Continue Shopping]                   │
└────────────────────────────────────────┘
```

## 4. UI/UX Design Specifications

### 4.1 Color Usage
- **Primary Actions**: `brand-primary` (#BF2645)
  - Add to Cart buttons
  - Checkout CTAs
  - Active states
- **Secondary Actions**: `brand-secondary` (#017DC7)
  - Continue Shopping
  - Edit links
  - Info badges
- **Accent**: `brand-accent` (#9B5440)
  - Price displays
  - Roast level indicators
  - Flavor note tags

### 4.2 Typography
- **Product Names**: Playfair Display (serif), 1.5rem-2rem
- **Prices**: Inter (sans), bold, 1.25rem
- **Body Text**: Inter (sans), regular, 0.875rem-1rem
- **Labels**: Inter (sans), medium, 0.75rem, uppercase, letter-spacing

### 4.3 Spacing & Layout
- **Container Max Width**: 1400px
- **Grid Gap**: 1.5rem (mobile), 2rem (desktop)
- **Section Padding**: 3rem (mobile), 6rem (desktop)
- **Card Padding**: 1rem (mobile), 1.5rem (desktop)

### 4.4 Animations
- **Product Card Hover**: Scale 1.02, duration 300ms
- **Add to Cart**: Success checkmark animation
- **Cart Badge**: Bounce animation on update
- **Page Transitions**: Fade in, duration 200ms
- **Loading States**: Spinner with brand-primary color

## 5. Bulgarian Translations

### 5.1 Shop Page
```json
{
  "shop": {
    "title": "Магазин",
    "filters": "Филтри",
    "sort": "Подреди",
    "category": "Категория",
    "price_range": "Ценови диапазон",
    "roast_level": "Ниво на печене",
    "origin": "Произход",
    "in_stock": "В наличност",
    "add_to_cart": "Добави в количка",
    "quick_view": "Бърз преглед",
    "no_products": "Няма намерени продукти",
    "showing_results": "Показване на {{count}} продукта"
  }
}
```

### 5.2 Product Detail
```json
{
  "product": {
    "grind_type": "Тип смилане",
    "whole_bean": "Цели зърна",
    "espresso": "Еспресо",
    "filter": "Филтър",
    "french_press": "Френска преса",
    "quantity": "Количество",
    "flavor_notes": "Вкусови ноти",
    "brewing_tips": "Съвети за приготвяне",
    "in_stock": "В наличност",
    "out_of_stock": "Изчерпан"
  }
}
```

### 5.3 Cart
```json
{
  "cart": {
    "title": "Количка",
    "empty": "Вашата количка е празна",
    "subtotal": "Междинна сума",
    "delivery": "Доставка",
    "total": "Общо",
    "free_delivery": "Безплатна доставка",
    "continue_shopping": "Продължи пазаруването",
    "proceed_checkout": "Към плащане",
    "remove": "Премахни",
    "items_count": "{{count}} артикула"
  }
}
```

### 5.4 Checkout
```json
{
  "checkout": {
    "client_info": "Данни на клиента",
    "first_name": "Име",
    "last_name": "Фамилия",
    "email": "Имейл",
    "phone": "Телефон",
    "delivery_details": "Детайли за доставка",
    "delivery_method": "Метод на доставка",
    "home_delivery": "Доставка до дома",
    "office_delivery": "Доставка до офис",
    "pickup": "Вземане от магазин",
    "street_address": "Адрес",
    "city": "Град",
    "postal_code": "Пощенски код",
    "notes": "Бележки",
    "payment_method": "Метод на плащане",
    "card_payment": "Плащане с карта",
    "cash_on_delivery": "Наложен платеж",
    "bank_transfer": "Банков превод",
    "review_order": "Преглед на поръчката",
    "place_order": "Поръчай",
    "terms_agree": "Съгласен съм с Условията",
    "back": "Назад",
    "continue": "Продължи"
  }
}
```

### 5.5 Order Confirmation
```json
{
  "order": {
    "confirmed": "Поръчката е потвърдена!",
    "thank_you": "Благодарим за поръчката!",
    "order_number": "Номер на поръчка",
    "confirmation_sent": "Потвърждение изпратено до",
    "estimated_delivery": "Очаквана доставка",
    "view_details": "Виж детайли",
    "continue_shopping": "Продължи пазаруването"
  }
}
```

## 6. Implementation Phases

### Phase 1: Foundation (Priority 1)
1. Install React Router
2. Create CartContext with LocalStorage
3. Create product data JSON
4. Implement routing structure

### Phase 2: Shop & Product Pages (Priority 1)
1. Build Shop page with grid layout
2. Implement filters and sorting
3. Create Product Detail page
4. Add grind type selector
5. Implement Add to Cart functionality

### Phase 3: Cart (Priority 1)
1. Build Cart page
2. Implement quantity management
3. Add remove functionality
4. Calculate totals with delivery

### Phase 4: Checkout Flow (Priority 2)
1. Create CheckoutContext
2. Build multi-step form
3. Implement validation
4. Create review page
5. Build success page

### Phase 5: Polish & Optimization (Priority 3)
1. Add animations and transitions
2. Implement loading states
3. Add error handling
4. Optimize performance
5. Mobile responsiveness testing

## 7. Technical Considerations

### 7.1 LocalStorage Schema
```javascript
{
  "recoffee_cart": [
    {
      "productId": "prod_001",
      "quantity": 2,
      "grindType": "espresso"
    }
  ],
  "recoffee_checkout": {
    "client": {...},
    "delivery": {...},
    "payment": {...}
  }
}
```

### 7.2 URL Structure
- Clean URLs with product slugs
- Query parameters for filters: `/shop?category=blend&roast=3`
- Preserve filter state in URL for sharing

### 7.3 SEO Optimization
- Product pages with proper meta tags
- Structured data (JSON-LD) for products
- Canonical URLs
- Image alt texts in Bulgarian

### 7.4 Performance
- Lazy load product images
- Virtualized lists for large catalogs
- Debounced filter updates
- Optimistic UI updates for cart

## 8. Future Enhancements
- User accounts and order history
- Product reviews and ratings
- Wishlist functionality
- Subscription management
- Real payment gateway integration
- Backend API for inventory management
- Email notifications
- Order tracking
