import { Link } from 'react-router-dom';

function HomeHero() {
  return (
    <section className="hero">
      <div className="hero__overlay" />
      <div className="hero__content container">
        <span className="hero__badge">✨ NEW SPRING COLLECTION 2026</span>
        <h1 className="hero__title">
          Your Beauty,
          <br />
          <span className="hero__title-accent">Elevated</span>
        </h1>
        <p className="hero__subtitle">
          Discover premium makeup, skincare, haircare and grooming essentials curated for the modern beauty lover.
        </p>
        <div className="hero__buttons">
          <Link to="/products" className="hero__btn hero__btn--primary">
            Shop Now <span>&rarr;</span>
          </Link>
          <Link to="/category/skincare" className="hero__btn hero__btn--secondary">
            Explore Skincare
          </Link>
        </div>
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-value">50K+</span>
            <span className="hero__stat-label">Happy Customers</span>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-value">200+</span>
            <span className="hero__stat-label">Premium Products</span>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-value">4.9★</span>
            <span className="hero__stat-label">Average Rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
