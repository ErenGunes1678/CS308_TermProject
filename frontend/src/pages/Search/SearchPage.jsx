import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import { getProducts } from '../../services/productService';
import '../Products/ProductsPage.css';
import './SearchPage.css';

const RATING_OPTIONS = [
  { value: 4, label: '4 stars & above' },
  { value: 3, label: '3 stars & above' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'in-stock', label: 'In stock' },
  { value: 'out-of-stock', label: 'Out of stock' },
];

const CATEGORY_LABELS = {
  makeup: 'Makeup',
  skincare: 'Skincare',
  haircare: 'Haircare',
  'men-care': 'Men Care',
  fragrance: 'Fragrance',
};

const formatLabel = (value = '') =>
  value
    .toString()
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getCategoryLabel = (value = '') => CATEGORY_LABELS[value] || formatLabel(value);

const SectionToggle = ({ label, isOpen, onToggle }) => (
  <button className="filter-section__header" onClick={onToggle}>
    <span className="filter-section__label">{label}</span>
    <svg
      className={`filter-section__chevron ${isOpen ? '' : 'filter-section__chevron--closed'}`}
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
);

const buildProductQuery = ({
  query,
  priceRange,
  priceBounds,
  selectedRating,
  selectedAvailability,
  selectedCategory,
  selectedSubcategory,
  selectedBrands,
  sortBy,
}) => {
  const params = {};

  if (query.trim()) params.q = query.trim();
  if (selectedRating !== null) params.minRating = selectedRating;
  if (selectedAvailability.length > 0) params.availability = selectedAvailability.join(',');
  if (selectedCategory) params.category = selectedCategory;
  if (selectedSubcategory) params.subcategory = selectedSubcategory;
  if (selectedBrands.length > 0) params.brands = selectedBrands.join(',');
  if (priceRange[0] !== priceBounds.min) params.minPrice = priceRange[0];
  if (priceRange[1] !== priceBounds.max) params.maxPrice = priceRange[1];
  if (sortBy && sortBy !== 'featured') params.sortBy = sortBy;

  return params;
};

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [openSections, setOpenSections] = useState({
    rating: true,
    price: true,
    availability: true,
    category: true,
    subcategory: true,
    brand: true,
  });

  useEffect(() => {
    let isMounted = true;

    const loadCatalogProducts = async () => {
      setIsLoadingCatalog(true);
      setLoadError('');

      try {
        const apiProducts = await getProducts();

        if (isMounted) {
          setCatalogProducts(apiProducts);
        }
      } catch {
        if (isMounted) {
          setCatalogProducts([]);
          setLoadError('Products could not be loaded. Please make sure the backend is running.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingCatalog(false);
        }
      }
    };

    loadCatalogProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const priceBounds = useMemo(() => {
    if (!catalogProducts.length) {
      return { min: 0, max: 200 };
    }

    const prices = catalogProducts.map((product) => Number(product.price) || 0);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [catalogProducts]);

  useEffect(() => {
    setPriceRange((currentRange) => {
      if (currentRange[0] === 0 && currentRange[1] === 200) {
        return [priceBounds.min, priceBounds.max];
      }

      return [
        Math.max(priceBounds.min, Math.min(currentRange[0], currentRange[1])),
        Math.min(priceBounds.max, Math.max(currentRange[1], currentRange[0])),
      ];
    });
  }, [priceBounds]);

  const categories = useMemo(
    () =>
      Array.from(new Set(catalogProducts.map((product) => product.category).filter(Boolean))).sort(
        (a, b) => getCategoryLabel(a).localeCompare(getCategoryLabel(b))
      ),
    [catalogProducts]
  );

  const subcategoriesByCategory = useMemo(
    () =>
      catalogProducts.reduce((accumulator, product) => {
        if (!product.category || !product.subcategory) {
          return accumulator;
        }

        if (!accumulator[product.category]) {
          accumulator[product.category] = new Set();
        }

        accumulator[product.category].add(product.subcategory);
        return accumulator;
      }, {}),
    [catalogProducts]
  );

  const availableSubcategories = useMemo(() => {
    if (!selectedCategory || !subcategoriesByCategory[selectedCategory]) {
      return [];
    }

    return Array.from(subcategoriesByCategory[selectedCategory]).sort((a, b) =>
      formatLabel(a).localeCompare(formatLabel(b))
    );
  }, [selectedCategory, subcategoriesByCategory]);

  const brandOptions = useMemo(
    () =>
      Array.from(
        new Set(
          catalogProducts
            .filter((product) => !selectedCategory || product.category === selectedCategory)
            .filter((product) => !selectedSubcategory || product.subcategory === selectedSubcategory)
            .map((product) => product.brand)
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [catalogProducts, selectedCategory, selectedSubcategory]
  );

  useEffect(() => {
    if (selectedSubcategory && !availableSubcategories.includes(selectedSubcategory)) {
      setSelectedSubcategory('');
    }
  }, [availableSubcategories, selectedSubcategory]);

  useEffect(() => {
    setSelectedBrands((currentBrands) =>
      currentBrands.filter((brand) => brandOptions.includes(brand))
    );
  }, [brandOptions]);

  const hasActiveSearch = useMemo(() => {
    const hasPriceFilter =
      priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max;

    return Boolean(
      query.trim() ||
        selectedRating !== null ||
        selectedAvailability.length > 0 ||
        selectedCategory ||
        selectedSubcategory ||
        selectedBrands.length > 0 ||
        hasPriceFilter
    );
  }, [
    priceBounds.max,
    priceBounds.min,
    priceRange,
    query,
    selectedAvailability.length,
    selectedBrands.length,
    selectedCategory,
    selectedRating,
    selectedSubcategory,
  ]);

  const requestParams = useMemo(
    () =>
      buildProductQuery({
        query,
        priceRange,
        priceBounds,
        selectedRating,
        selectedAvailability,
        selectedCategory,
        selectedSubcategory,
        selectedBrands,
        sortBy,
      }),
    [
      priceBounds,
      priceRange,
      query,
      selectedAvailability,
      selectedBrands,
      selectedCategory,
      selectedRating,
      selectedSubcategory,
      sortBy,
    ]
  );

  useEffect(() => {
    let isMounted = true;

    const loadSearchResults = async () => {
      if (!hasActiveSearch) {
        setProducts([]);
        setIsLoadingResults(false);
        return;
      }

      setIsLoadingResults(true);
      setLoadError('');

      try {
        const apiProducts = await getProducts(requestParams);

        if (isMounted) {
          setProducts(apiProducts);
        }
      } catch {
        if (isMounted) {
          setProducts([]);
          setLoadError('Search results could not be loaded. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingResults(false);
        }
      }
    };

    loadSearchResults();

    return () => {
      isMounted = false;
    };
  }, [hasActiveSearch, requestParams]);

  const heroInfo = query
    ? {
        name: `Results for "${query}"`,
        tagline: 'Search across the catalog and refine with filters.',
      }
    : {
        name: 'Search Products',
        tagline: 'Use the navbar search and filter options to request matching products.',
      };

  const toggleSection = (section) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const handleAvailabilityToggle = (value) => {
    setSelectedAvailability((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]
    );
  };

  const handlePriceRangeChange = (nextRange) => {
    setPriceRange([
      Math.max(priceBounds.min, Math.min(nextRange[0], nextRange[1])),
      Math.min(priceBounds.max, Math.max(nextRange[0], nextRange[1])),
    ]);
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('q');
    setSearchParams(nextParams);
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSelectedRating(null);
    setSelectedAvailability([]);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedBrands([]);
    setSortBy('featured');
    setViewMode('grid');
  };

  const isLoading = isLoadingCatalog || isLoadingResults;
  const sliderPercentage =
    ((priceRange[1] - priceBounds.min) / Math.max(priceBounds.max - priceBounds.min, 1)) * 100;

  return (
    <div className="products-page search-page">
      <section className="products-hero">
        <div className="products-hero__overlay" />
        <div className="products-hero__content container">
          <h1 className="products-hero__title">{heroInfo.name}</h1>
          <p className="products-hero__tagline">{heroInfo.tagline}</p>
        </div>
      </section>

      <div className="products-page__body container">
        <aside className="products-sidebar">
          <div className="products-sidebar__header">
            <h3 className="products-sidebar__title">Filters</h3>
            <button className="search-page__clear-btn" onClick={clearFilters}>
              Clear all
            </button>
          </div>

          <div className="filter-section">
            <SectionToggle
              label="Rate"
              isOpen={openSections.rating}
              onToggle={() => toggleSection('rating')}
            />
            {openSections.rating && (
              <div className="filter-section__body">
                {RATING_OPTIONS.map((option) => (
                  <label key={option.value} className="filter-choice">
                    <input
                      type="checkbox"
                      checked={selectedRating === option.value}
                      onChange={() =>
                        setSelectedRating((current) => (current === option.value ? null : option.value))
                      }
                      className="filter-choice__input"
                    />
                    <span className="filter-choice__custom filter-choice__custom--radio" />
                    <span className="filter-choice__label">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-section">
            <SectionToggle
              label="Price Range"
              isOpen={openSections.price}
              onToggle={() => toggleSection('price')}
            />
            {openSections.price && (
              <div className="filter-section__body">
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={priceRange[1]}
                  onChange={(event) =>
                    handlePriceRangeChange([priceRange[0], Number(event.target.value)])
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
              </div>
            )}
          </div>

          <div className="filter-section">
            <SectionToggle
              label="Availability"
              isOpen={openSections.availability}
              onToggle={() => toggleSection('availability')}
            />
            {openSections.availability && (
              <div className="filter-section__body">
                {AVAILABILITY_OPTIONS.map((option) => (
                  <label key={option.value} className="brand-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedAvailability.includes(option.value)}
                      onChange={() => handleAvailabilityToggle(option.value)}
                      className="brand-checkbox__input"
                    />
                    <span className="brand-checkbox__custom" />
                    <span className="brand-checkbox__label">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-section">
            <SectionToggle
              label="Category"
              isOpen={openSections.category}
              onToggle={() => toggleSection('category')}
            />
            {openSections.category && (
              <div className="filter-section__body">
                {categories.map((category) => (
                  <label key={category} className="filter-choice">
                    <input
                      type="checkbox"
                      checked={selectedCategory === category}
                      onChange={() => {
                        setSelectedCategory((current) => {
                          const nextCategory = current === category ? '' : category;
                          setSelectedSubcategory('');
                          return nextCategory;
                        });
                      }}
                      className="filter-choice__input"
                    />
                    <span className="filter-choice__custom filter-choice__custom--radio" />
                    <span className="filter-choice__label">{getCategoryLabel(category)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-section">
            <SectionToggle
              label="Subcategory"
              isOpen={openSections.subcategory}
              onToggle={() => toggleSection('subcategory')}
            />
            {openSections.subcategory && (
              <div className="filter-section__body">
                {selectedCategory ? (
                  availableSubcategories.length > 0 ? (
                    availableSubcategories.map((subcategory) => (
                      <label key={subcategory} className="filter-choice">
                        <input
                          type="checkbox"
                          checked={selectedSubcategory === subcategory}
                          onChange={() =>
                            setSelectedSubcategory((current) =>
                              current === subcategory ? '' : subcategory
                            )
                          }
                          className="filter-choice__input"
                        />
                        <span className="filter-choice__custom filter-choice__custom--radio" />
                        <span className="filter-choice__label">{formatLabel(subcategory)}</span>
                      </label>
                    ))
                  ) : (
                    <p className="search-page__helper-text">No subcategories available.</p>
                  )
                ) : (
                  <p className="search-page__helper-text">
                    Select a category to see its subcategories.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="filter-section">
            <button className="filter-section__header" onClick={() => toggleSection('brand')}>
              <span className="filter-section__label">Brand Name</span>
              <svg
                className={`filter-section__chevron ${openSections.brand ? '' : 'filter-section__chevron--closed'}`}
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

            {openSections.brand && (
              <div className="filter-section__body">
                {brandOptions.map((brand) => (
                  <label key={brand} className="brand-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
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

        <div className="products-main">
          <div className="products-toolbar">
            <p className="products-toolbar__count">
              <strong>{isLoading ? 'Loading' : products.length}</strong> products
            </p>

            <div className="products-toolbar__right">
              <div className="view-toggle">
                <button
                  className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`}
                  onClick={() => setViewMode('grid')}
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
                  onClick={() => setViewMode('list')}
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
                  onChange={(event) => setSortBy(event.target.value)}
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

          {!isLoading && (
            <div className="search-page__summary">
              <p className="products-toolbar__count">
                {hasActiveSearch ? (
                  <>
                    Showing <strong>{products.length}</strong> products returned by search
                    {query ? ` for "${query}"` : ''}
                  </>
                ) : (
                  'Use the navbar search or choose filters to request products.'
                )}
              </p>
            </div>
          )}

          {loadError && <p className="products-toolbar__count">{loadError}</p>}

          {!isLoading && hasActiveSearch && products.length > 0 ? (
            <div className={`products-grid ${viewMode === 'list' ? 'products-grid--list' : ''}`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : !isLoading && !hasActiveSearch ? (
            <div className="products-empty search-page__empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3>Search for a product</h3>
              <p>Use the navbar search, or choose filters to request matching products.</p>
            </div>
          ) : (
            !isLoading && (
              <div className="products-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <h3>No products found</h3>
                <p>Try adjusting your filters to find what you're looking for.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
