import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductsEmptyState from "../../components/product/product-listing/ProductsEmptyState";
import ProductsGrid from "../../components/product/product-listing/ProductsGrid";
import ProductsHero from "../../components/product/product-listing/ProductsHero";
import ProductsToolbar from "../../components/product/product-listing/ProductsToolbar";
import { getProducts } from "../../services/productService";
import "../Products/ProductsPage.css";
import "./SearchPage.css";

const RATING_OPTIONS = [
  { value: 4, label: "4 stars & above" },
  { value: 3, label: "3 stars & above" },
];

const AVAILABILITY_OPTIONS = [
  { value: "in-stock", label: "In stock" },
  { value: "out-of-stock", label: "Out of stock" },
];

const CATEGORY_LABELS = {
  makeup: "Makeup",
  skincare: "Skincare",
  haircare: "Haircare",
  "men-care": "Men Care",
  fragrance: "Fragrance",
};

const formatLabel = (value = "") =>
  value
    .toString()
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getCategoryLabel = (value = "") => CATEGORY_LABELS[value] || formatLabel(value);

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
      setSelectedSubcategory("");
    }
  }, [availableSubcategories, selectedSubcategory]);

  useEffect(() => {
    setSelectedBrands((currentBrands) =>
      currentBrands.filter((brand) => brandOptions.includes(brand))
    );
  }, [brandOptions]);

  const hasActiveSearch = Boolean(
    query.trim() ||
      selectedRating !== null ||
      selectedAvailability.length > 0 ||
      selectedCategory ||
      selectedSubcategory ||
      selectedBrands.length > 0 ||
      priceRange[0] !== priceBounds.min ||
      priceRange[1] !== priceBounds.max
  );

  const requestParams = useMemo(() => {
    const params = {};

    if (query.trim()) params.q = query.trim();
    if (selectedRating !== null) params.minRating = selectedRating;
    if (selectedAvailability.length > 0) params.availability = selectedAvailability.join(",");
    if (selectedCategory) params.category = selectedCategory;
    if (selectedSubcategory) params.subcategory = selectedSubcategory;
    if (selectedBrands.length > 0) params.brands = selectedBrands.join(",");
    if (priceRange[0] !== priceBounds.min) params.minPrice = priceRange[0];
    if (priceRange[1] !== priceBounds.max) params.maxPrice = priceRange[1];
    if (sortBy && sortBy !== "featured") params.sortBy = sortBy;

    return params;
  }, [
    priceBounds.max,
    priceBounds.min,
    priceRange,
    query,
    selectedAvailability,
    selectedBrands,
    selectedCategory,
    selectedRating,
    selectedSubcategory,
    sortBy,
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadSearchResults = async () => {
      if (!hasActiveSearch) {
        setProducts([]);
        setIsLoadingResults(false);
        return;
      }

      setIsLoadingResults(true);
      setLoadError("");

      try {
        const apiProducts = await getProducts(requestParams);

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

    return () => {
      isMounted = false;
    };
  }, [hasActiveSearch, requestParams]);

  const heroInfo = query
    ? {
        name: `Results for "${query}"`,
        tagline: "Search across the catalog and refine with filters.",
      }
    : {
        name: "Search Products",
        tagline: "Use the search field and filters to find matching products.",
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
  };

  const isLoading = isLoadingCatalog || isLoadingResults;

  return (
    <div className="products-page search-page">
      <ProductsHero categoryInfo={heroInfo} />

      <div className="products-page__body container">
        <aside className="products-sidebar">
          <div className="products-sidebar__header">
            <h3 className="products-sidebar__title">Filters</h3>
            <button type="button" className="search-page__clear-btn" onClick={clearFilters}>
              Clear all
            </button>
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
                <span className="filter-choice__label">{getCategoryLabel(category)}</span>
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
            productCount={isLoading ? "Loading" : products.length}
            viewMode={viewMode}
            sortBy={sortBy}
            onViewModeChange={setViewMode}
            onSortChange={setSortBy}
          />

          {!isLoading ? (
            <div className="search-page__summary">
              <p className="products-toolbar__count">
                {hasActiveSearch ? (
                  <>
                    Showing <strong>{products.length}</strong> matching products
                    {query ? ` for "${query}"` : ""}
                  </>
                ) : (
                  "Use the search field or choose filters to request products."
                )}
              </p>
            </div>
          ) : null}

          {loadError ? <p className="products-toolbar__count">{loadError}</p> : null}

          {!isLoading && hasActiveSearch && products.length > 0 ? (
            <ProductsGrid products={products} viewMode={viewMode} />
          ) : !isLoading && !hasActiveSearch ? (
            <div className="products-empty search-page__empty-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-gray-300)"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3>Search for a product</h3>
              <p>Use the search field or filters to find matching items in the catalog.</p>
            </div>
          ) : (
            !isLoading && <ProductsEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
