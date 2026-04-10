import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import './ProductsPage.css';

// Placeholder — replace with API data later
const PLACEHOLDER = 'https://placehold.co/400x400/f5f5f5/999?text=Product';

const ALL_PRODUCTS = [
    {
        id: 1,
        name: 'Velvet Matte Lipstick',
        brand: 'LumaBelle',
        category: 'makeup',
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
        category: 'skincare',
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
        category: 'makeup',
        price: 62,
        originalPrice: null,
        rating: 4.5,
        reviewCount: 541,
        image: PLACEHOLDER,
        badge: 'BEST',
    },
    {
        id: 4,
        name: "Men's Beard & Face Kit",
        brand: 'ForHim',
        category: 'men-care',
        price: 48,
        originalPrice: 60,
        rating: 4,
        reviewCount: 113,
        image: PLACEHOLDER,
        badge: 'NEW',
        discount: 20,
    },
    {
        id: 5,
        name: "Men's Active Cleanser",
        brand: 'ForHim',
        category: 'men-care',
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
        category: 'makeup',
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
        category: 'skincare',
        price: 118,
        originalPrice: 160,
        rating: 4,
        reviewCount: 89,
        image: PLACEHOLDER,
        badge: 'SALE',
        discount: 26,
        outOfStock: true,
    },
    {
        id: 8,
        name: 'Silk Repair Hair Oil',
        brand: 'HairLux',
        category: 'haircare',
        price: 38,
        originalPrice: null,
        rating: 4.5,
        reviewCount: 205,
        image: PLACEHOLDER,
        badge: 'NEW',
    },
    {
        id: 9,
        name: 'Deep Hydration Face Cream',
        brand: 'GlowLab',
        category: 'skincare',
        price: 42,
        originalPrice: null,
        rating: 4,
        reviewCount: 178,
        image: PLACEHOLDER,
    },
    {
        id: 10,
        name: 'Volumizing Shampoo',
        brand: 'HairLux',
        category: 'haircare',
        price: 26,
        originalPrice: 32,
        rating: 4,
        reviewCount: 143,
        image: PLACEHOLDER,
        discount: 19,
    },
];

const CATEGORY_INFO = {
    makeup: { name: 'Makeup', tagline: 'Express your beauty' },
    skincare: { name: 'Skincare', tagline: 'Glow from within' },
    haircare: { name: 'Haircare', tagline: 'Love your locks' },
    'men-care': { name: 'Men Care', tagline: 'Crafted for him' },
};

const BRANDS = ['LumaBelle', 'GlowLab', 'HairLux', 'ForHim', 'Aurore', 'SkinStar', 'PurGlow'];

const ProductsPage = () => {
    const { slug } = useParams(); // e.g. "makeup", "skincare", etc.

    // Filter state
    const [priceRange, setPriceRange] = useState([0, 200]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Collapsible filter sections
    const [priceOpen, setPriceOpen] = useState(true);
    const [brandOpen, setBrandOpen] = useState(true);

    const categoryInfo = slug ? CATEGORY_INFO[slug] : null;

    // Filter & sort products
    const filteredProducts = useMemo(() => {
        let products = [...ALL_PRODUCTS];

        // Filter by category
        if (slug) {
            products = products.filter((p) => p.category === slug);
        }

        // Filter by price range
        products = products.filter(
            (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        // Filter by brand
        if (selectedBrands.length > 0) {
            products = products.filter((p) => selectedBrands.includes(p.brand));
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                products.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                products.sort((a, b) => b.id - a.id);
                break;
            default:
                // featured — keep original order
                break;
        }

        return products;
    }, [slug, priceRange, selectedBrands, sortBy]);

    const handleBrandToggle = (brand) => {
        setSelectedBrands((prev) =>
            prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
        );
    };

    return (
        <div className="products-page">
            {/* ===== Category Hero Banner ===== */}
            <section className="products-hero">
                <div className="products-hero__overlay" />
                <div className="products-hero__content container">
                    <h1 className="products-hero__title">
                        {categoryInfo ? categoryInfo.name : 'All Products'}
                    </h1>
                    <p className="products-hero__tagline">
                        {categoryInfo ? categoryInfo.tagline : 'Browse our full collection'}
                    </p>
                </div>
            </section>

            {/* ===== Main Content ===== */}
            <div className="products-page__body container">
                {/* Sidebar Filters */}
                <aside className="products-sidebar">
                    <h3 className="products-sidebar__title">Filters</h3>

                    {/* Price Range */}
                    <div className="filter-section">
                        <button
                            className="filter-section__header"
                            onClick={() => setPriceOpen(!priceOpen)}
                        >
                            <span className="filter-section__label">Price Range</span>
                            <svg
                                className={`filter-section__chevron ${priceOpen ? '' : 'filter-section__chevron--closed'}`}
                                width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                        {priceOpen && (
                            <div className="filter-section__body">
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={priceRange[1]}
                                    onChange={(e) =>
                                        setPriceRange([priceRange[0], Number(e.target.value)])
                                    }
                                    className="price-slider"
                                    style={{
                                        background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(priceRange[1] / 200) * 100}%, var(--color-gray-200) ${(priceRange[1] / 200) * 100}%, var(--color-gray-200) 100%)`,
                                    }}
                                />
                                <div className="price-slider__labels">
                                    <span>${priceRange[0]}</span>
                                    <span>${priceRange[1]}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Brand */}
                    <div className="filter-section">
                        <button
                            className="filter-section__header"
                            onClick={() => setBrandOpen(!brandOpen)}
                        >
                            <span className="filter-section__label">Brand</span>
                            <svg
                                className={`filter-section__chevron ${brandOpen ? '' : 'filter-section__chevron--closed'}`}
                                width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                        {brandOpen && (
                            <div className="filter-section__body">
                                {BRANDS.map((brand) => (
                                    <label key={brand} className="brand-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedBrands.includes(brand)}
                                            onChange={() => handleBrandToggle(brand)}
                                            className="brand-checkbox__input"
                                        />
                                        <span className="brand-checkbox__custom" />
                                        <span className="brand-checkbox__label">{brand}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Product Grid Area */}
                <div className="products-main">
                    {/* Toolbar */}
                    <div className="products-toolbar">
                        <p className="products-toolbar__count">
                            <strong>{filteredProducts.length}</strong> products
                        </p>

                        <div className="products-toolbar__right">
                            {/* View toggle */}
                            <div className="view-toggle">
                                <button
                                    className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    aria-label="Grid view"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                        <rect x="14" y="14" width="7" height="7" />
                                    </svg>
                                </button>
                                <button
                                    className={`view-toggle__btn ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    aria-label="List view"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="4" rx="1" />
                                        <rect x="3" y="10" width="18" height="4" rx="1" />
                                        <rect x="3" y="17" width="18" height="4" rx="1" />
                                    </svg>
                                </button>
                            </div>

                            {/* Sort dropdown */}
                            <div className="sort-dropdown">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="sort-dropdown__select"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="newest">Newest</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className={`products-grid ${viewMode === 'list' ? 'products-grid--list' : ''}`}>
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="products-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <h3>No products found</h3>
                            <p>Try adjusting your filters to find what you're looking for.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;