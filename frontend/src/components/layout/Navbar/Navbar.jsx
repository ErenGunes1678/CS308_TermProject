import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart';
import { useWishlist } from '../../../hooks/useWishlist';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const ROLE_LABELS = {
  customer: 'Customer',
  product_manager: 'Product Manager',
  sales_manager: 'Sales Manager',
};

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount, discountNotifications } = useWishlist();

  const cartBadgeCount = itemCount > 99 ? '99+' : itemCount;
  const discountBadgeCount = discountNotifications.length > 99 ? '99+' : discountNotifications.length;
  const isCustomer = !user || user.role === 'customer';
  const isManager = user?.role === 'product_manager' || user?.role === 'sales_manager';
  const canAccessCart = isCustomer;
  const canAccessWishlist = isCustomer;
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

  const categoryNavLinks = [
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

  const managerNavLinks = (() => {
    if (user?.role === 'sales_manager') {
      return [
        { name: 'Revenue', path: '/admin/sales-manager/revenue' },
        { name: 'Invoices', path: '/admin/sales-manager/invoices' },
        { name: 'Pricing & Discounts', path: '/admin/sales-manager/pricing' },
        { name: 'Refund Requests', path: '/admin/sales-manager/refunds' },
      ];
    }

    if (user?.role === 'product_manager') {
      return [
        { name: 'Deliveries', path: '/admin/product-manager/deliveries' },
        { name: 'Comment Queue', path: '/admin/product-manager/comments' },
        { name: 'Inventory', path: '/admin/product-manager/inventory' },
      ];
    }

    return [];
  })();
  const navLinks = isManager ? managerNavLinks : categoryNavLinks;

  const isNavLinkActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

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
                className={`navbar__link ${isManager ? 'navbar__link--task' : ''} ${isNavLinkActive(link.path) ? 'navbar__link--active' : ''
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

          {isCustomer && isAuthenticated && (
            <NotificationBell userId={user?.id} />
          )}

          {canAccessWishlist && (
            <Link to="/wishlist" className="navbar__icon-btn" aria-label="Wishlist">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="navbar__badge">{wishlistCount}</span>
              )}
              {discountNotifications.length > 0 && (
                <span className="navbar__badge navbar__badge--notice">{discountBadgeCount}</span>
              )}
            </Link>
          )}

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
              className={`navbar__user-btn ${isAuthenticated ? 'navbar__user-btn--logged-in' : ''} ${isManager ? 'navbar__user-btn--static' : ''}`}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="Account menu"
              aria-haspopup
              aria-expanded={userMenuOpen}
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
                    {!isManager && (
                      <div className="navbar__dropdown-header">
                        <span className="navbar__dropdown-avatar">{userInitial}</span>
                        <div>
                          <p className="navbar__dropdown-name">{user?.name || 'User'}</p>
                          <p className="navbar__dropdown-email">{user?.email}</p>
                          <p className="navbar__dropdown-role">{ROLE_LABELS[user?.role] || 'Customer'}</p>
                        </div>
                      </div>
                    )}
                    {!isManager && <hr className="navbar__dropdown-divider" />}
                    {user?.role === 'customer' && (
                      <Link to="/customer" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        My Account
                      </Link>
                    )}
                    {user?.role === 'customer' && (
                      <Link to="/customer/orders" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2" /><path d="m9 12 2 2 4-4" /></svg>
                        My Orders
                      </Link>
                    )}
                    {user?.role === 'customer' && (
                      <Link to="/customer/notifications" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        Notifications
                      </Link>
                    )}
                    {user?.role === 'customer' && (
                      <Link to="/wishlist" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78a5.5 5.5 0 0 0 1.06-8.84z" /></svg>
                        Wishlist
                        {discountNotifications.length > 0 && (
                          <span className="navbar__item-badge">{discountBadgeCount}</span>
                        )}
                      </Link>
                    )}
                    {!isManager && <hr className="navbar__dropdown-divider" />}
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
