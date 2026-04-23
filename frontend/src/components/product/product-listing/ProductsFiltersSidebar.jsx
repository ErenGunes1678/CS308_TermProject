function ProductsFiltersSidebar({
  brands,
  priceRange,
  selectedBrands,
  priceOpen,
  brandOpen,
  onPriceRangeChange,
  onBrandToggle,
  onTogglePriceOpen,
  onToggleBrandOpen,
}) {
  return (
    <aside className="products-sidebar">
      <h3 className="products-sidebar__title">Filters</h3>

      <div className="filter-section">
        <button className="filter-section__header" onClick={onTogglePriceOpen}>
          <span className="filter-section__label">Price Range</span>
          <svg
            className={`filter-section__chevron ${priceOpen ? '' : 'filter-section__chevron--closed'}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {priceOpen && (
          <div className="filter-section__body">
            <input
              type="range"
              min="0"
              max="200"
              value={priceRange[1]}
              onChange={(event) =>
                onPriceRangeChange([priceRange[0], Number(event.target.value)])
              }
              className="price-slider"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(priceRange[1] / 200) * 100}%, var(--color-gray-200) ${(priceRange[1] / 200) * 100}%, var(--color-gray-200) 100%)`,
              }}
            />
            <div className="price-slider__labels">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        )}
      </div>

      <div className="filter-section">
        <button className="filter-section__header" onClick={onToggleBrandOpen}>
          <span className="filter-section__label">Brand</span>
          <svg
            className={`filter-section__chevron ${brandOpen ? '' : 'filter-section__chevron--closed'}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {brandOpen && (
          <div className="filter-section__body">
            {brands.map((brand) => (
              <label key={brand} className="brand-checkbox">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onBrandToggle(brand)}
                  className="brand-checkbox__input"
                />
                <span className="brand-checkbox__custom" />
                <span className="brand-checkbox__label">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export default ProductsFiltersSidebar;
