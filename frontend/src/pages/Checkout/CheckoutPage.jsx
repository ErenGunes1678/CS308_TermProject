import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AddressStep from "../../components/checkout/AddressStep";
import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import CheckoutSummary from "../../components/checkout/CheckoutSummary";
import PaymentStep from "../../components/checkout/PaymentStep";
import ReviewStep from "../../components/checkout/ReviewStep";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { placeOrder } from "../../services/orderService";
import "./CheckoutPage.css";

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
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
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

      <CheckoutSteps step={step} />

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 1 && (
            <AddressStep
              addressData={addressData}
              onAddressChange={handleAddressChange}
              onNext={goToNextStep}
            />
          )}

          {step === 2 && (
            <PaymentStep
              paymentMethod={paymentMethod}
              paymentData={paymentData}
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
            />
          )}
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
