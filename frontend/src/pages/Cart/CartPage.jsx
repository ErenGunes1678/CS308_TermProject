import { useState } from "react";
import "./CartPage.css";

export default function CartPage() {
  const [quantity, setQuantity] = useState(1);

  const price = 28.0;
  const shipping = quantity > 0 ? 5.99 : 0;
  const subtotal = price * quantity;
  const total = subtotal + shipping;

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 0 ? prev - 1 : 0));
  };

  if (quantity === 0) {
    return (
      <div className="empty-cart-wrapper">
        <div className="empty-cart-card">
          <div className="empty-cart-icon-box">
            <span className="empty-cart-icon">👜</span>
          </div>

          <h2>Your bag is empty</h2>

          <p>
            Looks like you haven&apos;t added anything yet. Let&apos;s find you
            something beautiful!
          </p>

          <a className="start-shopping-btn" href="/products">
            Start Shopping →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="breadcrumb">
        Home <span>›</span> Shopping Bag
      </div>

      <h1 className="cart-title">Shopping Bag</h1>
      <p className="cart-count">({quantity} items)</p>

      <div className="cart-grid">
        <div className="cart-items">
          <div className="cart-item">
            <img
              className="product-image"
              src="https://images.unsplash.com/photo-1586495777744-4413f21062fa"
              alt="lipstick"
            />

            <div className="product-info">
              <p className="brand">LumaBelle</p>
              <h3 className="product-name">Velvet Matte Lipstick</h3>

              <div className="quantity">
                <button onClick={decreaseQuantity}>-</button>
                <span>{quantity}</span>
                <button onClick={increaseQuantity}>+</button>
              </div>
            </div>

            <div className="product-price">${subtotal.toFixed(2)}</div>
          </div>

          <a className="continue-shopping" href="/products">
            ← Continue Shopping
          </a>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="promo">
            <input placeholder="Promo code" />
            <button>Apply</button>
          </div>

          <div className="summary-line">
            <span>Subtotal ({quantity} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-line">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>

          <p className="free-shipping">Add $22.00 more for free shipping</p>

          <div className="summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button className="checkout-btn">Sign In to Checkout →</button>

          <p className="login-note">
            You need to be logged in to checkout
          </p>

          <div className="secure">
            🔒 Secure checkout &nbsp;&nbsp; 💳 All cards accepted
          </div>
        </div>
      </div>
    </div>
  );
}