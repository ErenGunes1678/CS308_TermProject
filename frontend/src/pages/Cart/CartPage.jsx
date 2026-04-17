import { useState } from "react";
import "./CartPage.css";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      brand: "LumaBelle",
      name: "Velvet Matte Lipstick",
      price: 28,
      image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa",
      quantity: 1,
    },
  ]);

  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const total = subtotal + shipping;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-wrapper">
        <div className="empty-cart-card">
          <div className="empty-cart-icon-box">
            <span className="empty-cart-icon">👜</span>
          </div>
          <h2>Your bag is empty</h2>
          <p>Looks like you haven&apos;t added anything yet.</p>
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
      <p className="cart-count">({totalItems} items)</p>

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
                  <button onClick={() => decreaseQuantity(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQuantity(item.id)}>+</button>
                </div>
              </div>

              <div className="product-price">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <a className="continue-shopping" href="/products">
            ← Continue Shopping
          </a>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-line">
            <span>Subtotal ({totalItems} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-line">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}