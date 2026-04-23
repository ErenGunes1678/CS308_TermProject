import { Link, Navigate } from "react-router-dom";
import "./OrderSuccessPage.css";

export default function OrderSuccessPage() {
  const order = JSON.parse(localStorage.getItem("lastOrder"));

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Order Placed Successfully</h1>
        <p>Thank you for your order. Your purchase has been received.</p>

        <div className="success-details">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
          <p><strong>Email:</strong> {order.address.email}</p>
        </div>

        <div className="success-actions">
          <Link to="/" className="home-btn">Go Home</Link>
          <Link to="/products" className="shop-btn">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}