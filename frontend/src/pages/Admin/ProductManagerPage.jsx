import { Link, Navigate } from 'react-router-dom';
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
      <section className="product-manager-hero">
        <div className="product-manager-hero__overlay" />
        <div className="product-manager-hero__bubbles" aria-hidden="true">
          <span className="product-manager-hero__bubble product-manager-hero__bubble--1" />
          <span className="product-manager-hero__bubble product-manager-hero__bubble--2" />
          <span className="product-manager-hero__bubble product-manager-hero__bubble--3" />
        </div>
        <div className="container product-manager-hero__content">
          <p className="product-manager-hero__eyebrow">Product Manager Console</p>
          <h1 className="product-manager-hero__title">Product Manager Tasks</h1>
          <p className="product-manager-hero__tagline">
            Use this workspace to manage deliveries, review comments, and monitor product operations.
          </p>
        </div>
      </section>

      <main className="container product-manager-main">
        <section className="product-manager-panel">
          <div className="product-manager-panel__header">
            <div>
              <p className="product-manager-panel__label">Workspace</p>
              <h2 className="product-manager-panel__title">Choose a task</h2>
            </div>
            <span className="product-manager-panel__role">Product Manager</span>
          </div>

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
