import { useEffect, useLayoutEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProductDetailsPage.css';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';
import { getProductById } from '../../services/productService';
import {
    createComment,
    getApprovedComments,
} from '../../services/commentService';

const CATEGORY_LABELS = {
    makeup: 'Makeup',
    skincare: 'Skincare',
    haircare: 'Haircare',
    'men-care': 'Men Care',
};

const mapApiProductToDetails = (apiProduct) => {
    const stock = Number(apiProduct.quantity_in_stock ?? 0);

    return {
        ...apiProduct,
        category: CATEGORY_LABELS[apiProduct.category] || apiProduct.category || 'Products',
        categorySlug: apiProduct.category || 'products',
        price: Number(apiProduct.price ?? 0),
        originalPrice:
            apiProduct.original_price === null || apiProduct.original_price === undefined
                ? null
                : Number(apiProduct.original_price),
        rating: Number(apiProduct.rating ?? 0),
        reviewCount: Number(apiProduct.reviewCount ?? apiProduct.review_count ?? 0),
        stock,
        images: [apiProduct.image],
        details: {
            'Serial Number': apiProduct.serial_number || 'N/A',
            Model: apiProduct.model || 'N/A',
            'Quantity in Stock': stock,
            Warranty: apiProduct.warranty_status ? 'Active' : 'Not active',
            Distributor: apiProduct.distributor_info || 'N/A',
        },
    };
};

function StarRating({ rating, size = 16 }) {
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i += 1) {
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
}

function ClickableStars({ reviewRating, onRatingChange }) {
    return [1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" className="pdp-review-form__star-btn" onClick={() => onRatingChange(star)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={star <= reviewRating ? 'var(--color-star)' : 'none'} stroke={star <= reviewRating ? 'var(--color-star)' : 'var(--color-gray-300)'} strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        </button>
    ));
}

function ProductBreadcrumb({ product }) {
    return (
        <div className="pdp-breadcrumb">
            <div className="container pdp-breadcrumb__inner">
                <Link to="/">Home</Link>
                <span className="pdp-breadcrumb__sep">&rsaquo;</span>
                <Link to={`/category/${product.categorySlug}`}>{product.category}</Link>
                <span className="pdp-breadcrumb__sep">&rsaquo;</span>
                <span className="pdp-breadcrumb__current">{product.name}</span>
            </div>
        </div>
    );
}

function ProductGallery({ product, selectedImage, onSelectImage }) {
    return (
        <div className="pdp-gallery">
            <div className="pdp-gallery__main">
                {product.badge && <span className={`pdp-gallery__badge pdp-gallery__badge--${product.badge.toLowerCase()}`}>{product.badge}</span>}
                {product.discount && <span className="pdp-gallery__discount">-{product.discount}%</span>}
                <img src={product.images[selectedImage]} alt={product.name} className="pdp-gallery__image" />
            </div>
            <div className="pdp-gallery__thumbs">
                {product.images.map((img, index) => (
                    <button key={index} className={`pdp-gallery__thumb ${selectedImage === index ? 'pdp-gallery__thumb--active' : ''}`} onClick={() => onSelectImage(index)}>
                        <img src={img} alt={`${product.name} view ${index + 1}`} />
                    </button>
                ))}
            </div>
        </div>
    );
}

