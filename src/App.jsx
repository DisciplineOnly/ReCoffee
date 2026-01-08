import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Admin Imports
import AdminLogin from './pages/admin/Login';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import ProductList from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import ServiceList from './pages/admin/Services';
import ServiceForm from './pages/admin/ServiceForm';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CartProvider>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="products" replace />} />
                <Route path="products" element={<ProductList />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id" element={<ProductForm />} />
                <Route path="services" element={<ServiceList />} />
                <Route path="services/new" element={<ServiceForm />} />
                <Route path="services/:id" element={<ServiceForm />} />
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
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
