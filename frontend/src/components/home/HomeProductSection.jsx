import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard/ProductCard';

function HomeProductSection({
  eyebrow,
  title,
  subtitle,
  products,
  centered = false,
  showViewAll = false,
  showShopAll = false,
}) {
  return (
    <section className="products-section">
      <div className="container">
        <div className={`products-section__header ${centered ? 'products-section__header--center' : ''}`}>
          <div style={centered ? { textAlign: 'center', width: '100%' } : undefined}>
            <p className="section-label">{eyebrow}</p>
            <h2 className="section-title">{title}</h2>
            {subtitle && (
              <p className="section-subtitle" style={{ margin: '0 auto' }}>
                {subtitle}
              </p>
            )}
          </div>

          {showViewAll && (
            <Link to="/products" className="products-section__view-all">
              View All <span>&rarr;</span>
            </Link>
          )}
        </div>

        <div className="home-products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {showShopAll && (
          <div className="products-section__cta">
            <Link to="/products" className="products-section__shop-all-btn">
              Shop All Products <span>&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeProductSection;
