function ProductsHero({ categoryInfo }) {
  return (
    <section className="products-hero">
      <div className="products-hero__overlay" />
      <div className="products-hero__content container">
        <h1 className="products-hero__title">
          {categoryInfo ? categoryInfo.name : 'All Products'}
        </h1>
        <p className="products-hero__tagline">
          {categoryInfo ? categoryInfo.tagline : 'Browse our full collection'}
        </p>
      </div>
    </section>
  );
}

export default ProductsHero;