function ProductInfo({ product, writtenReviewCount, quantity, isOutOfStock, isLowStock, isWishlisted, isCartDisabled, onDecreaseQuantity, onIncreaseQuantity, onAddToCart, onToggleWishlist }) {
    const isPurchaseDisabled = isOutOfStock || isCartDisabled;

    return (
        <div className="pdp-info">
            <Link to={`/category/${product.categorySlug}`} className="pdp-info__brand">{product.brand}</Link>
            <h1 className="pdp-info__name">{product.name}</h1>
            <div className="pdp-info__rating">
                <div className="pdp-info__stars"><StarRating rating={product.rating} /></div>
                <span className="pdp-info__review-count">({product.reviewCount} {writtenReviewCount > 0 ? 'reviews' : 'ratings'})</span>
            </div>
            <div className="pdp-info__price-block">
                <span className="pdp-info__price">${product.price.toFixed(2)}</span>
                {product.originalPrice && <span className="pdp-info__original-price">${product.originalPrice.toFixed(2)}</span>}
                {product.discount && <span className="pdp-info__save-tag">Save {product.discount}%</span>}
            </div>
            <p className="pdp-info__description">{product.description}</p>
            <div className="pdp-info__stock">
                {isOutOfStock ? (
                    <span className="pdp-info__stock-badge pdp-info__stock-badge--out">Out of Stock</span>
                ) : isLowStock ? (
                    <span className="pdp-info__stock-badge pdp-info__stock-badge--low">Only {product.stock} left in stock</span>
                ) : (
                    <span className="pdp-info__stock-badge pdp-info__stock-badge--in">In Stock ({product.stock} available)</span>
                )}
            </div>
            {isCartDisabled && (
                <p className="pdp-info__admin-note">Cart actions are unavailable for product manager accounts.</p>
            )}
            <div className="pdp-info__actions">
                <div className="pdp-info__quantity">
                    <button className="pdp-info__qty-btn" onClick={onDecreaseQuantity} disabled={isPurchaseDisabled}>−</button>
                    <span className="pdp-info__qty-value">{quantity}</span>
                    <button className="pdp-info__qty-btn" onClick={onIncreaseQuantity} disabled={isPurchaseDisabled}>+</button>
                </div>
                <button className={`pdp-info__add-btn ${isPurchaseDisabled ? 'pdp-info__add-btn--disabled' : ''}`} onClick={onAddToCart} disabled={isPurchaseDisabled}>
                    {isOutOfStock ? 'Out of Stock' : isCartDisabled ? 'Unavailable for Admin' : 'Add to Cart'} {!isPurchaseDisabled && <span>&rarr;</span>}
                </button>
                <button className={`pdp-info__wishlist-btn ${isWishlisted ? 'pdp-info__wishlist-btn--active' : ''}`} onClick={onToggleWishlist} aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? 'var(--color-primary)' : 'none'} stroke={isWishlisted ? 'var(--color-primary)' : 'currentColor'} strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
            </div>
            <div className="pdp-info__trust">
                <div className="pdp-info__trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>Free shipping over $50</div>
                <div className="pdp-info__trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>30-day easy returns</div>
                <div className="pdp-info__trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>100% authentic</div>
            </div>
        </div>
    );
}

function CartToast({ cartToast }) {
    if (!cartToast) return null;
    return (
        <div className="pdp-cart-toast" role="status" aria-live="polite">
            <div>
                <p className="pdp-cart-toast__label">Added to bag</p>
                <p className="pdp-cart-toast__name">{cartToast.productName}</p>
                <p className="pdp-cart-toast__meta">Qty {cartToast.quantity} · ${cartToast.totalPrice.toFixed(2)}</p>
            </div>
            <Link to="/cart" className="pdp-cart-toast__btn">View Bag</Link>
        </div>
    );
}

