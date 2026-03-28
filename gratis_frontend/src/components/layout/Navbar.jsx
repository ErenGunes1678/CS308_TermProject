import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import './Navbar.css';

const CATEGORIES = {
    Makeup: ['Foundation', 'Eyeshadow', 'Lipstick', 'Mascara', 'Blush', 'Primer'],
    Skincare: ['Moisturizer', 'Serum', 'Cleanser', 'Sunscreen', 'Toner', 'Mask'],
    Haircare: ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Mask', 'Styling', 'Treatment'],
    'Man Care': ['Beard Oil', 'Face Wash', 'Moisturizer', 'Shaving', 'Cologne', 'Body Wash'],
};

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setProfileOpen(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">✦</span>
                    <span className="logo-text">Gratis</span>
                </Link>

                {/* Category Nav */}
                <ul className="navbar-categories">
                    {Object.entries(CATEGORIES).map(([category, subcategories]) => (
                        <li key={category} className="category-item">
                            <Link
                                to={`/products?category=${category.toLowerCase()}`}
                                className="category-link"
                            >
                                {category}
                            </Link>
                            <div className="category-dropdown">
                                <div className="dropdown-inner">
                                    {subcategories.map((sub) => (
                                        <Link
                                            key={sub}
                                            to={`/products?category=${category.toLowerCase()}&sub=${sub.toLowerCase()}`}
                                            className="dropdown-item"
                                        >
                                            {sub}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Right Actions */}
                <div className="navbar-actions">
                    {isAuthenticated ? (
                        <>
                            <Link to="/account/wishlist" className="action-btn" title="Favorites">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </Link>

                            <Link to="/cart" className="action-btn" title="Cart">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                {cartCount > 0 && <span className="action-badge">{cartCount}</span>}
                            </Link>

                            <div
                                className="profile-wrapper"
                                onMouseEnter={() => setProfileOpen(true)}
                                onMouseLeave={() => setProfileOpen(false)}
                            >
                                <button className="action-btn" title="Profile">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </button>
                                {profileOpen && (
                                    <div className="profile-dropdown">
                                        <Link to="/account/orders" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                                            Orders
                                        </Link>
                                        <Link to="/account/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                                            Settings
                                        </Link>
                                        <button className="dropdown-item dropdown-item--danger" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/account/wishlist" className="action-btn" title="Favorites">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </Link>
                            <Link to="/cart" className="action-btn" title="Cart">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                {cartCount > 0 && <span className="action-badge">{cartCount}</span>}
                            </Link>
                            <Link to="/login" className="btn btn-ghost">Sign In</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
