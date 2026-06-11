import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useWishlist } from "../../hooks/useWishlist";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from "../../services/addressService";
import "./ProfilePage.css";

/* ── Inline SVG icons ────────────────────────────────────── */
const icons = {
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  edit: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  lock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  headphones: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  chevron: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  orders: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  mapPin: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  creditCard: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  ),
  trash: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  visa: (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
      <rect width="32" height="20" rx="3" fill="#1A1F71" />
      <text x="16" y="13" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700" fontFamily="Arial">VISA</text>
    </svg>
  ),
  mastercard: (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
      <rect width="32" height="20" rx="3" fill="#252525" />
      <circle cx="12" cy="10" r="6" fill="#EB001B" />
      <circle cx="20" cy="10" r="6" fill="#F79E1B" />
      <path d="M16 5.37a6 6 0 0 1 0 9.26 6 6 0 0 1 0-9.26z" fill="#FF5F00" />
    </svg>
  ),
};

const sortAddresses = (addressList = []) =>
  [...addressList].sort((a, b) => {
    if (Boolean(a.isDefault) !== Boolean(b.isDefault)) {
      return a.isDefault ? -1 : 1;
    }

    return Number(a.id || 0) - Number(b.id || 0);
  });

/* ── Edit Profile Modal ──────────────────────────────────── */
const EditProfileModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: user?.name || "",
    taxId: user?.taxId || "",
    phone: user?.phone || ""
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal__header">
          <h2>Edit Profile</h2>
          <button className="profile-modal__close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <form className="profile-modal__form" onSubmit={handleSubmit}>
          <label className="profile-modal__label">
            Full Name
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label className="profile-modal__label">
            Email Address
            <input type="email" value={user?.email || ""} disabled className="profile-modal__disabled" />
          </label>
          {user?.role === "customer" && (
            <>
              <label className="profile-modal__label">
                Tax ID
                <input type="text" name="taxId" value={form.taxId} onChange={handleChange} placeholder="Tax identification number" />
              </label>
            </>
          )}
          <label className="profile-modal__label">
            Phone Number
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" />
          </label>
          <div className="profile-modal__actions">
            <button type="button" className="profile-modal__cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="profile-modal__save">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Add/Edit Address Modal ───────────────────────────────── */
