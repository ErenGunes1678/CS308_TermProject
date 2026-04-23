function ReviewStep({
  addressData,
  paymentLabel,
  cartItems,
  onBack,
  onPlaceOrder,
}) {
  return (
    <div className="checkout-card">
      <h2>Review Your Order</h2>

      <div className="review-box">
        <p className="review-label">SHIPPING TO</p>
        <p>{addressData.firstName} {addressData.lastName}</p>
        <p>{addressData.street}</p>
        <p>
          {addressData.city}, {addressData.state} {addressData.zip}
        </p>
        <p>{addressData.country}</p>
        <p>{addressData.email}</p>
      </div>

      <div className="review-box">
        <p className="review-label">PAYMENT</p>
        <p>{paymentLabel}</p>
      </div>

      <div className="review-items">
        {cartItems.map((item) => (
          <div className="review-item" key={item.id}>
            <div className="review-item-left">
              <img src={item.image} alt={item.name} />
              <div>
                <p className="item-name">{item.name}</p>
                <p className="item-qty">Qty: {item.quantity}</p>
              </div>
            </div>
            <p className="item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="checkout-actions">
        <button className="secondary-btn" onClick={onBack}>
          Back
        </button>
        <button className="primary-btn" onClick={onPlaceOrder}>
          Place Order →
        </button>
      </div>
    </div>
  );
}

export default ReviewStep;
