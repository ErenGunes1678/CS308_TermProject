import { Link } from 'react-router-dom';
import './HomePage.css';

const CATEGORIES = [
    {
        name: 'Makeup',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        slug: 'makeup',
    },
    {
        name: 'Skincare',
        image: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8797?w=400&h=400&fit=crop',
        slug: 'skincare',
    },
    {
        name: 'Haircare',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop',
        slug: 'haircare',
    },
    {
        name: 'Man Care',
        image: 'https://images.unsplash.com/photo-1581750801405-342615d8317e?w=400&h=400&fit=crop',
        slug: 'man-care',
    },
];

// Placeholder products — replace with API data later
const RECOMMENDED = [
    { id: 1, name: 'Rose Glow Serum', price: 42, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop' },
    { id: 2, name: 'Velvet Matte Lipstick', price: 28, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop' },
    { id: 3, name: 'Hydra Boost Cream', price: 55, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300&h=300&fit=crop' },
    { id: 4, name: 'Silk Hair Oil', price: 35, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&h=300&fit=crop' },
    { id: 5, name: 'Charcoal Face Wash', price: 22, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop' },
    { id: 6, name: 'Daily SPF 50+', price: 38, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop' },
    { id: 7, name: 'Eye Contour Cream', price: 48, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300&h=300&fit=crop' },
    { id: 8, name: 'Beard Grooming Kit', price: 60, image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=300&h=300&fit=crop' },
];

export default function HomePage() {
    return (
        <div className="home-page">
            {/* ── Hero ── */}
            <section className="hero container">
                <h1 className="hero-title">Discover Your Glow</h1>
                <p className="hero-subtitle">
                    Curated beauty essentials for every routine
                </p>
            </section>

            {/* ── Categories ── */}
            <section className="categories-section container">
                <h2 className="section-title">Shop by Category</h2>
                <div className="categories-grid">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.slug}
                            to={`/products?category=${cat.slug}`}
                            className="category-card"
                        >
                            <div className="category-card-image">
                                <img src={cat.image} alt={cat.name} />
                            </div>
                            <span className="category-card-name">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Recommended Products ── */}
            <section className="recommended-section container">
                <h2 className="section-title">Recommended for You</h2>
                <div className="recommended-scroll">
                    {RECOMMENDED.map((product) => (
                        <Link
                            key={product.id}
                            to={`/products/${product.id}`}
                            className="product-card"
                        >
                            <div className="product-card-image">
                                <img src={product.image} alt={product.name} />
                            </div>
                            <div className="product-card-info">
                                <h3 className="product-card-name">{product.name}</h3>
                                <span className="product-card-price">${product.price}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
