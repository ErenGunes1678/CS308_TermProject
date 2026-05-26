import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createCategory, deleteCategory, getCategories } from '../../services/categoryService';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../services/productService';
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
  price: '',
  original_price: '',
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
  price: product.price ?? '',
  original_price: product.originalPrice ?? '',
  image: product.image || '',
  badge: product.badge || '',
  warranty_status: Boolean(product.warranty_status),
  distributor_info: product.distributor_info || '',
});

const buildPayload = (form) => ({
  ...form,
  quantity_in_stock: Number(form.quantity_in_stock || 0),
  price: Number(form.price || 0),
  original_price: form.original_price === '' ? null : Number(form.original_price),
  badge: form.badge || null,
});

const ProductInventoryPage = () => {
  const { user, isLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryName, setCategoryName] = useState('');
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
          getProducts(),
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
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        product.name?.toLowerCase().includes(normalizedQuery) ||
        product.brand?.toLowerCase().includes(normalizedQuery) ||
        product.model?.toLowerCase().includes(normalizedQuery) ||
        product.serial_number?.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [products, query, selectedCategory]);

  const stockCounts = useMemo(() => ({
    total: products.length,
    out: products.filter((product) => Number(product.quantity_in_stock) === 0).length,
    low: products.filter((product) => Number(product.quantity_in_stock) > 0 && Number(product.quantity_in_stock) <= 10).length,
  }), [products]);

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
    setMessage('');
    setErrorMessage('');
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage('');
      const payload = buildPayload(form);
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
      <section className="product-inventory-hero">
        <div className="product-inventory-hero__overlay" />
        <div className="container product-inventory-hero__content">
          <p className="product-inventory-hero__eyebrow">Product Manager Console</p>
          <h1 className="product-inventory-hero__title">Product Inventory</h1>
          <p className="product-inventory-hero__tagline">
            Add products, manage categories, and keep stock levels accurate.
          </p>
        </div>
      </section>

      <main className="container product-inventory-main">
        <section className="product-inventory-panel">
          <div className="product-inventory-summary">
            <div>
              <p className="product-inventory-summary__label">Inventory Overview</p>
              <h2>{stockCounts.total} products</h2>
            </div>
            <div className="product-inventory-summary__counts">
              <span>Low stock: {stockCounts.low}</span>
              <span>Out of stock: {stockCounts.out}</span>
              <span>Categories: {categories.length}</span>
            </div>
          </div>

          {message ? <div className="product-inventory-alert product-inventory-alert--success">{message}</div> : null}
          {errorMessage ? <div className="product-inventory-alert">{errorMessage}</div> : null}

          <div className="product-inventory-layout">
            <aside className="product-inventory-sidebar">
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
                <button
                  type="button"
                  className={selectedCategory === 'all' ? 'is-active' : ''}
                  onClick={() => setSelectedCategory('all')}
                >
                  All products <span>{products.length}</span>
                </button>
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
              </div>
            </aside>

            <section className="product-inventory-content">
              <form className="product-inventory-form" onSubmit={handleSaveProduct}>
                <div className="product-inventory-form__header">
                  <div>
                    <p>{editingProduct ? 'Edit Product' : 'Add Product'}</p>
                    <h3>{editingProduct ? editingProduct.name : 'New catalog item'}</h3>
                  </div>
                  {editingProduct ? <button type="button" onClick={resetForm}>Cancel edit</button> : null}
                </div>

                <div className="product-inventory-form__grid">
                  <label>Name<input name="name" value={form.name} onChange={handleFormChange} required /></label>
                  <label>Brand<input name="brand" value={form.brand} onChange={handleFormChange} required /></label>
                  <label>Category
                    <select name="category" value={form.category} onChange={handleFormChange} required>
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.slug} value={category.slug}>{category.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>Subcategory<input name="subcategory" value={form.subcategory} onChange={handleFormChange} required /></label>
                  <label>Model<input name="model" value={form.model} onChange={handleFormChange} required /></label>
                  <label>Serial number<input name="serial_number" value={form.serial_number} onChange={handleFormChange} required /></label>
                  <label>Stock<input name="quantity_in_stock" type="number" min="0" value={form.quantity_in_stock} onChange={handleFormChange} required /></label>
                  <label>Price<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleFormChange} required /></label>
                  <label>Original price<input name="original_price" type="number" min="0" step="0.01" value={form.original_price} onChange={handleFormChange} /></label>
                  <label>Badge
                    <select name="badge" value={form.badge} onChange={handleFormChange}>
                      <option value="">None</option>
                      <option value="BEST">BEST</option>
                      <option value="NEW">NEW</option>
                      <option value="LIMITED">LIMITED</option>
                      <option value="SALE">SALE</option>
                    </select>
                  </label>
                  <label className="product-inventory-form__wide">Image URL<input name="image" value={form.image} onChange={handleFormChange} required /></label>
                  <label className="product-inventory-form__wide">Distributor<input name="distributor_info" value={form.distributor_info} onChange={handleFormChange} /></label>
                  <label className="product-inventory-form__wide">Description<textarea name="description" value={form.description} onChange={handleFormChange} rows="3" /></label>
                  <label className="product-inventory-form__check">
                    <input name="warranty_status" type="checkbox" checked={form.warranty_status} onChange={handleFormChange} />
                    Warranty available
                  </label>
                </div>

                <button className="product-inventory-form__submit" type="submit" disabled={isSaving || categories.length === 0}>
                  {isSaving ? 'Saving...' : editingProduct ? 'Save product' : 'Add product'}
                </button>
              </form>

              <div className="product-inventory-toolbar">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search product, brand, model, serial"
                />
              </div>

              {isPageLoading ? (
                <div className="product-inventory-state">Loading inventory...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="product-inventory-state">No products found.</div>
              ) : (
                <div className="product-inventory-list">
                  {filteredProducts.map((product) => (
                    <article key={product.id} className="product-inventory-card">
                      <img src={product.image} alt={product.name} />
                      <div className="product-inventory-card__body">
                        <div className="product-inventory-card__top">
                          <div>
                            <p>{product.brand}</p>
                            <h3>{product.name}</h3>
                            <span>{product.model} / {product.serial_number}</span>
                          </div>
                          <strong>${Number(product.price || 0).toFixed(2)}</strong>
                        </div>
                        <div className="product-inventory-card__meta">
                          <span>{product.category}</span>
                          <span>{product.subcategory}</span>
                          <span className={Number(product.quantity_in_stock) === 0 ? 'is-out' : Number(product.quantity_in_stock) <= 10 ? 'is-low' : ''}>
                            Stock: {product.quantity_in_stock}
                          </span>
                        </div>
                        <div className="product-inventory-card__actions">
                          <button type="button" onClick={() => handleStockChange(product, Number(product.quantity_in_stock) - 1)}>-1</button>
                          <button type="button" onClick={() => handleStockChange(product, Number(product.quantity_in_stock) + 1)}>+1</button>
                          <button type="button" onClick={() => handleEdit(product)}>Edit</button>
                          <button type="button" className="is-danger" onClick={() => handleDeleteProduct(product.id)}>Remove</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductInventoryPage;
