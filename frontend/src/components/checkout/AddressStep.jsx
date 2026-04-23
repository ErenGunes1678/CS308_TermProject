function AddressStep({ addressData, onAddressChange, onNext }) {
  return (
    <div className="checkout-card">
      <h2>Shipping Address</h2>

      <div className="form-grid two-cols">
        <div>
          <label>First Name</label>
          <input
            name="firstName"
            value={addressData.firstName}
            onChange={onAddressChange}
            placeholder="John"
          />
        </div>

        <div>
          <label>Last Name</label>
          <input
            name="lastName"
            value={addressData.lastName}
            onChange={onAddressChange}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          name="email"
          value={addressData.email}
          onChange={onAddressChange}
          placeholder="john@example.com"
        />
      </div>

      <div className="form-grid two-cols">
        <div>
          <label>Phone</label>
          <input
            name="phone"
            value={addressData.phone}
            onChange={onAddressChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label>Country</label>
          <select
            name="country"
            value={addressData.country}
            onChange={onAddressChange}
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
          onChange={onAddressChange}
          placeholder="123 Beauty Avenue"
        />
      </div>

      <div className="form-grid two-cols">
        <div>
          <label>City</label>
          <input
            name="city"
            value={addressData.city}
            onChange={onAddressChange}
            placeholder="New York"
          />
        </div>

        <div>
          <label>State / Province</label>
          <input
            name="state"
            value={addressData.state}
            onChange={onAddressChange}
            placeholder="NY"
          />
        </div>
      </div>

      <div className="form-group small-input">
        <label>ZIP / Postal Code</label>
        <input
          name="zip"
          value={addressData.zip}
          onChange={onAddressChange}
          placeholder="10001"
        />
      </div>

      <div className="checkout-actions single">
        <button className="primary-btn" onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

export default AddressStep;
