import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import './OrderManagementPage.css';

const STATUS_LABELS = {
  processing: 'Processing',
  'in-transit': 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  processing: 'order-status--processing',
  'in-transit': 'order-status--in-transit',
  delivered: 'order-status--delivered',
  cancelled: 'order-status--cancelled',
};

const STEP_LABELS = ['Processing', 'In Transit', 'Delivered'];

const OrderProgress = ({ status }) => {
  const activeIndex = STEP_LABELS.findIndex((label) =>
    label.toLowerCase().replace(/ /g, '-') === status
  );

  return (
    <div className="admin-order-progress">
      {STEP_LABELS.map((label, index) => (
        <div key={label} className="admin-order-progress__step">
          <span
            className={`admin-order-progress__dot ${index <= activeIndex ? 'is-active' : ''}`}
          />
          <span className={`admin-order-progress__label ${index <= activeIndex ? 'is-active' : ''}`}>
            {label}
          </span>
          {index < STEP_LABELS.length - 1 && (
            <span className={`admin-order-progress__line ${index < activeIndex ? 'is-active' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const nextStatus = {
  processing: 'in-transit',
  'in-transit': 'delivered',
};

const getNextActionLabel = (status) => {
  if (status === 'processing') return 'Send to Delivery';
  if (status === 'in-transit') return 'Mark Delivered';
  return null;
};

const OrderRow = ({ order, onAction, isUpdating }) => {
  const next = nextStatus[order.status];
  const actionLabel = getNextActionLabel(order.status);

  return (
    <article className="admin-order-card">
      <header className="admin-order-card__header">
        <div>
          <p className="admin-order-card__subtitle">Order #{order.id}</p>
          <h3>{order.user?.name || order.user?.email || 'Unknown customer'}</h3>
          <p className="admin-order-card__meta">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className={`order-status ${STATUS_COLORS[order.status] || ''}`}>
          <span className="order-status__dot" />
          {STATUS_LABELS[order.status]}
        </div>
      </header>

      <OrderProgress status={order.status} />

      <div className="admin-order-card__items">
        {order.items.map((item) => (
          <div key={item.id} className="admin-order-item">
            <span className="admin-order-item__name">{item.product?.name || `Product #${item.product_id}`}</span>
            <span className="admin-order-item__qty">Qty: {item.quantity}</span>
          </div>
        ))}
      </div>

      <footer className="admin-order-card__footer">
        <div>
          <p className="admin-order-card__total">Total: ${Number(order.total_amount || 0).toFixed(2)}</p>
          <p className="admin-order-card__user">Customer: {order.user?.email || 'N/A'}</p>
        </div>
        {actionLabel ? (
          <button
            type="button"
            className="admin-order-card__action"
            onClick={() => onAction(order.id, next)}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : actionLabel}
          </button>
        ) : (
          <span className="admin-order-card__status-note">
            {order.status === 'delivered'
              ? 'Delivery completed'
              : order.status === 'cancelled'
              ? 'Order cancelled'
              : 'No action available'}
          </span>
        )}
      </footer>
    </article>
  );
};

const OrderManagementPage = () => {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const isAdmin = user?.role === 'product_manager';

  useEffect(() => {
    if (isLoading || !user || !isAdmin) {
      setIsPageLoading(false);
      return;
    }

    let isMounted = true;
    const loadOrders = async () => {
      try {
        setErrorMessage('');
        setIsPageLoading(true);
        const data = await getAllOrders();
        if (isMounted) {
          setOrders(Array.isArray(data?.orders) ? data.orders : []);
        }
      } catch (error) {
        if (isMounted) {
          setOrders([]);
          setErrorMessage(error?.response?.data?.message || 'Unable to load orders.');
        }
      } finally {
        if (isMounted) setIsPageLoading(false);
      }
    };

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [isLoading, user, isAdmin]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  const handleStatusUpdate = async (orderId, nextStatusValue) => {
    try {
      setUpdatingOrderId(orderId);
      const data = await updateOrderStatus(orderId, nextStatusValue);
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status: data.order.status } : order
        )
      );
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const counts = useMemo(() => {
    const map = { all: orders.length, processing: 0, 'in-transit': 0, delivered: 0, cancelled: 0 };
    orders.forEach((order) => {
      map[order.status] = (map[order.status] || 0) + 1;
    });
    return map;
  }, [orders]);

  return (
    <div className="admin-orders-page">
      <section className="admin-orders-hero">
        <div className="admin-orders-hero__overlay" />
        <div className="admin-orders-hero__bubbles" aria-hidden="true">
          <span className="admin-orders-hero__bubble admin-orders-hero__bubble--1" />
          <span className="admin-orders-hero__bubble admin-orders-hero__bubble--2" />
          <span className="admin-orders-hero__bubble admin-orders-hero__bubble--3" />
          <span className="admin-orders-hero__bubble admin-orders-hero__bubble--4" />
        </div>
        <div className="container admin-orders-hero__content">
          <p className="admin-orders-hero__eyebrow">Admin Console</p>
          <h1 className="admin-orders-hero__title">Order Workflow</h1>
          <p className="admin-orders-hero__tagline">
            Move orders from processing to in-transit and deliver them when ready.
          </p>
        </div>
      </section>

      <div className="container">
        <section className="admin-orders-panel">
          <div className="admin-orders-summary">
            <div>
              <p className="admin-orders-summary__label">Order Overview</p>
              <h2 className="admin-orders-summary__title">{orders.length} active orders</h2>
            </div>
            <div className="admin-orders-summary__counts">
              <span>Processing: {counts.processing}</span>
              <span>In Transit: {counts['in-transit']}</span>
              <span>Delivered: {counts.delivered}</span>
              <span>Cancelled: {counts.cancelled}</span>
            </div>
          </div>

          {errorMessage ? (
            <div className="admin-orders-alert">{errorMessage}</div>
          ) : null}

          {isPageLoading ? (
            <div className="admin-orders-loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="admin-orders-empty">No orders available.</div>
          ) : (
            <div className="admin-orders-list">
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onAction={handleStatusUpdate}
                  isUpdating={updatingOrderId === order.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default OrderManagementPage;
