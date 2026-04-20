function ProductsEmptyState() {
  return (
    <div className="products-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <h3>No products found</h3>
      <p>Try adjusting your filters to find what you're looking for.</p>
    </div>
  );
}

export default ProductsEmptyState;
