import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './OrdersPage.css';

// ────────────────────────────────────────────────────────────
// TODO: Replace with an API call — e.g.
//   useEffect(() => { api.get('/orders').then(r => setOrders(r.data)) }, [])
// ────────────────────────────────────────────────────────────
const MOCK_ORDERS = [
    {
        id: 'LUM-2026-00412',
        date: '2026-04-20',
        status: 'processing',
        total: 184.5,
        address: 'Maslak Mah. Büyükdere Cad. No:237, Sarıyer / İstanbul',
        items: [
            {
                id: 1,
                name: 'Velvet Matte Lipstick',
                brand: 'LumaBelle',
                variant: 'Shade: Rouge Noir',
                qty: 2,
                price: 28,
                image: 'https://placehold.co/120x120/f0e4d8/c4956a?text=Lipstick',
            },
            {
                id: 2,
                name: 'Rose Hydrating Serum',
                brand: 'LumaBelle',
                variant: '30ml',
                qty: 1,
                price: 128.5,
                image: 'https://placehold.co/120x120/f0e4d8/c4956a?text=Serum',
            },
        ],
    },
    {
        id: 'LUM-2026-00387',
        date: '2026-04-14',
        status: 'in-transit',
        trackingNo: 'TR8947213052',
        total: 96,
        address: 'Maslak Mah. Büyükdere Cad. No:237, Sarıyer / İstanbul',
        items: [
            {
                id: 3,
                name: 'Silk Touch Foundation',
                brand: 'Aurélie',
                variant: 'Ivory 02',
                qty: 1,
                price: 96,
                image: 'https://placehold.co/120x120/f0e4d8/c4956a?text=Foundation',
            },
        ],
    },
    {
        id: 'LUM-2026-00301',
        date: '2026-04-02',
        status: 'delivered',
        deliveredOn: '2026-04-06',
        total: 215.75,
        address: 'Maslak Mah. Büyükdere Cad. No:237, Sarıyer / İstanbul',
        items: [
            {
                id: 4,
                name: 'Nourishing Hair Mask',
                brand: 'Botanique',
                variant: '200ml',
                qty: 1,
                price: 78,
                image: 'https://placehold.co/120x120/f0e4d8/c4956a?text=Mask',
            },
            {
                id: 5,
                name: 'Pearl Glow Highlighter',
                brand: 'LumaBelle',
                variant: 'Champagne',
                qty: 1,
                price: 54,
                image: 'https://placehold.co/120x120/f0e4d8/c4956a?text=Highlight',
            },
            {
                id: 6,
                name: 'Rose Hydrating Serum',
                brand: 'LumaBelle',
                variant: '30ml',
                qty: 1,
                price: 83.75,
                image: 'https://placehold.co/120x120/f0e4d8/c4956a?text=Serum',
            },
        ],
    },
    {
        id: 'LUM-2026-00244',
        date: '2026-03-15',
        status: 'delivered',
        deliveredOn: '2026-03-19',
        total: 145,
        address: 'Maslak Mah. Büyükdere Cad. No:237, Sarıyer / İstanbul',
        items: [
            {
                id: 7,
                name: 'Rejuvenating Eye Cream',
                brand: 'Aurélie',
                variant: '15ml',
                qty: 1,
                price: 145,
                image: 'https://placehold.co/120x120/f0e4d8/c4956a?text=Eye+Cream',
            },
        ],
    },
    {
        id: 'LUM-2026-00189',
        date: '2026-02-28',
        status: 'cancelled',
        total: 62,
        address: 'Maslak Mah. Büyükdere Cad. No:237, Sarıyer / İstanbul',
        items: [
            {
                id: 8,
                name: 'Bronzing Powder',
                brand: 'LumaBelle',
                variant: 'Sun Kissed',
                qty: 1,
                price: 62,
                image: 'https://placehold.co/120x120/f0e4d8/c4956a?text=Bronzer',
            },
        ],
    },
];

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

// Returns true if a delivered order is still within the 30-day return window
const isReturnEligible = (order) => {
    if (order.status !== 'delivered' || !order.deliveredOn) return false;
    const delivered = new Date(order.deliveredOn);
    const now = new Date();
    const daysSince = Math.floor((now - delivered) / (1000 * 60 * 60 * 24));
    return daysSince <= 30;
};

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

