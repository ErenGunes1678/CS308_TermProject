import { Link } from 'react-router-dom';

function HomePromoBanner() {
  return (
    <section className="promo-banner">
      <div className="container">
        <div className="promo-banner__card">
          <div className="promo-banner__overlay" />
          <div className="promo-banner__content">
            <span className="promo-banner__badge">LIMITED TIME OFFER</span>
            <h2 className="promo-banner__title">Skincare Bundle — Save 25%</h2>
            <p className="promo-banner__text">Complete your routine with our curated skincare set</p>
            <Link to="/products?bundle=skincare" className="promo-banner__btn">
              Shop Bundle <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePromoBanner;
