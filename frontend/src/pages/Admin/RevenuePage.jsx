import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowDown,
  ArrowUp,
  BadgeDollarSign,
  CreditCard,
  Package,
  RefreshCw,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import api from "../../services/api";
import "./DashboardPage.css";

const periods = ["7D", "30D", "6M", "1Y"];

function fmt(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}

function pct(n, tone) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n}%`;
}

function createLinePoints(data, key, max, width = 580, height = 170) {
  if (!data.length) return "";
  return data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - (item[key] / Math.max(max, 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

function createAreaPoints(linePoints, width = 580, height = 170) {
  return `0,${height} ${linePoints} ${width},${height}`;
}

function InteractiveLineChart({ data, width = 580, height = 170 }) {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  const handleMouseMove = useCallback(
    (e) => {
      if (!svgRef.current || !data.length) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const svgX = (mouseX / rect.width) * width;
      const idx = Math.min(
        data.length - 1,
        Math.max(0, Math.round((svgX / width) * (data.length - 1)))
      );
      const item = data[idx];
      const ptX = (idx / Math.max(data.length - 1, 1)) * width;
      const ptY = height - (item.revenue / Math.max(maxRevenue, 1)) * height;
      setTooltip({ idx, item, x: ptX, y: ptY, svgW: rect.width, svgH: rect.height });
    },
    [data, width, height, maxRevenue]
  );

  if (!data.length) {
    return <div className="products-empty">No revenue data available.</div>;
  }

  const yLabels = Array.from({ length: 5 }, (_, i) =>
    fmt(maxRevenue - (maxRevenue / 4) * i)
  );

  const revenuePoints = createLinePoints(data, "revenue", maxRevenue, width, height);
  const returnPoints = createLinePoints(data, "returns", maxRevenue, width, height);

  return (
    <div className="revenue-chart revenue-chart--large">
      <div className="revenue-chart__y">
        {yLabels.map((l) => <span key={l}>{l}</span>)}
      </div>
      <div className="revenue-chart__plot">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
          style={{ cursor: "crosshair" }}
        >
          <defs>
            <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={createAreaPoints(revenuePoints, width, height)} fill="url(#revenueArea)" stroke="none" />
          <polyline points={returnPoints} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          <polyline points={revenuePoints} fill="none" stroke="#f43f5e" strokeWidth="2.4" strokeLinecap="round" />

          {tooltip && (
            <>
              <line
                x1={tooltip.x} y1={0}
                x2={tooltip.x} y2={height}
                stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"
              />
              <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#f43f5e" />
            </>
          )}
        </svg>

        {tooltip && (() => {
          const pctX = tooltip.x / width;
          const left = pctX > 0.7 ? "auto" : `${(tooltip.x / width) * 100}%`;
          const right = pctX > 0.7 ? "0" : "auto";
          return (
            <div
              className="rev-tooltip"
              style={{ left, right, top: `${Math.max(0, (tooltip.y / height) * 88 - 10)}%` }}
            >
              <strong>{tooltip.item.month}</strong>
              <span className="rev-tooltip__rev">Revenue: {fmt(tooltip.item.revenue)}</span>
              <span className="rev-tooltip__ret">Returns: {fmt(tooltip.item.returns)}</span>
            </div>
          );
        })()}

        <div className="revenue-chart__x">
          {data.map((item) => <span key={item.month}>{item.month}</span>)}
        </div>
      </div>
    </div>
  );
}

function InteractiveBarChart({ data }) {
  const [activeIdx, setActiveIdx] = useState(null);

  if (!data.length) {
    return <div className="products-empty">No order volume data available.</div>;
  }

  const maxOrders = Math.max(...data.map((d) => d.orders), 1);
  const yMax = Math.ceil(maxOrders / 50) * 50 || 50;
  const yLabels = [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0];

  return (
    <div className="orders-chart">
      <div className="orders-chart__y">
        {yLabels.map((l) => <span key={l}>{l}</span>)}
      </div>
      <div className="orders-chart__bars" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(32px, 1fr))` }}>
        {data.map((item, i) => (
          <div
            className="orders-chart__bar-wrap"
            key={item.month}
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
            style={{ position: "relative" }}
          >
            {activeIdx === i && (
              <div className="rev-tooltip rev-tooltip--bar">
                <strong>{item.month}</strong>
                <span className="rev-tooltip__rev">Orders: {item.orders}</span>
              </div>
            )}
            <div className="orders-chart__track">
              <div
                className="orders-chart__bar"
                style={{
                  height: `${(item.orders / yMax) * 100}%`,
                  opacity: activeIdx === null || activeIdx === i ? 1 : 0.4,
                  transition: "opacity 0.15s",
                }}
              />
            </div>
            <span>{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ categories }) {
  const [hovered, setHovered] = useState(null);

  if (!categories.length) {
    return <div className="products-empty">No category revenue data available.</div>;
  }

  const gradient = `conic-gradient(${categories
    .reduce(
      (acc, item) => {
        const start = acc.total;
        const end = start + item.percent;
        acc.parts.push(`${item.color} ${start}% ${end}%`);
        acc.total = end;
        return acc;
      },
      { total: 0, parts: [] }
    )
    .parts.join(", ")})`;

  return (
    <div className="donut-wrap">
      <div
        className="donut-chart"
        style={{ background: gradient }}
      >
        <span />
        {hovered !== null && (
          <div className="donut-center-label">
            <strong>{hovered.percent}%</strong>
            <small>{hovered.name}</small>
          </div>
        )}
      </div>
      <div className="category-legend">
        {categories.map((item) => (
          <div
            className="category-legend__row"
            key={item.name}
            onMouseEnter={() => setHovered(item)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "default", borderRadius: 8, padding: "2px 6px", background: hovered?.name === item.name ? "#f8fafc" : "transparent" }}
          >
            <span><i style={{ backgroundColor: item.color }} />{item.name}</span>
            <strong>{item.percent}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RevenuePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6M");
  const [stats, setStats] = useState(null);
  const [overTime, setOverTime] = useState([]);
  const [ordersVolume, setOrdersVolume] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.allSettled([
      api.get(`/revenue/stats?period=${selectedPeriod}`),
      api.get(`/revenue/over-time?period=${selectedPeriod}`),
      api.get(`/revenue/orders-volume?period=${selectedPeriod}`),
      api.get(`/revenue/by-category?period=${selectedPeriod}`),
      api.get("/revenue/transactions"),
    ]).then(([statsRes, overTimeRes, ordersRes, catRes, txRes]) => {
      if (cancelled) return;
      setStats(statsRes.status === "fulfilled" ? statsRes.value.data : null);
      setOverTime(overTimeRes.status === "fulfilled" ? overTimeRes.value.data.data || [] : []);
      setOrdersVolume(ordersRes.status === "fulfilled" ? ordersRes.value.data.data || [] : []);
      setCategories(catRes.status === "fulfilled" ? catRes.value.data.data || [] : []);
      setTransactions(txRes.status === "fulfilled" ? txRes.value.data.data || [] : []);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [selectedPeriod]);

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? fmt(stats.totalRevenue) : "—",
      change: stats ? pct(stats.revenueChange) : null,
      tone: stats && stats.revenueChange >= 0 ? "positive" : "negative",
      color: "pink",
      Icon: BadgeDollarSign,
    },
    {
      title: "Total Orders",
      value: stats ? String(stats.totalOrders) : "—",
      change: stats ? pct(stats.ordersChange) : null,
      tone: stats && stats.ordersChange >= 0 ? "positive" : "negative",
      color: "purple",
      Icon: Package,
    },
    {
      title: "Avg. Order Value",
      value: stats ? fmt(stats.avgOrderValue) : "—",
      change: null,
      tone: "positive",
      color: "blue",
      Icon: TrendingUp,
    },
    {
      title: "Return Rate",
      value: stats ? `${stats.returnRate}%` : "—",
      change: null,
      tone: "negative",
      color: "amber",
      Icon: UsersRound,
    },
  ];

  return (
    <div className="admin-page revenue-page">
      <main className="dashboard-container revenue-container">
        <header className="revenue-hero">
          <div>
            <p className="admin-label">Sales Manager</p>
            <h1>Revenue Analytics</h1>
          </div>

          <div className="period-control" aria-label="Revenue period">
            {periods.map((period) => (
              <button
                key={period}
                type="button"
                className={selectedPeriod === period ? "period-control__item active" : "period-control__item"}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </header>

        <section className="revenue-stats-grid">
          {statCards.map(({ Icon, ...item }) => (
            <div className={`revenue-stat-card${loading ? " revenue-stat-card--loading" : ""}`} key={item.title}>
              <div className={`stat-icon ${item.color}`}>
                <Icon size={20} strokeWidth={2.3} />
              </div>
              {item.change !== null && (
                <span className={`stat-change stat-change--${item.tone}`}>
                  {item.tone === "negative" ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                  {item.change}
                </span>
              )}
              <h2>{item.value}</h2>
              <p>{item.title}</p>
            </div>
          ))}
        </section>

        <section className="revenue-analytics-card revenue-wide-card">
          <div className="revenue-card-header">
            <div>
              <h3>Revenue vs Returns</h3>
              <p>Gross revenue and returns over selected period</p>
            </div>
            <div className="chart-legend">
              <span><i className="legend-dot legend-dot--revenue" />Revenue</span>
              <span><i className="legend-dot legend-dot--returns" />Returns</span>
            </div>
          </div>
          <InteractiveLineChart data={overTime} />
        </section>

        <section className="revenue-section-grid">
          <div className="revenue-analytics-card">
            <div className="revenue-card-header">
              <div>
                <h3>Orders Volume</h3>
                <p>Number of orders per period</p>
              </div>
            </div>
            <InteractiveBarChart data={ordersVolume} />
          </div>

          <div className="revenue-analytics-card">
            <div className="revenue-card-header">
              <div>
                <h3>Revenue by Category</h3>
                <p>Share of total revenue</p>
              </div>
            </div>
            <DonutChart categories={categories} />
          </div>
        </section>

        <section className="revenue-analytics-card revenue-wide-card">
          <div className="revenue-card-header">
            <div>
              <h3>Recent Transactions</h3>
              <p>Latest sales and refunds</p>
            </div>
          </div>
          <div className="transaction-list">
            {transactions.length > 0 ? transactions.map((item, i) => (
              <div className="transaction-row" key={i}>
                <span className={`transaction-icon transaction-icon--${item.type}`}>
                  {item.type === "return" ? <RefreshCw size={17} /> : <BadgeDollarSign size={17} />}
                </span>
                <div>
                  <strong>{item.customer}</strong>
                  <p>{item.detail}</p>
                </div>
                <span className={`transaction-amount transaction-amount--${item.type}`}>
                  {item.amount}
                </span>
              </div>
            )) : (
              <div className="products-empty">No transactions available.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
