//navbar
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  // TODO: Replace with real auth context later
  const isLoggedIn = false;
  const cartItemCount = 0;
  const wishlistCount = 0;

  const navLinks = [
    { name: 'Makeup', path: '/category/makeup' },
    { name: 'Skincare', path: '/category/skincare' },
    { name: 'Haircare', path: '/category/haircare' },
    { name: 'Men Care', path: '/category/men-care' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">L</span>
          <span className="navbar__logo-text">Lumière</span>
          <span className="navbar__logo-dot">.</span>
        </Link>

        {/* Nav Links */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''
                  }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Icons */}
        <div className="navbar__actions">
          <Link to="/search" className="navbar__icon-btn" aria-label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>

          <Link to="/wishlist" className="navbar__icon-btn" aria-label="Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="navbar__badge">{wishlistCount}</span>
            )}
          </Link>

          <Link to="/cart" className="navbar__icon-btn" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartItemCount > 0 && (
              <span className="navbar__badge">{cartItemCount}</span>
            )}
          </Link>

          {/* User Menu */}
          <div className="navbar__user-wrapper">
            <button
              className={`navbar__user-btn ${isLoggedIn ? 'navbar__user-btn--logged-in' : ''}`}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              {isLoggedIn ? (
                <span className="navbar__user-avatar">U</span>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
              <svg className={`navbar__chevron ${userMenuOpen ? 'navbar__chevron--open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="navbar__dropdown">
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      My Account
                    </Link>
                    <Link to="/orders" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2" /><path d="m9 12 2 2 4-4" /></svg>
                      My Orders
                    </Link>
                    <Link to="/admin" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      Admin Panel
                    </Link>
                    <hr className="navbar__dropdown-divider" />
                    <button className="navbar__dropdown-item navbar__dropdown-item--logout">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      Login
                    </Link>
                    <Link to="/login?mode=register" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
