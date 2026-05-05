import { Link, Navigate, useLocation } from "react-router-dom";
import "./OrderSuccessPage.css";

const downloadPdf = (base64, filename) => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const invoice = state?.invoice;
  const bankConfirmation = state?.bankConfirmation;

  if (!invoice || !bankConfirmation) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="success-page">
      <div className="success-layout">
        <section className="success-card success-card--hero">
          <div className="success-icon">✓</div>
          <p className="success-eyebrow">Payment Confirmed</p>
          <h1>Invoice Ready</h1>
          <p>
            The mock banking entity approved your payment and your invoice is ready below.
          </p>

          <div className="status-grid">
            <div className="status-box">
              <span>Bank</span>
              <strong>{bankConfirmation.provider}</strong>
            </div>
            <div className="status-box">
              <span>Transaction ID</span>
              <strong>{bankConfirmation.transactionId}</strong>
            </div>
            <div className="status-box">
              <span>Customer</span>
              <strong>{invoice.customerEmail}</strong>
            </div>
            <div className="status-box">
              <span>Attachment</span>
              <strong>{invoice.pdfFilename}</strong>
            </div>
          </div>

          <div className="success-actions">
            <button
              type="button"
              className="home-btn"
              onClick={() => downloadPdf(invoice.pdfBase64, invoice.pdfFilename)}
            >
              Download PDF
            </button>
            <Link to="/orders" className="shop-btn">View Orders</Link>
          </div>
        </section>

        <section className="success-card invoice-card">
          <div className="invoice-header">
            <div>
              <p className="success-eyebrow">Invoice</p>
              <h2>{invoice.invoiceNumber}</h2>
            </div>
            <div className="invoice-meta">
              <p><strong>Order ID:</strong> {invoice.orderId}</p>
              <p><strong>Issued:</strong> {new Date(invoice.issuedAt).toLocaleString()}</p>
              <p><strong>Status:</strong> {invoice.status}</p>
            </div>
          </div>

          <div className="invoice-panels">
            <div className="invoice-panel">
              <p className="review-label">BILLED TO</p>
              <p>{invoice.customerName}</p>
              <p>{invoice.customerEmail}</p>
              <p>{invoice.customerPhone}</p>
            </div>
            <div className="invoice-panel">
              <p className="review-label">SHIPPING ADDRESS</p>
              <p>{invoice.shippingAddress}</p>
            </div>
          </div>

          <div className="invoice-items">
            <div className="invoice-row invoice-row--head">
              <span>Product</span>
              <span>Qty</span>
              <span>Unit Price</span>
              <span>Total</span>
            </div>

            {invoice.items.map((item) => (
              <div className="invoice-row" key={`${invoice.invoiceNumber}-${item.productId}`}>
                <span>{item.productName}</span>
                <span>{item.quantity}</span>
                <span>${item.unitPrice.toFixed(2)}</span>
                <span>${item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="invoice-summary">
            <p><span>Subtotal</span><strong>${invoice.subtotal.toFixed(2)}</strong></p>
            <p><span>Shipping</span><strong>${invoice.shipping.toFixed(2)}</strong></p>
            <p className="invoice-total"><span>Total Paid</span><strong>${invoice.total.toFixed(2)}</strong></p>
          </div>

          <div className="invoice-footer">
            <p>
              Payment approved at {new Date(bankConfirmation.confirmedAt).toLocaleString()} by{" "}
              {bankConfirmation.provider}.
            </p>
            <Link to="/" className="invoice-link">Return to home</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
