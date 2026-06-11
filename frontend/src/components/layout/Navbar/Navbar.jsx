import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart';
import { useWishlist } from '../../../hooks/useWishlist';
import { getCategories } from '../../../services/categoryService';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const ROLE_LABELS = {
  customer: 'Customer',
  product_manager: 'Product Manager',
  sales_manager: 'Sales Manager',
};

const formatCategoryLabel = (value = '') =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getCategoryPath = (category) => `/category/${encodeURIComponent(category?.name || '')}`;

const getSubcategoryPath = (category, subcategoryName) =>
  `${getCategoryPath(category)}?sub=${encodeURIComponent(subcategoryName)}`;

const getCategoryKey = (category) => String(category?.id ?? category?.name ?? '');

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [activeCategoryKey, setActiveCategoryKey] = useState(null);
  const [backendCategories, setBackendCategories] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount, discountNotifications } = useWishlist();

  const cartBadgeCount = itemCount > 99 ? '99+' : itemCount;
  const discountBadgeCount = discountNotifications.length > 99 ? '99+' : discountNotifications.length;
  const isCustomer = !user || user.role === 'customer';
  const isHaveAccountCustomer = isCustomer && user;
  const isManager = user?.role === 'product_manager' || user?.role === 'sales_manager';
  const canAccessCart = isCustomer;
  const canAccessWishlist = isHaveAccountCustomer;
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
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const categories = await getCategories();
        if (!isMounted) return;

        setBackendCategories(Array.isArray(categories) ? categories : []);
        setActiveCategoryKey((currentKey) => currentKey ?? getCategoryKey(categories?.[0]));
      } catch {
        if (isMounted) {
          setBackendCategories([]);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!categoryMenuRef.current?.contains(event.target)) {
        setCategoryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

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

  const managerNavLinks = (() => {
    if (user?.role === 'sales_manager') {
      return [
        { name: 'Revenue', path: '/admin/sales-manager/revenue' },
        { name: 'Invoices', path: '/admin/sales-manager/invoices' },
        { name: 'Pricing', path: '/admin/sales-manager/pricing' },
        { name: 'Discounts', path: '/admin/sales-manager/discounts' },
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

  const navLinks = isManager ? managerNavLinks : [];

  const isNavLinkActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner container">
        {/* Logo */}
        <div className="navbar__logo-wrapper" ref={categoryMenuRef}>
          {isManager ? (
            <Link to="/" className="navbar__logo">
              <span className="navbar__logo-icon">L</span>
              <span className="navbar__logo-text">Lumière</span>
              <span className="navbar__logo-dot">.</span>
            </Link>
          ) : (
            <>
              <button
                type="button"
                className={`navbar__logo navbar__logo--button ${categoryMenuOpen ? 'navbar__logo--open' : ''}`}
                onClick={() => setCategoryMenuOpen((isOpen) => !isOpen)}
                aria-haspopup="menu"
                aria-expanded={categoryMenuOpen}
              >
                <span className="navbar__logo-icon">L</span>
                <span className="navbar__logo-text">Lumière</span>
                <span className="navbar__logo-dot">.</span>
                <svg className="navbar__logo-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {categoryMenuOpen && (
                <div className="navbar__category-menu" role="menu">
                  <div className="navbar__category-main">
                    <Link
                      to="/products"
                      className="navbar__category-all"
                      onClick={() => setCategoryMenuOpen(false)}
                    >
                      All Products
                    </Link>
                    {backendCategories.map((category) => (
                      <button
                        key={getCategoryKey(category)}
                        type="button"
                        className={`navbar__category-main-btn ${activeCategoryKey === getCategoryKey(category) ? 'navbar__category-main-btn--active' : ''}`}
                        onClick={() => setActiveCategoryKey(getCategoryKey(category))}
                      >
                        {formatCategoryLabel(category.name)}
                        <span className="navbar__category-main-arrow">›</span>
                      </button>
                    ))}
                  </div>

                  <div className="navbar__subcategory-panel">
                    {backendCategories
                      .filter((category) => getCategoryKey(category) === activeCategoryKey)
                      .map((category) => (
                        <div key={getCategoryKey(category)}>
                          <Link
                            to={getCategoryPath(category)}
                            className="navbar__subcategory-title"
                            onClick={() => setCategoryMenuOpen(false)}
                          >
                            View all {formatCategoryLabel(category.name)}
                          </Link>
                          <div className="navbar__subcategory-list">
                            {(category.subcategories || []).map((subcategory) => (
                              <Link
                                key={subcategory}
                                to={getSubcategoryPath(category, subcategory)}
                                className="navbar__subcategory-link"
                                onClick={() => setCategoryMenuOpen(false)}
                              >
                                {formatCategoryLabel(subcategory)}
                              </Link>
                            ))}
                            {!category.subcategories?.length && (
                              <span className="navbar__subcategory-empty">No subcategories yet</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

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
        <div className="navbar__dropdown-header">
          <span className="navbar__dropdown-avatar">{userInitial}</span>

          <div>
            <p className="navbar__dropdown-name">{user?.name || 'User'}</p>
            <p className="navbar__dropdown-email">{user?.email}</p>
            <p className="navbar__dropdown-role">
              {ROLE_LABELS[user?.role] || 'Customer'}
            </p>
          </div>
        </div>

        {isCustomer && (
          <>
            <hr className="navbar__dropdown-divider" />

            <Link
              to="/account"
              className="navbar__dropdown-item"
              onClick={() => setUserMenuOpen(false)}
            >
              My Account
            </Link>

            <Link
              to="/customer/orders"
              className="navbar__dropdown-item"
              onClick={() => setUserMenuOpen(false)}
            >
              My Orders
            </Link>

            <Link
              to="/customer/notifications"
              className="navbar__dropdown-item"
              onClick={() => setUserMenuOpen(false)}
            >
              Notifications
            </Link>

            <Link
              to="/wishlist"
              className="navbar__dropdown-item"
              onClick={() => setUserMenuOpen(false)}
            >
              Wishlist

              {discountNotifications.length > 0 && (
                <span className="navbar__item-badge">
                  {discountBadgeCount}
                </span>
              )}
            </Link>
          </>
        )}

        <hr className="navbar__dropdown-divider" />

        <button
          type="button"
          className="navbar__dropdown-item navbar__dropdown-item--logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <Link
          to="/login"
          className="navbar__dropdown-item"
          onClick={() => setUserMenuOpen(false)}
        >
          Login
        </Link>

        <Link
          to="/register"
          className="navbar__dropdown-item"
          onClick={() => setUserMenuOpen(false)}
        >
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
