import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { placeOrder } from "../../services/orderService";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { cartItems, subtotal, shipping, total, clearCart } = useCart();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [addressData, setAddressData] = useState({
    firstName: user?.firstName || user?.name?.split(" ")[0] || "",
    lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    country: "United States",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const [paymentData, setPaymentData] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const paymentLabel =
    paymentMethod === "card"
      ? `💳 •••• •••• •••• ${paymentData.cardNumber.replace(/\s/g, "").slice(-4) || "1234"}`
      : paymentMethod === "paypal"
        ? "PayPal"
        : "Apple Pay";

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setAddressData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep1 = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "country",
      "street",
      "city",
      "state",
      "zip",
    ];

    for (const field of requiredFields) {
      if (!addressData[field]?.trim()) {
        alert("Please fill in all address fields.");
        return false;
      }
    }

    return true;
  };

  const validateStep2 = () => {
    if (paymentMethod !== "card") {
      return true;
    }

    const requiredFields = ["cardName", "cardNumber", "expiry", "cvc"];

    for (const field of requiredFields) {
      if (!paymentData[field]?.trim()) {
        alert("Please fill in all payment fields.");
        return false;
      }
    }

    return true;
  };

  const goToNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => prev + 1);
  };

  const goToPrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handlePlaceOrder = async () => {
    const { order } = await placeOrder();

    await clearCart();

    navigate("/order-success", {
      replace: true,
      state: {
        order: {
          ...order,
          address: addressData,
          payment: {
            method: paymentMethod,
            cardLast4:
              paymentMethod === "card"
                ? paymentData.cardNumber.replace(/\s/g, "").slice(-4)
                : null,
          },
          items: cartItems,
          subtotal,
          shipping,
          total,
          email: addressData.email,
        },
      },
    });
  };

  return (
    <div className="checkout-page">
      <div className="checkout-breadcrumb">
        Home <span>›</span> Cart <span>›</span> <strong>Checkout</strong>
      </div>

      <div className="checkout-steps">
        <div className="step-item">
          <div className={`step-circle ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
            {step > 1 ? "✓" : "1"}
          </div>
          <span className={step === 1 ? "active-label" : ""}>Address</span>
        </div>

        <div className={`step-line ${step > 1 ? "done-line" : ""}`} />

        <div className="step-item">
          <div className={`step-circle ${step >= 2 ? "active" : ""} ${step > 2 ? "done" : ""}`}>
            {step > 2 ? "✓" : "2"}
          </div>
          <span className={step === 2 ? "active-label" : ""}>Payment</span>
        </div>

        <div className={`step-line ${step > 2 ? "done-line" : ""}`} />

        <div className="step-item">
          <div className={`step-circle ${step >= 3 ? "active" : ""}`}>3</div>
          <span className={step === 3 ? "active-label" : ""}>Review</span>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 1 && (
            <div className="checkout-card">
              <h2>Shipping Address</h2>

              <div className="form-grid two-cols">
                <div>
                  <label>First Name</label>
                  <input
                    name="firstName"
                    value={addressData.firstName}
                    onChange={handleAddressChange}
                    placeholder="John"
                  />
                </div>

                <div>
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    value={addressData.lastName}
                    onChange={handleAddressChange}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  value={addressData.email}
                  onChange={handleAddressChange}
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-grid two-cols">
                <div>
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={addressData.phone}
                    onChange={handleAddressChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label>Country</label>
                  <select
                    name="country"
                    value={addressData.country}
                    onChange={handleAddressChange}
                  >
                    <option>United States</option>
                    <option>Turkey</option>
                    <option>Germany</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Street Address</label>
                <input
                  name="street"
                  value={addressData.street}
                  onChange={handleAddressChange}
                  placeholder="123 Beauty Avenue"
                />
              </div>

              <div className="form-grid two-cols">
                <div>
                  <label>City</label>
                  <input
                    name="city"
                    value={addressData.city}
                    onChange={handleAddressChange}
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label>State / Province</label>
                  <input
                    name="state"
                    value={addressData.state}
                    onChange={handleAddressChange}
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="form-group small-input">
                <label>ZIP / Postal Code</label>
                <input
                  name="zip"
                  value={addressData.zip}
                  onChange={handleAddressChange}
                  placeholder="10001"
                />
              </div>

              <div className="checkout-actions single">
                <button className="primary-btn" onClick={goToNextStep}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-card">
              <h2>Payment Details</h2>

              <div className="payment-tabs">
                <button
                  className={paymentMethod === "card" ? "active-tab" : ""}
                  onClick={() => setPaymentMethod("card")}
                >
                  Credit Card
                </button>
                <button
                  className={paymentMethod === "paypal" ? "active-tab" : ""}
                  onClick={() => setPaymentMethod("paypal")}
                >
                  PayPal
                </button>
                <button
                  className={paymentMethod === "applepay" ? "active-tab" : ""}
                  onClick={() => setPaymentMethod("applepay")}
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
                      onChange={handlePaymentChange}
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handlePaymentChange}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="form-grid two-cols">
                    <div>
                      <label>Expiry Date</label>
                      <input
                        name="expiry"
                        value={paymentData.expiry}
                        onChange={handlePaymentChange}
                        placeholder="MM / YY"
                      />
                    </div>

                    <div>
                      <label>CVC</label>
                      <input
                        name="cvc"
                        value={paymentData.cvc}
                        onChange={handlePaymentChange}
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
                <button className="secondary-btn" onClick={goToPrevStep}>
                  Back
                </button>
                <button className="primary-btn" onClick={goToNextStep}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
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
                <button className="secondary-btn" onClick={goToPrevStep}>
                  Back
                </button>
                <button className="primary-btn" onClick={handlePlaceOrder}>
                  Place Order →
                </button>
              </div>
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
}
