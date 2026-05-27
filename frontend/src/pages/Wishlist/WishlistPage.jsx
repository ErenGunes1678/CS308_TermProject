import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../hooks/useWishlist';
import './WishlistPage.css';

function WishlistPage() {
  const { user, isLoading } = useAuth();
  const {
    wishlistItems,
    discountNotifications,
    toggleWishlist,
    clearDiscountNotifications,
  } = useWishlist();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'customer') return <Navigate to="/unauthorized" replace />;

  return (
    <div className="wishlist-page">
      <section className="wishlist-hero">
        <div className="wishlist-hero__overlay" />
        <div className="container wishlist-hero__content">
          <span className="section-label">My Account</span>
          <h1>Wishlist</h1>
          <p>Keep favorite products close and see discount updates when they happen.</p>
        </div>
      </section>

      <section className="container wishlist-content">
        {discountNotifications.length > 0 && (
          <div className="wishlist-notices">
            <div>
              <h2>Discount notifications</h2>
              <p>{discountNotifications.length} wishlist product discount update{discountNotifications.length === 1 ? '' : 's'}.</p>
            </div>
            <button type="button" onClick={clearDiscountNotifications}>Mark all read</button>
            {discountNotifications.map((notice) => (
              <article key={notice.id} className="wishlist-notice">
                <strong>{notice.productName}</strong>
                <span>{notice.discountRate}% off: ${Number(notice.oldPrice || 0).toFixed(2)} to ${Number(notice.newPrice || 0).toFixed(2)}</span>
              </article>
            ))}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <h2>Your wishlist is empty</h2>
            <p>Add products from product detail pages and they will appear here.</p>
            <Link to="/products">Browse products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <article key={item.id} className="wishlist-card">
                <Link to={`/product/${item.id}`} className="wishlist-card__image">
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="wishlist-card__body">
                  <span>{item.brand}</span>
                  <Link to={`/product/${item.id}`}>{item.name}</Link>
                  <strong>${Number(item.price || 0).toFixed(2)}</strong>
                  <button type="button" onClick={() => toggleWishlist(item)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default WishlistPage;
