function ProductsToolbar({ productCount, viewMode, sortBy, onViewModeChange, onSortChange }) {
  return (
    <div className="products-toolbar">
      <p className="products-toolbar__count">
        <strong>{productCount}</strong> products
      </p>

      <div className="products-toolbar__right">
        <div className="view-toggle">
          <button
            className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            className={`view-toggle__btn ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`}
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="4" rx="1" />
              <rect x="3" y="10" width="18" height="4" rx="1" />
              <rect x="3" y="17" width="18" height="4" rx="1" />
            </svg>
          </button>
        </div>

        <div className="sort-dropdown">
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            className="sort-dropdown__select"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ProductsToolbar;
