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
  headerAction,
  beforeSections,
  priceContentFooter,
  afterPriceSections,
  brandLabel = 'Brand',
  priceMin = 0,
  priceMax = 200,
}) {
  const sliderPercentage = ((priceRange[1] - priceMin) / Math.max(priceMax - priceMin, 1)) * 100;

  return (
    <aside className="products-sidebar">
      <div className="products-sidebar__header">
        <h3 className="products-sidebar__title">Filters</h3>
        {headerAction}
      </div>

      {beforeSections}

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
              min={priceMin}
              max={priceMax}
              value={priceRange[1]}
              onChange={(event) =>
                onPriceRangeChange([priceRange[0], Number(event.target.value)])
              }
              className="price-slider"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${sliderPercentage}%, var(--color-gray-200) ${sliderPercentage}%, var(--color-gray-200) 100%)`,
              }}
            />
            <div className="price-slider__labels">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
            {priceContentFooter}
          </div>
        )}
      </div>

      {afterPriceSections}

      <div className="filter-section">
        <button className="filter-section__header" onClick={onToggleBrandOpen}>
          <span className="filter-section__label">{brandLabel}</span>
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
