import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import "./CartPage.css";

export default function CartPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const {
    cartItems,
    itemCount,
    subtotal,
    shipping,
    total,
    amountUntilFreeShipping,
    increaseCartItem,
    decreaseCartItem,
    clearCart,
  } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && user?.role === "product_manager") {
    return <Navigate to="/admin/product-manager/deliveries" replace />;
  }

  if (!isLoading && user?.role === "sales_manager") {
    return <Navigate to="/admin/sales-manager/invoices" replace />;
  }

  const handleClearCart = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuy = async () => {
    if (isSubmitting) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-wrapper">
        <div className="empty-cart-card">
          <div className="empty-cart-icon-box">
            <span className="empty-cart-icon">👜</span>
          </div>
          <h2>Your bag is empty</h2>
          <p>Looks like you haven&apos;t added anything yet.</p>
          <Link className="start-shopping-btn" to="/products">
            Start Shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="breadcrumb">
        Products <span>›</span> Shopping Bag
      </div>

      <h1 className="cart-title">Shopping Bag</h1>
      <p className="cart-count">({itemCount} items)</p>

      <div className="cart-grid">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <img
                className="product-image"
                src={item.image}
                alt={item.name}
              />

              <div className="product-info">
                <p className="brand">{item.brand}</p>
                <h3 className="product-name">{item.name}</h3>

                <div className="quantity">
                  <button onClick={() => decreaseCartItem(item.cartItemId)}>-</button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => increaseCartItem(item.id)}
                    disabled={item.quantity >= item.stock}
                    title={item.quantity >= item.stock ? "Cannot add more than available stock" : "Increase quantity"}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="product-price">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <div className="cart-actions">
            <Link className="continue-shopping" to="/products">
              ← Continue Shopping
            </Link>

            <button
              type="button"
              className="empty-cart-btn"
              onClick={handleClearCart}
              disabled={isSubmitting}
            >
              Empty Cart
            </button>
          </div>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-line">
            <span>Subtotal ({itemCount} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-line">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>

          {amountUntilFreeShipping > 0 ? (
            <p className="free-shipping">
              Add ${amountUntilFreeShipping.toFixed(2)} more for free shipping
            </p>
          ) : (
            <p className="free-shipping">You have free shipping</p>
          )}

          <div className="summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            type="button"
            className="checkout-btn"
            onClick={handleBuy}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
