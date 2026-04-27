import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Products from './pages/Products';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import ProductDetail from './pages/ProductDetail';
import AdminPanel from './pages/admin/AdminPanel';
import SplashScreen from './components/SplashScreen';
import CategoryProductsPage from './pages/CategoryProductsPage';
import NotFound from './pages/NotFound';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Reminders from './pages/Reminders';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import TrackOrder from './pages/TrackOrder';
import Feedback from './pages/Feedback';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Unsubscribe from './pages/Unsubscribe';
import AmountCalculator from './pages/AmountCalculator';
import { FEATURES } from './config/features';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function isAdminRole(role) {
  return (role || '').toLowerCase() === 'admin';
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminRole(user.role)) return <Navigate to="/" replace />;
  return children;
}

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

export default function App() {
  // Show splash once per browser session
  const [splash, setSplash] = useState(
    () => !sessionStorage.getItem('splashShown')
  );

  function handleSplashDone() {
    sessionStorage.setItem('splashShown', '1');
    setSplash(false);
  }

  if (splash) return <SplashScreen onDone={handleSplashDone} />;

  return (
    <>
      <ScrollToTopOnRouteChange />
      <Routes>
        {/* User routes (with Navbar + footer) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:categorySlug" element={<CategoryProductsPage />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="cart" element={<Cart />} />
          <Route path="amount-calculator" element={
            <ProtectedRoute><AmountCalculator /></ProtectedRoute>
          } />
          <Route path="checkout" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="order-confirmation/:orderId" element={
            <ProtectedRoute><OrderConfirmation /></ProtectedRoute>
          } />
          <Route path="unsubscribe" element={<Unsubscribe />} />
          <Route path="wishlist" element={
            <ProtectedRoute><Wishlist /></ProtectedRoute>
          } />
          <Route path="reminders" element={
            <ProtectedRoute>
              {FEATURES.REMINDERS ? <Reminders /> : <Navigate to="/profile" replace />}
            </ProtectedRoute>
          } />
        </Route>

        {/* Admin — full-screen, no Navbar */}
        <Route path="/admin" element={
          <AdminRoute><AdminPanel /></AdminRoute>
        } />
        <Route path="/admin/*" element={
          <AdminRoute><AdminPanel /></AdminRoute>
        } />

        {/* Unknown routes → animated 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
