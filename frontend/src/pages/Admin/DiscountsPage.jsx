import { useEffect, useState, useMemo } from "react";
import { Search, Check, X } from "lucide-react";
import { getManageProducts, updateProductPrice } from "../../services/productService";
import "./DiscountsPage.css";

/* ─── helpers ────────────────────────────────────────────────────────────── */

export default function DiscountsPage() {
  const [products, setProducts]     = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [productQuery, setProductQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productDiscount, setProductDiscount] = useState("");
  const [productMessage, setProductMessage] = useState("");
  const [productError, setProductError] = useState("");
  const [isApplyingProductDiscount, setIsApplyingProductDiscount] = useState(false);
  const [isRemovingProductDiscount, setIsRemovingProductDiscount] = useState(false);
  const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);

  const selectedProductIdSet = useMemo(
    () => new Set(selectedProductIds),
    [selectedProductIds]
  );

  const discountedProducts = useMemo(
    () => products.filter((product) => Number(product.discount) > 0),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = productQuery.trim().toLowerCase();
    const visibleProducts = products.filter((product) => Number(product.price) > 0);

    if (!normalizedQuery) {
      return [...visibleProducts]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 12);
    }

    return visibleProducts
      .filter((product) => (
        product.name?.toLowerCase().includes(normalizedQuery) ||
        product.brand?.toLowerCase().includes(normalizedQuery) ||
        product.category?.toLowerCase().includes(normalizedQuery) ||
        product.model?.toLowerCase().includes(normalizedQuery)
      ))
      .slice(0, 18);
  }, [productQuery, products]);

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedProductIdSet.has(product.id)),
    [products, selectedProductIdSet]
  );

  const selectedDiscountedProducts = useMemo(
    () => selectedProducts.filter((product) => Number(product.discount) > 0 && Number(product.originalPrice) > 0),
    [selectedProducts]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchDiscountData = async () => {
      try {
        const nextProducts = await getManageProducts();
        if (!isMounted) return;
        setProducts(Array.isArray(nextProducts) ? nextProducts : []);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDiscountData();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleProductSelection = (productId) => {
    setProductMessage("");
    setProductError("");
    setSelectedProductIds((current) => (
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    ));
  };

  const clearProductSelection = () => {
    setSelectedProductIds([]);
    setProductMessage("");
    setProductError("");
  };

  const handleRefreshProducts = async () => {
    try {
      setIsRefreshingProducts(true);
      setProductError("");
      const nextProducts = await getManageProducts();
      setProducts(Array.isArray(nextProducts) ? nextProducts : []);
      setProductMessage("Product list refreshed from backend.");
    } catch (error) {
      setProductError(error?.response?.data?.message || "Unable to refresh products.");
    } finally {
      setIsRefreshingProducts(false);
    }
  };

  const handleApplyProductDiscount = async () => {
    setProductMessage("");
    setProductError("");

    const discountRate = Number(productDiscount);
    if (!selectedProductIds.length) {
      setProductError("Select at least one product.");
      return;
    }
    if (!Number.isFinite(discountRate) || discountRate <= 0 || discountRate >= 100) {
      setProductError("Enter a discount percentage between 1 and 99.");
      return;
    }

    try {
      setIsApplyingProductDiscount(true);
      const updatedProducts = await Promise.all(
        selectedProducts.map((product) => {
          const basePrice = Number(product.originalPrice) > Number(product.price)
            ? Number(product.originalPrice)
            : Number(product.price);
          const nextPrice = Number((basePrice * (1 - discountRate / 100)).toFixed(2));

          return updateProductPrice(product.id, {
            price: nextPrice,
            original_price: basePrice,
          });
        })
      );

      const updatedById = new Map(updatedProducts.map((product) => [product.id, product]));
      setProducts((current) => current.map((product) => updatedById.get(product.id) || product));
      setProductMessage(`${updatedProducts.length} product${updatedProducts.length === 1 ? "" : "s"} updated with ${discountRate}% discount.`);
      setProductDiscount("");
      setSelectedProductIds([]);
    } catch (error) {
      setProductError(error?.response?.data?.message || "Unable to apply product discount right now.");
    } finally {
      setIsApplyingProductDiscount(false);
    }
  };

  const removeProductDiscounts = async (productsToUpdate) => {
    setProductMessage("");
    setProductError("");

    const discountedToUpdate = productsToUpdate.filter(
      (product) => Number(product.discount) > 0 && Number(product.originalPrice) > 0
    );

    if (!discountedToUpdate.length) {
      setProductError("Select at least one discounted product.");
      return;
    }

    try {
      setIsRemovingProductDiscount(true);
      const updatedProducts = await Promise.all(
        discountedToUpdate.map((product) =>
          updateProductPrice(product.id, {
            price: Number(product.originalPrice),
            original_price: null,
          })
        )
      );

      const updatedById = new Map(updatedProducts.map((product) => [product.id, product]));
      setProducts((current) => current.map((product) => updatedById.get(product.id) || product));
      setProductMessage(`Discount removed from ${updatedProducts.length} product${updatedProducts.length === 1 ? "" : "s"}.`);
      setSelectedProductIds((current) =>
        current.filter((id) => !updatedById.has(id))
      );
    } catch (error) {
      setProductError(error?.response?.data?.message || "Unable to remove product discount right now.");
    } finally {
      setIsRemovingProductDiscount(false);
    }
  };

  const handleRemoveSelectedDiscounts = () => {
    removeProductDiscounts(selectedDiscountedProducts);
  };

  const handleRemoveAllDiscounts = () => {
    removeProductDiscounts(discountedProducts);
  };

  /* stat cards */
  return (
    <div className="admin-page disc-page">
      <main className="dashboard-container disc-container">

        {/* ── header ── */}
        <header className="disc-hero">
          <div>
            <p className="admin-label">Sales Manager</p>
            <h1>Discounts</h1>
          </div>
        </header>

        <section className="disc-product-card">
          <div className="disc-product-card__header">
            <div>
              <p className="disc-section-label">Product-specific discount</p>
              <h2>Discount selected products</h2>
            </div>
            <div className="disc-product-card__meta">
              <span>{discountedProducts.length} discounted now</span>
              <button
                type="button"
                onClick={handleRefreshProducts}
                disabled={isRefreshingProducts}
              >
                {isRefreshingProducts ? "Refreshing..." : "Refresh products"}
              </button>
              {discountedProducts.length > 0 && (
                <button
                  type="button"
                  className="disc-meta-danger"
                  onClick={handleRemoveAllDiscounts}
                  disabled={isRemovingProductDiscount}
                >
                  {isRemovingProductDiscount ? "Removing..." : "Remove all discounts"}
                </button>
              )}
            </div>
          </div>

          <div className="disc-product-controls">
            <label className="disc-search">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search product, brand, category, or model"
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
              />
            </label>
            <label className="disc-percent">
              <span>Discount %</span>
              <input
                type="number"
                min="1"
                max="99"
                step="1"
                value={productDiscount}
                onChange={(event) => setProductDiscount(event.target.value)}
                placeholder="25"
              />
            </label>
            <button
              type="button"
              className="disc-btn disc-btn--primary"
              onClick={handleApplyProductDiscount}
              disabled={isApplyingProductDiscount || isRemovingProductDiscount}
            >
              <Check size={16} />
              {isApplyingProductDiscount ? "Applying..." : "Apply Discount"}
            </button>
          </div>

          {selectedProducts.length > 0 && (
            <div className="disc-selected-products">
              <span>{selectedProducts.length} selected</span>
              {selectedProducts.slice(0, 6).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProductSelection(product.id)}
                >
                  {product.brand} · {product.name}
                  <X size={12} aria-hidden="true" />
                </button>
              ))}
              {selectedProducts.length > 6 && <em>+{selectedProducts.length - 6} more</em>}
              <button type="button" className="disc-clear-products" onClick={clearProductSelection}>
                Clear
              </button>
              {selectedDiscountedProducts.length > 0 && (
                <button
                  type="button"
                  className="disc-remove-selected"
                  onClick={handleRemoveSelectedDiscounts}
                  disabled={isRemovingProductDiscount}
                >
                  {isRemovingProductDiscount ? "Removing..." : "Remove selected discount"}
                </button>
              )}
            </div>
          )}

          {productError && <p className="disc-form-error">{productError}</p>}
          {productMessage && <p className="disc-product-success">{productMessage}</p>}

          <div className="disc-product-list">
            {filteredProducts.length === 0 ? (
              <p className="disc-product-empty">No products match this search.</p>
            ) : (
              filteredProducts.map((product) => {
                const selected = selectedProductIdSet.has(product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    className={`disc-product-row${selected ? " is-selected" : ""}`}
                    onClick={() => toggleProductSelection(product.id)}
                  >
                    <img src={product.image} alt="" />
                    <span className="disc-product-row__main">
                      <strong>{product.name}</strong>
                      <small>{product.brand} · {product.category}</small>
                    </span>
                    <span className="disc-product-row__price">
                      {product.discount ? <em>-{product.discount}%</em> : null}
                      <strong>${Number(product.price).toFixed(2)}</strong>
                      {product.originalPrice ? <small>${Number(product.originalPrice).toFixed(2)}</small> : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
