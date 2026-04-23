function CheckoutSummary({ cartItems, subtotal, shipping, total }) {
  return (
    <div className="checkout-summary">
      <div className="summary-card">
        <h3>Order Summary</h3>

        {cartItems.map((item) => (
          <div className="summary-item" key={item.id}>
            <div className="summary-item-left">
              <img src={item.image} alt={item.name} />
              <span className="summary-qty">{item.quantity}</span>
              <p>{item.name}</p>
            </div>
            <p>${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}

        <div className="summary-line">
          <span>Subtotal</span>
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
  );
}

export default CheckoutSummary;
