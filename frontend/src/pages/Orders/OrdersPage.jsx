import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cancelOrder, getOrders, requestRefund } from '../../services/orderService';
import { invalidateNotifications } from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import './OrdersPage.css';

const RefundModal = ({ item, onConfirm, onClose, isSubmitting }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="refund-modal-overlay" onClick={onClose}>
            <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="refund-modal__title">Request Refund</h3>
                <p className="refund-modal__product">{item.product?.name}</p>
                <label className="refund-modal__label">
                    Reason for refund
                    <textarea
                        className="refund-modal__textarea"
                        placeholder="Please describe why you want to refund this item…"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        autoFocus
                    />
                </label>
                <div className="refund-modal__actions">
                    <button type="button" className="refund-modal__cancel" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="refund-modal__submit"
                        onClick={() => onConfirm(item, reason)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting…' : 'Submit refund request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const STATUS_LABELS = {
    processing: 'Processing',
    'in-transit': 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const TABS = [
    { key: 'all', label: 'All Orders' },
    { key: 'processing', label: 'Processing' },
    { key: 'in-transit', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
];

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

const OrderProgress = ({ status }) => {
    if (status === 'cancelled') return null;

    const steps = ['processing', 'in-transit', 'delivered'];
    const activeIndex = steps.indexOf(status);

    return (
        <div className="order-progress">
            {steps.map((step, i) => (
                <div key={step} className="order-progress__item">
                    <div
                        className={`order-progress__dot ${i <= activeIndex ? 'is-active' : ''
                            } ${i === activeIndex ? 'is-current' : ''}`}
                    >
                        {i < activeIndex ? '✓' : ''}
                    </div>
                    <span
                        className={`order-progress__label ${i <= activeIndex ? 'is-active' : ''
                            }`}
                    >
                        {STATUS_LABELS[step]}
                    </span>
                    {i < steps.length - 1 && (
                        <div
                            className={`order-progress__line ${i < activeIndex ? 'is-active' : ''
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

const isWithinReturnWindow = (createdAt) => {
    const orderDate = new Date(createdAt);
    const ageMs = Date.now() - orderDate.getTime();
    return ageMs <= 30 * 24 * 60 * 60 * 1000;
};

const hasApprovedRefund = (order) =>
    order.items?.some((item) => item.refundRequest?.status === 'approved');

const getOrderDisplayStatus = (order) =>
    hasApprovedRefund(order) ? 'cancelled' : order.status;

const OrderItem = ({ item, canRequestRefund, onReturn, returningItemId }) => {
    const [showRefundForm, setShowRefundForm] = useState(false);
    const [reason, setReason] = useState('');

    const canRefundThis = canRequestRefund && !item.refundRequest;

    const handleSubmit = (e) => {
        e.preventDefault();
        onReturn(item, reason);
        setShowRefundForm(false);
        setReason('');
    };

    return (
        <>
            <div className="order-item">
                <div className="order-item__image">
                    <img src={item.product?.image} alt={item.product?.name} />
                </div>
                <div className="order-item__info">
                    <Link to={`/product/${item.product_id}`} className="order-item__name">
                        {item.product?.name}
                    </Link>
                    <span className="order-item__meta">{item.product?.brand} · Qty {item.quantity}</span>
                </div>
                <div className="order-item__right">
                    <span className="order-item__price">
                        ${(Number(item.unit_price || 0) * Number(item.quantity || 0)).toFixed(2)}
                    </span>
                    {item.refundRequest ? (
                        <span className={`order-item__refund-badge order-item__refund-badge--${item.refundRequest.status}`}>
                            Refund {item.refundRequest.status}
                        </span>
                    ) : canRefundThis ? (
                        <button
                            type="button"
                            className="order-item__return-btn"
                            onClick={() => setShowRefundForm((v) => !v)}
                            disabled={returningItemId === item.id}
                        >
                            {returningItemId === item.id ? 'Sending…' : showRefundForm ? 'Cancel' : 'Refund'}
                        </button>
                    ) : null}
                </div>
            </div>
            {showRefundForm && (
                <form className="order-item__refund-form" onSubmit={handleSubmit}>
                    <textarea
                        className="order-item__refund-reason"
                        placeholder="Why are you requesting a refund for this item? (optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={2}
                        autoFocus
                    />
                    <button type="submit" className="order-item__refund-submit" disabled={returningItemId === item.id}>
                        {returningItemId === item.id ? 'Submitting…' : 'Submit refund request'}
                    </button>
                </form>
            )}
        </>
    );
};

const OrderCard = ({ order, canCancel, onCancel, onReturn, returningItemId, autoExpand, cardRef }) => {
    const [expanded, setExpanded] = useState(autoExpand);
    const displayStatus = getOrderDisplayStatus(order);
    const canRequestRefund = displayStatus !== 'cancelled' && isWithinReturnWindow(order.createdAt);
    const hasRefundable = order.items.some((item) => !item.refundRequest && canRequestRefund);

    return (
        <article className="order-card" ref={cardRef}>
            <button
                type="button"
                className="order-card__summary-row"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
            >
                <div className="order-card__summary-left">
                    <span className="order-card__label">Order #{order.id}</span>
                    <span className="order-card__date">{formatDate(order.createdAt)}</span>
                    <span className="order-card__item-count">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </span>
                </div>
                <div className="order-card__summary-right">
                    <span className="order-card__total-value">${Number(order.total_amount || 0).toFixed(2)}</span>
                    {hasRefundable && <span className="order-card__refund-hint">Refund available</span>}
                    <div className={`order-status order-status--${displayStatus}`}>
                        <span className="order-status__dot" />
                        {STATUS_LABELS[displayStatus]}
                    </div>
                    <span className="order-card__chevron">{expanded ? '▲' : '▼'}</span>
                </div>
            </button>

            {expanded && (
                <div className="order-card__expanded">
                    <OrderProgress status={displayStatus} />
                    <div className="order-card__items">
                        {order.items.map((item) => (
                            <OrderItem
                                key={item.id}
                                item={item}
                                canRequestRefund={canRequestRefund}
                                onReturn={onReturn}
                                returningItemId={returningItemId}
                            />
                        ))}
                    </div>
                    {canCancel && (
                        <div className="order-card__footer-slim">
                            <button className="order-btn order-btn--secondary" onClick={() => onCancel(order.id)}>
                                Cancel Order
                            </button>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
};

const OrdersPage = () => {
    const { user, isLoading } = useAuth();
    const { showToast } = useNotifications();
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [returningItemId, setReturningItemId] = useState(null);
    const [searchParams] = useSearchParams();
    const targetOrderId = Number(searchParams.get('order')) || null;
    const targetRef = useRef(null);

    // Scroll to + highlight the target order once orders are loaded
    useEffect(() => {
        if (!targetOrderId || !targetRef.current) return;
        const el = targetRef.current;
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }, [targetOrderId, orders]);

    useEffect(() => {
        if (isLoading || !user) {
            return;
        }

        let isMounted = true;

        const loadOrders = async () => {
            try {
                setIsPageLoading(true);
                setErrorMessage('');
                const data = await getOrders();

                if (isMounted) {
                    setOrders(Array.isArray(data?.orders) ? data.orders : []);
                }
            } catch (error) {
                if (isMounted) {
                    setOrders([]);
                    setErrorMessage(
                        error?.response?.data?.message || 'Failed to fetch orders.'
                    );
                }
            } finally {
                if (isMounted) {
                    setIsPageLoading(false);
                }
            }
        };

        loadOrders();

        return () => {
            isMounted = false;
        };
    }, [isLoading, user]);

    const filteredOrders = useMemo(() => {
        let list = orders;

        if (activeTab !== 'all') {
            list = list.filter((o) => getOrderDisplayStatus(o) === activeTab);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (o) =>
                    String(o.id).toLowerCase().includes(q) ||
                    o.items.some((it) =>
                        it.product?.name?.toLowerCase().includes(q)
                    )
            );
        }

        return list;
    }, [orders, activeTab, searchQuery]);

    const counts = useMemo(() => {
        const map = { all: orders.length };
        orders.forEach((o) => {
            const displayStatus = getOrderDisplayStatus(o);
            map[displayStatus] = (map[displayStatus] || 0) + 1;
        });
        return map;
    }, [orders]);

    if (isLoading) {
        return (
            <div className="orders-page">
                <div className="container">
                    <div className="orders-empty">
                        <h3>Loading orders...</h3>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === 'product_manager') {
        return <Navigate to="/admin/product-manager/deliveries" replace />;
    }

    if (user.role === 'sales_manager') {
        return <Navigate to="/admin/sales-manager/invoices" replace />;
    }

    const handleCancel = async (orderId) => {
        try {
            const data = await cancelOrder(orderId);
            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId ? { ...order, status: data.order.status } : order
                )
            );
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Unable to cancel order.');
        }
    };

    const handleReturn = async (item, reason) => {
        try {
            setReturningItemId(item.id);
            const data = await requestRefund(item.id, reason);
            setOrders((currentOrders) =>
                currentOrders.map((currentOrder) => ({
                    ...currentOrder,
                    items: currentOrder.items.map((currentItem) =>
                        currentItem.id === item.id
                            ? { ...currentItem, refundRequest: data.refundRequest }
                            : currentItem
                    ),
                }))
            );
            setErrorMessage('');
            // Show toast immediately — don't wait for the background fetch
            showToast({
                id: `refund-${data.refundRequest.id}-received`,
                type: 'refund',
                icon: '🔄',
                title: 'Refund request received',
                body: `Your return request for "${item.product?.name}" has been submitted.`,
                link: `/customer/orders?order=${item.order_id || ''}`,
            });
            invalidateNotifications();
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Unable to request refund.');
        } finally {
            setReturningItemId(null);
        }
    };

    return (
        <div className="orders-page">
            <section className="orders-hero">
                <div className="orders-hero__overlay" />
                <div className="orders-hero__bubbles" aria-hidden="true">
                    <span className="orders-hero__bubble orders-hero__bubble--1" />
                    <span className="orders-hero__bubble orders-hero__bubble--2" />
                    <span className="orders-hero__bubble orders-hero__bubble--3" />
                    <span className="orders-hero__bubble orders-hero__bubble--4" />
                </div>
                <div className="container">
                    <div className="orders-hero__content">
                        <span className="section-label">My Account</span>
                        <h1 className="orders-hero__title">My Orders</h1>
                        <p className="orders-hero__tagline">
                            Track, manage, and reorder your purchases — all in one place.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container">
                <div className="orders-controls">
                    <div className="orders-tabs" role="tablist">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                role="tab"
                                aria-selected={activeTab === tab.key}
                                className={`orders-tab ${activeTab === tab.key ? 'is-active' : ''
                                    }`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                                {counts[tab.key] > 0 && (
                                    <span className="orders-tab__count">{counts[tab.key]}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="orders-search">
                        <svg
                            className="orders-search__icon"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Search by order number or product"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="orders-list">
                    {isPageLoading ? (
                        <div className="orders-empty">
                            <h3>Loading orders...</h3>
                        </div>
                    ) : errorMessage ? (
                        <div className="orders-empty orders-empty--error" role="alert">
                            <h3>Unable to load orders</h3>
                            <p>{errorMessage}</p>
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                canCancel={order.status === 'processing' && user.role === 'sales_manager'}
                                onCancel={handleCancel}
                                onReturn={handleReturn}
                                returningItemId={returningItemId}
                                autoExpand={order.id === targetOrderId}
                                cardRef={order.id === targetOrderId ? targetRef : null}
                            />
                        ))
                    ) : (
                        <div className="orders-empty">
                            <div className="orders-empty__icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                            </div>
                            <h3>No orders found</h3>
                            <p>
                                {activeTab === 'all'
                                    ? "You haven't placed any orders yet."
                                    : `You have no ${STATUS_LABELS[activeTab]?.toLowerCase()} orders.`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
