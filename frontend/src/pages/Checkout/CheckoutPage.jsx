import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { createAddress, getAddresses } from "../../services/addressService";
import { placeOrder } from "../../services/orderService";
import { validateDiscountCode } from "../../services/discountService";
import "./CheckoutPage.css";

const sortAddresses = (addressList = []) =>
  [...addressList].sort((a, b) => {
    if (Boolean(a.isDefault) !== Boolean(b.isDefault)) {
      return a.isDefault ? -1 : 1;
    }

    return Number(a.id || 0) - Number(b.id || 0);
  });

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

function AddressStep({ addressData, fieldErrors, savedAddresses, saveAccountInfo, onAddressChange, onSavedAddressChange, onSaveAccountInfoChange, onNext }) {
  return (
    <div className="checkout-card">
      <h2>Shipping Address</h2>
      {savedAddresses.length > 0 ? (
        <div className="form-group">
          <label>Saved Delivery Address</label>
          <select
            className="checkout-input"
            value={addressData.addressId}
            onChange={(event) => onSavedAddressChange(event.target.value)}
          >
            <option value="">Enter a new address</option>
            {savedAddresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.label} - {address.street}, {address.city}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="form-group">
        <label>Name</label>
        <input
          className={fieldErrors.name ? "checkout-input checkout-input--error" : "checkout-input"}
          name="name"
          value={addressData.name}
          onChange={onAddressChange}
          placeholder="John Doe"
          aria-invalid={Boolean(fieldErrors.name)}
        />
        {fieldErrors.name ? <p className="checkout-field-error">{fieldErrors.name}</p> : null}
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
          <label>Tax ID</label>
          <input
            className={fieldErrors.taxId ? "checkout-input checkout-input--error" : "checkout-input"}
            name="taxId"
            value={addressData.taxId}
            onChange={onAddressChange}
            placeholder="Tax identification number"
            aria-invalid={Boolean(fieldErrors.taxId)}
          />
          {fieldErrors.taxId ? <p className="checkout-field-error">{fieldErrors.taxId}</p> : null}
        </div>
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
      </div>
      <div className="checkout-account-info-actions">
        <label className="checkout-save-profile">
          <input
            type="checkbox"
            checked={saveAccountInfo}
            onChange={(event) => onSaveAccountInfoChange(event.target.checked)}
          />
          Save tax ID and this delivery address
        </label>
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
      <div className="form-grid two-cols">
        <div>
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
        <div>
          <label>Country</label>
          <input
            className={fieldErrors.country ? "checkout-input checkout-input--error" : "checkout-input"}
            name="country"
            value={addressData.country}
            onChange={onAddressChange}
            placeholder="United States"
            aria-invalid={Boolean(fieldErrors.country)}
          />
          {fieldErrors.country ? <p className="checkout-field-error">{fieldErrors.country}</p> : null}
        </div>
      </div>
      <div className="checkout-actions single">
        <button className="checkout-primary-btn" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

function PaymentStep({ paymentMethod, paymentData, fieldErrors, onPaymentMethodChange, onPaymentChange, onBack, onNext, discountCode, onDiscountChange, onApplyDiscount, isApplyingDiscount, discountError, discountInfo }) {
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
      <div className="form-group">
        <label>Discount Code</label>
        <div className="discount-row">
          <input className="checkout-input" name="discount" placeholder="Enter code (e.g. SUMMER25)" value={discountCode} onChange={(e) => onDiscountChange(e.target.value)} />
          <button className="checkout-primary-btn" onClick={onApplyDiscount} disabled={isApplyingDiscount || !discountCode}>{isApplyingDiscount ? "Applying..." : "Apply"}</button>
        </div>
        {discountError ? <p className="checkout-field-error">{discountError}</p> : null}
        {discountInfo ? (
          <p className="checkout-field-info">Applied: {discountInfo.type === 'free_shipping' ? 'Free shipping' : `$${discountInfo.discountAmount} discount (${discountInfo.type})`}</p>
        ) : null}
      </div>
      <div className="checkout-actions">
        <button className="checkout-secondary-btn" onClick={onBack}>Back</button>
        <button className="checkout-primary-btn" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

function ReviewStep({ addressData, paymentLabel, cartItems, saveAccountInfo, onBack, onPlaceOrder, isSubmitting }) {
  return (
    <div className="checkout-card">
      <h2>Review Your Order</h2>
      <div className="review-box">
        <p className="checkout-review-label">SHIPPING TO</p>
        <p>{addressData.name}</p>
        <p>{addressData.street}</p>
        <p>{addressData.city}, {addressData.state} {addressData.zip}</p>
        <p>{addressData.country}</p>
        <p>{addressData.email}</p>
        <p>Tax ID: {addressData.taxId}</p>
        {saveAccountInfo ? <p>Your tax ID and this delivery address will be saved.</p> : null}
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
  const { user, updateProfile } = useAuth();
  const { cartItems, subtotal, shipping, total, clearCart } = useCart();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [addressData, setAddressData] = useState({
    addressId: "",
    name: user?.name || "",
    email: user?.email || "",
    taxId: user?.taxId || "",
    phone: user?.phone || "",
    country: "",
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
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAccountInfo, setSaveAccountInfo] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
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
      ...(name !== "taxId" && name !== "phone" && { addressId: "" }),
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
      name: "Name is required.",
      email: "Email is required.",
      taxId: "Tax ID is required.",
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

  useEffect(() => {
    if (!user?.phone) return;

    setAddressData((prev) => ({
      ...prev,
      phone: prev.phone || user.phone,
    }));
  }, [user?.phone]);

  useEffect(() => {
    if (!user?.name) return;

    setAddressData((prev) => ({
      ...prev,
      name: prev.name || user.name,
    }));
  }, [user?.name]);

  useEffect(() => {
    let isMounted = true;

    const loadAddresses = async () => {
      try {
        const addresses = await getAddresses();
        if (!isMounted) return;

        const nextAddresses = sortAddresses(Array.isArray(addresses) ? addresses : []);
        setSavedAddresses(nextAddresses);

        const defaultAddress = nextAddresses.find((address) => address.isDefault);
        if (defaultAddress) {
          applySavedAddress(defaultAddress);
        }
      } catch {
        if (isMounted) {
          setSavedAddresses([]);
        }
      }
    };

    loadAddresses();

    return () => {
      isMounted = false;
    };
  }, []);

  const applySavedAddress = (address) => {
    setAddressData((prev) => ({
      ...prev,
      addressId: String(address.id),
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip || "",
      country: address.country || "",
    }));
  };

  const handleSavedAddressChange = (addressId) => {
    const selectedAddress = savedAddresses.find((address) => String(address.id) === String(addressId));

    if (!selectedAddress) {
      setAddressData((prev) => ({
        ...prev,
        addressId: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      }));
      return;
    }

    applySavedAddress(selectedAddress);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (saveAccountInfo) {
        await updateProfile({
          taxId: addressData.taxId,
        });

        if (!addressData.addressId) {
          const newAddress = await createAddress({
            label: "Delivery",
            street: addressData.street,
            city: addressData.city,
            state: addressData.state,
            zip: addressData.zip,
            country: addressData.country,
            isDefault: savedAddresses.length === 0,
          });
          setSavedAddresses((current) => sortAddresses([...current, newAddress]));
          setAddressData((current) => ({ ...current, addressId: String(newAddress.id) }));
        }
      }

      const checkoutPayload = {
        shippingAddress: addressData,
        payment: {
          method: paymentMethod,
          cardLast4:
            paymentMethod === "card"
              ? paymentData.cardNumber.replace(/\s/g, "").slice(-4)
              : null,
        },
        ...(discountInfo && discountCode ? { discount_code: discountCode } : {}),
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

  const handleDiscountChange = (value) => {
    setDiscountCode(value.toUpperCase());
    setDiscountError("");
    setDiscountInfo(null);
  };

  const handleApplyDiscount = async () => {
    if (!discountCode) return;
    setIsApplyingDiscount(true);
    setDiscountError("");
    try {
      const orderTotal = Number(subtotal) + Number(shipping);
      const resp = await validateDiscountCode({ code: discountCode, orderTotal });
      setDiscountInfo({ type: resp.type, discountAmount: resp.discountAmount });
    } catch (err) {
      setDiscountError(err?.response?.data?.message || "Invalid discount code.");
      setDiscountInfo(null);
    } finally {
      setIsApplyingDiscount(false);
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
              savedAddresses={savedAddresses}
              saveAccountInfo={saveAccountInfo}
              onAddressChange={handleAddressChange}
              onSavedAddressChange={handleSavedAddressChange}
              onSaveAccountInfoChange={setSaveAccountInfo}
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
              discountCode={discountCode}
              onDiscountChange={handleDiscountChange}
              onApplyDiscount={handleApplyDiscount}
              isApplyingDiscount={isApplyingDiscount}
              discountError={discountError}
              discountInfo={discountInfo}
            />
          )}

          {step === 3 && (
            <ReviewStep
              addressData={addressData}
              paymentLabel={paymentLabel}
              cartItems={cartItems}
              saveAccountInfo={saveAccountInfo}
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
          shipping={discountInfo && discountInfo.type === 'free_shipping' ? 0 : shipping}
          total={(() => {
            const appliedShipping = discountInfo && discountInfo.type === 'free_shipping' ? 0 : shipping;
            const appliedDiscount = discountInfo && discountInfo.discountAmount ? Number(discountInfo.discountAmount) : 0;
            return Number(subtotal) + Number(appliedShipping) - appliedDiscount;
          })()}
        />
      </div>
    </div>
  );
}
