import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import AdminPanel from './pages/admin/AdminPanel';

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
  return (
    <Routes>
      {/* User routes (with Navbar + footer) */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
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

      {/* Anything else → home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
