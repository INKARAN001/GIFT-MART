import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/HomeNew';
import Login from './pages/Login';
import Products from './pages/Products';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import ProductDetail from './pages/ProductDetail';
import AdminPanel from './pages/admin/AdminPanel';
import SplashScreen from './components/SplashScreen';
import FlashCards from './pages/FlashCards';
import Bouquets from './pages/Bouquets';
import Frames from './pages/Frames';
import GiftBoxes from './pages/GiftBoxes';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
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
    <Routes>
      {/* User routes (with Navbar + footer) */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/flash-cards" element={<FlashCards />} />
        <Route path="products/bouquets" element={<Bouquets />} />
        <Route path="products/frames" element={<Frames />} />
        <Route path="products/gift-boxes" element={<GiftBoxes />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
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
  );
}
