import ProductCard from '../product/ProductCard/ProductCard';

function ProductsGrid({ products, viewMode }) {
  return (
    <div className={`products-grid ${viewMode === 'list' ? 'products-grid--list' : ''}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductsGrid;
