import PDFDocument from "pdfkit";

export const createInvoicePdf = (order: any): PDFKit.PDFDocument => {
    const doc = new PDFDocument({
        size: "A4",
        margin: 50,
    });

    doc.fontSize(22).text("Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice / Order ID: ${order.id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Order Status: ${order.status}`);
    doc.moveDown();

    doc.fontSize(14).text("Customer Information", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Customer ID: ${order.user?.id || order.user_id}`);
    doc.text(`Name: ${order.user?.name || "N/A"}`);
    doc.text(`Email: ${order.user?.email || "N/A"}`);
    doc.moveDown();

    doc.fontSize(14).text("Purchased Products", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12);
    doc.text("Product", 50, doc.y, { continued: true });
    doc.text("Qty", 260, doc.y, { continued: true });
    doc.text("Unit Price", 330, doc.y, { continued: true });
    doc.text("Total", 440, doc.y);
    doc.moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    for (const item of order.items) {
        const productName = item.product?.name || `Product #${item.product_id}`;
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unit_price);
        const lineTotal = quantity * unitPrice;

        doc.text(productName, 50, doc.y, { continued: true, width: 190 });
        doc.text(String(quantity), 260, doc.y, { continued: true });
        doc.text(`$${unitPrice.toFixed(2)}`, 330, doc.y, { continued: true });
        doc.text(`$${lineTotal.toFixed(2)}`, 440, doc.y);

        doc.moveDown();
    }

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(14).text(`Total Amount: $${Number(order.total_amount).toFixed(2)}`, {
        align: "right",
    });

    doc.moveDown(2);
    doc.fontSize(10).text("Thank you for shopping with us.", {
        align: "center",
    });

    return doc;
};