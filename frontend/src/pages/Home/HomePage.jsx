import HomeCategories from '../../components/home/HomeCategories';
import HomeHero from '../../components/home/HomeHero';
import HomeProductSection from '../../components/home/HomeProductSection';
import HomePromoBanner from '../../components/home/HomePromoBanner';
import HomeReviews from '../../components/home/HomeReviews';
import HomeTrustBar from '../../components/home/HomeTrustBar';
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
            <HomeHero />
            <HomeTrustBar />
            <HomeCategories categories={categories} />
            <HomeProductSection
                eyebrow="HANDPICKED FOR YOU"
                title="Featured Products"
                products={featuredProducts}
                showViewAll
            />
            <HomePromoBanner />
            <HomeProductSection
                eyebrow="TRENDING NOW"
                title="Best Sellers"
                subtitle="Our most-loved products — loved by thousands of beauty enthusiasts worldwide."
                products={bestSellers}
                centered
                showShopAll
            />
            <HomeReviews reviews={reviews} />
        </div>
    );
};

export default HomePage;
