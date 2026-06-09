import { useState, useMemo } from "react";
import { Download, Printer, Search, FileText } from "lucide-react";
import "./InvoicesPage.css";

/* ─── Mock data ──────────────────────────────────────────────────────────── */

const MOCK_INVOICES = [
  {
    id: 1,
    invoiceNumber: "INV-2026-001",
    customerName: "Sophie Laurent",
    customerEmail: "sophie.l@example.com",
    customerPhone: "+1 310 555 0101",
    shippingAddress: "15 Sunrise Blvd, Beverly Hills, CA 90210, USA",
    amount: 128.00,
    subtotal: 122.01,
    shipping: 5.99,
    orderId: 101,
    createdAt: "2026-03-21T10:30:00Z",
    items: [
      { productName: "Pro Glow Serum 30ml", quantity: 1, unitPrice: 49.99, lineTotal: 49.99 },
      { productName: "Hydra Boost Moisturizer", quantity: 2, unitPrice: 34.00, lineTotal: 68.00 },
      { productName: "Rose Lip Balm", quantity: 1, unitPrice: 4.02, lineTotal: 4.02 },
    ],
  },
  {
    id: 2,
    invoiceNumber: "INV-2026-002",
    customerName: "Emma Klein",
    customerEmail: "emma.k@example.com",
    customerPhone: "+1 212 555 0182",
    shippingAddress: "42 Park Avenue, New York, NY 10016, USA",
    amount: 62.00,
    subtotal: 56.01,
    shipping: 5.99,
    orderId: 102,
    createdAt: "2026-03-20T14:15:00Z",
    items: [
      { productName: "Velvet Matte Lipstick – Ruby", quantity: 2, unitPrice: 24.99, lineTotal: 49.98 },
      { productName: "Setting Powder Compact", quantity: 1, unitPrice: 6.03, lineTotal: 6.03 },
    ],
  },
  {
    id: 3,
    invoiceNumber: "INV-2026-003",
    customerName: "Anna Rossi",
    customerEmail: "anna.r@example.com",
    customerPhone: "+39 02 5550193",
    shippingAddress: "Via Montenapoleone 8, 20121 Milan, Italy",
    amount: 210.00,
    subtotal: 210.00,
    shipping: 0.00,
    orderId: 103,
    createdAt: "2026-03-18T09:05:00Z",
    items: [
      { productName: "Luxury Night Repair Cream", quantity: 1, unitPrice: 95.00, lineTotal: 95.00 },
      { productName: "Vitamin C Brightening Serum", quantity: 1, unitPrice: 75.00, lineTotal: 75.00 },
      { productName: "Collagen Eye Patches (10pk)", quantity: 2, unitPrice: 20.00, lineTotal: 40.00 },
    ],
  },
  {
    id: 4,
    invoiceNumber: "INV-2026-004",
    customerName: "Julia Petit",
    customerEmail: "julia.p@example.com",
    customerPhone: "+33 1 5550 4821",
    shippingAddress: "14 Rue de Rivoli, 75001 Paris, France",
    amount: 48.00,
    subtotal: 42.01,
    shipping: 5.99,
    orderId: 104,
    createdAt: "2026-03-17T16:45:00Z",
    items: [
      { productName: "Argan Hair Mask 250ml", quantity: 1, unitPrice: 32.00, lineTotal: 32.00 },
      { productName: "Silk Serum Spray", quantity: 1, unitPrice: 10.01, lineTotal: 10.01 },
    ],
  },
  {
    id: 5,
    invoiceNumber: "INV-2026-005",
    customerName: "Clara Müller",
    customerEmail: "clara.m@example.com",
    customerPhone: "+49 89 5550671",
    shippingAddress: "Marienplatz 5, 80331 Munich, Germany",
    amount: 156.00,
    subtotal: 156.00,
    shipping: 0.00,
    orderId: 105,
    createdAt: "2026-03-16T11:20:00Z",
    items: [
      { productName: "Foundation SPF 30 – Ivory", quantity: 2, unitPrice: 42.00, lineTotal: 84.00 },
      { productName: "Contour & Highlight Duo", quantity: 1, unitPrice: 38.00, lineTotal: 38.00 },
      { productName: "Primer Perfecting Base", quantity: 1, unitPrice: 34.00, lineTotal: 34.00 },
    ],
  },
  {
    id: 6,
    invoiceNumber: "INV-2026-006",
    customerName: "Rosa Navarro",
    customerEmail: "rosa.n@example.com",
    customerPhone: "+34 91 5550823",
    shippingAddress: "Calle Gran Vía 45, 28013 Madrid, Spain",
    amount: 89.00,
    subtotal: 83.01,
    shipping: 5.99,
    orderId: 106,
    createdAt: "2026-03-15T08:55:00Z",
    items: [
      { productName: "Men Grooming Kit – Essentials", quantity: 1, unitPrice: 59.00, lineTotal: 59.00 },
      { productName: "Charcoal Face Wash 150ml", quantity: 2, unitPrice: 12.00, lineTotal: 24.00 },
    ],
  },
  {
    id: 7,
    invoiceNumber: "INV-2026-007",
    customerName: "Hana Yıldız",
    customerEmail: "hana.y@example.com",
    customerPhone: "+90 212 555 0744",
    shippingAddress: "Bağdat Caddesi 112, Kadıköy, 34710 Istanbul, Turkey",
    amount: 74.00,
    subtotal: 74.00,
    shipping: 0.00,
    orderId: 107,
    createdAt: "2026-03-12T13:30:00Z",
    items: [
      { productName: "Shampoo Repair & Restore 500ml", quantity: 1, unitPrice: 28.00, lineTotal: 28.00 },
      { productName: "Conditioner Deep Nourish 500ml", quantity: 1, unitPrice: 26.00, lineTotal: 26.00 },
      { productName: "Scalp Oil Treatment 50ml", quantity: 1, unitPrice: 20.00, lineTotal: 20.00 },
    ],
  },
  {
    id: 8,
    invoiceNumber: "INV-2026-008",
    customerName: "Lena Fischer",
    customerEmail: "lena.f@example.com",
    customerPhone: "+49 30 5550992",
    shippingAddress: "Unter den Linden 22, 10117 Berlin, Germany",
    amount: 193.00,
    subtotal: 193.00,
    shipping: 0.00,
    orderId: 108,
    createdAt: "2026-03-10T17:05:00Z",
    items: [
      { productName: "Anti-Aging Retinol Cream 50ml", quantity: 1, unitPrice: 88.00, lineTotal: 88.00 },
      { productName: "Hyaluronic Acid Serum 30ml", quantity: 1, unitPrice: 65.00, lineTotal: 65.00 },
      { productName: "SPF 50 Daily Shield Lotion", quantity: 1, unitPrice: 40.00, lineTotal: 40.00 },
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const fmt = (n) =>
  `$${Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "—";

const fmtDateLong = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/* ─── PDF generation (browser-side, no library) ─────────────────────────── */

function escapePdf(str) {
  let out = "";
  for (const ch of String(str)) {
    const code = ch.charCodeAt(0);
    if (ch === "\\") out += "\\\\";
    else if (ch === "(") out += "\\(";
    else if (ch === ")") out += "\\)";
    else if (code > 127 && code <= 255) out += `\\${code.toString(8).padStart(3, "0")}`;
    else if (code > 255) out += "?";
    else out += ch;
  }
  return out;
}

const line = (text, x, y, size = 11) =>
  `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`;

function invoicePageLines(inv) {
  const ops = [];
  let y = 750;

  ops.push(line("Lumiere Cosmetics", 50, y, 18));
  y -= 26;
  ops.push(line("INVOICE", 50, y, 13));
  y -= 22;
  ops.push(line(`Number: ${inv.invoiceNumber}`, 50, y));
  y -= 16;
  ops.push(line(`Date:   ${new Date(inv.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" })}`, 50, y));
  y -= 16;
  ops.push(line(`Order:  #${inv.orderId}`, 50, y));
  y -= 28;

  ops.push(line("Bill To", 50, y, 12));
  y -= 18;
  ops.push(line(inv.customerName, 50, y));
  y -= 15;
  ops.push(line(inv.customerEmail, 50, y));
  y -= 15;
  ops.push(line(inv.customerPhone, 50, y));
  y -= 15;
  ops.push(line(inv.shippingAddress.slice(0, 72), 50, y));
  y -= 30;

  ops.push(line("Product", 50, y, 10));
  ops.push(line("Qty", 330, y, 10));
  ops.push(line("Unit", 390, y, 10));
  ops.push(line("Total", 470, y, 10));
  y -= 16;

  for (const it of inv.items) {
    ops.push(line(it.productName.slice(0, 40), 50, y));
    ops.push(line(String(it.quantity), 330, y));
    ops.push(line(`$${it.unitPrice.toFixed(2)}`, 390, y));
    ops.push(line(`$${it.lineTotal.toFixed(2)}`, 470, y));
    y -= 15;
  }

  y -= 10;
  ops.push(line(`Subtotal : $${inv.subtotal.toFixed(2)}`, 380, y));
  y -= 15;
  ops.push(line(`Shipping : $${inv.shipping.toFixed(2)}`, 380, y));
  y -= 15;
  ops.push(line(`Grand Total: $${inv.amount.toFixed(2)}`, 380, y, 13));
  y -= 28;
  ops.push(line("Status: PAID", 50, y, 11));
  y -= 30;
  ops.push(line("Thank you for shopping at Lumiere!", 160, y, 10));

  return ops;
}

function buildMultiPagePdf(invoices) {
  const N = invoices.length;
  // Object layout:
  //  1       Catalog
  //  2       Pages
  //  3..2+N  Page descriptors
  //  3+N..2+2N  Content streams
  //  3+2N    Font
  const fontObj = 3 + 2 * N;

  const pageContents = invoices.map((inv) => invoicePageLines(inv).join("\n"));

  const kidRefs = Array.from({ length: N }, (_, i) => `${3 + i} 0 R`).join(" ");

  const objects = [
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`,
    `2 0 obj << /Type /Pages /Kids [${kidRefs}] /Count ${N} >> endobj`,
    ...Array.from({ length: N }, (_, i) =>
      `${3 + i} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${3 + N + i} 0 R >> endobj`
    ),
    ...pageContents.map((content, i) =>
      `${3 + N + i} 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`
    ),
    `${fontObj} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const off of offsets) {
    pdf += `${off.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return bytes;
}

function downloadPdf(invoices, filename) {
  const bytes = buildMultiPagePdf(invoices);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─── Print engine ───────────────────────────────────────────────────────── */

function buildInvoiceHtml(inv) {
  const rows = inv.items
    .map(
      (it) => `
      <tr>
        <td>${it.productName}</td>
        <td style="text-align:center">${it.quantity}</td>
        <td style="text-align:right">${fmt(it.unitPrice)}</td>
        <td style="text-align:right">${fmt(it.lineTotal)}</td>
      </tr>`
    )
    .join("");

  return `
    <div class="inv-doc">
      <div class="inv-doc__header">
        <div class="inv-doc__brand">
          <span class="inv-doc__logo">L</span>
          <span class="inv-doc__brand-name">Lumière<span class="inv-doc__dot">.</span></span>
        </div>
        <div class="inv-doc__meta">
          <div class="inv-doc__meta-label">INVOICE</div>
          <div class="inv-doc__meta-number">${inv.invoiceNumber}</div>
          <div class="inv-doc__meta-date">${fmtDateLong(inv.createdAt)}</div>
        </div>
      </div>

      <div class="inv-doc__parties">
        <div class="inv-doc__party">
          <div class="inv-doc__party-label">From</div>
          <div class="inv-doc__party-name">Lumière Cosmetics</div>
          <div>contact@lumiere.store</div>
          <div>www.lumiere.store</div>
        </div>
        <div class="inv-doc__party">
          <div class="inv-doc__party-label">Bill To</div>
          <div class="inv-doc__party-name">${inv.customerName}</div>
          <div>${inv.customerEmail}</div>
          <div>${inv.customerPhone}</div>
          <div>${inv.shippingAddress}</div>
        </div>
      </div>

      <table class="inv-doc__table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Unit Price</th>
            <th style="text-align:right">Line Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="inv-doc__totals">
        <div class="inv-doc__total-row">
          <span>Subtotal</span><span>${fmt(inv.subtotal)}</span>
        </div>
        <div class="inv-doc__total-row">
          <span>Shipping</span><span>${fmt(inv.shipping)}</span>
        </div>
        <div class="inv-doc__total-row inv-doc__total-row--grand">
          <span>Total</span><span>${fmt(inv.amount)}</span>
        </div>
        <div class="inv-doc__badge">Paid</div>
      </div>

      <div class="inv-doc__footer">
        Thank you for your purchase! If you have questions contact support@lumiere.store
      </div>
    </div>`;
}

const PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #1e293b; background: #fff; }

  .inv-doc { max-width: 720px; margin: 0 auto; padding: 48px 48px 56px; page-break-after: always; }
  .inv-doc:last-child { page-break-after: avoid; }

  .inv-doc__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #f43f5e; }
  .inv-doc__brand { display: flex; align-items: center; gap: 8px; }
  .inv-doc__logo { width: 36px; height: 36px; background: #f43f5e; color: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; }
  .inv-doc__brand-name { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
  .inv-doc__dot { color: #f43f5e; }
  .inv-doc__meta { text-align: right; }
  .inv-doc__meta-label { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8; }
  .inv-doc__meta-number { font-size: 20px; font-weight: 900; color: #0f172a; margin: 4px 0 2px; font-family: 'Courier New', monospace; }
  .inv-doc__meta-date { font-size: 12px; color: #64748b; font-weight: 600; }

  .inv-doc__parties { display: flex; gap: 40px; margin-bottom: 36px; }
  .inv-doc__party { flex: 1; }
  .inv-doc__party-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; margin-bottom: 8px; }
  .inv-doc__party-name { font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 3px; }
  .inv-doc__party div { line-height: 1.6; color: #475569; font-size: 12px; }

  .inv-doc__table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .inv-doc__table thead tr { background: #f8fafc; }
  .inv-doc__table th { padding: 10px 12px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #e2e8f0; }
  .inv-doc__table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 12px; }
  .inv-doc__table tbody tr:last-child td { border-bottom: none; }

  .inv-doc__totals { margin-left: auto; max-width: 280px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  .inv-doc__total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: #475569; font-weight: 600; }
  .inv-doc__total-row--grand { font-size: 16px; font-weight: 900; color: #0f172a; border-top: 2px solid #0f172a; margin-top: 8px; padding-top: 10px; }
  .inv-doc__badge { display: inline-block; margin-top: 12px; padding: 3px 12px; background: #ecfdf5; color: #059669; border-radius: 999px; font-size: 11px; font-weight: 800; }

  .inv-doc__footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; font-weight: 600; }

  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .inv-doc { padding: 32px; }
  }
`;

function openPrintWindow(invoices) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>Lumière – Invoices</title><style>${PRINT_STYLES}</style></head><body>`);
  for (const inv of invoices) {
    win.document.write(buildInvoiceHtml(inv));
  }
  win.document.write("</body></html>");
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    let list = MOCK_INVOICES;

    if (fromDate) {
      const f = new Date(fromDate);
      list = list.filter((inv) => new Date(inv.createdAt) >= f);
    }
    if (toDate) {
      const t = new Date(toDate);
      t.setHours(23, 59, 59, 999);
      list = list.filter((inv) => new Date(inv.createdAt) <= t);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (inv) =>
          inv.customerName.toLowerCase().includes(q) ||
          inv.invoiceNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, fromDate, toDate]);

  const totalRevenue = filtered.reduce((sum, inv) => sum + inv.amount, 0);
  const hasFilters = search || fromDate || toDate;

  const handleClearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="admin-page invoices-page">
      <main className="dashboard-container invoices-container">

        {/* ── Header ── */}
        <header className="invoices-hero">
          <div>
            <p className="admin-label">Sales Manager</p>
            <h1>Invoices</h1>
          </div>
          <div className="inv-hero-actions">
            <button
              className="inv-action-btn inv-action-btn--outline"
              onClick={() => openPrintWindow(filtered)}
              disabled={filtered.length === 0}
              title="Print or save all visible invoices as PDF"
            >
              <Printer size={17} />
              Print All
            </button>
            <button
              className="inv-action-btn inv-action-btn--primary"
              onClick={() => downloadPdf(filtered, "lumiere-invoices.pdf")}
              disabled={filtered.length === 0}
              title="Download all visible invoices as a single PDF"
            >
              <Download size={17} />
              Download All PDF
            </button>
          </div>
        </header>

        {/* ── Summary ── */}
        <section className="inv-summary-row">
          <div className="inv-summary-card inv-summary-card--count">
            <p className="inv-summary-card__label">Total Invoices</p>
            <h2 className="inv-summary-card__value">{filtered.length}</h2>
            <p className="inv-summary-card__sub">{hasFilters ? "matching filters" : "all time"}</p>
          </div>
          <div className="inv-summary-card inv-summary-card--revenue">
            <p className="inv-summary-card__label">Total Revenue</p>
            <h2 className="inv-summary-card__value">{fmt(totalRevenue)}</h2>
            <p className="inv-summary-card__sub">{hasFilters ? "matching filters" : "all time"}</p>
          </div>
        </section>

        {/* ── Filters ── */}
        <section className="inv-filters">
          <div className="inv-search-wrap">
            <Search size={17} className="inv-search-icon" />
            <input
              type="text"
              className="inv-search-input"
              placeholder="Search by customer or invoice ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="inv-search-clear" onClick={() => setSearch("")} aria-label="Clear">×</button>
            )}
          </div>

          <div className="inv-date-range">
            <label className="inv-date-label">From</label>
            <input type="date" className="inv-date-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <label className="inv-date-label">To</label>
            <input type="date" className="inv-date-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            {hasFilters && (
              <button className="inv-clear-btn" onClick={handleClearFilters}>Clear filters</button>
            )}
          </div>
        </section>

        {/* ── Table ── */}
        <section className="inv-table-card">
          {filtered.length === 0 ? (
            <div className="inv-state">
              <FileText size={44} strokeWidth={1.2} />
              <p>No invoices found{hasFilters ? " for the selected filters" : ""}.</p>
              {hasFilters && (
                <button className="inv-retry-btn" onClick={handleClearFilters}>Clear filters</button>
              )}
            </div>
          ) : (
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th className="inv-col-num">Items</th>
                  <th className="inv-col-num">Amount</th>
                  <th className="inv-col-status">Status</th>
                  <th className="inv-col-action">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="inv-row">
                    <td>
                      <span className="inv-number">{inv.invoiceNumber}</span>
                    </td>
                    <td>
                      <div className="inv-customer">{inv.customerName}</div>
                      <div className="inv-customer-email">{inv.customerEmail}</div>
                    </td>
                    <td className="inv-cell-date">{fmtDate(inv.createdAt)}</td>
                    <td className="inv-col-num">{inv.items.length}</td>
                    <td className="inv-col-num inv-amount">{fmt(inv.amount)}</td>
                    <td className="inv-col-status">
                      <span className="inv-status-badge">Paid</span>
                    </td>
                    <td className="inv-col-action">
                      <div className="inv-row-actions">
                        <button
                          className="inv-row-btn"
                          onClick={() => openPrintWindow([inv])}
                          title="Print this invoice"
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          className="inv-row-btn inv-row-btn--primary"
                          onClick={() => downloadPdf([inv], `${inv.invoiceNumber}.pdf`)}
                          title={`Download ${inv.invoiceNumber} as PDF`}
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="inv-total-row">
                  <td colSpan={4}>
                    <strong>{filtered.length} invoice{filtered.length !== 1 ? "s" : ""}</strong>
                  </td>
                  <td className="inv-col-num inv-amount">
                    <strong>{fmt(totalRevenue)}</strong>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          )}
        </section>

      </main>
    </div>
  );
}
