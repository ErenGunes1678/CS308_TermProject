import { useState, useMemo } from "react";
import { Tag, Trash2, Plus, X, Check } from "lucide-react";
import "./DiscountsPage.css";

/* ─── seed data ─────────────────────────────────────────────────────────── */

const SEED = [
  { id: 1, code: "BEAUTY15",  type: "percentage",    value: 15,  minOrder: 50,  uses: 234, expires: "2026-06-30", active: true  },
  { id: 2, code: "SKINCARE20", type: "percentage",   value: 20,  minOrder: 80,  uses: 89,  expires: "2026-07-15", active: true  },
  { id: 3, code: "FREESHIP",  type: "free_shipping", value: null, minOrder: null, uses: 512, expires: "2026-05-31", active: false },
  { id: 4, code: "NEWUSER10", type: "fixed",         value: 10,  minOrder: 30,  uses: 156, expires: "2026-12-31", active: true  },
  { id: 5, code: "SUMMER25",  type: "percentage",    value: 25,  minOrder: 100, uses: 0,   expires: "2026-09-01", active: false },
];

function loadCodes() {
  try {
    const raw = localStorage.getItem("lumiere_discounts");
    return raw ? JSON.parse(raw) : SEED;
  } catch {
    return SEED;
  }
}

function saveCodes(codes) {
  localStorage.setItem("lumiere_discounts", JSON.stringify(codes));
}

/* ─── helpers ────────────────────────────────────────────────────────────── */

const TYPE_LABELS = {
  percentage:    "Percentage",
  fixed:         "Fixed",
  free_shipping: "Free Shipping",
};

