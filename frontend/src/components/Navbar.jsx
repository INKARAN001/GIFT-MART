import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

// Sprint 1 Navbar: Brand + Login/Profile link only (no search, no menu)
export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left: Brand */}
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <span className="navbar-brand-line1">𝓘𝓝𝓣</span>
            <span className="navbar-brand-line2">𝓖𝓲𝓯𝓽 𝓜𝓪𝓻𝓽</span>
          </Link>
        </div>

        {/* Right: Auth */}
        <div className="navbar-right">
          <div className="navbar-auth">
            {user && !isLoginPage && (
              <Link to="/profile" className="nav-link">{user.name}</Link>
            )}
            {user && (
              <button onClick={logout} className="logout-btn">Logout</button>
            )}
            {!user && (
              <Link to="/login" className="nav-link login-btn">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
