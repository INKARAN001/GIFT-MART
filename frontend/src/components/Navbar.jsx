import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const hideSearchBar =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/about-us';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">redeem</span>
            </div>
            <h1 className="text-xl font-black tracking-tighter font-display uppercase text-slate-900 dark:text-white">
              Gift Mart
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/products" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              Shop
            </Link>
            <Link to="/about-us" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              About
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4 lg:gap-6">
          {!hideSearchBar && (
            <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 w-full max-w-xs border border-transparent focus-within:border-primary transition-all">
              <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
              <input
                type="text"
                placeholder="Find the perfect gift..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
              />
            </form>
          )}
          <div className="flex items-center gap-2">
            <Link to="/cart" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors text-slate-700 dark:text-slate-300" aria-label="Cart">
              <span className="material-symbols-outlined">shopping_bag</span>
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">{itemCount > 99 ? '99+' : itemCount}</span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/wishlist" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-slate-300" title="Wishlist" aria-label="Wishlist">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>favorite</span>
                </Link>
                <Link to="/reminders" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-slate-300" title="Reminders" aria-label="Reminders">
                  <span className="material-symbols-outlined">notifications</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-primary dark:text-primary"
                    title="Admin panel"
                    aria-label="Admin panel"
                  >
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                  </Link>
                )}
                <Link to="/profile" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-slate-300" title={user.name || user.email}>
                  <span className="material-symbols-outlined">person</span>
                </Link>
                <button type="button" onClick={logout} className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary px-2">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-slate-300">
                <span className="material-symbols-outlined">person</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
