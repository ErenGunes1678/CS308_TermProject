import { useEffect, useState, useMemo } from "react";
import { Search, Tag, Trash2, Plus, X, Check } from "lucide-react";
import { getDiscountCodes, createDiscountCode, toggleDiscountCode, deleteDiscountCode } from "../../services/discountService";
import { getManageProducts, updateProductPrice } from "../../services/productService";
import "./DiscountsPage.css";

/* ─── discount data ─────────────────────────────────────────────────────── */

async function loadCodes() {
  try {
    return await getDiscountCodes();
  } catch {
    return [];
  }
}

/* ─── helpers ────────────────────────────────────────────────────────────── */

const TYPE_LABELS = {
  percentage:    "Percentage",
  fixed:         "Fixed",
  free_shipping: "Free Shipping",
};

function formatValue(code) {
  if (code.type === "free_shipping") return "—";
  if (code.type === "percentage")    return `${code.value}%`;
  return `$${Number(code.value).toFixed(0)}`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

const isExpired = (expires) => expires && new Date(expires) < new Date();

/* ─── summary computation ────────────────────────────────────────────────── */

function computeStats(codes) {
  const active       = codes.filter((c) => c.active && !isExpired(c.expires)).length;
  const totalUses    = codes.reduce((s, c) => s + c.uses, 0);
  const pctCodes     = codes.filter((c) => c.type === "percentage" && c.value);
  const avgDiscount  = pctCodes.length
    ? (pctCodes.reduce((s, c) => s + c.value, 0) / pctCodes.length).toFixed(1)
    : "0.0";
  const revenueSaved = codes
    .filter((c) => c.type === "fixed" && c.value)
    .reduce((s, c) => s + c.value * c.uses, 0);
  return { active, totalUses, avgDiscount, revenueSaved };
}

/* ─── form default ───────────────────────────────────────────────────────── */

const EMPTY_FORM = { code: "", type: "percentage", value: "", minOrder: "", expires: "" };

/* ─── component ──────────────────────────────────────────────────────────── */

export default function DiscountsPage() {
  const [codes, setCodes]           = useState([]);
  const [products, setProducts]     = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formError, setFormError]   = useState("");
  const [deleteId, setDeleteId]     = useState(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [productQuery, setProductQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productDiscount, setProductDiscount] = useState("");
  const [productMessage, setProductMessage] = useState("");
  const [productError, setProductError] = useState("");
  const [isApplyingProductDiscount, setIsApplyingProductDiscount] = useState(false);
  const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);

  const stats = useMemo(() => computeStats(codes), [codes]);
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

  useEffect(() => {
    let isMounted = true;

    const fetchDiscountData = async () => {
      try {
        const [nextCodes, nextProducts] = await Promise.all([
          loadCodes(),
          getManageProducts(),
        ]);
        if (!isMounted) return;
        setCodes(nextCodes);
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

  const handleToggle = async (id) => {
    try {
      const updatedCode = await toggleDiscountCode(id);
      setCodes((currentCodes) =>
        currentCodes.map((c) => (c.id === updatedCode.id ? updatedCode : c))
      );
    } catch (error) {
      console.error("Could not toggle discount code", error);
    }
  };

  /* delete */
  const handleDelete = async (id) => {
    try {
      await deleteDiscountCode(id);
      setCodes((currentCodes) => currentCodes.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Could not delete discount code", error);
    } finally {
      setDeleteId(null);
    }
  };

  /* form field change */
  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  /* submit */
  const handleCreate = async () => {
    setFormError("");
    const codeStr = form.code.trim().toUpperCase();
    if (!codeStr) { setFormError("Code is required."); return; }
    if (codes.some((c) => c.code === codeStr)) { setFormError("Code already exists."); return; }
    if (form.type !== "free_shipping") {
      if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0) {
        setFormError("Enter a valid discount value."); return;
      }
    }
    if (!form.expires) { setFormError("Expiry date is required."); return; }

    try {
      const created = await createDiscountCode({
        code: codeStr,
        type: form.type,
        value: form.type === "free_shipping" ? null : Number(form.value),
        min_order: form.minOrder ? Number(form.minOrder) : null,
        expiry_date: form.expires,
      });

      setCodes((currentCodes) => [created, ...currentCodes]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (error) {
      setFormError(error?.response?.data?.message || "Unable to create discount code right now.");
    }
  };

  const handleCancel = () => { setForm(EMPTY_FORM); setFormError(""); setShowForm(false); };

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

  /* stat cards */
  const statCards = [
    { label: "Active Codes",   value: stats.active,              color: "pink",   suffix: "" },
    { label: "Total Uses",     value: stats.totalUses.toLocaleString(), color: "purple", suffix: "" },
    { label: "Avg. Discount",  value: `${stats.avgDiscount}%`,   color: "blue",   suffix: "" },
    { label: "Revenue Saved",  value: `$${(stats.revenueSaved / 1000).toFixed(1)}K`, color: "green", suffix: "" },
  ];

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

        {/* ── stat cards ── */}
        <section className="stats-grid disc-stats">
          {statCards.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon ${s.color}`}>
                <Tag size={16} strokeWidth={2.5} />
              </div>
              <h2 className="stat-card__value">{s.value}</h2>
              <p className="stat-card__label">{s.label}</p>
            </div>
          ))}
        </section>

        <div className="disc-code-actions">
          <button className="disc-new-btn" onClick={() => { setShowForm(true); setFormError(""); }}>
            <Plus size={18} strokeWidth={2.5} />
            New Code
          </button>
        </div>

        {showForm && (
          <section className="disc-form-card">
            <div className="disc-form-header">
              <Tag size={17} className="disc-form-icon" />
              <h3>Create Promo Code</h3>
            </div>

            <div className="disc-form-grid">
              <input
                className="disc-input"
                placeholder="CODE (e.g. SUMMER25)"
                value={form.code}
                onChange={(e) => setField("code", e.target.value.toUpperCase())}
                maxLength={24}
                spellCheck={false}
              />

              <select
                className="disc-input disc-select"
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed ($)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>

              <input
                className="disc-input"
                placeholder="Value (% or $)"
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => setField("value", e.target.value)}
                disabled={form.type === "free_shipping"}
              />

              <input
                className="disc-input"
                placeholder="Min. Order ($)"
                type="number"
                min="0"
                step="1"
                value={form.minOrder}
                onChange={(e) => setField("minOrder", e.target.value)}
              />

              <input
                className="disc-input"
                type="date"
                value={form.expires}
                onChange={(e) => setField("expires", e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>

            {formError && <p className="disc-form-error">{formError}</p>}

            <div className="disc-form-actions">
              <button className="disc-btn disc-btn--primary" onClick={handleCreate}>
                <Check size={16} /> Create Code
              </button>
              <button className="disc-btn disc-btn--ghost" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* ── table ── */}
        <section className="disc-table-card">
          {codes.length === 0 ? (
            <div className="disc-empty">
              <Tag size={40} strokeWidth={1.2} />
              <p>No discount codes yet. Create one above.</p>
            </div>
          ) : (
            <table className="disc-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th className="disc-col-r">Value</th>
                  <th className="disc-col-r">Min. Order</th>
                  <th className="disc-col-r">Uses</th>
                  <th>Expires</th>
                  <th className="disc-col-c">Status</th>
                  <th className="disc-col-c" />
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => {
                  const expired = isExpired(c.expires);
                  return (
                    <tr key={c.id} className={`disc-row${expired ? " disc-row--expired" : ""}`}>
                      <td>
                        <span className="disc-code">{c.code}</span>
                      </td>
                      <td className="disc-type">{TYPE_LABELS[c.type]}</td>
                      <td className="disc-col-r disc-value">{formatValue(c)}</td>
                      <td className="disc-col-r disc-muted">
                        {c.minOrder ? `$${c.minOrder}` : "—"}
                      </td>
                      <td className="disc-col-r disc-uses">{c.uses.toLocaleString()}</td>
                      <td className={`disc-expires${expired ? " disc-expires--past" : ""}`}>
                        {fmtDate(c.expires)}
                      </td>
                      <td className="disc-col-c">
                        {expired ? (
                          <span className="disc-badge disc-badge--expired">Expired</span>
                        ) : (
                          <button
                            className={`disc-toggle${c.active ? " disc-toggle--on" : ""}`}
                            onClick={() => handleToggle(c.id)}
                            title={c.active ? "Deactivate" : "Activate"}
                          >
                            <span className="disc-toggle__knob" />
                            <span className="disc-toggle__label">
                              {c.active ? "Active" : "Inactive"}
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="disc-col-c">
                        {deleteId === c.id ? (
                          <div className="disc-confirm">
                            <button className="disc-confirm__yes" onClick={() => handleDelete(c.id)}>
                              Delete
                            </button>
                            <button className="disc-confirm__no" onClick={() => setDeleteId(null)}>
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="disc-delete-btn"
                            onClick={() => setDeleteId(c.id)}
                            title="Delete code"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

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
              disabled={isApplyingProductDiscount}
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
