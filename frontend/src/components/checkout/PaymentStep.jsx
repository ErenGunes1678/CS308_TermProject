function PaymentStep({
  paymentMethod,
  paymentData,
  onPaymentMethodChange,
  onPaymentChange,
  onBack,
  onNext,
}) {
  return (
    <div className="checkout-card">
      <h2>Payment Details</h2>

      <div className="payment-tabs">
        <button
          className={paymentMethod === "card" ? "active-tab" : ""}
          onClick={() => onPaymentMethodChange("card")}
        >
          Credit Card
        </button>
        <button
          className={paymentMethod === "paypal" ? "active-tab" : ""}
          onClick={() => onPaymentMethodChange("paypal")}
        >
          PayPal
        </button>
        <button
          className={paymentMethod === "applepay" ? "active-tab" : ""}
          onClick={() => onPaymentMethodChange("applepay")}
        >
          Apple Pay
        </button>
      </div>

      {paymentMethod === "card" ? (
        <>
          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              name="cardName"
              value={paymentData.cardName}
              onChange={onPaymentChange}
              placeholder="Jane Doe"
            />
          </div>

          <div className="form-group">
            <label>Card Number</label>
            <input
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={onPaymentChange}
              placeholder="1234 5678 9012 3456"
            />
          </div>

          <div className="form-grid two-cols">
            <div>
              <label>Expiry Date</label>
              <input
                name="expiry"
                value={paymentData.expiry}
                onChange={onPaymentChange}
                placeholder="MM / YY"
              />
            </div>

            <div>
              <label>CVC</label>
              <input
                name="cvc"
                value={paymentData.cvc}
                onChange={onPaymentChange}
                placeholder="•••"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="payment-placeholder">
          {paymentMethod === "paypal"
            ? "You will continue with PayPal after review."
            : "You will continue with Apple Pay after review."}
        </div>
      )}

      <div className="info-box">
        🔒 Your payment info is encrypted and secure. We never store your card details.
      </div>

      <div className="checkout-actions">
        <button className="secondary-btn" onClick={onBack}>
          Back
        </button>
        <button className="primary-btn" onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

export default PaymentStep;
