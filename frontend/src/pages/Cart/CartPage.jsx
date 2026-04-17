import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import "./CartPage.css";

export default function CartPage() {
  const {
    cartItems,
    itemCount,
    subtotal,
    shipping,
    total,
    amountUntilFreeShipping,
    increaseCartItem,
    decreaseCartItem,
  } = useCart();

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
        Home <span>›</span> Shopping Bag
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
                  <button onClick={() => decreaseCartItem(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseCartItem(item.id)}>+</button>
                </div>
              </div>

              <div className="product-price">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <Link className="continue-shopping" to="/products">
            ← Continue Shopping
          </Link>
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
        </div>
      </div>
    </div>
  );
}
