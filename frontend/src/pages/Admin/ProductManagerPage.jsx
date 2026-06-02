import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './ProductManagerPage.css';

const taskCards = [
  {
    title: 'Delivery List',
    description: 'Review active orders and move them through the delivery workflow.',
    path: '/admin/product-manager/deliveries',
    status: 'Active',
  },
  {
    title: 'Comment Moderation',
    description: 'Approve or reject pending customer reviews before they appear publicly.',
    path: '/admin/product-manager/comments',
    status: 'Active',
  },
  {
    title: 'Product Inventory',
    description: 'Manage product stock, availability, and catalog information.',
    path: '/admin/product-manager/inventory',
    status: 'Active',
  },
];

const ProductManagerPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'product_manager') {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="product-manager-page">
      <div className="admin-page-header container">
        <div className="admin-page-header__text">
          <p className="admin-page-header__eyebrow">Admin Panel</p>
          <h1 className="admin-page-header__title">Product Manager</h1>
        </div>
        <button
          type="button"
          className="admin-page-header__back-btn"
          onClick={() => navigate('/')}
        >
          Back to Store
        </button>
      </div>

      <main className="container product-manager-main">
        <section className="product-manager-panel">

          <div className="product-manager-task-grid">
            {taskCards.map((task) => (
              <Link key={task.path} to={task.path} className="product-manager-task-card">
                <div className="product-manager-task-card__top">
                  <h3>{task.title}</h3>
                  <span className={task.status === 'Active' ? 'is-active' : ''}>{task.status}</span>
                </div>
                <p>{task.description}</p>
                <div className="product-manager-task-card__action">
                  Open task <span aria-hidden="true">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductManagerPage;
