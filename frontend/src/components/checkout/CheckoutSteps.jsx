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

export default CheckoutSteps;
