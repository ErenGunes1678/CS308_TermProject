import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import { getProducts } from '../../services/productService';
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

const ProductsPage = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const selectedSubcategory = searchParams.get('sub');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [priceRange, setPriceRange] = useState([0, 200]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [viewMode, setViewMode] = useState('grid');

    const [priceOpen, setPriceOpen] = useState(true);
    const [brandOpen, setBrandOpen] = useState(true);

    const categoryInfo = slug ? CATEGORY_INFO[slug] : null;
    const subcategoryInfo =
        slug && selectedSubcategory
            ? SUBCATEGORY_INFO[slug]?.[selectedSubcategory]
            : null;
    const heroInfo = subcategoryInfo || categoryInfo;
    const brands = useMemo(
        () => Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort(),
        [products]
    );

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

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredProducts = useMemo(() => {
        let visibleProducts = [...products];

        if (slug) {
            visibleProducts = visibleProducts.filter((product) => product.category === slug);
        }

        if (selectedSubcategory) {
            visibleProducts = visibleProducts.filter(
                (product) => normalizeSlug(product.subcategory) === normalizeSlug(selectedSubcategory)
            );
        }

        visibleProducts = visibleProducts.filter(
            (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        if (selectedBrands.length > 0) {
            visibleProducts = visibleProducts.filter((product) => selectedBrands.includes(product.brand));
        }

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
                break;
        }

        return visibleProducts;
    }, [priceRange, products, selectedBrands, selectedSubcategory, slug, sortBy]);

    const handleBrandToggle = (brand) => {
        setSelectedBrands((prev) =>
            prev.includes(brand) ? prev.filter((item) => item !== brand) : [...prev, brand]
        );
    };

    const productCountLabel = isLoading ? 'Loading' : filteredProducts.length;
    const sliderPercentage = (priceRange[1] / 200) * 100;

    return (
        <div className="products-page">
            <section className="products-hero">
                <div className="products-hero__overlay" />
                <div className="products-hero__content container">
                    <h1 className="products-hero__title">
                        {heroInfo ? heroInfo.name : 'All Products'}
                    </h1>
                    <p className="products-hero__tagline">
                        {heroInfo ? heroInfo.tagline : 'Browse our full collection'}
                    </p>
                </div>
            </section>

            <div className="products-page__body container">
                <aside className="products-sidebar">
                    <div className="products-sidebar__header">
                        <h3 className="products-sidebar__title">Filters</h3>
                    </div>

                    <div className="filter-section">
                        <button className="filter-section__header" onClick={() => setPriceOpen(!priceOpen)}>
                            <span className="filter-section__label">Price Range</span>
                            <svg
                                className={`filter-section__chevron ${priceOpen ? '' : 'filter-section__chevron--closed'}`}
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
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
                                    onChange={(event) => setPriceRange([priceRange[0], Number(event.target.value)])}
                                    className="price-slider"
                                    style={{
                                        background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${sliderPercentage}%, var(--color-gray-200) ${sliderPercentage}%, var(--color-gray-200) 100%)`,
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
                        <button className="filter-section__header" onClick={() => setBrandOpen(!brandOpen)}>
                            <span className="filter-section__label">Brand</span>
                            <svg
                                className={`filter-section__chevron ${brandOpen ? '' : 'filter-section__chevron--closed'}`}
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {brandOpen && (
                            <div className="filter-section__body">
                                {brands.map((brand) => (
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

                <div className="products-main">
                    <div className="products-toolbar">
                        <p className="products-toolbar__count">
                            <strong>{productCountLabel}</strong> products
                        </p>

                        <div className="products-toolbar__right">
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

                            <div className="sort-dropdown">
                                <select
                                    value={sortBy}
                                    onChange={(event) => setSortBy(event.target.value)}
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

                    {loadError && <p className="products-toolbar__count">{loadError}</p>}

                    {!isLoading && filteredProducts.length > 0 ? (
                        <div className={`products-grid ${viewMode === 'list' ? 'products-grid--list' : ''}`}>
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        !isLoading && (
                            <div className="products-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" strokeWidth="1.5">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                                <h3>No products found</h3>
                                <p>Try adjusting your filters to find what you're looking for.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
