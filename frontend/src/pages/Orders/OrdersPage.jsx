import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cancelOrder, getOrders, requestRefund } from '../../services/orderService';
import './OrdersPage.css';

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

const OrderCard = ({ order, canCancel, onCancel, onReturn, returningItemId }) => {
    const [expanded, setExpanded] = useState(false);
    const visibleItems = expanded ? order.items : order.items.slice(0, 2);
    const hiddenCount = order.items.length - 2;
    const canRequestRefund = order.status === 'delivered' && isWithinReturnWindow(order.createdAt);
    const refundForOrder = order.items
        .map((item) => ({
            ...item.refundRequest,
            productName: item.product?.name || `Product #${item.product_id}`,
        }))
        .filter((request) => request.id);

    return (
        <article className="order-card">
            <header className="order-card__header">
                <div className="order-card__header-left">
                    <span className="order-card__label">Order</span>
                    <h3 className="order-card__id">{order.id}</h3>
                    <span className="order-card__date">Placed on {formatDate(order.createdAt)}</span>
                </div>
                <div className={`order-status order-status--${order.status}`}>
                    <span className="order-status__dot" />
                    {STATUS_LABELS[order.status]}
                </div>
            </header>

            <OrderProgress status={order.status} />

            <div className="order-card__items">
                {visibleItems.map((item) => (
                    <div key={item.id} className="order-item">
                        <div className="order-item__image">
                            <img src={item.product?.image} alt={item.product?.name} />
                        </div>
                        <div className="order-item__info">
                            <span className="order-item__brand">{item.product?.brand}</span>
                            <Link to={`/product/${item.product_id}`} className="order-item__name">
                                {item.product?.name}
                            </Link>
                            <span className="order-item__variant">{item.product?.subcategory}</span>
                            <span className="order-item__qty">Qty: {item.quantity}</span>
                            {item.refundRequest ? (
                                <span className="order-item__refund-status">
                                    Refund {item.refundRequest.status}
                                </span>
                            ) : canRequestRefund ? (
                                <button
                                    type="button"
                                    className="order-item__refund-btn"
                                    onClick={() => onReturn(order, item)}
                                    disabled={returningItemId === item.id}
                                >
                                    {returningItemId === item.id ? 'Requesting...' : 'Request refund'}
                                </button>
                            ) : null}
                        </div>
                        <div className="order-item__price">
                            ${(Number(item.unit_price || 0) * Number(item.quantity || 0)).toFixed(2)}
                        </div>
                    </div>
                ))}

                {hiddenCount > 0 && !expanded && (
                    <button
                        className="order-card__expand"
                        onClick={() => setExpanded(true)}
                    >
                        + View {hiddenCount} more {hiddenCount === 1 ? 'item' : 'items'}
                    </button>
                )}
                {expanded && order.items.length > 2 && (
                    <button
                        className="order-card__expand"
                        onClick={() => setExpanded(false)}
                    >
                        Show less
                    </button>
                )}
                {refundForOrder.length > 0 && (
                    <div className="order-refund-statuses">
                        {refundForOrder.map((request) => (
                            <span key={request.id}>
                                {request.productName}: {request.status}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <footer className="order-card__footer">
                <div className="order-card__summary">
                    <div className="order-card__total">
                        <span className="order-card__total-label">Total</span>
                        <span className="order-card__total-value">${Number(order.total_amount || 0).toFixed(2)}</span>
                    </div>
                </div>

                <div className="order-card__actions">
                    {(order.status === 'processing' || order.status === 'in-transit') && (
                        <button className="order-btn order-btn--primary">
                            Track Package
                        </button>
                    )}

                    {canCancel && (
                        <button
                            className="order-btn order-btn--secondary"
                            onClick={() => onCancel(order.id)}
                        >
                            Cancel Order
                        </button>
                    )}

                    {order.status === 'delivered' && !canRequestRefund && (
                        <button
                            className="order-btn order-btn--disabled"
                            disabled
                        >
                            Return window closed
                        </button>
                    )}
                </div>
            </footer>
        </article>
    );
};

const OrdersPage = () => {
    const { user, isLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [returningItemId, setReturningItemId] = useState(null);

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
            list = list.filter((o) => o.status === activeTab);
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
            map[o.status] = (map[o.status] || 0) + 1;
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

    const handleReturn = async (_order, item) => {
        try {
            setReturningItemId(item.id);
            const data = await requestRefund(item.id);
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
