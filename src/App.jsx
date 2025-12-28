import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';

// Placeholder components - will be implemented in next phases
const Shop = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-serif">Shop Page - Coming Soon</h1></div>;
const ProductDetail = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-serif">Product Detail - Coming Soon</h1></div>;
const Cart = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-serif">Cart - Coming Soon</h1></div>;
const Checkout = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-serif">Checkout - Coming Soon</h1></div>;
const CheckoutSuccess = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-serif">Order Confirmed - Coming Soon</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
