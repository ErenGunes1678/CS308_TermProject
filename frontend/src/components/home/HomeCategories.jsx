import { Link } from 'react-router-dom';

function HomeCategories({ categories }) {
  return (
    <section className="categories-section">
      <div className="container">
        <div className="categories-section__header">
          <p className="section-label">SHOP BY CATEGORY</p>
          <h2 className="section-title">Find Your Perfect Routine</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Explore our curated collections designed to make you feel beautiful inside and out.
          </p>
        </div>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link to={category.path} key={category.name} className="category-card">
              <div className="category-card__image-wrapper">
                <img src={category.image} alt={category.name} className="category-card__image" />
                <div className="category-card__overlay" />
              </div>
              <div className="category-card__content">
                <h3 className="category-card__name">{category.name}</h3>
                <p className="category-card__tagline">{category.tagline}</p>
                <span className="category-card__link">
                  Shop Now <span>&rsaquo;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeCategories;
