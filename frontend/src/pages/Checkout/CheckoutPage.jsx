import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { placeOrder } from "../../services/orderService";
import "./CheckoutPage.css";

function CheckoutSteps({ step }) {
  return (
    <div className="checkout-steps">
      <div className="step-item">
        <div className={`step-circle ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
          {step > 1 ? "✓" : "1"}
        </div>
        <span className={step === 1 ? "active-label" : ""}>Address</span>
      </div>
      <div className={`step-line ${step > 1 ? "done-line" : ""}`}></div>
      <div className="step-item">
        <div className={`step-circle ${step >= 2 ? "active" : ""} ${step > 2 ? "done" : ""}`}>
          {step > 2 ? "✓" : "2"}
        </div>
        <span className={step === 2 ? "active-label" : ""}>Payment</span>
      </div>
      <div className={`step-line ${step > 2 ? "done-line" : ""}`}></div>
      <div className="step-item">
        <div className={`step-circle ${step >= 3 ? "active" : ""}`}>3</div>
        <span className={step === 3 ? "active-label" : ""}>Review</span>
      </div>
    </div>
  );
}

function AddressStep({ addressData, fieldErrors, onAddressChange, onNext }) {
  return (
    <div className="checkout-card">
      <h2>Shipping Address</h2>
      <div className="form-grid two-cols">
        <div>
          <label>First Name</label>
          <input
            className={fieldErrors.firstName ? "checkout-input checkout-input--error" : "checkout-input"}
            name="firstName"
            value={addressData.firstName}
            onChange={onAddressChange}
            placeholder="John"
            aria-invalid={Boolean(fieldErrors.firstName)}
          />
          {fieldErrors.firstName ? <p className="checkout-field-error">{fieldErrors.firstName}</p> : null}
        </div>
        <div>
          <label>Last Name</label>
          <input
            className={fieldErrors.lastName ? "checkout-input checkout-input--error" : "checkout-input"}
            name="lastName"
            value={addressData.lastName}
            onChange={onAddressChange}
            placeholder="Doe"
            aria-invalid={Boolean(fieldErrors.lastName)}
          />
          {fieldErrors.lastName ? <p className="checkout-field-error">{fieldErrors.lastName}</p> : null}
        </div>
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          className={fieldErrors.email ? "checkout-input checkout-input--error" : "checkout-input"}
          name="email"
          value={addressData.email}
          onChange={onAddressChange}
          placeholder="john@example.com"
          aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email ? <p className="checkout-field-error">{fieldErrors.email}</p> : null}
      </div>
      <div className="form-grid two-cols">
        <div>
          <label>Phone</label>
          <input
            className={fieldErrors.phone ? "checkout-input checkout-input--error" : "checkout-input"}
            name="phone"
            value={addressData.phone}
            onChange={onAddressChange}
            placeholder="+1 (555) 000-0000"
            aria-invalid={Boolean(fieldErrors.phone)}
          />
          {fieldErrors.phone ? <p className="checkout-field-error">{fieldErrors.phone}</p> : null}
        </div>
        <div>
          <label>Country</label>
          <select
            className={fieldErrors.country ? "checkout-input checkout-input--error" : "checkout-input"}
            name="country"
            value={addressData.country}
            onChange={onAddressChange}
            aria-invalid={Boolean(fieldErrors.country)}
          >
            <option>United States</option>
            <option>Turkey</option>
            <option>Germany</option>
            <option>United Kingdom</option>
          </select>
          {fieldErrors.country ? <p className="checkout-field-error">{fieldErrors.country}</p> : null}
        </div>
      </div>
      <div className="form-group">
        <label>Street Address</label>
        <input
          className={fieldErrors.street ? "checkout-input checkout-input--error" : "checkout-input"}
          name="street"
          value={addressData.street}
          onChange={onAddressChange}
          placeholder="123 Beauty Avenue"
          aria-invalid={Boolean(fieldErrors.street)}
        />
        {fieldErrors.street ? <p className="checkout-field-error">{fieldErrors.street}</p> : null}
      </div>
      <div className="form-grid two-cols">
        <div>
          <label>City</label>
          <input
            className={fieldErrors.city ? "checkout-input checkout-input--error" : "checkout-input"}
            name="city"
            value={addressData.city}
            onChange={onAddressChange}
            placeholder="New York"
            aria-invalid={Boolean(fieldErrors.city)}
          />
          {fieldErrors.city ? <p className="checkout-field-error">{fieldErrors.city}</p> : null}
        </div>
        <div>
          <label>State / Province</label>
          <input
            className={fieldErrors.state ? "checkout-input checkout-input--error" : "checkout-input"}
            name="state"
            value={addressData.state}
            onChange={onAddressChange}
            placeholder="NY"
            aria-invalid={Boolean(fieldErrors.state)}
          />
          {fieldErrors.state ? <p className="checkout-field-error">{fieldErrors.state}</p> : null}
        </div>
      </div>
      <div className="form-group small-input">
        <label>ZIP / Postal Code</label>
        <input
          className={fieldErrors.zip ? "checkout-input checkout-input--error" : "checkout-input"}
          name="zip"
          value={addressData.zip}
          onChange={onAddressChange}
          placeholder="10001"
          aria-invalid={Boolean(fieldErrors.zip)}
        />
        {fieldErrors.zip ? <p className="checkout-field-error">{fieldErrors.zip}</p> : null}
      </div>
      <div className="checkout-actions single">
        <button className="checkout-primary-btn" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

function PaymentStep({ paymentMethod, paymentData, fieldErrors, onPaymentMethodChange, onPaymentChange, onBack, onNext }) {
  return (
    <div className="checkout-card">
      <h2>Payment Details</h2>
      <div className="payment-tabs">
        <button className={paymentMethod === "card" ? "active-tab" : ""} onClick={() => onPaymentMethodChange("card")}>Credit Card</button>
        <button className={paymentMethod === "paypal" ? "active-tab" : ""} onClick={() => onPaymentMethodChange("paypal")}>PayPal</button>
        <button className={paymentMethod === "applepay" ? "active-tab" : ""} onClick={() => onPaymentMethodChange("applepay")}>Apple Pay</button>
      </div>
      {paymentMethod === "card" ? (
        <>
          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              className={fieldErrors.cardName ? "checkout-input checkout-input--error" : "checkout-input"}
              name="cardName"
              value={paymentData.cardName}
              onChange={onPaymentChange}
              placeholder="Jane Doe"
              aria-invalid={Boolean(fieldErrors.cardName)}
            />
            {fieldErrors.cardName ? <p className="checkout-field-error">{fieldErrors.cardName}</p> : null}
          </div>
          <div className="form-group">
            <label>Card Number</label>
            <input
              className={fieldErrors.cardNumber ? "checkout-input checkout-input--error" : "checkout-input"}
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={onPaymentChange}
              placeholder="1234 5678 9012 3456"
              aria-invalid={Boolean(fieldErrors.cardNumber)}
            />
            {fieldErrors.cardNumber ? <p className="checkout-field-error">{fieldErrors.cardNumber}</p> : null}
          </div>
          <div className="form-grid two-cols">
            <div>
              <label>Expiry Date</label>
              <input
                className={fieldErrors.expiry ? "checkout-input checkout-input--error" : "checkout-input"}
                name="expiry"
                value={paymentData.expiry}
                onChange={onPaymentChange}
                placeholder="MM / YY"
                aria-invalid={Boolean(fieldErrors.expiry)}
              />
              {fieldErrors.expiry ? <p className="checkout-field-error">{fieldErrors.expiry}</p> : null}
            </div>
            <div>
              <label>CVC</label>
              <input
                className={fieldErrors.cvc ? "checkout-input checkout-input--error" : "checkout-input"}
                name="cvc"
                value={paymentData.cvc}
                onChange={onPaymentChange}
                placeholder="•••"
                aria-invalid={Boolean(fieldErrors.cvc)}
              />
              {fieldErrors.cvc ? <p className="checkout-field-error">{fieldErrors.cvc}</p> : null}
            </div>
          </div>
        </>
      ) : (
        <div className="payment-placeholder">
          {paymentMethod === "paypal" ? "You will continue with PayPal after review." : "You will continue with Apple Pay after review."}
        </div>
      )}
      <div className="checkout-info-box">🔒 Your payment info is encrypted and secure. We never store your card details.</div>
      <div className="checkout-actions">
        <button className="checkout-secondary-btn" onClick={onBack}>Back</button>
        <button className="checkout-primary-btn" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

function ReviewStep({ addressData, paymentLabel, cartItems, onBack, onPlaceOrder, isSubmitting }) {
  return (
    <div className="checkout-card">
      <h2>Review Your Order</h2>
      <div className="review-box">
        <p className="checkout-review-label">SHIPPING TO</p>
        <p>{addressData.firstName} {addressData.lastName}</p>
        <p>{addressData.street}</p>
        <p>{addressData.city}, {addressData.state} {addressData.zip}</p>
        <p>{addressData.country}</p>
        <p>{addressData.email}</p>
      </div>
      <div className="review-box">
        <p className="checkout-review-label">PAYMENT</p>
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
            <p className="item-price">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="checkout-actions">
        <button className="checkout-secondary-btn" onClick={onBack} disabled={isSubmitting}>Back</button>
        <button className="checkout-primary-btn" onClick={onPlaceOrder} disabled={isSubmitting}>
          {isSubmitting ? "Confirming Payment..." : "Place Order →"}
        </button>
      </div>
    </div>
  );
}

function CheckoutSummary({ cartItems, subtotal, shipping, total }) {
  return (
    <div className="checkout-summary">
      <div className="checkout-summary-card">
        <h3>Order Summary</h3>
        {cartItems.map((item) => (
          <div className="checkout-summary-item" key={item.id}>
            <div className="checkout-summary-item-left">
              <img src={item.image} alt={item.name} />
              <span className="checkout-summary-qty">{item.quantity}</span>
              <p>{item.name}</p>
            </div>
            <p>${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        <div className="checkout-summary-line">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="checkout-summary-line">
          <span>Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="checkout-summary-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const paymentLabel =
    paymentMethod === "card"
      ? `💳 •••• •••• •••• ${paymentData.cardNumber.replace(/\s/g, "").slice(-4) || "1234"}`
      : paymentMethod === "paypal"
        ? "PayPal"
        : "Apple Pay";

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      return { ...prev, [name]: "" };
    });
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      return { ...prev, [name]: "" };
    });
  };

  const validateStep1 = () => {
    const requiredFields = {
      firstName: "First name is required.",
      lastName: "Last name is required.",
      email: "Email is required.",
      phone: "Phone is required.",
      country: "Country is required.",
      street: "Street address is required.",
      city: "City is required.",
      state: "State / Province is required.",
      zip: "ZIP / Postal Code is required.",
    };

    const nextErrors = Object.entries(requiredFields).reduce((errors, [field, message]) => {
      if (!addressData[field]?.trim()) {
        errors[field] = message;
      }

      return errors;
    }, {});

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStep2 = () => {
    if (paymentMethod !== "card") {
      setFieldErrors({});
      return true;
    }

    const requiredFields = {
      cardName: "Cardholder name is required.",
      cardNumber: "Card number is required.",
      expiry: "Expiry date is required.",
      cvc: "CVC is required.",
    };

    const nextErrors = Object.entries(requiredFields).reduce((errors, [field, message]) => {
      if (!paymentData[field]?.trim()) {
        errors[field] = message;
      }

      return errors;
    }, {});

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setFieldErrors({});
    setStep((prev) => prev + 1);
  };

  const goToPrevStep = () => {
    setFieldErrors({});
    setStep((prev) => prev - 1);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const checkoutPayload = {
        shippingAddress: addressData,
        payment: {
          method: paymentMethod,
          cardLast4:
            paymentMethod === "card"
              ? paymentData.cardNumber.replace(/\s/g, "").slice(-4)
              : null,
        },
      };

      const response = await placeOrder(checkoutPayload);

      await clearCart();

      navigate("/order-success", {
        replace: true,
        state: {
          invoice: response.invoice,
          bankConfirmation: response.bankConfirmation,
        },
      });
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message || "Payment could not be completed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-breadcrumb">
        Products <span>›</span> Cart <span>›</span> <strong>Checkout</strong>
      </div>

      <CheckoutSteps step={step} />

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 1 && (
            <AddressStep
              addressData={addressData}
              fieldErrors={fieldErrors}
              onAddressChange={handleAddressChange}
              onNext={goToNextStep}
            />
          )}

          {step === 2 && (
            <PaymentStep
              paymentMethod={paymentMethod}
              paymentData={paymentData}
              fieldErrors={fieldErrors}
              onPaymentMethodChange={setPaymentMethod}
              onPaymentChange={handlePaymentChange}
              onBack={goToPrevStep}
              onNext={goToNextStep}
            />
          )}

          {step === 3 && (
            <ReviewStep
              addressData={addressData}
              paymentLabel={paymentLabel}
              cartItems={cartItems}
              onBack={goToPrevStep}
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={isSubmitting}
            />
          )}

          {submitError ? <div className="site-inline-message site-inline-message--error" role="alert">{submitError}</div> : null}
        </div>

        <CheckoutSummary
          cartItems={cartItems}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
        />
      </div>
    </div>
  );
}
