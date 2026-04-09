import "./CartPage.css";

export default function CartPage() {
  return (
    <div className="cart-container">

      <div className="breadcrumb">
        Home <span>›</span> Shopping Bag
      </div>

      <h1 className="cart-title">Shopping Bag</h1>
      <p className="cart-count">(1 items)</p>

      <div className="cart-grid">

        {/* LEFT SIDE */}
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
                <button>-</button>
                <span>1</span>
                <button>+</button>
              </div>
            </div>

            <div className="product-price">
              $28.00
            </div>
          </div>

          <a className="continue-shopping" href="/products">
            ← Continue Shopping
          </a>

        </div>

        {/* RIGHT SIDE */}
        <div className="order-summary">

          <h2>Order Summary</h2>

          <div className="promo">
            <input placeholder="Promo code" />
            <button>Apply</button>
          </div>

          <div className="summary-line">
            <span>Subtotal (1 items)</span>
            <span>$28.00</span>
          </div>

          <div className="summary-line">
            <span>Shipping</span>
            <span>$5.99</span>
          </div>

          <p className="free-shipping">
            Add $22.00 more for free shipping
          </p>

          <div className="summary-total">
            <span>Total</span>
            <span>$33.99</span>
          </div>

          <button className="checkout-btn">
            Sign In to Checkout →
          </button>

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