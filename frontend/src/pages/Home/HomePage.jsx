//update
import { Link } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import './HomePage.css';

// Placeholder product images - replace with your actual images
const PLACEHOLDER = 'https://placehold.co/400x400/f5f5f5/999?text=Product';

const featuredProducts = [
    {
        id: 1,
        name: 'Velvet Matte Lipstick',
        brand: 'LumaBelle',
        price: 28,
        originalPrice: 35,
        rating: 4,
        reviewCount: 312,
        image: PLACEHOLDER,
        badge: 'BEST',
        discount: 20,
    },
    {
        id: 2,
        name: 'Radiance Boost Serum',
        brand: 'GlowLab',
        price: 54,
        originalPrice: 68,
        rating: 4.5,
        reviewCount: 487,
        image: PLACEHOLDER,
        badge: 'NEW',
        discount: 21,
    },
    {
        id: 3,
        name: 'Pro Glow Eyeshadow Palette',
        brand: 'LumaBelle',
        price: 62,
        originalPrice: null,
        rating: 4.5,
        reviewCount: 541,
        image: PLACEHOLDER,
        badge: 'BEST',
        discount: null,
    },
    {
        id: 4,
        name: "Men's Beard & Face Kit",
        brand: 'ForHim',
        price: 48,
        originalPrice: 60,
        rating: 4,
        reviewCount: 113,
        image: PLACEHOLDER,
        badge: 'NEW',
        discount: 20,
        wishlisted: true,
    },
];

const bestSellers = [
    {
        id: 3,
        name: 'Pro Glow Eyeshadow Palette',
        brand: 'LumaBelle',
        price: 62,
        originalPrice: null,
        rating: 4.5,
        reviewCount: 541,
        image: PLACEHOLDER,
        badge: 'BEST',
    },
    {
        id: 5,
        name: "Men's Active Cleanser",
        brand: 'ForHim',
        price: 22,
        originalPrice: 28,
        rating: 4,
        reviewCount: 96,
        image: PLACEHOLDER,
        discount: 21,
    },
    {
        id: 6,
        name: 'Luxury Perfume Collection',
        brand: 'Aurore',
        price: 89,
        originalPrice: null,
        rating: 4.5,
        reviewCount: 234,
        image: PLACEHOLDER,
        badge: 'LIMITED',
        lowStock: 9,
    },
    {
        id: 7,
        name: 'Complete Skincare Bundle',
        brand: 'GlowLab',
        price: 118,
        originalPrice: 160,
        rating: 4,
        reviewCount: 89,
        image: PLACEHOLDER,
        badge: 'SALE',
        discount: 26,
        outOfStock: true,
    },
];

const categories = [
    { name: 'Makeup', tagline: 'Express your beauty', path: '/category/makeup', image: PLACEHOLDER },
    { name: 'Skincare', tagline: 'Glow from within', path: '/category/skincare', image: PLACEHOLDER },
    { name: 'Haircare', tagline: 'Love your locks', path: '/category/haircare', image: PLACEHOLDER },
    { name: 'Men Care', tagline: 'Crafted for him', path: '/category/men-care', image: PLACEHOLDER },
];

const reviews = [
    {
        id: 1,
        text: "Absolutely obsessed with Lumière! The quality is unmatched and my skin has never looked better.",
        author: 'Sophie L.',
        role: 'Verified Customer',
        initial: 'S',
    },
    {
        id: 2,
        text: "Finally a beauty brand that delivers on its promises. Every product I've tried has been flawless.",
        author: 'Emma K.',
        role: 'Verified Customer',
        initial: 'E',
    },
    {
        id: 3,
        text: 'The skincare range transformed my routine completely. Fast shipping, beautiful packaging. 10/10!',
        author: 'Mia T.',
        role: 'Verified Customer',
        initial: 'M',
    },
];

