import { useState, useEffect, useMemo, useCallback } from "react";
import { Download, Printer, Search, FileText, Loader } from "lucide-react";
import { getInvoices, downloadInvoicePdf } from "../../services/invoiceService";
import "./InvoicesPage.css";

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

/* ─── Shape raw API invoice into what the PDF generators expect ──────────── */

function shapeInvoice(raw) {
  const items = (raw.order?.items ?? []).map((it) => ({
    productName: it.product?.name ?? "Unknown Product",
    quantity: it.quantity,
    unitPrice: parseFloat(it.unit_price),
    lineTotal: parseFloat(it.unit_price) * it.quantity,
  }));

  const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
  const amount = parseFloat(raw.amount);
  const discount = parseFloat(raw.discount_amount) || 0;
  // amount = subtotal + shipping - discount  => shipping = amount + discount - subtotal
  const shipping = Math.max(0, parseFloat((amount + discount - subtotal).toFixed(2)));

  return {
    id: raw.id,
    invoiceNumber: raw.invoice_number,
    fileName: raw.file_name,
    customerName: raw.customer_name,
    customerEmail: raw.order?.user?.email ?? "",
    customerPhone: "",
    shippingAddress: "",
    amount,
    discount,
    discountCode: raw.discount_code || null,
    subtotal,
    shipping,
    orderId: raw.order_id,
    orderStatus: raw.order?.status ?? "",
    createdAt: raw.createdAt,
    items,
  };
}

/* ─── Browser-side PDF generation (no library) ───────────────────────────── */

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

const pdfLine = (text, x, y, size = 11) =>
  `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`;

function invoicePageLines(inv) {
  const ops = [];
  let y = 750;

  ops.push(pdfLine("Lumiere Cosmetics", 50, y, 18));
  y -= 26;
  ops.push(pdfLine("INVOICE", 50, y, 13));
  y -= 22;
  ops.push(pdfLine(`Number: ${inv.invoiceNumber}`, 50, y));
  y -= 16;
  ops.push(
    pdfLine(
      `Date:   ${new Date(inv.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })}`,
      50,
      y
    )
  );
  y -= 16;
  ops.push(pdfLine(`Order:  #${inv.orderId}`, 50, y));
  y -= 28;

  ops.push(pdfLine("Bill To", 50, y, 12));
  y -= 18;
  ops.push(pdfLine(inv.customerName, 50, y));
  y -= 15;
  if (inv.customerEmail) ops.push(pdfLine(inv.customerEmail, 50, y));
  y -= 30;

  ops.push(pdfLine("Product", 50, y, 10));
  ops.push(pdfLine("Qty", 330, y, 10));
  ops.push(pdfLine("Unit", 390, y, 10));
  ops.push(pdfLine("Total", 470, y, 10));
  y -= 16;

  for (const it of inv.items) {
    ops.push(pdfLine(it.productName.slice(0, 40), 50, y));
    ops.push(pdfLine(String(it.quantity), 330, y));
    ops.push(pdfLine(`$${it.unitPrice.toFixed(2)}`, 390, y));
    ops.push(pdfLine(`$${it.lineTotal.toFixed(2)}`, 470, y));
    y -= 15;
  }

  y -= 10;
  ops.push(pdfLine(`Subtotal : $${inv.subtotal.toFixed(2)}`, 380, y));
  y -= 15;
  ops.push(pdfLine(`Shipping : $${inv.shipping.toFixed(2)}`, 380, y));
  y -= 15;
  if (inv.discount && Number(inv.discount) > 0) {
    ops.push(pdfLine(`Discount${inv.discountCode ? ` (${inv.discountCode})` : ""} : -$${Number(inv.discount).toFixed(2)}`, 380, y));
    y -= 15;
  }
  ops.push(pdfLine(`Grand Total: $${inv.amount.toFixed(2)}`, 380, y, 13));
  y -= 28;
  ops.push(pdfLine("Status: PAID", 50, y, 11));
  y -= 30;
  ops.push(pdfLine("Thank you for shopping at Lumiere!", 160, y, 10));

  return ops;
}

