import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import { downloadInvoicePdf } from '../../services/invoiceService';
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

const FILTER_TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'processing', label: 'Processing' },
  { key: 'in-transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_PRIORITY = {
  processing: 0,
  'in-transit': 1,
  cancelled: 2,
  delivered: 3,
};

const nextStatus = {
  processing: 'in-transit',
  'in-transit': 'delivered',
};

const getNextActionLabel = (status) => {
  if (status === 'processing') return 'Send to Delivery';
  if (status === 'in-transit') return 'Mark as Delivered';
  return null;
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getCustomerLabel = (order) =>
  order.user?.name || order.user?.email || 'Unknown customer';

const getProductSummary = (items = []) => {
  if (items.length > 2) {
    return `${items.length} products`;
  }

  return items
    .map((item) => `${item.product?.name || `Product #${item.product_id}`} x${item.quantity}`)
    .join(' · ');
};

const getQuantitySummary = (items = []) => {
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  return `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`;
};

const formatDeliveryAddress = (address) => {
  if (!address) return 'No delivery address saved';
  if (typeof address === 'string') return address;
  return address.label || [
    address.name,
    address.street,
    [address.city, address.state, address.zip].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean).join(' • ');
};

const OrderRow = ({ order, onAction, onDownloadInvoice, isUpdating, isDownloadingInvoice }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const next = nextStatus[order.status];
  const actionLabel = getNextActionLabel(order.status);
  const canToggleDetails = order.items.length > 0;

  return (
    <article className={`admin-order-row admin-order-row--${order.status}`}>
      <div className="admin-order-row__main">
        <div className="admin-order-row__cell admin-order-row__id">
          <span className="admin-order-row__label">Order</span>
          <strong>#{order.id}</strong>
        </div>

        <div className="admin-order-row__cell admin-order-row__customer">
          <span className="admin-order-row__label">Customer</span>
          <strong>{getCustomerLabel(order)}</strong>
          <span>{order.user?.email || 'N/A'}</span>
        </div>

        <div className="admin-order-row__cell">
          <span className="admin-order-row__label">Date</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>

        <div className="admin-order-row__cell admin-order-row__products">
          <span className="admin-order-row__label">Products</span>
          <strong>{getProductSummary(order.items)}</strong>
          {canToggleDetails ? (
            <button
              type="button"
              className="admin-order-row__details-btn"
              onClick={() => setIsExpanded((current) => !current)}
            >
              {isExpanded ? 'Hide details' : 'View delivery details'}
            </button>
          ) : null}
        </div>

        <div className="admin-order-row__cell">
          <span className="admin-order-row__label">Qty</span>
          <span>{getQuantitySummary(order.items)}</span>
        </div>

        <div className="admin-order-row__cell admin-order-row__total">
          <span className="admin-order-row__label">Total</span>
          <strong>${Number(order.total_amount || 0).toFixed(2)}</strong>
        </div>

        <div className={`order-status ${STATUS_COLORS[order.status] || ''}`}>
          <span className="order-status__dot" />
          {STATUS_LABELS[order.status]}
        </div>

        <div className="admin-order-row__actions">
          {order.invoice ? (
            <button
              type="button"
              className="admin-order-row__action admin-order-row__action--secondary"
              onClick={() => onDownloadInvoice(order)}
              disabled={isDownloadingInvoice}
            >
              {isDownloadingInvoice ? 'Downloading...' : 'Invoice PDF'}
            </button>
          ) : null}

          {actionLabel ? (
            <button
              type="button"
              className="admin-order-row__action"
              onClick={() => onAction(order.id, next)}
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : actionLabel}
            </button>
          ) : canToggleDetails ? (
            <button
              type="button"
              className="admin-order-row__action admin-order-row__action--secondary"
              onClick={() => setIsExpanded((current) => !current)}
            >
              {isExpanded ? 'Hide Details' : 'View Details'}
            </button>
          ) : (
            <span className="admin-order-row__status-note">No action</span>
          )}
        </div>
      </div>

      {isExpanded ? (
        <div className="admin-order-row__details">
          {order.items.map((item, idx) => (
            <div key={item.id} className="admin-order-detail">
              <span className="admin-order-detail__line">Delivery #{order.id}-{item.id}</span>
              <span className="admin-order-detail__line">{item.product?.name || `Product #${item.product_id}`}</span>
              <span className="admin-order-detail__line">Qty {item.quantity}</span>
              <span className="admin-order-detail__line">Unit ${Number(item.unit_price || 0).toFixed(2)}</span>
              <span className="admin-order-detail__line">${(Number(item.unit_price || 0) * Number(item.quantity || 0)).toFixed(2)}</span>
              <span className="admin-order-detail__line">{STATUS_LABELS[order.status]}</span>
              <span className="admin-order-detail__line">{order.invoice?.invoice_number || 'No invoice yet'}</span>
              <span className="admin-order-detail__address">{formatDeliveryAddress(order.delivery_address)}</span>

              {idx === 0 ? (
                <div className="admin-order-summary admin-order-summary--inline" aria-hidden>
                  <div className="admin-order-summary__grid">
                    <div className="admin-order-summary__left">
                      <div className="admin-order-summary__row">
                        <span>Products subtotal</span>
                        <strong>${order.items.reduce((s, it) => s + Number(it.unit_price || 0) * Number(it.quantity || 0), 0).toFixed(2)}</strong>
                      </div>
                      <div className="admin-order-summary__row">
                        <span>Coupon</span>
                        <span className="admin-order-summary__muted">{order.invoice?.discount_code ? order.invoice.discount_code : '-'}</span>
                      </div>
                      <div className="admin-order-summary__row">
                        <span>Discount</span>
                        <strong className="admin-order-summary__discount">-${Number(order.invoice?.discount_amount || 0).toFixed(2)}</strong>
                      </div>
                      <div className="admin-order-summary__row">
                        <span>Shipping</span>
                        <strong>${(
                          Number(order.total_amount || 0) -
                          order.items.reduce((s, it) => s + Number(it.unit_price || 0) * Number(it.quantity || 0), 0) +
                          Number(order.invoice?.discount_amount || 0)
                        ).toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className="admin-order-summary__right">
                      <div className="admin-order-summary__row admin-order-summary__total">
                        <span>Total</span>
                        <strong>${Number(order.total_amount || 0).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
};

const OrderManagementPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
  const [activeStatus, setActiveStatus] = useState('all');

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

  const handleDownloadInvoice = async (order) => {
    if (!order.invoice) return;

    try {
      setDownloadingInvoiceId(order.invoice.id);
      setErrorMessage('');
      await downloadInvoicePdf(order.invoice.id, order.invoice.file_name);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to download invoice PDF.');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const counts = useMemo(() => {
    const map = { all: orders.length, processing: 0, 'in-transit': 0, delivered: 0, cancelled: 0 };
    orders.forEach((order) => {
      map[order.status] = (map[order.status] || 0) + 1;
    });
    return map;
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const filtered =
      activeStatus === 'all'
        ? orders
        : orders.filter((order) => order.status === activeStatus);

    return [...filtered].sort((a, b) => {
      const priorityDiff =
        (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, activeStatus]);

  const actionableCount = counts.processing + counts['in-transit'];

  return (
    <div className="admin-orders-page">
      <div className="admin-page-header container">
        <div className="admin-page-header__text">
          <p className="admin-page-header__eyebrow">Admin Panel</p>
          <h1 className="admin-page-header__title">Order Workflow</h1>
        </div>
        <button
          type="button"
          className="admin-page-header__back-btn"
          onClick={() => navigate('/')}
        >
          Back to Store
        </button>
      </div>

      <div className="container">
        <section className="admin-orders-panel">
          <div className="admin-orders-summary">
            <div className="admin-orders-status-tabs" role="tablist" aria-label="Filter orders by status">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeStatus === tab.key}
                  className={`admin-orders-status-tab ${activeStatus === tab.key ? 'is-active' : ''}`}
                  onClick={() => setActiveStatus(tab.key)}
                >
                  {tab.label}
                  <span>{counts[tab.key] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {errorMessage ? (
            <div className="admin-orders-alert">{errorMessage}</div>
          ) : null}

          {isPageLoading ? (
            <div className="admin-orders-loading">Loading orders...</div>
          ) : visibleOrders.length === 0 ? (
            <div className="admin-orders-empty">No orders available.</div>
          ) : (
            <div className="admin-orders-list">
              <div className="admin-orders-table-head" aria-hidden="true">
                <span>Order</span>
                <span>Customer</span>
                <span>Date</span>
                <span>Products</span>
                <span>Qty</span>
                <span>Total</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {visibleOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onAction={handleStatusUpdate}
                  onDownloadInvoice={handleDownloadInvoice}
                  isUpdating={updatingOrderId === order.id}
                  isDownloadingInvoice={downloadingInvoiceId === order.invoice?.id}
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
