import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductDetailsPage.css';

// TODO: Replace with API call using the id param
const PLACEHOLDER = 'https://placehold.co/600x600/f5f5f5/999?text=Product';

const ALL_PRODUCTS = [
    {
        id: 1,
        name: 'Velvet Matte Lipstick',
        brand: 'LumaBelle',
        category: 'Makeup',
        categorySlug: 'makeup',
        price: 28,
        originalPrice: 35,
        discount: 20,
        rating: 4,
        reviewCount: 312,
        stock: 24,
        badge: 'BEST',
        images: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
        description:
            'A luxuriously smooth matte lipstick that delivers intense, long-lasting color in a single swipe. Enriched with vitamin E and jojoba oil to keep your lips hydrated all day without feathering or fading.',
        details: {
            'Serial Number': 'LB-VML-001',
            Model: 'Velvet Matte Pro',
            Weight: '3.5g / 0.12 oz',
            Warranty: '12 months',
            Distributor: 'LumaBelle International',
        },
        reviews: [
            {
                id: 1,
                author: 'Sophie L.',
                rating: 5,
                date: 'Mar 15, 2026',
                text: 'Absolutely love this lipstick! The color payoff is incredible and it lasts all day without drying out my lips.',
                approved: true,
            },
            {
                id: 2,
                author: 'Emma K.',
                rating: 4,
                date: 'Mar 10, 2026',
                text: 'Beautiful shade and smooth application. Would love more color options in this formula.',
                approved: true,
            },
            {
                id: 3,
                author: 'Mia T.',
                rating: 5,
                date: 'Feb 28, 2026',
                text: 'Best matte lipstick I have ever tried. The texture is so comfortable and the packaging is gorgeous.',
                approved: true,
            },
        ],
    },
    {
        id: 2,
        name: 'Radiance Boost Serum',
        brand: 'GlowLab',
        category: 'Skincare',
        categorySlug: 'skincare',
        price: 54,
        originalPrice: 68,
        discount: 21,
        rating: 4.5,
        reviewCount: 487,
        stock: 15,
        badge: 'NEW',
        images: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
        description:
            'A powerful brightening serum formulated with vitamin C, niacinamide, and hyaluronic acid. Targets dullness, dark spots, and uneven skin tone for a radiant, dewy complexion.',
        details: {
            'Serial Number': 'GL-RBS-002',
            Model: 'Radiance Pro',
            Weight: '30ml / 1 fl oz',
            Warranty: '6 months',
            Distributor: 'GlowLab Cosmetics',
        },
        reviews: [
            {
                id: 1,
                author: 'Anna R.',
                rating: 5,
                date: 'Mar 18, 2026',
                text: 'My skin has never looked better! This serum gave me visible results within two weeks.',
                approved: true,
            },
        ],
    },
    {
        id: 3,
        name: 'Pro Glow Eyeshadow Palette',
        brand: 'LumaBelle',
        category: 'Makeup',
        categorySlug: 'makeup',
        price: 62,
        originalPrice: null,
        discount: null,
        rating: 4.5,
        reviewCount: 541,
        stock: 18,
        badge: 'BEST',
        images: [PLACEHOLDER, PLACEHOLDER],
        description:
            'A versatile 12-shade eyeshadow palette featuring a curated mix of mattes, shimmers, and metallic finishes. Highly pigmented and blendable for endless eye looks.',
        details: {
            'Serial Number': 'LB-PGP-003',
            Model: 'Pro Glow 12',
            Weight: '18g / 0.63 oz',
            Warranty: '12 months',
            Distributor: 'LumaBelle International',
        },
        reviews: [],
    },
    {
        id: 6,
        name: 'Luxury Perfume Collection',
        brand: 'Aurore',
        category: 'Makeup',
        categorySlug: 'makeup',
        price: 89,
        originalPrice: null,
        discount: null,
        rating: 4.5,
        reviewCount: 234,
        stock: 9,
        badge: 'LIMITED',
        images: [PLACEHOLDER, PLACEHOLDER],
        description:
            'An exquisite set of three signature fragrances, each capturing a different mood — from fresh florals to deep oriental notes. Presented in a luxury gift box.',
        details: {
            'Serial Number': 'AU-LPC-006',
            Model: 'Signature Trio',
            Weight: '3 × 30ml',
            Warranty: '24 months',
            Distributor: 'Aurore Paris',
        },
        reviews: [],
    },
    {
        id: 7,
        name: 'Complete Skincare Bundle',
        brand: 'GlowLab',
        category: 'Skincare',
        categorySlug: 'skincare',
        price: 118,
        originalPrice: 160,
        discount: 26,
        rating: 4,
        reviewCount: 89,
        stock: 0,
        badge: 'SALE',
        images: [PLACEHOLDER, PLACEHOLDER],
        description:
            'Everything you need for a complete skincare routine. Includes cleanser, toner, serum, moisturizer, and SPF — all formulated to work together for maximum results.',
        details: {
            'Serial Number': 'GL-CSB-007',
            Model: 'Complete Set',
            Weight: '5-piece set',
            Warranty: '6 months',
            Distributor: 'GlowLab Cosmetics',
        },
        reviews: [],
    },
];

