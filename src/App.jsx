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
import Locations from './pages/Locations';
import Learn from './pages/Learn';
import LearnArticle from './pages/LearnArticle';
import About from './pages/About';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Cookies from './pages/legal/Cookies';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Admin Imports
import AdminLogin from './pages/admin/Login';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import ProductList from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import ServiceList from './pages/admin/Services';
import ServiceForm from './pages/admin/ServiceForm';
import AdminOrders from './pages/admin/Orders';
import AdminInquiries from './pages/admin/Inquiries';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route path="/admin" element={<ProtectedRoute />}>
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
                <Route path="/locations" element={<Locations />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/:slug" element={<LearnArticle />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/account" element={<Account />} />
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
