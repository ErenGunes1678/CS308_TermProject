import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getPendingPricingProducts, updateProductPrice } from '../../services/productService';
import './PricingManagementPage.css';

const PricingManagementPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState({});
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [savingProductId, setSavingProductId] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isSalesManager = user?.role === 'sales_manager';

  useEffect(() => {
    if (isLoading || !user || !isSalesManager) {
      setIsPageLoading(false);
      return;
    }

    let isMounted = true;
    const loadPendingProducts = async () => {
      try {
        setIsPageLoading(true);
        setErrorMessage('');
        const nextProducts = await getPendingPricingProducts();
        if (isMounted) {
          setProducts(Array.isArray(nextProducts) ? nextProducts : []);
        }
      } catch (error) {
        if (isMounted) {
          setProducts([]);
          setErrorMessage(error?.response?.data?.message || 'Unable to load pending products.');
        }
      } finally {
        if (isMounted) setIsPageLoading(false);
      }
    };

    loadPendingProducts();
    return () => {
      isMounted = false;
    };
  }, [isLoading, isSalesManager, user]);

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isSalesManager) return <Navigate to="/unauthorized" replace />;

  const handlePriceChange = (productId, value) => {
    setPrices((current) => ({ ...current, [productId]: value }));
  };

  const handleSetPrice = async (productId) => {
    const price = Number(prices[productId]);

    if (!Number.isFinite(price) || price <= 0) {
      setErrorMessage('Enter a valid product price.');
      return;
    }

    try {
      setSavingProductId(productId);
      setErrorMessage('');
      await updateProductPrice(productId, { price, original_price: null });
      setProducts((current) => current.filter((product) => product.id !== productId));
      setPrices((current) => {
        const next = { ...current };
        delete next[productId];
        return next;
      });
      setMessage('Product price set. It is now visible to customers.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to set product price.');
    } finally {
      setSavingProductId(null);
    }
  };

  return (
    <div className="pricing-page">
      <div className="admin-page-header container">
        <div className="admin-page-header__text">
          <p className="admin-page-header__eyebrow">Sales Manager</p>
          <h1 className="admin-page-header__title">Pricing Queue</h1>
        </div>
        <button type="button" className="admin-page-header__back-btn" onClick={() => navigate('/')}>
          Back to Store
        </button>
      </div>

      <main className="container pricing-main">
        <section className="pricing-panel">
          <div className="pricing-summary">
            <span>Waiting for price: {products.length}</span>
          </div>

          {message ? <div className="pricing-alert pricing-alert--success">{message}</div> : null}
          {errorMessage ? <div className="pricing-alert">{errorMessage}</div> : null}

          {isPageLoading ? (
            <div className="pricing-state">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="pricing-state">No products are waiting for pricing.</div>
          ) : (
            <div className="pricing-list">
              {products.map((product) => (
                <article key={product.id} className="pricing-row">
                  <img src={product.image} alt={product.name} />
                  <div className="pricing-row__details">
                    <strong>{product.name}</strong>
                    <span>{product.brand} · {product.category} · {product.model}</span>
                  </div>
                  <label className="pricing-row__price">
                    Product price
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prices[product.id] || ''}
                      onChange={(event) => handlePriceChange(product.id, event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="pricing-row__action"
                    onClick={() => handleSetPrice(product.id)}
                    disabled={savingProductId === product.id}
                  >
                    {savingProductId === product.id ? 'Saving...' : 'Publish'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PricingManagementPage;
