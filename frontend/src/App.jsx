import './index.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';

import Header from './components/storefront/Header';
import Footer from './components/storefront/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import TermsAndPolicy from './pages/TermsAndPolicy';
import Login from './pages/Login';
import Register from './pages/Register';
import Storefront from './pages/Storefront';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminLayout from './components/admin/AdminLayout';

function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center py-12">Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms-and-policy" element={<TermsAndPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/storefront" element={<Storefront />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