const AddressModal = ({ address, onClose, onSave }) => {
  const [form, setForm] = useState({
    label: address?.label || "",
    street: address?.street || "",
    city: address?.city || "",
    state: address?.state || "",
    zip: address?.zip || "",
    country: address?.country || "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, id: address?.id });
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal__header">
          <h2>{address ? "Edit Address" : "Add New Address"}</h2>
          <button className="profile-modal__close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <form className="profile-modal__form" onSubmit={handleSubmit}>
          <label className="profile-modal__label">
            Label (e.g. Home, Work)
            <input type="text" name="label" value={form.label} onChange={handleChange} placeholder="Home" required />
          </label>
          <label className="profile-modal__label">
            Street Address
            <input type="text" name="street" value={form.street} onChange={handleChange} placeholder="123 Main St, Apt 4B" required />
          </label>
          <div className="profile-modal__row">
            <label className="profile-modal__label">
              City
              <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="New York" required />
            </label>
            <label className="profile-modal__label">
              State
              <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="NY" />
            </label>
          </div>
          <div className="profile-modal__row">
            <label className="profile-modal__label">
              ZIP Code
              <input type="text" name="zip" value={form.zip} onChange={handleChange} placeholder="10001" required />
            </label>
            <label className="profile-modal__label">
              Country
              <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="United States" required />
            </label>
          </div>
          <div className="profile-modal__actions">
            <button type="button" className="profile-modal__cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="profile-modal__save">{address ? "Save Changes" : "Add Address"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main ProfilePage ────────────────────────────────────── */
function ProfilePage() {
  const { user, isLoading, updateProfile } = useAuth();
  const { discountNotifications, clearDiscountNotifications } = useWishlist();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Local state for profile details (would come from API in production)
  const [profileData, setProfileData] = useState({
    dateOfBirth: "",
  });

  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "customer") {
      setAddresses([]);
      return;
    }

    let isMounted = true;

    const loadAddresses = async () => {
      try {
        const nextAddresses = await getAddresses();
        if (isMounted) {
          setAddresses(sortAddresses(Array.isArray(nextAddresses) ? nextAddresses : []));
        }
      } catch {
        if (isMounted) {
          setAddresses([]);
        }
      }
    };

    loadAddresses();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userInitial =
    user.name?.trim().charAt(0).toUpperCase() ||
    user.email?.trim().charAt(0).toUpperCase() ||
    "U";

  const handleSaveProfile = async (formData) => {
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        ...(user.role === "customer" && {
          taxId: formData.taxId,
        }),
      });
      setProfileData((prev) => ({
        ...prev,
        dateOfBirth: formData.dateOfBirth,
      }));
      setShowEditModal(false);
    } catch {
      setShowEditModal(false);
    }
  };

  const handleAddAddress = async (addr) => {
    try {
      const savedAddress = addr.id
        ? await updateAddress(addr.id, addr)
        : await createAddress(addr);

      setAddresses((current) => {
        if (addr.id) {
          return sortAddresses(current.map((item) => (item.id === savedAddress.id ? savedAddress : item)));
        }

        if (savedAddress.isDefault) {
          return sortAddresses([savedAddress, ...current.map((item) => ({ ...item, isDefault: false }))]);
        }

        return sortAddresses([...current, savedAddress]);
      });
      setShowAddressModal(false);
      setEditingAddress(null);
    } catch {
      setShowAddressModal(false);
      setEditingAddress(null);
    }
  };

  const handleRemoveAddress = async (addrId) => {
    try {
      await deleteAddress(addrId);
      const nextAddresses = await getAddresses();
      setAddresses(sortAddresses(Array.isArray(nextAddresses) ? nextAddresses : []));
    } catch {
      // Keep the existing list when the backend rejects the delete.
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    try {
      await setDefaultAddress(addrId);
      setAddresses((prev) =>
        sortAddresses(prev.map((a) => ({ ...a, isDefault: a.id === addrId })))
      );
    } catch {
      // Leave UI unchanged if default update fails.
    }
  };

  const formatDateOfBirth = (dateStr) => {
    if (!dateStr) return "Not set";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="profile-page">
      {/* ── Hero Banner ─────────────────────────────────── */}
      <section className="account-hero">
        <div className="account-hero__overlay" />
        <div className="account-hero__bubbles">
          <span className="bubble bubble--1" />
          <span className="bubble bubble--2" />
          <span className="bubble bubble--3" />
          <span className="bubble bubble--4" />
        </div>
        <div className="container">
          <div className="account-hero__content">
            <div className="account-hero__avatar">{userInitial}</div>
            <div className="account-hero__info">
              <span className="account-hero__label">MY ACCOUNT</span>
              <h1 className="account-hero__title">Hello, {user.name || "there"}!</h1>
              <p className="account-hero__email">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Summary Cards ───────────────────────────────── */}
      <div className="container">
        <div className="profile-summary-cards">
          <button
            className="summary-card"
            onClick={() => {
              if (user.role === "product_manager") {
                navigate("/admin/product-manager/deliveries");
              } else if (user.role === "sales_manager") {
                navigate("/admin/sales-manager/invoices");
              } else {
                navigate("/customer/orders");
              }
            }}
            id="profile-orders-card"
          >
            <div className="summary-card__icon summary-card__icon--orders">
              {icons.orders}
            </div>
            <div className="summary-card__body">
              <span className="summary-card__label">
                {user.role === "product_manager"
                  ? "Product Manager"
                  : user.role === "sales_manager"
                    ? "Sales Manager"
                    : "Orders"}
              </span>
              <span className="summary-card__value">
                {user.role === "product_manager" || user.role === "sales_manager"
                  ? "Open console"
                  : "View & track"}
              </span>
              <span className="summary-card__desc">
                {user.role === "product_manager"
                  ? "Manage inventory, deliveries, and reviews"
                  : user.role === "sales_manager"
                    ? "Manage invoices, revenue, pricing, and refunds"
                  : "View and track your orders"}
              </span>
            </div>
            <span className="summary-card__arrow">{icons.chevron}</span>
          </button>

          <button
            className="summary-card"
            onClick={() => document.getElementById("delivery-addresses-section")?.scrollIntoView({ behavior: "smooth" })}
            id="profile-addresses-card"
          >
            <div className="summary-card__icon summary-card__icon--address">
              {icons.mapPin}
            </div>
            <div className="summary-card__body">
              <span className="summary-card__label">Saved Addresses</span>
              <span className="summary-card__value">Manage</span>
              <span className="summary-card__desc">Manage your delivery addresses</span>
            </div>
            <span className="summary-card__arrow">{icons.chevron}</span>
          </button>

        </div>

        {user.role === "customer" && discountNotifications.length > 0 && (
          <section className="profile-discount-panel">
            <div>
              <h2>Wishlist discount updates</h2>
              <p>{discountNotifications.length} item{discountNotifications.length === 1 ? "" : "s"} from your wishlist received a discount.</p>
            </div>
            <button type="button" onClick={clearDiscountNotifications}>Mark all read</button>
            {discountNotifications.slice(0, 3).map((notice) => (
              <article key={notice.id}>
                <strong>{notice.productName}</strong>
                <span>{notice.discountRate}% off: ${Number(notice.oldPrice || 0).toFixed(2)} to ${Number(notice.newPrice || 0).toFixed(2)}</span>
              </article>
            ))}
          </section>
        )}

        {/* ── Two-Column Grid ───────────────────────────── */}
        <div className="profile-grid">
          {/* Profile Details */}
          <section className="profile-card" id="profile-details-section">
            <div className="profile-card__header">
              <h2 className="profile-card__title">Profile Details</h2>
              <button className="profile-card__edit" onClick={() => setShowEditModal(true)}>
                {icons.edit}
                <span>Edit Profile</span>
              </button>
            </div>
            <div className="profile-card__body">
              <div className="profile-detail">
                <span className="profile-detail__icon">{icons.user}</span>
                <span className="profile-detail__label">Full Name</span>
                <span className="profile-detail__value">{user.name || "—"}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail__icon">{icons.email}</span>
                <span className="profile-detail__label">Email Address</span>
                <span className="profile-detail__value">{user.email}</span>
              </div>
              {user.role === "customer" && (
                <>
                  <div className="profile-detail">
                    <span className="profile-detail__icon">{icons.creditCard}</span>
                    <span className="profile-detail__label">Tax ID</span>
                    <span className="profile-detail__value">{user.taxId || "Not set"}</span>
                  </div>
                </>
              )}
              <div className="profile-detail">
                <span className="profile-detail__icon">{icons.phone}</span>
                <span className="profile-detail__label">Phone Number</span>
                <span className="profile-detail__value">{user.phone || "Not set"}</span>
              </div>
            </div>
          </section>

          {/* Support & Security */}
          <section className="profile-card" id="support-security-section">
            <div className="profile-card__header">
              <h2 className="profile-card__title">Support &amp; Security</h2>
            </div>
            <div className="profile-card__body profile-card__body--support">
              <button className="support-item" id="change-password-btn">
                <span className="support-item__icon support-item__icon--lock">{icons.lock}</span>
                <div className="support-item__info">
                  <span className="support-item__title">Change Password</span>
                  <span className="support-item__desc">Update your password to keep your account secure</span>
                </div>
                <span className="support-item__arrow">{icons.chevron}</span>
              </button>
              <button className="support-item" id="contact-support-btn">
                <span className="support-item__icon support-item__icon--headphones">{icons.headphones}</span>
                <div className="support-item__info">
                  <span className="support-item__title">Contact Support</span>
                  <span className="support-item__desc">Get help from our beauty experts</span>
                </div>
                <span className="support-item__arrow">{icons.chevron}</span>
              </button>
              <button className="support-item" id="manage-preferences-btn">
                <span className="support-item__icon support-item__icon--settings">{icons.settings}</span>
                <div className="support-item__info">
                  <span className="support-item__title">Manage Preferences</span>
                  <span className="support-item__desc">Email notifications, marketing and privacy settings</span>
                </div>
                <span className="support-item__arrow">{icons.chevron}</span>
              </button>
            </div>
          </section>
        </div>

        <div className="profile-grid profile-grid--account-management">
        {/* ── Delivery Addresses ─────────────────────────── */}
        <section className="profile-card profile-card--full" id="delivery-addresses-section">
          <div className="profile-card__header">
            <h2 className="profile-card__title">Delivery Addresses</h2>
            <button
              className="profile-card__edit profile-card__edit--add"
              onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
            >
              {icons.plus}
              <span>Add New Address</span>
            </button>
          </div>
          <div className="profile-card__body">
            {addresses.length === 0 ? (
              <div className="payment-empty">
                <span className="payment-empty__icon">{icons.mapPin}</span>
                <p>No saved addresses</p>
                <button className="payment-empty__add" onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}>
                  Add an Address
                </button>
              </div>
            ) : (
              <div className="address-list">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`address-card ${addr.isDefault ? "address-card--default" : ""}`}>
                    <div className="address-card__icon">
                      {icons.mapPin}
                    </div>
                    <div className="address-card__info">
                      <div className="address-card__top">
                        <span className="address-card__label-name">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="payment-card__badge">Default</span>
                        )}
                      </div>
                      <span className="address-card__street">{addr.street}</span>
                      <span className="address-card__city">
                        {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zip}, {addr.country}
                      </span>
                    </div>
                    <div className="address-card__actions">
                      {!addr.isDefault && (
                        <button
                          className="payment-card__action payment-card__action--default"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        className="payment-card__action payment-card__action--default"
                        onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }}
                      >
                        {icons.edit}
                        <span>Edit</span>
                      </button>
                      <button
                        className="payment-card__action payment-card__action--remove"
                        onClick={() => handleRemoveAddress(addr.id)}
                      >
                        {icons.trash}
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      </div>

      {/* ── Modals ──────────────────────────────────────── */}
      {showEditModal && (
        <EditProfileModal
          user={{ ...user, ...profileData }}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
      {showAddressModal && (
        <AddressModal
          address={editingAddress}
          onClose={() => { setShowAddressModal(false); setEditingAddress(null); }}
          onSave={handleAddAddress}
        />
      )}
    </div>
  );
}

export default ProfilePage;