const ProductDetailsPage = () => {
    const { id } = useParams();
    const product = ALL_PRODUCTS.find((p) => p.id === Number(id));

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Review form
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    if (!product) {
        return (
            <div className="pdp-not-found">
                <h2>Product not found</h2>
                <p>The product you're looking for doesn't exist.</p>
                <Link to="/products" className="pdp-not-found__btn">
                    Browse Products &rarr;
                </Link>
            </div>
        );
    }

    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 10;

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        // TODO: Hook into CartContext
        alert(`Added ${quantity}x "${product.name}" to cart`);
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (reviewRating === 0 || reviewText.trim() === '') return;
        // TODO: Send to API — comment needs approval by product manager
        setReviewSubmitted(true);
        setShowReviewForm(false);
        setReviewRating(0);
        setReviewText('');
    };

    const renderStars = (rating, size = 16) => {
        const stars = [];
        const full = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        for (let i = 0; i < 5; i++) {
            if (i < full) {
                stars.push(
                    <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            } else if (i === full && hasHalf) {
                stars.push(
                    <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1" opacity="0.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            } else {
                stars.push(
                    <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            }
        }
        return stars;
    };

    const renderClickableStars = () => {
        return [1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                className="pdp-review-form__star-btn"
                onClick={() => setReviewRating(star)}
            >
                <svg width="24" height="24" viewBox="0 0 24 24"
                    fill={star <= reviewRating ? 'var(--color-star)' : 'none'}
                    stroke={star <= reviewRating ? 'var(--color-star)' : 'var(--color-gray-300)'}
                    strokeWidth="1.5"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            </button>
        ));
    };

    return (
        <div className="pdp">
            {/* Breadcrumb */}
            <div className="pdp-breadcrumb">
                <div className="container pdp-breadcrumb__inner">
                    <Link to="/">Home</Link>
                    <span className="pdp-breadcrumb__sep">&rsaquo;</span>
                    <Link to={`/category/${product.categorySlug}`}>{product.category}</Link>
                    <span className="pdp-breadcrumb__sep">&rsaquo;</span>
                    <span className="pdp-breadcrumb__current">{product.name}</span>
                </div>
            </div>

            {/* Main Product Section */}
            <section className="pdp-main container">
                {/* Image Gallery */}
                <div className="pdp-gallery">
                    <div className="pdp-gallery__main">
                        {product.badge && (
                            <span className={`pdp-gallery__badge pdp-gallery__badge--${product.badge.toLowerCase()}`}>
                                {product.badge}
                            </span>
                        )}
                        {product.discount && (
                            <span className="pdp-gallery__discount">-{product.discount}%</span>
                        )}
                        <img
                            src={product.images[selectedImage]}
                            alt={product.name}
                            className="pdp-gallery__image"
                        />
                    </div>
                    <div className="pdp-gallery__thumbs">
                        {product.images.map((img, index) => (
                            <button
                                key={index}
                                className={`pdp-gallery__thumb ${selectedImage === index ? 'pdp-gallery__thumb--active' : ''}`}
                                onClick={() => setSelectedImage(index)}
                            >
                                <img src={img} alt={`${product.name} view ${index + 1}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="pdp-info">
                    <Link to={`/category/${product.categorySlug}`} className="pdp-info__brand">
                        {product.brand}
                    </Link>
                    <h1 className="pdp-info__name">{product.name}</h1>

                    {/* Rating */}
                    <div className="pdp-info__rating">
                        <div className="pdp-info__stars">{renderStars(product.rating)}</div>
                        <span className="pdp-info__review-count">({product.reviewCount} reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="pdp-info__price-block">
                        <span className="pdp-info__price">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                            <span className="pdp-info__original-price">${product.originalPrice.toFixed(2)}</span>
                        )}
                        {product.discount && (
                            <span className="pdp-info__save-tag">Save {product.discount}%</span>
                        )}
                    </div>

                    {/* Short description */}
                    <p className="pdp-info__description">{product.description}</p>

                    {/* Stock */}
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

                    {/* Quantity + Add to Cart */}
                    <div className="pdp-info__actions">
                        <div className="pdp-info__quantity">
                            <button
                                className="pdp-info__qty-btn"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={isOutOfStock}
                            >
                                −
                            </button>
                            <span className="pdp-info__qty-value">{quantity}</span>
                            <button
                                className="pdp-info__qty-btn"
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                disabled={isOutOfStock}
                            >
                                +
                            </button>
                        </div>

                        <button
                            className={`pdp-info__add-btn ${isOutOfStock ? 'pdp-info__add-btn--disabled' : ''}`}
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                        >
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'} {!isOutOfStock && <span>&rarr;</span>}
                        </button>

                        <button
                            className={`pdp-info__wishlist-btn ${isWishlisted ? 'pdp-info__wishlist-btn--active' : ''}`}
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            aria-label="Add to wishlist"
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

                    {/* Trust badges */}
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
            </section>

            {/* Tabs: Description / Details / Reviews */}
            <section className="pdp-tabs-section">
                <div className="container">
                    <div className="pdp-tabs">
                        <button
                            className={`pdp-tabs__btn ${activeTab === 'description' ? 'pdp-tabs__btn--active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`pdp-tabs__btn ${activeTab === 'details' ? 'pdp-tabs__btn--active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Product Details
                        </button>
                        <button
                            className={`pdp-tabs__btn ${activeTab === 'reviews' ? 'pdp-tabs__btn--active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({product.reviews.length})
                        </button>
                    </div>

                    <div className="pdp-tab-content">
                        {/* Description Tab */}
                        {activeTab === 'description' && (
                            <div className="pdp-tab-description">
                                <p>{product.description}</p>
                            </div>
                        )}

                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div className="pdp-tab-details">
                                <table className="pdp-details-table">
                                    <tbody>
                                        {Object.entries(product.details).map(([key, value]) => (
                                            <tr key={key}>
                                                <td className="pdp-details-table__label">{key}</td>
                                                <td className="pdp-details-table__value">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="pdp-tab-reviews">
                                {/* Review summary */}
                                <div className="pdp-reviews-summary">
                                    <div className="pdp-reviews-summary__score">
                                        <span className="pdp-reviews-summary__number">{product.rating}</span>
                                        <div className="pdp-reviews-summary__stars">{renderStars(product.rating, 20)}</div>
                                        <span className="pdp-reviews-summary__count">Based on {product.reviewCount} reviews</span>
                                    </div>
                                    <button
                                        className="pdp-reviews-summary__write-btn"
                                        onClick={() => setShowReviewForm(!showReviewForm)}
                                    >
                                        Write a Review
                                    </button>
                                </div>

                                {/* Review submission success */}
                                {reviewSubmitted && (
                                    <div className="pdp-review-success">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        Thank you! Your review has been submitted and is pending approval.
                                    </div>
                                )}

                                {/* Review form */}
                                {showReviewForm && (
                                    <div className="pdp-review-form">
                                        <h4 className="pdp-review-form__title">Write Your Review</h4>
                                        <div className="pdp-review-form__stars-row">
                                            <span>Your Rating:</span>
                                            <div className="pdp-review-form__stars">{renderClickableStars()}</div>
                                        </div>
                                        <textarea
                                            className="pdp-review-form__textarea"
                                            placeholder="Share your experience with this product..."
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            rows={4}
                                        />
                                        <div className="pdp-review-form__actions">
                                            <button
                                                className="pdp-review-form__submit"
                                                onClick={handleSubmitReview}
                                                disabled={reviewRating === 0 || reviewText.trim() === ''}
                                            >
                                                Submit Review
                                            </button>
                                            <button
                                                className="pdp-review-form__cancel"
                                                onClick={() => setShowReviewForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Review list */}
                                <div className="pdp-reviews-list">
                                    {product.reviews.filter((r) => r.approved).length > 0 ? (
                                        product.reviews
                                            .filter((r) => r.approved)
                                            .map((review) => (
                                                <div key={review.id} className="pdp-review-card">
                                                    <div className="pdp-review-card__header">
                                                        <div className="pdp-review-card__avatar">
                                                            {review.author.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="pdp-review-card__author">{review.author}</p>
                                                            <p className="pdp-review-card__date">{review.date}</p>
                                                        </div>
                                                        <div className="pdp-review-card__stars">
                                                            {renderStars(review.rating, 14)}
                                                        </div>
                                                    </div>
                                                    <p className="pdp-review-card__text">{review.text}</p>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="pdp-reviews-empty">
                                            <p>No reviews yet. Be the first to share your thoughts!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductDetailsPage;