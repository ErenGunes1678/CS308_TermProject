import { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductsEmptyState from '../../components/product/product-listing/ProductsEmptyState';
import ProductsFiltersSidebar from '../../components/product/product-listing/ProductsFiltersSidebar';
import ProductsGrid from '../../components/product/product-listing/ProductsGrid';
import ProductsHero from '../../components/product/product-listing/ProductsHero';
import ProductsToolbar from '../../components/product/product-listing/ProductsToolbar';
import './ProductsPage.css';

// Placeholder — replace with API data later
const PLACEHOLDER = 'https://placehold.co/400x400/f5f5f5/999?text=Product';

const ALL_PRODUCTS = [
    {
        id: 1,
        name: 'Velvet Matte Lipstick',
        brand: 'LumaBelle',
        category: 'makeup',
        subcategory: 'lipstick',
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
        subcategory: 'serums',
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
        subcategory: 'eyeshadow',
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
        subcategory: 'beard-care',
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
        subcategory: 'face-wash',
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
        subcategory: 'blush',
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
        subcategory: 'moisturizers',
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
        subcategory: 'hair-oil',
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
        subcategory: 'moisturizers',
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
        subcategory: 'shampoo',
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

const BRANDS = ['LumaBelle', 'GlowLab', 'HairLux', 'ForHim', 'Aurore', 'SkinStar', 'PurGlow'];

const ProductsPage = () => {
    const { slug } = useParams(); // e.g. "makeup", "skincare", etc.
    const [searchParams] = useSearchParams();
    const selectedSubcategory = searchParams.get('sub');

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

    // Filter & sort products
    const filteredProducts = useMemo(() => {
        let products = [...ALL_PRODUCTS];

        // Filter by category
        if (slug) {
            products = products.filter((p) => p.category === slug);
        }

        // Filter by navbar subcategory query, e.g. ?sub=lipstick
        if (selectedSubcategory) {
            products = products.filter(
                (p) => normalizeSlug(p.subcategory) === normalizeSlug(selectedSubcategory)
            );
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
    }, [slug, selectedSubcategory, priceRange, selectedBrands, sortBy]);

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
                    brands={BRANDS}
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
                        productCount={filteredProducts.length}
                        viewMode={viewMode}
                        sortBy={sortBy}
                        onViewModeChange={setViewMode}
                        onSortChange={setSortBy}
                    />

                    {filteredProducts.length > 0 ? (
                        <ProductsGrid products={filteredProducts} viewMode={viewMode} />
                    ) : (
                        <ProductsEmptyState />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
