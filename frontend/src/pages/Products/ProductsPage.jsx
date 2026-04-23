import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductsEmptyState from '../../components/product/product-listing/ProductsEmptyState';
import ProductsFiltersSidebar from '../../components/product/product-listing/ProductsFiltersSidebar';
import ProductsGrid from '../../components/product/product-listing/ProductsGrid';
import ProductsHero from '../../components/product/product-listing/ProductsHero';
import ProductsToolbar from '../../components/product/product-listing/ProductsToolbar';
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
    const { slug } = useParams(); // e.g. "makeup", "skincare", etc.
    const [searchParams] = useSearchParams();
    const selectedSubcategory = searchParams.get('sub');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // Filter state
    const [priceRange, setPriceRange] = useState([0, 200]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Collapsible filter sections
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

    // Filter & sort products
    const filteredProducts = useMemo(() => {
        let visibleProducts = [...products];

        // Filter by category
        if (slug) {
            visibleProducts = visibleProducts.filter((p) => p.category === slug);
        }

        // Filter by navbar subcategory query, e.g. ?sub=lipstick
        if (selectedSubcategory) {
            visibleProducts = visibleProducts.filter(
                (p) => normalizeSlug(p.subcategory) === normalizeSlug(selectedSubcategory)
            );
        }

        // Filter by price range
        visibleProducts = visibleProducts.filter(
            (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        // Filter by brand
        if (selectedBrands.length > 0) {
            visibleProducts = visibleProducts.filter((p) => selectedBrands.includes(p.brand));
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
    }, [products, slug, selectedSubcategory, priceRange, selectedBrands, sortBy]);

    const handleBrandToggle = (brand) => {
        setSelectedBrands((prev) =>
            prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
        );
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
                />

                <div className="products-main">
                    <ProductsToolbar
                        productCount={isLoading ? 'Loading' : filteredProducts.length}
                        viewMode={viewMode}
                        sortBy={sortBy}
                        onViewModeChange={setViewMode}
                        onSortChange={setSortBy}
                    />

                    {loadError && <p className="products-toolbar__count">{loadError}</p>}

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