function buildMultiPagePdf(invoices) {
  const N = invoices.length;
  const fontObj = 3 + 2 * N;

  const pageContents = invoices.map((inv) => invoicePageLines(inv).join("\n"));
  const kidRefs = Array.from({ length: N }, (_, i) => `${3 + i} 0 R`).join(" ");

  const objects = [
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`,
    `2 0 obj << /Type /Pages /Kids [${kidRefs}] /Count ${N} >> endobj`,
    ...Array.from(
      { length: N },
      (_, i) =>
        `${3 + i} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${3 + N + i} 0 R >> endobj`
    ),
    ...pageContents.map(
      (content, i) =>
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

function downloadAllAsPdf(invoices, filename) {
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
        ${inv.discount && Number(inv.discount) > 0 ? `<div class="inv-doc__total-row"><span>Discount${inv.discountCode ? ` (${inv.discountCode})` : ""}</span><span>-${fmt(inv.discount)}</span></div>` : ''}
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
  win.document.write(
    `<!DOCTYPE html><html><head><title>Lumière – Invoices</title><style>${PRINT_STYLES}</style></head><body>`
  );
  for (const inv of invoices) {
    win.document.write(buildInvoiceHtml(inv));
  }
  win.document.write("</body></html>");
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 400);
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getInvoices({
        from: fromDate || undefined,
        to: toDate || undefined,
        q: search.trim() || undefined,
      });
      setInvoices(raw.map(shapeInvoice));
    } catch (err) {
      setError("Failed to load invoices. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, search, toDate]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filtered = useMemo(() => {
    return invoices;
  }, [invoices, search]);

  const totalRevenue = filtered.reduce((sum, inv) => sum + inv.amount, 0);
  const hasFilters = search || fromDate || toDate;

  const handleClearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
  };

  const handleDownloadPdf = async (inv) => {
    setDownloadingId(inv.id);
    try {
      await downloadInvoicePdf(inv.id, inv.fileName);
    } catch {
      alert("Could not download the PDF. The file may not exist on the server.");
    } finally {
      setDownloadingId(null);
    }
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
              onClick={() => downloadAllAsPdf(filtered, "lumiere-invoices.pdf")}
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
            <h2 className="inv-summary-card__value">{loading ? "—" : filtered.length}</h2>
            <p className="inv-summary-card__sub">{hasFilters ? "matching filters" : "all time"}</p>
          </div>
          <div className="inv-summary-card inv-summary-card--revenue">
            <p className="inv-summary-card__label">Total Revenue</p>
            <h2 className="inv-summary-card__value">{loading ? "—" : fmt(totalRevenue)}</h2>
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
              <button
                className="inv-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear"
              >
                ×
              </button>
            )}
          </div>

          <div className="inv-date-range">
            <label className="inv-date-label">From</label>
            <input
              type="date"
              className="inv-date-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <label className="inv-date-label">To</label>
            <input
              type="date"
              className="inv-date-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            {hasFilters && (
              <button className="inv-clear-btn" onClick={handleClearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* ── Table ── */}
        <section className="inv-table-card">
          {loading ? (
            <div className="inv-state">
              <Loader size={36} strokeWidth={1.5} className="inv-spinner" />
              <p>Loading invoices…</p>
            </div>
          ) : error ? (
            <div className="inv-state">
              <FileText size={44} strokeWidth={1.2} />
              <p>{error}</p>
              <button className="inv-retry-btn" onClick={fetchInvoices}>
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="inv-state">
              <FileText size={44} strokeWidth={1.2} />
              <p>No invoices found{hasFilters ? " for the selected filters" : ""}.</p>
              {hasFilters && (
                <button className="inv-retry-btn" onClick={handleClearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table className="invoice-ledger-table">
              <colgroup>
                <col className="inv-col-invoice" />
                <col className="inv-col-customer" />
                <col className="inv-col-date" />
                <col className="inv-col-items" />
                <col className="inv-col-amount" />
                <col className="inv-col-paid" />
                <col className="inv-col-actions-col" />
              </colgroup>
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
                      {inv.customerEmail && (
                        <div className="inv-customer-email">{inv.customerEmail}</div>
                      )}
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
                          onClick={() => handleDownloadPdf(inv)}
                          disabled={downloadingId === inv.id}
                          title={`Download ${inv.invoiceNumber} as PDF`}
                        >
                          {downloadingId === inv.id ? (
                            <Loader size={14} className="inv-spinner" />
                          ) : (
                            <Download size={14} />
                          )}
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
                    <strong>
                      {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
                    </strong>
                  </td>
                  <td colSpan={3} className="inv-col-num inv-amount">
                    <strong>{fmt(totalRevenue)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

      </main>
    </div>
  );
}