function ProductTabs(props) {
    const { product, approvedReviews, writtenReviewCount, averageReviewRating, activeTab, showReviewForm, reviewRating, reviewText, reviewSubmitted, isLoadingReviews, reviewError, onActiveTabChange, onShowReviewFormChange, onReviewRatingChange, onReviewTextChange, onSubmitReview, onReviewButtonClick } = props;
    return (
        <section className="pdp-tabs-section">
            <div className="container">
                <div className="pdp-tabs">
                    <button className={`pdp-tabs__btn ${activeTab === 'description' ? 'pdp-tabs__btn--active' : ''}`} onClick={() => onActiveTabChange('description')}>Description</button>
                    <button className={`pdp-tabs__btn ${activeTab === 'details' ? 'pdp-tabs__btn--active' : ''}`} onClick={() => onActiveTabChange('details')}>Product Details</button>
                    <button className={`pdp-tabs__btn ${activeTab === 'reviews' ? 'pdp-tabs__btn--active' : ''}`} onClick={() => onActiveTabChange('reviews')}>Reviews ({writtenReviewCount})</button>
                </div>
                <div className="pdp-tab-content">
                    {activeTab === 'description' && <div className="pdp-tab-description"><p>{product.description}</p></div>}
                    {activeTab === 'details' && (
                        <div className="pdp-tab-details">
                            <table className="pdp-details-table"><tbody>{Object.entries(product.details).map(([key, value]) => (
                                <tr key={key}><td className="pdp-details-table__label">{key}</td><td className="pdp-details-table__value">{value}</td></tr>
                            ))}</tbody></table>
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="pdp-tab-reviews">
                            <div className="pdp-reviews-summary">
                                <div className="pdp-reviews-summary__score">
                                    {writtenReviewCount > 0 ? (
                                        <>
                                            <span className="pdp-reviews-summary__number">{averageReviewRating}</span>
                                            <div className="pdp-reviews-summary__stars"><StarRating rating={Number(averageReviewRating)} size={20} /></div>
                                            <span className="pdp-reviews-summary__count">Based on {writtenReviewCount} written reviews</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="pdp-reviews-summary__stars"><StarRating rating={0} size={20} /></div>
                                            <span className="pdp-reviews-summary__count">Be the first to write a review.</span>
                                        </>
                                    )}
                                </div>
                                <button className="pdp-reviews-summary__write-btn" onClick={onReviewButtonClick}>Write a Review</button>
                            </div>
                            {reviewSubmitted && <div className="pdp-review-success"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>Thank you! Your review has been submitted and is pending approval.</div>}
                            {reviewError && !showReviewForm && <div className="pdp-reviews-empty"><p>{reviewError}</p></div>}
                            {showReviewForm && (
                                <div className="pdp-review-form">
                                    <h4 className="pdp-review-form__title">Write Your Review</h4>
                                    <div className="pdp-review-form__stars-row">
                                        <span>Your Rating:</span>
                                        <div className="pdp-review-form__stars"><ClickableStars reviewRating={reviewRating} onRatingChange={onReviewRatingChange} /></div>
                                    </div>
                                    <textarea className="pdp-review-form__textarea" placeholder="Share your experience with this product..." value={reviewText} onChange={(event) => onReviewTextChange(event.target.value)} rows={4} />
                                    <div className="pdp-review-form__actions">
                                        <button className="pdp-review-form__submit" onClick={onSubmitReview} disabled={reviewRating === 0 || reviewText.trim() === ''}>Submit Review</button>
                                        <button className="pdp-review-form__cancel" onClick={() => onShowReviewFormChange(false)}>Cancel</button>
                                    </div>
                                </div>
                            )}
                            <div className="pdp-reviews-list">
                                {isLoadingReviews ? (
                                    <div className="pdp-reviews-empty"><p>Loading reviews...</p></div>
                                ) : approvedReviews.length > 0 ? (
                                    approvedReviews.map((review) => (
                                        <div key={review.id} className="pdp-review-card">
                                            <div className="pdp-review-card__header">
                                                <div className="pdp-review-card__avatar">{review.author.charAt(0)}</div>
                                                <div>
                                                    <p className="pdp-review-card__author">{review.author}</p>
                                                    <p className="pdp-review-card__date">{review.date}</p>
                                                </div>
                                                <div className="pdp-review-card__stars"><StarRating rating={review.rating} size={14} /></div>
                                            </div>
                                            <p className="pdp-review-card__text">{review.text}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="pdp-reviews-empty"><p>No written reviews yet. Be the first to write a review.</p></div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [apiProduct, setApiProduct] = useState(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState(true);
    const product = apiProduct;
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [cartToast, setCartToast] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [approvedReviews, setApprovedReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [reviewError, setReviewError] = useState('');

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        let isMounted = true;

        const loadProduct = async () => {
            setIsLoadingProduct(true);
            setApiProduct(null);

            try {
                const productFromApi = await getProductById(id);

                if (isMounted && productFromApi) {
                    setApiProduct(mapApiProductToDetails(productFromApi));
                    setSelectedImage(0);
                    setQuantity(1);
                }
            } catch {
                if (isMounted) {
                    setApiProduct(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingProduct(false);
                }
            }
        };

        loadProduct();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        let isMounted = true;

        const loadApprovedComments = async () => {
            setIsLoadingReviews(true);
            setReviewError('');

            try {
                const data = await getApprovedComments(id);
                const comments = Array.isArray(data?.comments) ? data.comments : [];

                if (isMounted) {
                    setApprovedReviews(
                        comments.map((comment) => ({
                            id: comment.id,
                            author: comment.user?.name || 'Anonymous',
                            date: new Date(comment.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            }),
                            rating: Number(comment.rating || 0),
                            text: comment.comment_text || '',
                        }))
                    );
                }
            } catch {
                if (isMounted) {
                    setApprovedReviews([]);
                    setReviewError('Reviews could not be loaded right now.');
                }
            } finally {
                if (isMounted) {
                    setIsLoadingReviews(false);
                }
            }
        };

        loadApprovedComments();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (!cartToast) return undefined;

        const toastTimer = window.setTimeout(() => {
            setCartToast(null);
        }, 2500);

        return () => {
            window.clearTimeout(toastTimer);
        };
    }, [cartToast]);

    if (!product && isLoadingProduct) {
        return (
            <div className="pdp pdp-skeleton">
                <div className="pdp-breadcrumb">
                    <div className="pdp-breadcrumb__inner container">
                        <span className="pdp-skeleton__line pdp-skeleton__line--breadcrumb" />
                    </div>
                </div>

                <section className="pdp-main container">
                    <div className="pdp-gallery">
                        <div className="pdp-gallery__main pdp-skeleton__box" />
                        <div className="pdp-gallery__thumbs">
                            <span className="pdp-gallery__thumb pdp-skeleton__box" />
                            <span className="pdp-gallery__thumb pdp-skeleton__box" />
                            <span className="pdp-gallery__thumb pdp-skeleton__box" />
                        </div>
                    </div>

                    <div className="pdp-info">
                        <span className="pdp-skeleton__line pdp-skeleton__line--brand" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--title" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--rating" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--price" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--text" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--text-short" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--button" />
                    </div>
                </section>

                <section className="pdp-tabs-section">
                    <div className="container">
                        <div className="pdp-tabs">
                            <span className="pdp-skeleton__line pdp-skeleton__line--tab" />
                            <span className="pdp-skeleton__line pdp-skeleton__line--tab" />
                        </div>
                    </div>
                </section>
            </div>
        );
    }

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
    const isWishlisted = isInWishlist(product.id);
    const isCartDisabled = user?.role === 'product_manager';
    const writtenReviewCount = approvedReviews.length;
    const averageReviewRating =
        writtenReviewCount > 0
            ? (
                approvedReviews.reduce((total, review) => total + review.rating, 0) /
                writtenReviewCount
            ).toFixed(1)
            : null;

    const handleAddToCart = async () => {
        if (isOutOfStock || isCartDisabled) return;

        const selectedProduct = {
            ...product,
            image: product.images[selectedImage],
        };

        await addToCart(selectedProduct, quantity);

        setCartToast({
            productName: product.name,
            quantity,
            totalPrice: product.price * quantity,
        });
    };

    const handleToggleWishlist = () => {
        toggleWishlist({
            ...product,
            image: product.images[selectedImage],
        });
    };

    const decreaseQuantity = () => {
        setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1));
    };

    const increaseQuantity = () => {
        setQuantity((currentQuantity) => Math.min(product.stock, currentQuantity + 1));
    };

    const handleSubmitReview = async (event) => {
        event.preventDefault();
        if (reviewRating === 0 || reviewText.trim() === '') return;

        try {
            await createComment(id, {
                rating: reviewRating,
                comment_text: reviewText.trim(),
            });
            setReviewSubmitted(true);
            setReviewError('');
            setShowReviewForm(false);
            setReviewRating(0);
            setReviewText('');
        } catch (error) {
            setReviewSubmitted(false);
            setReviewError(
                error?.response?.data?.message || 'Unable to submit your review right now.'
            );
        }
    };

    const handleReviewButtonClick = () => {
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }

        setShowReviewForm(!showReviewForm);
    };

    return (
        <div className="pdp">
            <ProductBreadcrumb product={product} />

            <section className="pdp-main container">
                <ProductGallery
                    product={product}
                    selectedImage={selectedImage}
                    onSelectImage={setSelectedImage}
                />

                <ProductInfo
                    product={product}
                    writtenReviewCount={writtenReviewCount}
                    quantity={quantity}
                    isOutOfStock={isOutOfStock}
                    isLowStock={isLowStock}
                    isWishlisted={isWishlisted}
                    isCartDisabled={isCartDisabled}
                    onDecreaseQuantity={decreaseQuantity}
                    onIncreaseQuantity={increaseQuantity}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                />
            </section>

            <CartToast cartToast={cartToast} />

            <ProductTabs
                product={product}
                approvedReviews={approvedReviews}
                writtenReviewCount={writtenReviewCount}
                averageReviewRating={averageReviewRating}
                activeTab={activeTab}
                showReviewForm={showReviewForm}
                reviewRating={reviewRating}
                reviewText={reviewText}
                reviewSubmitted={reviewSubmitted}
                isLoadingReviews={isLoadingReviews}
                reviewError={reviewError}
                onActiveTabChange={setActiveTab}
                onShowReviewFormChange={setShowReviewForm}
                onReviewRatingChange={setReviewRating}
                onReviewTextChange={setReviewText}
                onSubmitReview={handleSubmitReview}
                onReviewButtonClick={handleReviewButtonClick}
            />
        </div>
    );
};

export default ProductDetailsPage;
