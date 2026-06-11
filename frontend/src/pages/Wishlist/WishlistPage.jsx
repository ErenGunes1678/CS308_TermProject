import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { getProducts } from '../../services/productService';
import './WishlistPage.css';

const BagIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const formatPrice = (value) => {
  const price = Number(value || 0);
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
};

function WishlistPage() {
  const { user, isLoading } = useAuth();
  const { addToCart } = useCart();
  const {
    wishlistItems,
    discountNotifications,
    toggleWishlist,
    clearDiscountNotifications,
  } = useWishlist();
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [activeProductId, setActiveProductId] = useState(null);
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    if (isLoading || !isCustomer) {
      return undefined;
    }

    let isMounted = true;

    const loadRecommendations = async () => {
      try {
        const products = await getProducts();
        if (!isMounted) return;
        setRecommendedProducts(Array.isArray(products) ? products : []);
      } catch {
        if (isMounted) setRecommendedProducts([]);
      }
    };

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [isCustomer, isLoading]);

  const recommended = useMemo(() => {
    const savedIds = new Set(wishlistItems.map((item) => Number(item.id)));

    return recommendedProducts
      .filter((product) => !savedIds.has(Number(product.id)))
      .slice(0, 4);
  }, [recommendedProducts, wishlistItems]);

  const handleAddToBag = async (product) => {
    try {
      setActiveProductId(product.id);
      await addToCart(product, 1);
    } finally {
      setActiveProductId(null);
    }
  };

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isCustomer) return <Navigate to="/unauthorized" replace />;

  const handleAddAllToBag = async () => {
    try {
      setActiveProductId('all');
      for (const item of wishlistItems) {
        await addToCart(item, 1);
      }
    } finally {
      setActiveProductId(null);
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="empty-wishlist-wrapper">
        <div className="empty-wishlist-card">
          <div className="empty-wishlist-icon-box">
            <span className="empty-wishlist-icon">♡</span>
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Looks like you haven&apos;t saved anything yet.</p>
          <Link className="start-shopping-btn" to="/products">
            Start Shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-breadcrumb">
        Products <span>›</span> Wishlist
      </div>

      <div className="wishlist-heading">
        <div>
          <h1 className="wishlist-title">My Wishlist</h1>
          <p className="wishlist-count">{wishlistItems.length} saved item{wishlistItems.length === 1 ? '' : 's'}</p>
        </div>
        <button
          type="button"
          className="wishlist-add-all"
          onClick={handleAddAllToBag}
          disabled={activeProductId === 'all'}
        >
          <BagIcon />
          {activeProductId === 'all' ? 'Adding...' : 'Add All to Bag'}
        </button>
      </div>

      <section className="wishlist-saved">
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

        <div className="wishlist-grid">
          {wishlistItems.map((item) => (
            <article key={item.id} className="wishlist-card">
              <Link to={`/product/${item.id}`} className="wishlist-card__image">
                <img src={item.image} alt={item.name} />
              </Link>

              <div className="wishlist-card__info">
                <p className="wishlist-card__brand">{item.brand}</p>
                <Link to={`/product/${item.id}`} className="wishlist-card__name">
                  {item.name}
                </Link>
                <strong className="wishlist-card__price">{formatPrice(item.price)}</strong>
                <div className="wishlist-card__actions">
                  <button
                    type="button"
                    className="wishlist-card__bag"
                    onClick={() => handleAddToBag(item)}
                    disabled={activeProductId === item.id || activeProductId === 'all'}
                  >
                    <BagIcon size={14} />
                    {activeProductId === item.id ? 'Adding...' : 'Add to Bag'}
                  </button>
                  <button type="button" className="wishlist-card__remove" onClick={() => toggleWishlist(item)} aria-label={`Remove ${item.name}`}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {recommended.length > 0 ? (
        <section className="wishlist-recommendations">
          <p className="wishlist-section-label">You Might Like</p>
          <h2>Recommended For You</h2>
          <div className="wishlist-recommendation-grid">
            {recommended.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="wishlist-recommendation-card">
                <div className="wishlist-recommendation-card__image">
                  <img src={product.image} alt={product.name} />
                  <div className="wishlist-recommendation-card__badges">
                    {product.badge ? <span>{product.badge}</span> : null}
                    {product.discount ? <span>-{product.discount}%</span> : null}
                  </div>
                </div>
                <div className="wishlist-recommendation-card__body">
                  <p>{product.brand}</p>
                  <h3>{product.name}</h3>
                  <strong>{formatPrice(product.price)}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default WishlistPage;
