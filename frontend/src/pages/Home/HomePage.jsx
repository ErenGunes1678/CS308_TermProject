import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import { getProducts } from '../../services/productService';
import './HomePage.css';

const categories = [
    { name: 'Makeup', tagline: 'Express your beauty', path: '/category/makeup', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348' },
    { name: 'Skincare', tagline: 'Glow from within', path: '/category/skincare', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883' },
    { name: 'Haircare', tagline: 'Love your locks', path: '/category/haircare', image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a' },
    { name: 'Men Care', tagline: 'Crafted for him', path: '/category/men-care', image: 'https://images.unsplash.com/photo-1621607512214-68297480165e' },
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

const trustItems = [
    {
        title: 'Free Shipping',
        text: 'On orders over $50',
        icon: (
            <>
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
            </>
        ),
    },
    {
        title: 'Easy Returns',
        text: '30-day return policy',
        icon: (
            <>
                <path d="M1 4v6h6" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </>
        ),
    },
    {
        title: 'Authentic Products',
        text: '100% genuine brands',
        icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    },
    {
        title: 'Loyalty Rewards',
        text: 'Earn points every order',
        icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    },
];

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const loadHomeProducts = async () => {
            try {
                const products = await getProducts();

                if (!isMounted) return;

                setFeaturedProducts(products.slice(0, 4));
                setBestSellers(
                    [...products]
                        .sort((a, b) => Number(b.reviewCount || 0) - Number(a.reviewCount || 0))
                        .slice(0, 4)
                );
            } catch {
                if (isMounted) {
                    setFeaturedProducts([]);
                    setBestSellers([]);
                }
            }
        };

        loadHomeProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="home">
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

            <section className="trust-bar">
                <div className="container trust-bar__inner">
                    {trustItems.map((item) => (
                        <div key={item.title} className="trust-bar__item">
                            <div className="trust-bar__icon trust-bar__icon--pink">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    {item.icon}
                                </svg>
                            </div>
                            <div>
                                <h4 className="trust-bar__title">{item.title}</h4>
                                <p className="trust-bar__text">{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

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
                        {categories.map((category) => (
                            <Link to={category.path} key={category.name} className="category-card">
                                <div className="category-card__image-wrapper">
                                    <img src={category.image} alt={category.name} className="category-card__image" />
                                    <div className="category-card__overlay" />
                                </div>
                                <div className="category-card__content">
                                    <h3 className="category-card__name">{category.name}</h3>
                                    <p className="category-card__tagline">{category.tagline}</p>
                                    <span className="category-card__link">
                                        Shop Now <span>&rsaquo;</span>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {featuredProducts.length > 0 && (
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
                        <div className="home-products-grid">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

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

            {bestSellers.length > 0 && (
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
                        <div className="home-products-grid">
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
            )}

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
