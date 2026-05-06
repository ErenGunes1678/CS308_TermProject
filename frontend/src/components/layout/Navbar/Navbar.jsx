import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart';
import './Navbar.css';

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const wishlistCount = 0;
  const cartBadgeCount = itemCount > 99 ? '99+' : itemCount;
  const canAccessCart = user?.role !== 'product_manager';
  const userInitial =
    user?.name?.trim().charAt(0).toUpperCase() ||
    user?.email?.trim().charAt(0).toUpperCase() ||
    'U';

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const currentQuery = new URLSearchParams(location.search).get('q') || '';
    setSearchQuery(currentQuery);
    setSearchOpen(location.pathname === '/search' && Boolean(currentQuery));
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [searchOpen]);

  useEffect(() => {
    if (location.pathname !== '/search') {
      return;
    }

    const currentQuery = new URLSearchParams(location.search).get('q') || '';
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery === currentQuery.trim()) {
      return;
    }

    const timer = window.setTimeout(() => {
      const target = trimmedQuery
        ? `/search?q=${encodeURIComponent(trimmedQuery)}`
        : '/search';
      navigate(target, { replace: true });
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.pathname, location.search, navigate, searchQuery]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setSearchOpen(true);
      return;
    }

    navigate('/search');
    setSearchOpen(false);
  };

  const openSearchPage = () => {
    if (location.pathname !== '/search') {
      navigate(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery.trim())}` : '/search');
    }
    setSearchOpen(true);
  };

  const navLinks = [
    {
      name: 'Makeup',
      path: '/category/makeup',
      subcategories: ['Lipstick', 'Foundation', 'Eyeshadow', 'Mascara', 'Blush'],
    },
    {
      name: 'Skincare',
      path: '/category/skincare',
      subcategories: ['Moisturizers', 'Serums', 'Cleansers', 'Sunscreen', 'Face Masks'],
    },
    {
      name: 'Haircare',
      path: '/category/haircare',
      subcategories: ['Shampoo', 'Conditioner', 'Hair Oil', 'Styling', 'Treatments'],
    },
    {
      name: 'Men Care',
      path: '/category/men-care',
      subcategories: ['Beard Care', 'Face Wash', 'Moisturizer', 'Grooming Kits'],
    },
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
            <li key={link.name} className="navbar__link-wrapper">
              <Link
                to={link.path}
                className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''
                  }`}
              >
                {link.name}
              </Link>
              {link.subcategories && (
                <div className="navbar__cat-dropdown">
                  {link.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      to={`${link.path}?sub=${sub.toLowerCase().replace(/\s+/g, '-')}`}
                      className="navbar__cat-dropdown-item"
                    >
                      {sub}
                    </Link>
                  ))}
                  <div className="navbar__cat-dropdown-footer">
                    <Link to={link.path} className="navbar__cat-dropdown-all">
                      View All {link.name} &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Right Icons */}
        <div className="navbar__actions">
          <form
            className={`navbar__search ${searchOpen ? 'navbar__search--open' : ''}`}
            onSubmit={handleSearchSubmit}
          >
            <button
              type="button"
              className="navbar__icon-btn"
              aria-label="Search"
              onClick={() => {
                if (searchOpen && !searchQuery.trim()) {
                  setSearchOpen(false);
                  if (location.pathname === '/search') {
                    navigate('/search');
                  }
                  return;
                }

                openSearchPage();
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={openSearchPage}
              placeholder="Search products"
              className="navbar__search-input"
              aria-hidden={!searchOpen}
              tabIndex={searchOpen ? 0 : -1}
            />
          </form>

          <Link to="/wishlist" className="navbar__icon-btn" aria-label="Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="navbar__badge">{wishlistCount}</span>
            )}
          </Link>

          {canAccessCart && (
            <Link to="/cart" className="navbar__icon-btn" aria-label="Cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="navbar__badge">{cartBadgeCount}</span>
              )}
            </Link>
          )}

          {/* User Menu */}
          <div className="navbar__user-wrapper">
            <button
              type="button"
              className={`navbar__user-btn ${isAuthenticated ? 'navbar__user-btn--logged-in' : ''}`}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              {isAuthenticated ? (
                <span className="navbar__user-avatar">{userInitial}</span>
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
                {isAuthenticated ? (
                  <>
                    <div className="navbar__dropdown-header">
                      <span className="navbar__dropdown-avatar">{userInitial}</span>
                      <div>
                        <p className="navbar__dropdown-name">{user?.name || 'User'}</p>
                        <p className="navbar__dropdown-email">{user?.email}</p>
                      </div>
                    </div>
                    <hr className="navbar__dropdown-divider" />
                    <Link to="/profile" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      My Account
                    </Link>
                    <Link to="/orders" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2" /><path d="m9 12 2 2 4-4" /></svg>
                      My Orders
                    </Link>
                    {user?.role === 'product_manager' && (
                      <Link to="/admin" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Comment Moderation
                      </Link>
                    )}
                    <hr className="navbar__dropdown-divider" />
                    <button
                      className="navbar__dropdown-item navbar__dropdown-item--logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
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
