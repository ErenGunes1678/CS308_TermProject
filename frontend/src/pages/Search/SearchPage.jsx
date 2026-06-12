import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { useWishlist } from "../../hooks/useWishlist";
import { searchProducts } from "../../services/searchService";
import { PRODUCT_REVIEW_UPDATED_EVENT } from "../../utils/reviewUpdates";
import { formatCategoryLabel } from "../../utils/categoryUtils";
import "../../styles/product-card.css";
import "../Products/ProductsPage.css";
import "./SearchPage.css";

const RATING_OPTIONS = [
  { value: 4, label: "4 stars & above" },
  { value: 3, label: "3 stars & above" },
];

const AVAILABILITY_OPTIONS = [
  { value: "inStock", label: "In stock" },
];

function FilterSection({ label, isOpen, onToggle, children }) {
  return (
    <div className="filter-section">
      <button type="button" className="filter-section__header" onClick={onToggle}>
        <span className="filter-section__label">{label}</span>
        <svg
          className={`filter-section__chevron ${isOpen ? "" : "filter-section__chevron--closed"}`}
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
      {isOpen ? <div className="filter-section__body">{children}</div> : null}
    </div>
  );
}

function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { id, name, brand, price, originalPrice, rating, reviewCount, image, badge, discount, outOfStock, lowStock } = product;
  const badgeColors = { BEST: '#10B981', NEW: '#3B82F6', LIMITED: '#8B5CF6', SALE: '#EF4444' };
  const stars = [];
  const full = Math.floor(rating || 0);
  const hasHalf = (rating || 0) % 1 >= 0.5;
  for (let i = 0; i < 5; i += 1) {
    if (i < full) {
      stars.push(<svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
    } else if (i === full && hasHalf) {
      stars.push(<svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1" opacity="0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
    } else {
      stars.push(<svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
    }
  }
  return (
    <div className={`product-card ${outOfStock ? 'product-card--out-of-stock' : ''}`}>
      <Link to={`/product/${id}`} className="product-card__image-wrapper">
        <img src={image} alt={name} className="product-card__image" />
        <div className="product-card__badges">
          {badge && <span className="product-card__badge" style={{ background: badgeColors[badge] || '#6B7280' }}>{badge}</span>}
          {discount && <span className="product-card__badge product-card__badge--discount">-{discount}%</span>}
          {outOfStock && <span className="product-card__badge product-card__badge--oos">OUT OF STOCK</span>}
        </div>
        <button className={`product-card__wishlist ${isInWishlist(id) ? 'product-card__wishlist--active' : ''}`} onClick={(event) => { event.preventDefault(); toggleWishlist(product); }} aria-label="Add to wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist(id) ? 'var(--color-primary)' : 'none'} stroke={isInWishlist(id) ? 'var(--color-primary)' : 'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        </button>
        {outOfStock && <div className="product-card__oos-overlay" />}
      </Link>
      <div className="product-card__info">
        <span className="product-card__brand">{brand}</span>
        <Link to={`/product/${id}`} className="product-card__name">{name}</Link>
        <div className="product-card__rating">
          <div className="product-card__stars">{stars}</div>
          <span className="product-card__review-count">({reviewCount})</span>
        </div>
        <div className="product-card__price-row">
          <span className="product-card__price">${price}</span>
          {originalPrice && <span className="product-card__original-price">${originalPrice}</span>}
          {lowStock && <span className="product-card__low-stock">Only {lowStock} left</span>}
        </div>
      </div>
    </div>
  );
}

function ProductsHero({ categoryInfo }) {
  return (
    <section className="products-hero">
      <div className="products-hero__overlay" />
      <div className="products-hero__content container">
        <h1 className="products-hero__title">{categoryInfo ? categoryInfo.name : 'All Products'}</h1>
        <p className="products-hero__tagline">{categoryInfo ? categoryInfo.tagline : 'Browse our full collection'}</p>
      </div>
    </section>
  );
}

function ProductsToolbar({ productCount, viewMode, sortBy, onViewModeChange, onSortChange }) {
  return (
    <div className="products-toolbar">
      <p className="products-toolbar__count"><strong>{productCount}</strong> products</p>
      <div className="products-toolbar__right">
        <div className="view-toggle">
          <button className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`} onClick={() => onViewModeChange('grid')} aria-label="Grid view">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
          </button>
          <button className={`view-toggle__btn ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`} onClick={() => onViewModeChange('list')} aria-label="List view">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="4" rx="1" /><rect x="3" y="10" width="18" height="4" rx="1" /><rect x="3" y="17" width="18" height="4" rx="1" /></svg>
          </button>
        </div>
        <div className="sort-dropdown">
          <select value={sortBy} onChange={(event) => onSortChange(event.target.value)} className="sort-dropdown__select">
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

function ProductsGrid({ products, viewMode }) {
  return (
    <div className={`products-grid ${viewMode === 'list' ? 'products-grid--list' : ''}`}>
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}

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

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [appliedFilters, setAppliedFilters] = useState({
    selectedRating: null,
    selectedAvailability: [],
    selectedCategory: "",
    selectedSubcategory: "",
    selectedBrands: [],
    minPrice: null,
    maxPrice: null,
  });
  const [openSections, setOpenSections] = useState({
    rating: true,
    price: true,
    availability: true,
    category: true,
    subcategory: true,
    brand: true,
  });

  const query = searchParams.get("q") || "";

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoadingCatalog(true);
      setLoadError("");

      try {
        const apiProducts = await getProducts();

        if (isMounted) {
          setCatalogProducts(apiProducts);
        }
      } catch {
        if (isMounted) {
          setCatalogProducts([]);
          setLoadError("Products could not be loaded. Please make sure the backend is running.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingCatalog(false);
        }
      }
    };

    loadProducts();

    const handleProductReviewUpdated = () => {
      loadProducts();
    };

    window.addEventListener(PRODUCT_REVIEW_UPDATED_EVENT, handleProductReviewUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener(PRODUCT_REVIEW_UPDATED_EVENT, handleProductReviewUpdated);
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

  useEffect(() => {
    setAppliedFilters((current) => {
      const nextMin =
        current.minPrice === null ? priceBounds.min : Math.max(priceBounds.min, current.minPrice);
      const nextMax =
        current.maxPrice === null ? priceBounds.max : Math.min(priceBounds.max, current.maxPrice);

      return {
        ...current,
        minPrice: nextMin,
        maxPrice: nextMax,
      };
    });
  }, [priceBounds]);

  const categories = useMemo(
    () =>
      Array.from(new Set(catalogProducts.map((product) => product.category).filter(Boolean))).sort(
        (a, b) => formatCategoryLabel(a).localeCompare(formatCategoryLabel(b))
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
      formatCategoryLabel(a).localeCompare(formatCategoryLabel(b))
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
      setSelectedSubcategory("");
    }
  }, [availableSubcategories, selectedSubcategory]);

  useEffect(() => {
    setSelectedBrands((currentBrands) =>
      currentBrands.filter((brand) => brandOptions.includes(brand))
    );
  }, [brandOptions]);

  const hasActiveSearchCriteria = Boolean(
    query.trim() ||
      appliedFilters.selectedRating !== null ||
      appliedFilters.selectedAvailability.length > 0 ||
      appliedFilters.selectedCategory ||
      appliedFilters.selectedSubcategory ||
      appliedFilters.selectedBrands.length > 0 ||
      (appliedFilters.minPrice !== null && appliedFilters.minPrice !== priceBounds.min) ||
      (appliedFilters.maxPrice !== null && appliedFilters.maxPrice !== priceBounds.max)
  );

  const requestParams = useMemo(() => {
    const params = {};

    if (query.trim()) params.q = query.trim();
    if (appliedFilters.selectedRating !== null) params.minRating = appliedFilters.selectedRating;
    if (appliedFilters.selectedAvailability.includes("inStock")) {
      params.inStock = "true";
    }
    if (appliedFilters.selectedCategory) params.category = appliedFilters.selectedCategory;
    if (appliedFilters.selectedSubcategory) params.subcategory = appliedFilters.selectedSubcategory;
    if (appliedFilters.selectedBrands.length > 0) {
      params.brands = appliedFilters.selectedBrands.join(",");
    }
    if (appliedFilters.minPrice !== null && appliedFilters.minPrice !== priceBounds.min) {
      params.minPrice = appliedFilters.minPrice;
    }
    if (appliedFilters.maxPrice !== null && appliedFilters.maxPrice !== priceBounds.max) {
      params.maxPrice = appliedFilters.maxPrice;
    }
    if (sortBy === "newest") params.sortBy = "newest";
    if (sortBy === "price-low") params.sortBy = "price_asc";
    if (sortBy === "price-high") params.sortBy = "price_desc";
    if (sortBy === "rating") params.sortBy = "rating_desc";

    return params;
  }, [
    appliedFilters,
    priceBounds.max,
    priceBounds.min,
    query,
    sortBy,
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadSearchResults = async () => {
      setIsLoadingResults(true);
      setLoadError("");

      try {
        const apiProducts = await searchProducts(requestParams);

        if (isMounted) {
          setProducts(apiProducts);
        }
      } catch {
        if (isMounted) {
          setProducts([]);
          setLoadError("Search results could not be loaded. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingResults(false);
        }
      }
    };

    loadSearchResults();

    const handleProductReviewUpdated = () => {
      loadSearchResults();
    };

    window.addEventListener(PRODUCT_REVIEW_UPDATED_EVENT, handleProductReviewUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener(PRODUCT_REVIEW_UPDATED_EVENT, handleProductReviewUpdated);
    };
  }, [requestParams]);

  const heroInfo = query
    ? {
        name: `Results for "${query}"`,
        tagline: "Search across the catalog and refine with filters.",
      }
    : {
        name: "All Products",
        tagline: "Browse the full catalog or refine it with search and filters.",
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

  const applyFilters = () => {
    setAppliedFilters({
      selectedRating,
      selectedAvailability: [...selectedAvailability],
      selectedCategory,
      selectedSubcategory,
      selectedBrands: [...selectedBrands],
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSelectedRating(null);
    setSelectedAvailability([]);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrands([]);
    setSortBy("featured");
    setViewMode("grid");
    setAppliedFilters({
      selectedRating: null,
      selectedAvailability: [],
      selectedCategory: "",
      selectedSubcategory: "",
      selectedBrands: [],
      minPrice: priceBounds.min,
      maxPrice: priceBounds.max,
    });
  };

  const isInitialLoading = isLoadingCatalog && products.length === 0;
  const isRefreshingResults = isLoadingResults && products.length > 0;

  return (
    <div className="products-page search-page">
      <ProductsHero categoryInfo={heroInfo} />

      <div className="products-page__body container">
        <aside className="products-sidebar">
          <div className="products-sidebar__header">
            <h3 className="products-sidebar__title">Filters</h3>
            <div className="search-page__actions">
              <button type="button" className="search-page__apply-btn" onClick={applyFilters}>
                Apply
              </button>
              <button type="button" className="search-page__clear-btn" onClick={clearFilters}>
                Clear all
              </button>
            </div>
          </div>

          <FilterSection
            label="Rate"
            isOpen={openSections.rating}
            onToggle={() => toggleSection("rating")}
          >
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
          </FilterSection>

          <FilterSection
            label="Price Range"
            isOpen={openSections.price}
            onToggle={() => toggleSection("price")}
          >
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={priceRange[1]}
              onChange={(event) => setPriceRange([priceRange[0], Number(event.target.value)])}
              className="price-slider"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${
                  ((priceRange[1] - priceBounds.min) / Math.max(priceBounds.max - priceBounds.min, 1)) *
                  100
                }%, var(--color-gray-200) ${
                  ((priceRange[1] - priceBounds.min) / Math.max(priceBounds.max - priceBounds.min, 1)) *
                  100
                }%, var(--color-gray-200) 100%)`,
              }}
            />
            <div className="price-slider__labels">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </FilterSection>

          <FilterSection
            label="Availability"
            isOpen={openSections.availability}
            onToggle={() => toggleSection("availability")}
          >
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
          </FilterSection>

          <FilterSection
            label="Category"
            isOpen={openSections.category}
            onToggle={() => toggleSection("category")}
          >
            {categories.map((category) => (
              <label key={category} className="filter-choice">
                <input
                  type="checkbox"
                  checked={selectedCategory === category}
                  onChange={() => {
                    setSelectedCategory((current) => {
                      const nextCategory = current === category ? "" : category;
                      setSelectedSubcategory("");
                      return nextCategory;
                    });
                  }}
                  className="filter-choice__input"
                />
                <span className="filter-choice__custom filter-choice__custom--radio" />
                <span className="filter-choice__label">{formatCategoryLabel(category)}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection
            label="Subcategory"
            isOpen={openSections.subcategory}
            onToggle={() => toggleSection("subcategory")}
          >
            {selectedCategory ? (
              availableSubcategories.length > 0 ? (
                availableSubcategories.map((subcategory) => (
                  <label key={subcategory} className="filter-choice">
                    <input
                      type="checkbox"
                      checked={selectedSubcategory === subcategory}
                      onChange={() =>
                        setSelectedSubcategory((current) =>
                          current === subcategory ? "" : subcategory
                        )
                      }
                      className="filter-choice__input"
                    />
                    <span className="filter-choice__custom filter-choice__custom--radio" />
                    <span className="filter-choice__label">{formatCategoryLabel(subcategory)}</span>
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
          </FilterSection>

          <FilterSection
            label="Brand"
            isOpen={openSections.brand}
            onToggle={() => toggleSection("brand")}
          >
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
          </FilterSection>
        </aside>

        <div className="products-main">
          <ProductsToolbar
            productCount={isInitialLoading ? "Loading" : products.length}
            viewMode={viewMode}
            sortBy={sortBy}
            onViewModeChange={setViewMode}
            onSortChange={setSortBy}
          />

          {!isInitialLoading ? (
            <div className="search-page__summary">
              <p className="products-toolbar__count">
                {hasActiveSearchCriteria ? (
                  <>
                    Showing <strong>{products.length}</strong> matching products
                    {query ? ` for "${query}"` : ""}
                    {isRefreshingResults ? "..." : ""}
                  </>
                ) : (
                  <>
                    Showing <strong>{products.length}</strong> products
                    {isRefreshingResults ? "..." : ""}
                  </>
                )}
              </p>
            </div>
          ) : null}

          {loadError ? (
            <div className="site-inline-message site-inline-message--error" role="alert">
              {loadError}
            </div>
          ) : null}

          {products.length > 0 ? (
            <ProductsGrid products={products} viewMode={viewMode} />
          ) : (
            !isInitialLoading && !isLoadingResults && <ProductsEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
