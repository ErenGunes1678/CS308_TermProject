import { Link } from 'react-router-dom';
import StarRating from './StarRating';

function ProductInfo({
  product,
  writtenReviewCount,
  quantity,
  isOutOfStock,
  isLowStock,
  isWishlisted,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onAddToCart,
  onToggleWishlist,
}) {
  return (
    <div className="pdp-info">
      <Link to={`/category/${product.categorySlug}`} className="pdp-info__brand">
        {product.brand}
      </Link>
      <h1 className="pdp-info__name">{product.name}</h1>

      <div className="pdp-info__rating">
        <div className="pdp-info__stars"><StarRating rating={product.rating} /></div>
        <span className="pdp-info__review-count">
          ({product.reviewCount} {writtenReviewCount > 0 ? 'reviews' : 'ratings'})
        </span>
      </div>

      <div className="pdp-info__price-block">
        <span className="pdp-info__price">${product.price.toFixed(2)}</span>
        {product.originalPrice && (
          <span className="pdp-info__original-price">${product.originalPrice.toFixed(2)}</span>
        )}
        {product.discount && (
          <span className="pdp-info__save-tag">Save {product.discount}%</span>
        )}
      </div>

      <p className="pdp-info__description">{product.description}</p>

      <div className="pdp-info__stock">
        {isOutOfStock ? (
          <span className="pdp-info__stock-badge pdp-info__stock-badge--out">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="pdp-info__stock-badge pdp-info__stock-badge--low">
            Only {product.stock} left in stock
          </span>
        ) : (
          <span className="pdp-info__stock-badge pdp-info__stock-badge--in">
            In Stock ({product.stock} available)
          </span>
        )}
      </div>

      <div className="pdp-info__actions">
        <div className="pdp-info__quantity">
          <button
            className="pdp-info__qty-btn"
            onClick={onDecreaseQuantity}
            disabled={isOutOfStock}
          >
            −
          </button>
          <span className="pdp-info__qty-value">{quantity}</span>
          <button
            className="pdp-info__qty-btn"
            onClick={onIncreaseQuantity}
            disabled={isOutOfStock}
          >
            +
          </button>
        </div>

        <button
          className={`pdp-info__add-btn ${isOutOfStock ? 'pdp-info__add-btn--disabled' : ''}`}
          onClick={onAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'} {!isOutOfStock && <span>&rarr;</span>}
        </button>

        <button
          className={`pdp-info__wishlist-btn ${isWishlisted ? 'pdp-info__wishlist-btn--active' : ''}`}
          onClick={onToggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill={isWishlisted ? 'var(--color-primary)' : 'none'}
            stroke={isWishlisted ? 'var(--color-primary)' : 'currentColor'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="pdp-info__trust">
        <div className="pdp-info__trust-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
          Free shipping over $50
        </div>
        <div className="pdp-info__trust-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
          30-day easy returns
        </div>
        <div className="pdp-info__trust-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          100% authentic
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;