// ────────────────────────────────────────────────────────────
// Progress track rendered under each active order
// ────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────
// Single order card
// ────────────────────────────────────────────────────────────
const OrderCard = ({ order, onCancel, onReturn }) => {
    const [expanded, setExpanded] = useState(false);
    const visibleItems = expanded ? order.items : order.items.slice(0, 2);
    const hiddenCount = order.items.length - 2;

    return (
        <article className="order-card">
            {/* Header */}
            <header className="order-card__header">
                <div className="order-card__header-left">
                    <span className="order-card__label">Order</span>
                    <h3 className="order-card__id">{order.id}</h3>
                    <span className="order-card__date">Placed on {formatDate(order.date)}</span>
                </div>
                <div className={`order-status order-status--${order.status}`}>
                    <span className="order-status__dot" />
                    {STATUS_LABELS[order.status]}
                </div>
            </header>

            {/* Progress tracker */}
            <OrderProgress status={order.status} />

            {/* Items list */}
            <div className="order-card__items">
                {visibleItems.map((item) => (
                    <div key={item.id} className="order-item">
                        <div className="order-item__image">
                            <img src={item.image} alt={item.name} />
                        </div>
                        <div className="order-item__info">
                            <span className="order-item__brand">{item.brand}</span>
                            <Link to={`/product/${item.id}`} className="order-item__name">
                                {item.name}
                            </Link>
                            <span className="order-item__variant">{item.variant}</span>
                            <span className="order-item__qty">Qty: {item.qty}</span>
                        </div>
                        <div className="order-item__price">
                            ${(item.price * item.qty).toFixed(2)}
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
            </div>

            {/* Footer */}
            <footer className="order-card__footer">
                <div className="order-card__summary">
                    <div className="order-card__delivery">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{order.address}</span>
                    </div>
                    <div className="order-card__total">
                        <span className="order-card__total-label">Total</span>
                        <span className="order-card__total-value">${order.total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="order-card__actions">
                    <Link to={`/orders/${order.id}`} className="order-btn order-btn--ghost">
                        View Details
                    </Link>

                    {order.status === 'processing' && (
                        <button
                            className="order-btn order-btn--danger"
                            onClick={() => onCancel(order.id)}
                        >
                            Cancel Order
                        </button>
                    )}

                    {order.status === 'in-transit' && (
                        <button className="order-btn order-btn--primary">
                            Track Package
                        </button>
                    )}

                    {order.status === 'delivered' && (
                        <>
                            <button className="order-btn order-btn--ghost">Reorder</button>
                            {isReturnEligible(order) && (
                                <button
                                    className="order-btn order-btn--primary"
                                    onClick={() => onReturn(order.id)}
                                >
                                    Request Return
                                </button>
                            )}
                        </>
                    )}

                    {order.status === 'cancelled' && (
                        <button className="order-btn order-btn--primary">Reorder</button>
                    )}
                </div>
            </footer>
        </article>
    );
};

// ────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────
const OrdersPage = () => {
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrders = useMemo(() => {
        let list = orders;

        if (activeTab !== 'all') {
            list = list.filter((o) => o.status === activeTab);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (o) =>
                    o.id.toLowerCase().includes(q) ||
                    o.items.some((it) => it.name.toLowerCase().includes(q))
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

    const handleCancel = (id) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        // TODO: await api.put(`/orders/${id}/cancel`)
        setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o))
        );
    };

    const handleReturn = (id) => {
        // TODO: navigate to a return flow page, or post refund request
        alert(
            `Return request submitted for order ${id}. A sales manager will review your request shortly.`
        );
    };

    return (
        <div className="orders-page">
            {/* Hero */}
            <section className="orders-hero">
                <div className="orders-hero__overlay" />
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
                {/* Controls */}
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

                {/* Orders list */}
                <div className="orders-list">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onCancel={handleCancel}
                                onReturn={handleReturn}
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
                            <Link to="/products" className="order-btn order-btn--primary">
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;