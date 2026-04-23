import { useEffect, useState } from 'react';
import HomeCategories from '../../components/home/HomeCategories';
import HomeHero from '../../components/home/HomeHero';
import HomeProductSection from '../../components/home/HomeProductSection';
import HomePromoBanner from '../../components/home/HomePromoBanner';
import HomeReviews from '../../components/home/HomeReviews';
import HomeTrustBar from '../../components/home/HomeTrustBar';
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
            <HomeHero />
            <HomeTrustBar />
            <HomeCategories categories={categories} />
            {featuredProducts.length > 0 && (
                <HomeProductSection
                    eyebrow="HANDPICKED FOR YOU"
                    title="Featured Products"
                    products={featuredProducts}
                    showViewAll
                />
            )}
            <HomePromoBanner />
            {bestSellers.length > 0 && (
                <HomeProductSection
                    eyebrow="TRENDING NOW"
                    title="Best Sellers"
                    subtitle="Our most-loved products — loved by thousands of beauty enthusiasts worldwide."
                    products={bestSellers}
                    centered
                    showShopAll
                />
            )}
            <HomeReviews reviews={reviews} />
        </div>
    );
};

export default HomePage;
