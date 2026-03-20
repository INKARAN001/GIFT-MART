import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoMenu, setShowLogoMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide search on login/register/about-us pages
  const hideSearchBar = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/about-us';

  // Show home button on all pages except home page
  const isHomePage = location.pathname === '/';
  // Show only home button on About Us page
  const isAboutPage = location.pathname === '/about-us';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const logoWrapper = document.querySelector('.logo-menu-wrapper');
      if (logoWrapper && !logoWrapper.contains(e.target)) {
        setShowLogoMenu(false);
      }
    };

    if (showLogoMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showLogoMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowLogoMenu(false);
    }
  };

  const menuItems = [
    { label: 'Our Products', path: '/products', style: 'font-style-1' },
    { label: 'Design Gifts', path: '/gift-builder', style: 'font-style-2' },
    { label: 'About Us', path: '/about-us', style: 'font-style-3' }
  ];

  const isLoginPage = location.pathname === '/login';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {isAboutPage ? (
          <>
            <div className="navbar-left">
              <Link to="/" className="nav-link home-btn">← Home</Link>
            </div>
            {!hideSearchBar && <div className="navbar-center" />}
            <div className="navbar-right">
              <div className="navbar-auth">
                {user && !isLoginPage && <Link to="/profile" className="nav-link">{user.name}</Link>}
                {user && isLoginPage && <button onClick={logout} className="logout-btn">Logout</button>}
                {!user && <Link to="/login" className="nav-link login-btn">Login</Link>}
              </div>
              <div className="logo-menu-wrapper">
                <button className="logo-button" onClick={() => setShowLogoMenu(!showLogoMenu)} title="Menu">
                  <img src="/logo.png" alt="Gift Mart Logo" className="navbar-logo" />
                </button>
                {showLogoMenu && (
                  <div className="logo-dropdown-menu">
                    {menuItems.map((item, idx) => (
                      <Link key={idx} to={item.path} className={`menu-item ${item.style}`} onClick={() => setShowLogoMenu(false)}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Left: Brand on home, back button on other pages */}
            <div className="navbar-left">
              {isHomePage ? (
                <Link to="/" className="navbar-brand">
                  <span className="navbar-brand-line1">𝓘𝓝𝓣</span>
                  <span className="navbar-brand-line2">𝓖𝓲𝓯𝓽 𝓜𝓪𝓻𝓽</span>
                </Link>
              ) : (
                <Link to="/" className="nav-link home-btn">
                  ← Home
                </Link>
              )}
            </div>

            {/* Center: Search bar */}
            {!hideSearchBar && (
              <div className="navbar-center">
                <form className="search-bar" onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Search gifts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <button type="submit" className="search-btn">
                    🔍
                  </button>
                </form>
              </div>
            )}

            {/* Right: Auth + Logo Menu */}
            <div className="navbar-right">
              <div className="navbar-auth">
                {user && !isLoginPage && (
                  <Link to="/profile" className="nav-link">{user.name}</Link>
                )}
                {user && isLoginPage && (
                  <button onClick={logout} className="logout-btn">Logout</button>
                )}
                {!user && (
                  <Link to="/login" className="nav-link login-btn">Login</Link>
                )}
              </div>

              <div className="logo-menu-wrapper">
                <button
                  className="logo-button"
                  onClick={() => setShowLogoMenu(!showLogoMenu)}
                  title="Menu"
                >
                  <img src="/logo.png" alt="Gift Mart Logo" className="navbar-logo" />
                </button>

                {showLogoMenu && (
                  <div className="logo-dropdown-menu">
                    {menuItems.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.path}
                        className={`menu-item ${item.style}`}
                        onClick={() => setShowLogoMenu(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
