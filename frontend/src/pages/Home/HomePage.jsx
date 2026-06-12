import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/categoryService';
import { getProducts } from '../../services/productService';
import { useWishlist } from '../../hooks/useWishlist';
import { formatCategoryLabel, normalizeSlug } from '../../utils/categoryUtils';
import '../../styles/product-card.css';
import './HomePage.css';

const getCategoryInitial = (name = '') => (formatCategoryLabel(name).charAt(0) || 'C').toUpperCase();

const buildHomeCategories = (categories = [], products = []) => {
  const bySlug = new Map();

  categories.forEach((category) => {
    const name = category.name || category.slug || '';
    const slug = normalizeSlug(name);
    if (!slug) return;
    bySlug.set(slug, {
      id: category.id || slug,
      slug,
      name: formatCategoryLabel(name),
      subcategories: new Set(),
    });
  });

  products.forEach((product) => {
    const slug = normalizeSlug(product.category);
    if (!slug) return;

    if (!bySlug.has(slug)) {
      bySlug.set(slug, {
        id: slug,
        slug,
        name: formatCategoryLabel(product.category),
        subcategories: new Set(),
      });
    }

    if (product.subcategory) {
      bySlug.get(slug).subcategories.add(product.subcategory);
    }
  });

  return Array.from(bySlug.values())
    .map((category) => ({
      ...category,
      subcategories: Array.from(category.subcategories),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { id, name, brand, price, originalPrice, rating, reviewCount, image, badge, discount, outOfStock, lowStock } = product;
  const badgeColors = { BEST: '#10B981', NEW: '#3B82F6', LIMITED: '#8B5CF6', SALE: '#EF4444' };

  const stars = [];
  const full = Math.floor(rating || 0);
  const hasHalf = (rating || 0) % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
    } else if (i === full && hasHalf) {
      stars.push(<svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1" opacity="0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
    } else {
      stars.push(<svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
    }
  }

  return (
    <div className={`product-card home-product-card ${outOfStock ? 'product-card--out-of-stock' : ''}`}>
      <Link to={`/product/${id}`} className="product-card__image-wrapper">
        <img src={image} alt={name} className="product-card__image" />
        <div className="product-card__badges">
          {badge && <span className="product-card__badge" style={{ background: badgeColors[badge] || '#6B7280' }}>{badge}</span>}
          {discount && <span className="product-card__badge product-card__badge--discount">-{discount}%</span>}
          {outOfStock && <span className="product-card__badge product-card__badge--oos">OUT OF STOCK</span>}
        </div>
        <button
          className={`product-card__wishlist ${isInWishlist(id) ? 'product-card__wishlist--active' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          aria-label="Add to wishlist"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist(id) ? 'var(--color-primary)' : 'none'} stroke={isInWishlist(id) ? 'var(--color-primary)' : 'currentColor'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
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

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [onSale, setOnSale] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getProducts()])
      .then(([cats, products]) => {
        setCategories(buildHomeCategories(cats, products));

        const saleProducts = products
          .filter((product) => Number(product.discount) > 0)
          .sort((a, b) => Number(b.discount) - Number(a.discount))
          .slice(0, 8);

        const ratedProducts = [...products]
          .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
          .slice(0, 8);

        setOnSale(saleProducts);
        setTopRated(ratedProducts);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="home__hero">
        <div className="home__hero-content">
          <p className="home__hero-eyebrow">New Season, New Glow</p>
          <h1 className="home__hero-title">Your Beauty,<br />Your Way</h1>
          <p className="home__hero-sub">Discover makeup &amp; skincare that celebrates you — curated for every skin type, tone, and style.</p>
          <div className="home__hero-actions">
            <Link to="/products" className="home__btn home__btn--primary">Shop Now</Link>
            <Link to="/products" className="home__btn home__btn--ghost">View All Products</Link>
          </div>
        </div>
        <div className="home__hero-visual">
          <div className="home__hero-blob" />
          <div className="home__hero-circle home__hero-circle--1" />
          <div className="home__hero-circle home__hero-circle--2" />
          <div className="home__hero-circle home__hero-circle--3" />
        </div>
      </section>

      {/* Perks bar */}
      <section className="home__perks">
        <div className="home__perks-inner">
          <div className="home__perk">
            <span className="home__perk-icon">🚚</span>
            <div>
              <strong>Free Shipping</strong>
              <p>On orders over $50</p>
            </div>
          </div>
          <div className="home__perk">
            <span className="home__perk-icon">↩️</span>
            <div>
              <strong>Easy Returns</strong>
              <p>30-day return policy</p>
            </div>
          </div>
          <div className="home__perk">
            <span className="home__perk-icon">🐰</span>
            <div>
              <strong>Cruelty-Free</strong>
              <p>Ethically sourced brands</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="home__section">
        <div className="home__section-header">
          <h2>Shop by Category</h2>
          <Link to="/products" className="home__see-all">See all →</Link>
        </div>
        {loading ? (
          <div className="home__category-grid home__category-grid--skeleton">
            {[...Array(4)].map((_, i) => <div key={i} className="home__category-skeleton" />)}
          </div>
        ) : (
          <div className="home__category-grid">
            {categories.map((cat) => (
              <Link key={cat.slug} to={`/category/${encodeURIComponent(cat.slug)}`} className="home__category-card">
                <span className="home__category-icon">{getCategoryInitial(cat.name)}</span>
                <span className="home__category-name">{cat.name}</span>
                {cat.subcategories?.length > 0 && (
                  <span className="home__category-sub">{cat.subcategories.length} types</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* On Sale */}
      <section className="home__section home__section--muted">
        <div className="home__section-header">
          <h2>On Sale</h2>
          <Link to="/products" className="home__see-all">See all →</Link>
        </div>
        {loading ? (
          <div className="home__products-scroll">
            {[...Array(4)].map((_, i) => <div key={i} className="home__product-skeleton" />)}
          </div>
        ) : (
          <div className="home__products-scroll">
            {onSale.length > 0 ? onSale.map((product) => (
              <ProductCard key={product.id} product={product} />
            )) : <p>No sale products available right now.</p>}
          </div>
        )}
      </section>

      {/* Top Rated */}
      <section className="home__section">
        <div className="home__section-header">
          <h2>Top Rated</h2>
          <Link to="/products" className="home__see-all">See all →</Link>
        </div>
        {loading ? (
          <div className="home__products-scroll">
            {[...Array(4)].map((_, i) => <div key={i} className="home__product-skeleton" />)}
          </div>
        ) : (
          <div className="home__products-scroll">
            {topRated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
