import { useEffect, useState, useMemo } from "react";
import { Search, Check, X } from "lucide-react";
import { getManageProducts, updateProductPrice } from "../../services/productService";
import { createDiscountCode } from "../../services/discountService";
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

  // coupon creation state
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState("percentage");
  const [couponValue, setCouponValue] = useState("");
  const [couponMinOrder, setCouponMinOrder] = useState("");
  const [couponExpires, setCouponExpires] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);

  const handleCreateCoupon = async () => {
    setCouponMessage("");
    setCouponError("");

    const code = String(couponCode || "").trim().toUpperCase();
    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }

    if (!couponExpires) {
      setCouponError("Select an expiry date.");
      return;
    }

    if (!["percentage", "fixed", "free_shipping"].includes(couponType)) {
      setCouponError("Invalid coupon type.");
      return;
    }

    if (couponType !== "free_shipping") {
      const v = Number(couponValue);
      if (!Number.isFinite(v) || v <= 0) {
        setCouponError("Enter a valid coupon value.");
        return;
      }
      if (couponType === "percentage" && (v <= 0 || v > 100)) {
        setCouponError("Percentage must be between 1 and 100.");
        return;
      }
    }

    try {
      setIsCreatingCoupon(true);

      const payload = {
        code,
        type: couponType,
        value: couponType === "free_shipping" ? null : Number(couponValue),
        min_order: couponMinOrder ? Number(couponMinOrder) : null,
        expiry_date: couponExpires,
      };

      const res = await createDiscountCode(payload);
      setCouponMessage(`Created ${res.code}`);
      setCouponCode("");
      setCouponValue("");
      setCouponMinOrder("");
      setCouponExpires("");
      setCouponType("percentage");
    } catch (err) {
      setCouponError(err?.response?.data?.message || "Unable to create coupon.");
    } finally {
      setIsCreatingCoupon(false);
    }
  };

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

        {/* coupon creation card will be rendered below product-specific discount to match site layout */}

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

        <section className="disc-form-card">
          <div className="disc-form-header">
            <svg className="disc-form-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2"><path d="M21 10v6a2 2 0 0 1-2 2h-6"/><path d="M3 7v6a2 2 0 0 0 2 2h6"/><path d="M7 7V5a2 2 0 0 1 2-2h6"/></svg>
            <h3>Create Coupon Code</h3>
          </div>

          <div className="disc-form-grid">
            <input className="disc-input" placeholder="Code (e.g. SUMMER25)" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            <select className="disc-input disc-select" value={couponType} onChange={(e) => setCouponType(e.target.value)}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
            <input className="disc-input" placeholder="Value" value={couponValue} onChange={(e) => setCouponValue(e.target.value)} type="number" min="0" />
            <input className="disc-input" placeholder="Minimum order (optional)" value={couponMinOrder} onChange={(e) => setCouponMinOrder(e.target.value)} type="number" min="0" step="0.01" />
            <input className="disc-input" placeholder="Expiry date" value={couponExpires} onChange={(e) => setCouponExpires(e.target.value)} type="date" />
          </div>

          <div className="disc-form-actions">
            <button type="button" className="disc-btn disc-btn--ghost" onClick={() => { setCouponCode(""); setCouponValue(""); setCouponMinOrder(""); setCouponExpires(""); setCouponType("percentage"); }}>Reset</button>
            <button type="button" className="disc-btn disc-btn--primary" onClick={handleCreateCoupon} disabled={isCreatingCoupon}>{isCreatingCoupon ? 'Creating...' : 'Create Coupon'}</button>
          </div>

          {couponError && <p className="disc-form-error">{couponError}</p>}
          {couponMessage && <p className="disc-product-success">{couponMessage}</p>}
        </section>
      </main>
    </div>
  );
}