const HomePage = () => {
    return (
        <div className="home">
            {/* ===== SECTION 1: Hero ===== */}
            <section className="hero">
                <div className="hero__overlay" />
                <div className="hero__content container">
                    <span className="hero__badge">✨ NEW SPRING COLLECTION 2026</span>
                    <h1 className="hero__title">
                        Your Beauty,
                        <br />
                        <span className="hero__title-accent">Elevated</span>
                    </h1>
                    <p className="hero__subtitle">
                        Discover premium makeup, skincare, haircare and grooming essentials curated for the modern beauty lover.
                    </p>
                    <div className="hero__buttons">
                        <Link to="/products" className="hero__btn hero__btn--primary">
                            Shop Now <span>&rarr;</span>
                        </Link>
                        <Link to="/category/skincare" className="hero__btn hero__btn--secondary">
                            Explore Skincare
                        </Link>
                    </div>
                    <div className="hero__stats">
                        <div className="hero__stat">
                            <span className="hero__stat-value">50K+</span>
                            <span className="hero__stat-label">Happy Customers</span>
                        </div>
                        <div className="hero__stat">
                            <span className="hero__stat-value">200+</span>
                            <span className="hero__stat-label">Premium Products</span>
                        </div>
                        <div className="hero__stat">
                            <span className="hero__stat-value">4.9★</span>
                            <span className="hero__stat-label">Average Rating</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SECTION 2: Trust Bar ===== */}
            <section className="trust-bar">
                <div className="container trust-bar__inner">
                    <div className="trust-bar__item">
                        <div className="trust-bar__icon trust-bar__icon--pink">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                        </div>
                        <div>
                            <h4 className="trust-bar__title">Free Shipping</h4>
                            <p className="trust-bar__text">On orders over $50</p>
                        </div>
                    </div>
                    <div className="trust-bar__item">
                        <div className="trust-bar__icon trust-bar__icon--pink">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                        </div>
                        <div>
                            <h4 className="trust-bar__title">Easy Returns</h4>
                            <p className="trust-bar__text">30-day return policy</p>
                        </div>
                    </div>
                    <div className="trust-bar__item">
                        <div className="trust-bar__icon trust-bar__icon--pink">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <div>
                            <h4 className="trust-bar__title">Authentic Products</h4>
                            <p className="trust-bar__text">100% genuine brands</p>
                        </div>
                    </div>
                    <div className="trust-bar__item">
                        <div className="trust-bar__icon trust-bar__icon--pink">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        </div>
                        <div>
                            <h4 className="trust-bar__title">Loyalty Rewards</h4>
                            <p className="trust-bar__text">Earn points every order</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SECTION 3: Shop by Category ===== */}
            <section className="categories-section">
                <div className="container">
                    <div className="categories-section__header">
                        <p className="section-label">SHOP BY CATEGORY</p>
                        <h2 className="section-title">Find Your Perfect Routine</h2>
                        <p className="section-subtitle" style={{ margin: '0 auto' }}>
                            Explore our curated collections designed to make you feel beautiful inside and out.
                        </p>
                    </div>
                    <div className="categories-grid">
                        {categories.map((cat) => (
                            <Link to={cat.path} key={cat.name} className="category-card">
                                <div className="category-card__image-wrapper">
                                    <img src={cat.image} alt={cat.name} className="category-card__image" />
                                    <div className="category-card__overlay" />
                                </div>
                                <div className="category-card__content">
                                    <h3 className="category-card__name">{cat.name}</h3>
                                    <p className="category-card__tagline">{cat.tagline}</p>
                                    <span className="category-card__link">
                                        Shop Now <span>&rsaquo;</span>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SECTION 4: Featured Products ===== */}
            <section className="products-section">
                <div className="container">
                    <div className="products-section__header">
                        <div>
                            <p className="section-label">HANDPICKED FOR YOU</p>
                            <h2 className="section-title">Featured Products</h2>
                        </div>
                        <Link to="/products" className="products-section__view-all">
                            View All <span>&rarr;</span>
                        </Link>
                    </div>
                    <div className="products-grid">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SECTION 5: Promo Banner ===== */}
            <section className="promo-banner">
                <div className="container">
                    <div className="promo-banner__card">
                        <div className="promo-banner__overlay" />
                        <div className="promo-banner__content">
                            <span className="promo-banner__badge">LIMITED TIME OFFER</span>
                            <h2 className="promo-banner__title">Skincare Bundle — Save 25%</h2>
                            <p className="promo-banner__text">Complete your routine with our curated skincare set</p>
                            <Link to="/products?bundle=skincare" className="promo-banner__btn">
                                Shop Bundle <span>&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SECTION 6: Best Sellers ===== */}
            <section className="products-section">
                <div className="container">
                    <div className="products-section__header products-section__header--center">
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <p className="section-label">TRENDING NOW</p>
                            <h2 className="section-title">Best Sellers</h2>
                            <p className="section-subtitle" style={{ margin: '0 auto' }}>
                                Our most-loved products — loved by thousands of beauty enthusiasts worldwide.
                            </p>
                        </div>
                    </div>
                    <div className="products-grid">
                        {bestSellers.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <div className="products-section__cta">
                        <Link to="/products" className="products-section__shop-all-btn">
                            Shop All Products <span>&rarr;</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== SECTION 7: Reviews ===== */}
            <section className="reviews-section">
                <div className="container">
                    <div className="reviews-section__header">
                        <p className="section-label">WHAT THEY SAY</p>
                        <h2 className="section-title">Loved by Thousands</h2>
                    </div>
                    <div className="reviews-grid">
                        {reviews.map((review) => (
                            <div key={review.id} className="review-card">
                                <div className="review-card__stars">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg key={star} width="18" height="18" viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="review-card__text">"{review.text}"</p>
                                <div className="review-card__author">
                                    <div className="review-card__avatar">{review.initial}</div>
                                    <div>
                                        <p className="review-card__name">{review.author}</p>
                                        <p className="review-card__role">{review.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;