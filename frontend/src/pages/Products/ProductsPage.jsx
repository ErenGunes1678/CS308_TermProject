import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ProductsEmptyState from '../../components/product-listing/ProductsEmptyState';
import ProductsFiltersSidebar from '../../components/product-listing/ProductsFiltersSidebar';
import ProductsGrid from '../../components/product-listing/ProductsGrid';
import ProductsHero from '../../components/product-listing/ProductsHero';
import ProductsToolbar from '../../components/product-listing/ProductsToolbar';
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
            <ProductsHero categoryInfo={categoryInfo} />

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
