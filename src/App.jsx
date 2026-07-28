import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Subscription from './pages/Subscription';
import Wholesale from './pages/Wholesale';
import Learn from './pages/Learn';
import LearnArticle from './pages/LearnArticle';
import About from './pages/About';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Delivery from './pages/Delivery';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import Unsubscribe from './pages/Unsubscribe';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Cookies from './pages/legal/Cookies';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Admin Imports. Lazy, so the dashboard stays out of the bundle every shop
// visitor downloads. All ten go through the barrel in pages/admin/index.js so
// they land in one chunk: the first of these to resolve fetches it, and the
// rest are already there. See that file for why it exists.
const adminChunk = () => import('./pages/admin');
const pick = (name) => lazy(() => adminChunk().then((m) => ({ default: m[name] })));

const AdminLogin = pick('AdminLogin');
const ProtectedRoute = pick('ProtectedRoute');
const AdminLayout = pick('AdminLayout');
const ProductList = pick('ProductList');
const ProductForm = pick('ProductForm');
const ServiceList = pick('ServiceList');
const ServiceForm = pick('ServiceForm');
const AdminOrders = pick('AdminOrders');
const AdminInquiries = pick('AdminInquiries');
const AdminReviews = pick('AdminReviews');

// Shown while the admin chunk is in flight. A blank screen on a slow connection
// reads as a broken login, so fill the viewport the dashboard is about to take.
const adminFallback = (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <LoadingSpinner size="lg" color="slate" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Admin Routes. The Suspense boundaries sit on these two
                  top-level elements; the nested pages render through an Outlet
                  inside them, so they are covered without a boundary each. */}
              <Route
                path="/admin/login"
                element={
                  <Suspense fallback={adminFallback}>
                    <AdminLogin />
                  </Suspense>
                }
              />

              <Route
                path="/admin"
                element={
                  <Suspense fallback={adminFallback}>
                    <ProtectedRoute />
                  </Suspense>
                }
              >
                <Route element={<AdminLayout />}>
                  <Route index element={<Navigate to="orders" replace />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="products" element={<ProductList />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/:id" element={<ProductForm />} />
                  <Route path="services" element={<ServiceList />} />
                  <Route path="services/new" element={<ServiceForm />} />
                  <Route path="services/:id" element={<ServiceForm />} />
                  <Route path="inquiries" element={<AdminInquiries />} />
                  <Route path="reviews" element={<AdminReviews />} />
                </Route>
              </Route>

              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/wholesale" element={<Wholesale />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/:slug" element={<LearnArticle />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/delivery" element={<Delivery />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/account" element={<Account />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
