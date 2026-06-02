import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './UnauthorizedPage.css';

const roleHome = {
  customer: '/profile',
  product_manager: '/admin/product-manager',
  sales_manager: '/admin/sales-manager',
};

const roleLabel = {
  customer: 'Customer',
  product_manager: 'Product Manager',
  sales_manager: 'Sales Manager',
};

function UnauthorizedPage() {
  const { user } = useAuth();
  const homePath = roleHome[user?.role] || '/';
  const currentRole = roleLabel[user?.role] || 'Guest';

  return (
    <div className="unauthorized-page">
      <section className="unauthorized-panel">
        <p className="unauthorized-panel__eyebrow">Access restricted</p>
        <h1>This area is not available for your role.</h1>
        <p>
          You are signed in as <strong>{currentRole}</strong>. Use your role dashboard or account page to continue.
        </p>
        <div className="unauthorized-panel__actions">
          <Link to={homePath}>Go to my area</Link>
          <Link to="/">Back to store</Link>
        </div>
      </section>
    </div>
  );
}

export default UnauthorizedPage;
