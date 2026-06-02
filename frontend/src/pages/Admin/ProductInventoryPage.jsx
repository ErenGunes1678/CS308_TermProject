import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createCategory, deleteCategory, getCategories } from '../../services/categoryService';
import { createProduct, deleteProduct, getManageProducts, updateProduct } from '../../services/productService';
import './ProductInventoryPage.css';

const emptyForm = {
  name: '',
  brand: '',
  category: '',
  subcategory: '',
  model: '',
  serial_number: '',
  description: '',
  quantity_in_stock: 0,
  image: '',
  badge: '',
  warranty_status: false,
  distributor_info: '',
};

const toForm = (product) => ({
  name: product.name || '',
  brand: product.brand || '',
  category: product.category || '',
  subcategory: product.subcategory || '',
  model: product.model || '',
  serial_number: product.serial_number || '',
  description: product.description || '',
  quantity_in_stock: product.quantity_in_stock ?? 0,
  image: product.image || '',
  badge: product.badge || '',
  warranty_status: Boolean(product.warranty_status),
  distributor_info: product.distributor_info || '',
});

const buildPayload = (form) => ({
  ...form,
  quantity_in_stock: Number(form.quantity_in_stock || 0),
  badge: form.badge || null,
});

const ProductInventoryPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [inventoryMode, setInventoryMode] = useState('list');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const canManageInventory = user?.role === 'product_manager';

  useEffect(() => {
    if (isLoading || !user || !canManageInventory) {
      setIsPageLoading(false);
      return;
    }

    let isMounted = true;
    const loadInventory = async () => {
      try {
        setIsPageLoading(true);
        setErrorMessage('');
        const [nextProducts, nextCategories] = await Promise.all([
          getManageProducts(),
          getCategories(),
        ]);

        if (isMounted) {
          setProducts(Array.isArray(nextProducts) ? nextProducts : []);
          setCategories(Array.isArray(nextCategories) ? nextCategories : []);
          setForm((current) => ({
            ...current,
            category: current.category || nextCategories[0]?.slug || '',
          }));
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error?.response?.data?.message || 'Unable to load inventory.');
        }
      } finally {
        if (isMounted) setIsPageLoading(false);
      }
    };

    loadInventory();
    return () => {
      isMounted = false;
    };
  }, [canManageInventory, isLoading, user]);

  const categoryUsage = useMemo(() => {
    const usage = {};
    products.forEach((product) => {
      usage[product.category] = (usage[product.category] || 0) + 1;
    });
    return usage;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const stock = Number(product.quantity_in_stock || 0);
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && stock > 0 && stock <= 10) ||
        (stockFilter === 'out' && stock === 0);
      const matchesQuery =
        !normalizedQuery ||
        product.name?.toLowerCase().includes(normalizedQuery) ||
        product.brand?.toLowerCase().includes(normalizedQuery) ||
        product.model?.toLowerCase().includes(normalizedQuery) ||
        product.serial_number?.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesStock && matchesQuery;
    });
  }, [products, query, selectedCategory, stockFilter]);

  const stockCounts = useMemo(() => ({
    total: products.length,
    out: products.filter((product) => Number(product.quantity_in_stock) === 0).length,
    low: products.filter((product) => Number(product.quantity_in_stock) > 0 && Number(product.quantity_in_stock) <= 10).length,
  }), [products]);

  const isManageMode = inventoryMode === 'manage';

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canManageInventory) {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleFormChange = (event) => {
    const { name, type, value, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({
      ...emptyForm,
      category: categories[0]?.slug || '',
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm(toForm(product));
    setInventoryMode('manage');
    setMessage('');
    setErrorMessage('');
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage('');
      const payload = buildPayload(form);
      if (!editingProduct) {
        payload.price = 0;
        payload.original_price = null;
      }
      const savedProduct = editingProduct
        ? await updateProduct(editingProduct.id, payload)
        : await createProduct(payload);

      setProducts((current) => {
        if (editingProduct) {
          return current.map((product) => (product.id === savedProduct.id ? savedProduct : product));
        }
        return [savedProduct, ...current];
      });
      setMessage(editingProduct ? 'Product updated.' : 'Product added.');
      resetForm();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setErrorMessage('');
      await deleteProduct(productId);
      setProducts((current) => current.filter((product) => product.id !== productId));
      setMessage('Product removed.');
      if (editingProduct?.id === productId) resetForm();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to remove product.');
    }
  };

  const handleStockChange = async (product, nextStock) => {
    const normalizedStock = Math.max(0, Number(nextStock || 0));

    try {
      setErrorMessage('');
      const updated = await updateProduct(product.id, {
        quantity_in_stock: normalizedStock,
      });
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? updated : item))
      );
      setMessage('Stock updated.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to update stock.');
    }
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();

    try {
      setErrorMessage('');
      const category = await createCategory({ name: categoryName });
      setCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryName('');
      setForm((current) => ({ ...current, category: current.category || category.slug }));
      setMessage('Category added.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to add category.');
    }
  };

  const handleDeleteCategory = async (slug) => {
    try {
      setErrorMessage('');
      await deleteCategory(slug);
      setCategories((current) => current.filter((category) => category.slug !== slug));
      if (selectedCategory === slug) setSelectedCategory('all');
      if (form.category === slug) {
        setForm((current) => ({ ...current, category: categories.find((category) => category.slug !== slug)?.slug || '' }));
      }
      setMessage('Category removed.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to remove category.');
    }
  };

  return (
    <div className="product-inventory-page">
      <div className="admin-page-header container">
        <div className="admin-page-header__text">
          <p className="admin-page-header__eyebrow">Admin Panel</p>
          <h1 className="admin-page-header__title">Product Inventory</h1>
        </div>
        <button
          type="button"
          className="admin-page-header__back-btn"
          onClick={() => navigate('/')}
        >
          Back to Store
        </button>
      </div>

      <main className="container product-inventory-main">
        <section className="product-inventory-panel">
          <div className="product-inventory-summary">
            <div className="product-inventory-summary__counts">
              <span>Total: {stockCounts.total}</span>
              <span>Low stock: {stockCounts.low}</span>
              <span>Out of stock: {stockCounts.out}</span>
              <span>Categories: {categories.length}</span>
            </div>
            <div className="product-inventory-mode-switch" aria-label="Inventory view">
              <button
                type="button"
                className={inventoryMode === 'list' ? 'is-active' : ''}
                onClick={() => setInventoryMode('list')}
              >
                Product List
              </button>
              <button
                type="button"
                className={isManageMode ? 'is-active' : ''}
                onClick={() => setInventoryMode('manage')}
              >
                Add / Manage
              </button>
            </div>
          </div>

          {message ? <div className="product-inventory-alert product-inventory-alert--success">{message}</div> : null}
          {errorMessage ? <div className="product-inventory-alert">{errorMessage}</div> : null}

          {isManageMode ? (
            <div className="product-inventory-layout product-inventory-layout--manage">
              <div className="product-inventory-manage-grid">
                <section className="product-inventory-sidebar product-inventory-sidebar--manage">
                  <form className="product-inventory-category-form" onSubmit={handleAddCategory}>
                    <label>
                      Add category
                      <input
                        type="text"
                        value={categoryName}
                        onChange={(event) => setCategoryName(event.target.value)}
                        placeholder="Category name"
                      />
                    </label>
                    <button type="submit" disabled={!categoryName.trim()}>Add</button>
                  </form>
                  <div className="product-inventory-categories">
                    {categories.map((category) => (
                      <div key={category.slug} className="product-inventory-category-row">
                        <button
                          type="button"
                          className={selectedCategory === category.slug ? 'is-active' : ''}
                          onClick={() => setSelectedCategory(category.slug)}
                        >
                          {category.name} <span>{categoryUsage[category.slug] || 0}</span>
                        </button>
                        <button
                          type="button"
                          className="product-inventory-category-row__delete"
                          onClick={() => handleDeleteCategory(category.slug)}
                          disabled={(categoryUsage[category.slug] || 0) > 0}
                          title={(categoryUsage[category.slug] || 0) > 0 ? 'Remove products first' : 'Delete category'}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    {categories.length === 0 && <p className="product-inventory-state">No categories yet.</p>}
                  </div>
                </section>

                <form className="inv-form" onSubmit={handleSaveProduct}>
                  <div className="inv-form__header">
                    <div>
                      <p className="inv-form__eyebrow">{editingProduct ? 'Edit Product' : 'Add Product'}</p>
                      <h3 className="inv-form__title">{editingProduct ? editingProduct.name : 'New catalog item'}</h3>
                    </div>
                    <div className="inv-form__header-actions">
                      {editingProduct ? <button type="button" className="inv-form__cancel" onClick={resetForm}>Cancel</button> : null}
                      <button className="inv-form__submit" type="submit" disabled={isSaving || categories.length === 0}>
                        {isSaving ? 'Saving…' : editingProduct ? 'Save changes' : 'Add product'}
                      </button>
                    </div>
                  </div>
                  <div className="inv-form__grid">
                    <label className="inv-form__field inv-form__field--2">Name<input name="name" value={form.name} onChange={handleFormChange} required /></label>
                    <label className="inv-form__field">Brand<input name="brand" value={form.brand} onChange={handleFormChange} required /></label>
                    <label className="inv-form__field">Category
                      <select name="category" value={form.category} onChange={handleFormChange} required>
                        <option value="">Select</option>
                        {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                      </select>
                    </label>
                    <label className="inv-form__field">Subcategory<input name="subcategory" value={form.subcategory} onChange={handleFormChange} required /></label>
                    <label className="inv-form__field">Model<input name="model" value={form.model} onChange={handleFormChange} required /></label>
                    <label className="inv-form__field">Serial #<input name="serial_number" value={form.serial_number} onChange={handleFormChange} required /></label>
                    <label className="inv-form__field">Stock<input name="quantity_in_stock" type="number" min="0" value={form.quantity_in_stock} onChange={handleFormChange} required /></label>
                    <label className="inv-form__field">Badge
                      <select name="badge" value={form.badge} onChange={handleFormChange}>
                        <option value="">None</option>
                        <option value="BEST">BEST</option>
                        <option value="NEW">NEW</option>
                        <option value="LIMITED">LIMITED</option>
                        <option value="SALE">SALE</option>
                      </select>
                    </label>
                    <label className="inv-form__field inv-form__field--full">Image URL<input name="image" value={form.image} onChange={handleFormChange} required /></label>
                    <label className="inv-form__field inv-form__field--2">Distributor<input name="distributor_info" value={form.distributor_info} onChange={handleFormChange} /></label>
                    <label className="inv-form__field inv-form__field--2">Description<textarea name="description" value={form.description} onChange={handleFormChange} rows="2" /></label>
                    <label className="inv-form__field inv-form__check">
                      <input name="warranty_status" type="checkbox" checked={form.warranty_status} onChange={handleFormChange} />
                      Warranty
                    </label>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="product-inventory-layout product-inventory-layout--list">
              <section className="product-inventory-content">
              <div className="product-inventory-toolbar">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search product, brand, model, serial"
                />
                <div className="product-inventory-filter-chips" aria-label="Inventory filters">
                  <button
                    type="button"
                    className={stockFilter === 'all' && selectedCategory === 'all' ? 'is-active' : ''}
                    onClick={() => {
                      setStockFilter('all');
                      setSelectedCategory('all');
                    }}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={stockFilter === 'low' ? 'is-active' : ''}
                    onClick={() => setStockFilter('low')}
                  >
                    Low stock
                  </button>
                  <button
                    type="button"
                    className={stockFilter === 'out' ? 'is-active' : ''}
                    onClick={() => setStockFilter('out')}
                  >
                    Out of stock
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      type="button"
                      className={selectedCategory === category.slug ? 'is-active' : ''}
                      onClick={() => setSelectedCategory(category.slug)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {isPageLoading ? (
                <div className="product-inventory-state">Loading inventory...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="product-inventory-state">No products found.</div>
              ) : (
                <div className="inv-table">
                  <div className="inv-table__head" aria-hidden="true">
                    <span>Product</span>
                    <span>Brand</span>
                    <span>Category</span>
                    <span>Price</span>
                    <span>Stock</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>
                  {filteredProducts.map((product) => {
                    const stock = Number(product.quantity_in_stock || 0);
                    const isOut = stock === 0;
                    const isLow = !isOut && stock <= 10;
                    return (
                      <div key={product.id} className="inv-table__row">
                        <div className="inv-row__product">
                          <img src={product.image} alt={product.name} />
                          <span>{product.name}</span>
                        </div>
                        <span className="inv-row__brand">{product.brand}</span>
                        <span className="inv-row__category">{product.category}</span>
                        <strong className="inv-row__price">
                          {Number(product.price) <= 0 ? 'Pending' : `$${Number(product.price).toFixed(2)}`}
                        </strong>
                        <span className={`inv-row__stock${isLow ? ' is-low' : isOut ? ' is-out' : ''}`}>
                          {isOut ? '–' : stock}
                        </span>
                        <span className={`inv-row__status${Number(product.price) <= 0 ? ' is-pending' : isOut ? ' is-out' : ''}`}>
                          {Number(product.price) <= 0 ? 'Pending Price' : isOut ? 'Out of Stock' : 'In Stock'}
                        </span>
                        <div className="inv-row__actions">
                          <button type="button" className="inv-row__icon-btn" title="Edit" onClick={() => handleEdit(product)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button type="button" className="inv-row__icon-btn inv-row__icon-btn--danger" title="Delete" onClick={() => handleDeleteProduct(product.id)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </section>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProductInventoryPage;
