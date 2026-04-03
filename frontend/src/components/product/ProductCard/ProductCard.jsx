import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(product.wishlisted || false);

    const {
        id,
        name,
        brand,
        price,
        originalPrice,
        rating,
        reviewCount,
        image,
        badge,
        discount,
        outOfStock,
        lowStock,
    } = product;

    const renderStars = (rating) => {
        const stars = [];
        const full = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < full) {
                stars.push(
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            } else if (i === full && hasHalf) {
                stars.push(
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1" opacity="0.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            } else {
                stars.push(
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            }
        }
        return stars;
    };

    const badgeColors = {
        BEST: '#10B981',
        NEW: '#3B82F6',
        LIMITED: '#8B5CF6',
        SALE: '#EF4444',
    };

    return (
        <div className={`product-card ${outOfStock ? 'product-card--out-of-stock' : ''}`}>
            <Link to={`/product/${id}`} className="product-card__image-wrapper">
                <img src={image} alt={name} className="product-card__image" />

                {/* Badges */}
                <div className="product-card__badges">
                    {badge && (
                        <span
                            className="product-card__badge"
                            style={{ background: badgeColors[badge] || '#6B7280' }}
                        >
                            {badge}
                        </span>
                    )}
                    {discount && (
                        <span className="product-card__badge product-card__badge--discount">
                            -{discount}%
                        </span>
                    )}
                    {outOfStock && (
                        <span className="product-card__badge product-card__badge--oos">
                            OUT OF STOCK
                        </span>
                    )}
                </div>

                {/* Wishlist button */}
                <button
                    className={`product-card__wishlist ${isWishlisted ? 'product-card__wishlist--active' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        setIsWishlisted(!isWishlisted);
                    }}
                    aria-label="Add to wishlist"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'var(--color-primary)' : 'none'} stroke={isWishlisted ? 'var(--color-primary)' : 'currentColor'} strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>

                {outOfStock && <div className="product-card__oos-overlay" />}
            </Link>

            <div className="product-card__info">
                <span className="product-card__brand">{brand}</span>
                <Link to={`/product/${id}`} className="product-card__name">{name}</Link>
                <div className="product-card__rating">
                    <div className="product-card__stars">{renderStars(rating)}</div>
                    <span className="product-card__review-count">({reviewCount})</span>
                </div>
                <div className="product-card__price-row">
                    <span className="product-card__price">${price}</span>
                    {originalPrice && (
                        <span className="product-card__original-price">${originalPrice}</span>
                    )}
                    {lowStock && (
                        <span className="product-card__low-stock">Only {lowStock} left</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;