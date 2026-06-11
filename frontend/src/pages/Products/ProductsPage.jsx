import { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import { useWishlist } from '../../hooks/useWishlist';
import { PRODUCT_REVIEW_UPDATED_EVENT } from '../../utils/reviewUpdates';
import '../../styles/product-card.css';
import './ProductsPage.css';

const CATEGORY_INFO = {
    makeup: { name: 'Makeup', tagline: 'Express your beauty' },
    skincare: { name: 'Skincare', tagline: 'Glow from within' },
    haircare: { name: 'Haircare', tagline: 'Love your locks' },
    'men-care': { name: 'Men Care', tagline: 'Crafted for him' },
};

const SUBCATEGORY_INFO = {
    makeup: {
        lipstick: { name: 'Lipstick', tagline: 'Color that completes every look' },
        foundation: { name: 'Foundation', tagline: 'Your base for a flawless finish' },
        eyeshadow: { name: 'Eyeshadow', tagline: 'Build every eye look from soft to bold' },
        mascara: { name: 'Mascara', tagline: 'Lift, lengthen, and define' },
        blush: { name: 'Blush', tagline: 'Fresh color for a natural glow' },
    },
    skincare: {
        moisturizers: { name: 'Moisturizers', tagline: 'Hydration for every skin routine' },
        serums: { name: 'Serums', tagline: 'Targeted care for visible glow' },
        cleansers: { name: 'Cleansers', tagline: 'Start fresh with gentle formulas' },
        sunscreen: { name: 'Sunscreen', tagline: 'Daily protection made simple' },
        'face-masks': { name: 'Face Masks', tagline: 'A reset for tired skin' },
    },
    haircare: {
        shampoo: { name: 'Shampoo', tagline: 'Cleanse and care for every hair type' },
        conditioner: { name: 'Conditioner', tagline: 'Smooth, soften, and detangle' },
        'hair-oil': { name: 'Hair Oil', tagline: 'Shine and softness from root to tip' },
        styling: { name: 'Styling', tagline: 'Shape your look with confidence' },
        treatments: { name: 'Treatments', tagline: 'Extra care for stronger hair' },
    },
    'men-care': {
        'beard-care': { name: 'Beard Care', tagline: 'Grooming essentials for a clean finish' },
        'face-wash': { name: 'Face Wash', tagline: 'Fresh skin after every cleanse' },
        moisturizer: { name: 'Moisturizer', tagline: 'Lightweight hydration for daily care' },
        'grooming-kits': { name: 'Grooming Kits', tagline: 'Everything needed for a sharp routine' },
    },
};

const normalizeSlug = (value = '') => value.toLowerCase().trim().replace(/\s+/g, '-');

function ProductCard({ product }) {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { id, name, brand, price, originalPrice, rating, reviewCount, image, badge, discount, outOfStock, lowStock } = product;
    const badgeColors = { BEST: '#10B981', NEW: '#3B82F6', LIMITED: '#8B5CF6', SALE: '#EF4444' };
    const stars = [];
    const full = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 >= 0.5;
    for (let i = 0; i < 5; i += 1) {
        if (i < full) {
            stars.push(<svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
        } else if (i === full && hasHalf) {
            stars.push(<svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1" opacity="0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
        } else {
            stars.push(<svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
        }
    }
    return (
        <div className={`product-card ${outOfStock ? 'product-card--out-of-stock' : ''}`}>
            <Link to={`/product/${id}`} className="product-card__image-wrapper">
                <img src={image} alt={name} className="product-card__image" />
                <div className="product-card__badges">
                    {badge && <span className="product-card__badge" style={{ background: badgeColors[badge] || '#6B7280' }}>{badge}</span>}
                    {discount && <span className="product-card__badge product-card__badge--discount">-{discount}%</span>}
                    {outOfStock && <span className="product-card__badge product-card__badge--oos">OUT OF STOCK</span>}
                </div>
                <button className={`product-card__wishlist ${isInWishlist(id) ? 'product-card__wishlist--active' : ''}`} onClick={(event) => { event.preventDefault(); toggleWishlist(product); }} aria-label="Add to wishlist">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist(id) ? 'var(--color-primary)' : 'none'} stroke={isInWishlist(id) ? 'var(--color-primary)' : 'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                </button>
                {outOfStock && <div className="product-card__oos-overlay" />}
            </Link>
            <div className="product-card__info">
                <span className="product-card__brand">{brand}</span>
                <Link to={`/product/${id}`} className="product-card__name">{name}</Link>
                <div className="product-card__rating">
                    <div className="product-card__stars">{stars}</div>
                    <span className="product-card__review-count">({reviewCount})</span>
                </div>
                <div className="product-card__price-row">
                    <span className="product-card__price">${price}</span>
                    {originalPrice && <span className="product-card__original-price">${originalPrice}</span>}
                    {lowStock && <span className="product-card__low-stock">Only {lowStock} left</span>}
                </div>
            </div>
        </div>
    );
}

function ProductsHero({ categoryInfo }) {
    return (
        <section className="products-hero">
            <div className="products-hero__overlay" />
            <div className="products-hero__content container">
                <h1 className="products-hero__title">{categoryInfo ? categoryInfo.name : 'All Products'}</h1>
                <p className="products-hero__tagline">{categoryInfo ? categoryInfo.tagline : 'Browse our full collection'}</p>
            </div>
        </section>
    );
}

function ProductsFiltersSidebar({
    brands,
    priceRange,
    priceBounds,
    selectedBrands,
    priceOpen,
    brandOpen,
    onPriceRangeChange,
    onBrandToggle,
    onTogglePriceOpen,
    onToggleBrandOpen,
    onApply,
    onClear,
}) {
    return (
        <aside className="products-sidebar">
            <div className="products-sidebar__header">
                <h3 className="products-sidebar__title">Filters</h3>
                <div className="search-page__actions">
                    <button type="button" className="search-page__apply-btn" onClick={onApply}>
                        Apply
                    </button>
                    <button type="button" className="search-page__clear-btn" onClick={onClear}>
                        Clear all
                    </button>
                </div>
            </div>
            <div className="filter-section">
                <button className="filter-section__header" onClick={onTogglePriceOpen}>
                    <span className="filter-section__label">Price Range</span>
                    <svg className={`filter-section__chevron ${priceOpen ? '' : 'filter-section__chevron--closed'}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {priceOpen && (
                    <div className="filter-section__body">
                        <input
                            type="range"
                            min={priceBounds.min}
                            max={priceBounds.max}
                            value={priceRange[1]}
                            onChange={(event) => onPriceRangeChange([priceRange[0], Number(event.target.value)])}
                            className="price-slider"
                            style={{
                                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((priceRange[1] - priceBounds.min) / Math.max(priceBounds.max - priceBounds.min, 1)) * 100}%, var(--color-gray-200) ${((priceRange[1] - priceBounds.min) / Math.max(priceBounds.max - priceBounds.min, 1)) * 100}%, var(--color-gray-200) 100%)`
                            }}
                        />
                        <div className="price-slider__labels">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="filter-section">
                <button className="filter-section__header" onClick={onToggleBrandOpen}>
                    <span className="filter-section__label">Brand</span>
                    <svg className={`filter-section__chevron ${brandOpen ? '' : 'filter-section__chevron--closed'}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {brandOpen && (
                    <div className="filter-section__body">
                        {brands.map((brand) => (
                            <label key={brand} className="brand-checkbox">
                                <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => onBrandToggle(brand)} className="brand-checkbox__input" />
                                <span className="brand-checkbox__custom" />
                                <span className="brand-checkbox__label">{brand}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}

function ProductsToolbar({ productCount, viewMode, sortBy, onViewModeChange, onSortChange }) {
    return (
        <div className="products-toolbar">
            <p className="products-toolbar__count"><strong>{productCount}</strong> products</p>
            <div className="products-toolbar__right">
                <div className="view-toggle">
                    <button className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`} onClick={() => onViewModeChange('grid')} aria-label="Grid view">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                    </button>
                    <button className={`view-toggle__btn ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`} onClick={() => onViewModeChange('list')} aria-label="List view">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="4" rx="1" /><rect x="3" y="10" width="18" height="4" rx="1" /><rect x="3" y="17" width="18" height="4" rx="1" /></svg>
                    </button>
                </div>
                <div className="sort-dropdown">
                    <select value={sortBy} onChange={(event) => onSortChange(event.target.value)} className="sort-dropdown__select">
                        <option value="featured">Featured</option>
                        <option value="newest">Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

function ProductsGrid({ products, viewMode }) {
    return (
        <div className={`products-grid ${viewMode === 'list' ? 'products-grid--list' : ''}`}>
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
    );
}

function ProductsEmptyState() {
    return (
        <div className="products-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </svg>
            <h3>No products found</h3>
            <p>Try adjusting your filters to find what you're looking for.</p>
        </div>
    );
}

const ProductsPage = () => {
    const { category } = useParams(); // e.g. "makeup", "skincare", etc.
    const [searchParams] = useSearchParams();
    const selectedSubcategory = searchParams.get('sub');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // Filter state
    const [priceRange, setPriceRange] = useState([0, 200]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [appliedPriceRange, setAppliedPriceRange] = useState([0, 200]);
    const [appliedBrands, setAppliedBrands] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Collapsible filter sections
    const [priceOpen, setPriceOpen] = useState(true);
    const [brandOpen, setBrandOpen] = useState(true);

    const categoryInfo = category ? CATEGORY_INFO[category] : null;
    const subcategoryInfo =
        category && selectedSubcategory
            ? SUBCATEGORY_INFO[category]?.[selectedSubcategory]
            : null;
    const heroInfo = subcategoryInfo || categoryInfo;
    const brands = useMemo(
        () => Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort(),
        [products]
    );
    const priceBounds = useMemo(() => {
        if (!products.length) {
            return { min: 0, max: 200 };
        }

        const prices = products.map((product) => Number(product.price) || 0);

        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices)),
        };
    }, [products]);

    useEffect(() => {
        setSelectedBrands((currentBrands) =>
            currentBrands.filter((brand) => brands.includes(brand))
        );
        setAppliedBrands((currentBrands) =>
            currentBrands.filter((brand) => brands.includes(brand))
        );
    }, [brands]);

    useEffect(() => {
        setPriceRange((currentRange) => {
            if (currentRange[0] === 0 && currentRange[1] === 200) {
                return [priceBounds.min, priceBounds.max];
            }

            return [
                Math.max(priceBounds.min, Math.min(currentRange[0], currentRange[1])),
                Math.min(priceBounds.max, Math.max(currentRange[1], currentRange[0])),
            ];
        });
    }, [priceBounds]);

    useEffect(() => {
        setAppliedPriceRange((currentRange) => {
            if (currentRange[0] === 0 && currentRange[1] === 200) {
                return [priceBounds.min, priceBounds.max];
            }

            return [
                Math.max(priceBounds.min, Math.min(currentRange[0], currentRange[1])),
                Math.min(priceBounds.max, Math.max(currentRange[1], currentRange[0])),
            ];
        });
    }, [priceBounds]);

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            setIsLoading(true);
            setLoadError('');

            try {
                const apiProducts = await getProducts();

                if (isMounted) {
                    setProducts(apiProducts);
                }
            } catch {
                if (isMounted) {
                    setProducts([]);
                    setLoadError('Products could not be loaded. Please make sure the backend is running.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadProducts();

        const handleProductReviewUpdated = () => {
            loadProducts();
        };

        window.addEventListener(PRODUCT_REVIEW_UPDATED_EVENT, handleProductReviewUpdated);

        return () => {
            isMounted = false;
            window.removeEventListener(PRODUCT_REVIEW_UPDATED_EVENT, handleProductReviewUpdated);
        };
    }, []);

    // Filter & sort products
    const filteredProducts = useMemo(() => {
        let visibleProducts = [...products];

        // Filter by category
        if (category) {
            visibleProducts = visibleProducts.filter((p) => p.category === category);
        }

        // Filter by navbar subcategory query, e.g. ?sub=lipstick
        if (selectedSubcategory) {
            visibleProducts = visibleProducts.filter(
                (p) => normalizeSlug(p.subcategory) === normalizeSlug(selectedSubcategory)
            );
        }

        // Filter by price range
        visibleProducts = visibleProducts.filter(
            (p) => p.price >= appliedPriceRange[0] && p.price <= appliedPriceRange[1]
        );

        // Filter by brand
        if (appliedBrands.length > 0) {
            visibleProducts = visibleProducts.filter((p) => appliedBrands.includes(p.brand));
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                visibleProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                visibleProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                visibleProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                visibleProducts.sort((a, b) => b.id - a.id);
                break;
            default:
                // featured — keep original order
                break;
        }

        return visibleProducts;
    }, [products, category, selectedSubcategory, appliedPriceRange, appliedBrands, sortBy]);

    const handleBrandToggle = (brand) => {
        setSelectedBrands((prev) =>
            prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
        );
    };

    const applyFilters = () => {
        setAppliedPriceRange([...priceRange]);
        setAppliedBrands([...selectedBrands]);
    };

    const clearFilters = () => {
        setPriceRange([priceBounds.min, priceBounds.max]);
        setSelectedBrands([]);
        setAppliedPriceRange([priceBounds.min, priceBounds.max]);
        setAppliedBrands([]);
    };

    return (
        <div className="products-page">
            <ProductsHero categoryInfo={heroInfo} />

            <div className="products-page__body container">
                <ProductsFiltersSidebar
                    brands={brands}
                    priceRange={priceRange}
                    selectedBrands={selectedBrands}
                    priceOpen={priceOpen}
                    brandOpen={brandOpen}
                    onPriceRangeChange={setPriceRange}
                    onBrandToggle={handleBrandToggle}
                    onTogglePriceOpen={() => setPriceOpen(!priceOpen)}
                    onToggleBrandOpen={() => setBrandOpen(!brandOpen)}
                    onApply={applyFilters}
                    onClear={clearFilters}
                    priceBounds={priceBounds}
                />

                <div className="products-main">
                    <ProductsToolbar
                        productCount={isLoading ? 'Loading' : filteredProducts.length}
                        viewMode={viewMode}
                        sortBy={sortBy}
                        onViewModeChange={setViewMode}
                        onSortChange={setSortBy}
                    />

                    {loadError ? (
                        <div className="site-inline-message site-inline-message--error" role="alert">
                            {loadError}
                        </div>
                    ) : null}

                    {!isLoading && filteredProducts.length > 0 ? (
                        <ProductsGrid products={filteredProducts} viewMode={viewMode} />
                    ) : (
                        !isLoading && <ProductsEmptyState />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
