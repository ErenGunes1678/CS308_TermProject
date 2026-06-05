import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";


const stats = [
  {
    title: "Monthly Revenue",
    value: "$28.9K",
    change: "+18%",
    icon: "$",
    color: "pink",
  },
  {
    title: "Total Orders",
    value: "209",
    change: "+12%",
    icon: "▣",
    color: "purple",
  },
  {
    title: "New Customers",
    value: "86",
    change: "+24%",
    icon: "♟",
    color: "blue",
  },
  {
    title: "Conversion Rate",
    value: "3.8%",
    change: "+0.4%",
    icon: "↗",
    color: "green",
  },
];

const mockRevenueData = [
  { month: "Oct", value: 12000 },
  { month: "Nov", value: 18900 },
  { month: "Dec", value: 32000 },
  { month: "Jan", value: 23000 },
  { month: "Feb", value: 24500 },
  { month: "Mar", value: 28900 },
];

const categories = [
  { name: "Skincare", percent: 40 },
  { name: "Makeup", percent: 33 },
  { name: "Haircare", percent: 19 },
  { name: "Men Care", percent: 12 },
];

const initialComments  = [
  {
    id: 1,
    user: "Luna B.",
    product: "Radiance Boost Serum",
    text: "Absolutely amazing! My skin has never been more radiant.",
  },
  {
    id: 2,
    user: "Rose T.",
    product: "Velvet Matte Lipstick",
    text: "The color is gorgeous and it lasts all day.",
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [hoveredRevenue, setHoveredRevenue] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [comments, setComments] = useState(initialComments);

  const handleReviewComment = (commentId) => {
  setComments((currentComments) =>
    currentComments.filter((comment) => comment.id !== commentId)
  );
};

  const revenueData = mockRevenueData.map((item) => ({
    ...item,
    label: `$${Number(item.value).toLocaleString("en-US")}`,
  }));

  const getRevenuePoint = (item, index) => {
    const max = 34000;
    const width = 600;
    const height = 170;

    const x = (index / (revenueData.length - 1)) * width;
    const y = height - (item.value / max) * height;

    return { x, y };
  };

  const createLinePoints = () => {
    return revenueData
      .map((item, index) => {
        const point = getRevenuePoint(item, index);
        return `${point.x},${point.y}`;
      })
      .join(" ");
  };

  return (
    <div className="admin-page">
      <main className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <p className="admin-label">ADMIN PANEL</p>
            <h1>Lumière Dashboard</h1>
          </div>

          <button className="back-btn" onClick={() => navigate("/")}>
            Back to Store
          </button>
        </div>

        <div className="admin-tabs">
          {["Dashboard", "Products", "Discounts", "Invoices"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Dashboard" && "⌁"}
              {tab === "Products" && "◈"}
              {tab === "Discounts" && "◇"}
              {tab === "Invoices" && "▤"}
              <span>{tab}</span>
            </button>
          ))}
        </div>

        <section className="stats-grid">
          {stats.map((item) => (
            <div className="stat-card" key={item.title}>
              <div className={`stat-icon ${item.color}`}>{item.icon}</div>
              <span className="stat-change">{item.change}</span>

              <h2>{item.value}</h2>
              <p>{item.title}</p>
            </div>
          ))}
        </section>

        <section className="charts-grid">
          <div className="chart-card revenue-card">
            <div className="card-title-row">
              <h3>Revenue Overview</h3>
              <span>Last 6 Months</span>
            </div>

            <div className="line-chart">
              <div className="y-labels">
                <span>$34k</span>
                <span>$26k</span>
                <span>$17k</span>
                <span>$9k</span>
                <span>$0k</span>
              </div>

              <div className="chart-area">
                <svg viewBox="0 0 600 170" preserveAspectRatio="none">
                  <defs>
                    <linearGradient
                      id="pinkGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#f43f5e"
                        stopOpacity="0.22"
                      />
                      <stop
                        offset="100%"
                        stopColor="#f43f5e"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <polyline
                    points={`0,170 ${createLinePoints()} 600,170`}
                    fill="url(#pinkGradient)"
                    stroke="none"
                  />

                  <polyline
                    points={createLinePoints()}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {revenueData.map((item, index) => {
                    const point = getRevenuePoint(item, index);

                    return (
                      <g key={item.month}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="#f43f5e"
                          opacity={hoveredRevenue?.month === item.month ? 1 : 0}
                        />

                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="18"
                          fill="transparent"
                          onMouseEnter={() =>
                            setHoveredRevenue({
                              ...item,
                              x: point.x,
                              y: point.y,
                            })
                          }
                          onMouseLeave={() => setHoveredRevenue(null)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {hoveredRevenue && (
                  <div
                    className="chart-tooltip revenue-tooltip"
                    style={{
                      left: `${(hoveredRevenue.x / 600) * 100}%`,
                      top: `${(hoveredRevenue.y / 170) * 100}%`,
                    }}
                  >
                    <strong>{hoveredRevenue.month}</strong>
                    <span>Revenue : {hoveredRevenue.label}</span>
                  </div>
                )}

                <div className="x-labels">
                  {revenueData.map((item) => (
                    <span key={item.month}>{item.month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card category-card">
  <h3>Sales by Category</h3>

  <div className="bar-list">
    {categories.map((category, index) => (
      <div
        className="bar-row"
        key={category.name}
        onMouseEnter={() =>
          setHoveredCategory({
            ...category,
            index,
          })
        }
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <span>{category.name}</span>

        <div className="bar-track">
          <div
            className="bar-fill"
            style={{ width: `${category.percent * 2}%` }}
          />
        </div>
      </div>
    ))}

    {hoveredCategory && (
      <div
        className="bar-tooltip"
        style={{
          top: `${hoveredCategory.index * 43 + 20}px`,
          left: "120px",
        }}
      >
        <strong>{hoveredCategory.name}</strong>
        <span>Share : {hoveredCategory.percent}%</span>
      </div>
    )}
  </div>

  <div className="percent-axis">
    <span>0%</span>
    <span>10%</span>
    <span>20%</span>
    <span>30%</span>
    <span>40%</span>
  </div>
</div>
</section>

              <section className="comments-card">
  <h3>Pending Comments Approval</h3>

  {comments.length === 0 ? (
    <div className="comments-empty">
      All comments have been reviewed!
    </div>
  ) : (
    <div className="comments-list">
      {comments.map((comment) => (
        <div className="comment-row" key={comment.id}>
          <div>
            <p>
              <strong>{comment.user}</strong>
              <span> on </span>
              <a href="#">{comment.product}</a>
            </p>

            <blockquote>“{comment.text}”</blockquote>
          </div>

          <div className="dashboard-comment-actions">
            <button
              type="button"
              className="dashboard-comment-btn dashboard-comment-btn--approve"
              onClick={() => handleReviewComment(comment.id)}
            >
              ✓
            </button>

            <button
              type="button"
              className="dashboard-comment-btn dashboard-comment-btn--reject"
              onClick={() => handleReviewComment(comment.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</section>
      </main>
    </div>
  );
}