function formatValue(code) {
  if (code.type === "free_shipping") return "—";
  if (code.type === "percentage")    return `${code.value}%`;
  return `$${Number(code.value).toFixed(0)}`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

const isExpired = (expires) => expires && new Date(expires) < new Date();

/* ─── summary computation ────────────────────────────────────────────────── */

function computeStats(codes) {
  const active       = codes.filter((c) => c.active && !isExpired(c.expires)).length;
  const totalUses    = codes.reduce((s, c) => s + c.uses, 0);
  const pctCodes     = codes.filter((c) => c.type === "percentage" && c.value);
  const avgDiscount  = pctCodes.length
    ? (pctCodes.reduce((s, c) => s + c.value, 0) / pctCodes.length).toFixed(1)
    : "0.0";
  const revenueSaved = codes
    .filter((c) => c.type === "fixed" && c.value)
    .reduce((s, c) => s + c.value * c.uses, 0);
  return { active, totalUses, avgDiscount, revenueSaved };
}

/* ─── form default ───────────────────────────────────────────────────────── */

const EMPTY_FORM = { code: "", type: "percentage", value: "", minOrder: "", expires: "" };

/* ─── component ──────────────────────────────────────────────────────────── */

export default function DiscountsPage() {
  const [codes, setCodes]           = useState(loadCodes);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formError, setFormError]   = useState("");
  const [deleteId, setDeleteId]     = useState(null);

  const stats = useMemo(() => computeStats(codes), [codes]);

  /* persist on every write */
  const persist = (next) => { setCodes(next); saveCodes(next); };

  /* toggle active */
  const handleToggle = (id) => {
    persist(codes.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  /* delete */
  const handleDelete = (id) => {
    persist(codes.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  /* form field change */
  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  /* submit */
  const handleCreate = () => {
    setFormError("");
    const codeStr = form.code.trim().toUpperCase();
    if (!codeStr) { setFormError("Code is required."); return; }
    if (codes.some((c) => c.code === codeStr)) { setFormError("Code already exists."); return; }
    if (form.type !== "free_shipping") {
      if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0) {
        setFormError("Enter a valid discount value."); return;
      }
    }
    if (!form.expires) { setFormError("Expiry date is required."); return; }

    const next = [
      ...codes,
      {
        id:       Date.now(),
        code:     codeStr,
        type:     form.type,
        value:    form.type === "free_shipping" ? null : Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : null,
        uses:     0,
        expires:  form.expires,
        active:   true,
      },
    ];
    persist(next);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleCancel = () => { setForm(EMPTY_FORM); setFormError(""); setShowForm(false); };

  /* stat cards */
  const statCards = [
    { label: "Active Codes",   value: stats.active,              color: "pink",   suffix: "" },
    { label: "Total Uses",     value: stats.totalUses.toLocaleString(), color: "purple", suffix: "" },
    { label: "Avg. Discount",  value: `${stats.avgDiscount}%`,   color: "blue",   suffix: "" },
    { label: "Revenue Saved",  value: `$${(stats.revenueSaved / 1000).toFixed(1)}K`, color: "green", suffix: "" },
  ];

  return (
    <div className="admin-page disc-page">
      <main className="dashboard-container disc-container">

        {/* ── header ── */}
        <header className="disc-hero">
          <div>
            <p className="admin-label">Sales Manager</p>
            <h1>Discounts</h1>
          </div>
          <button className="disc-new-btn" onClick={() => { setShowForm(true); setFormError(""); }}>
            <Plus size={18} strokeWidth={2.5} />
            New Code
          </button>
        </header>

        {/* ── stat cards ── */}
        <section className="stats-grid disc-stats">
          {statCards.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon ${s.color}`}>
                <Tag size={16} strokeWidth={2.5} />
              </div>
              <h2 className="stat-card__value">{s.value}</h2>
              <p className="stat-card__label">{s.label}</p>
            </div>
          ))}
        </section>

        {/* ── create form ── */}
        {showForm && (
          <section className="disc-form-card">
            <div className="disc-form-header">
              <Tag size={17} className="disc-form-icon" />
              <h3>Create Promo Code</h3>
            </div>

            <div className="disc-form-grid">
              <input
                className="disc-input"
                placeholder="CODE (e.g. SUMMER25)"
                value={form.code}
                onChange={(e) => setField("code", e.target.value.toUpperCase())}
                maxLength={24}
                spellCheck={false}
              />

              <select
                className="disc-input disc-select"
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed ($)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>

              <input
                className="disc-input"
                placeholder="Value (% or $)"
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => setField("value", e.target.value)}
                disabled={form.type === "free_shipping"}
              />

              <input
                className="disc-input"
                placeholder="Min. Order ($)"
                type="number"
                min="0"
                step="1"
                value={form.minOrder}
                onChange={(e) => setField("minOrder", e.target.value)}
              />

              <input
                className="disc-input"
                type="date"
                value={form.expires}
                onChange={(e) => setField("expires", e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>

            {formError && <p className="disc-form-error">{formError}</p>}

            <div className="disc-form-actions">
              <button className="disc-btn disc-btn--primary" onClick={handleCreate}>
                <Check size={16} /> Create Code
              </button>
              <button className="disc-btn disc-btn--ghost" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* ── table ── */}
        <section className="disc-table-card">
          {codes.length === 0 ? (
            <div className="disc-empty">
              <Tag size={40} strokeWidth={1.2} />
              <p>No discount codes yet. Create one above.</p>
            </div>
          ) : (
            <table className="disc-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th className="disc-col-r">Value</th>
                  <th className="disc-col-r">Min. Order</th>
                  <th className="disc-col-r">Uses</th>
                  <th>Expires</th>
                  <th className="disc-col-c">Status</th>
                  <th className="disc-col-c" />
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => {
                  const expired = isExpired(c.expires);
                  return (
                    <tr key={c.id} className={`disc-row${expired ? " disc-row--expired" : ""}`}>
                      <td>
                        <span className="disc-code">{c.code}</span>
                      </td>
                      <td className="disc-type">{TYPE_LABELS[c.type]}</td>
                      <td className="disc-col-r disc-value">{formatValue(c)}</td>
                      <td className="disc-col-r disc-muted">
                        {c.minOrder ? `$${c.minOrder}` : "—"}
                      </td>
                      <td className="disc-col-r disc-uses">{c.uses.toLocaleString()}</td>
                      <td className={`disc-expires${expired ? " disc-expires--past" : ""}`}>
                        {fmtDate(c.expires)}
                      </td>
                      <td className="disc-col-c">
                        {expired ? (
                          <span className="disc-badge disc-badge--expired">Expired</span>
                        ) : (
                          <button
                            className={`disc-toggle${c.active ? " disc-toggle--on" : ""}`}
                            onClick={() => handleToggle(c.id)}
                            title={c.active ? "Deactivate" : "Activate"}
                          >
                            <span className="disc-toggle__knob" />
                            <span className="disc-toggle__label">
                              {c.active ? "Active" : "Inactive"}
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="disc-col-c">
                        {deleteId === c.id ? (
                          <div className="disc-confirm">
                            <button className="disc-confirm__yes" onClick={() => handleDelete(c.id)}>
                              Delete
                            </button>
                            <button className="disc-confirm__no" onClick={() => setDeleteId(null)}>
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="disc-delete-btn"
                            onClick={() => setDeleteId(c.id)}
                            title="Delete code"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

      </main>
    </div>
  );
}
