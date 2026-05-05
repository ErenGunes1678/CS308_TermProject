type InvoiceItem = {
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
};

type InvoicePayload = {
    invoiceNumber: string;
    issuedAt: string;
    orderId: number;
    status: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    items: InvoiceItem[];
    subtotal: number;
    shipping: number;
    total: number;
};

const escapePdfText = (value: string): string =>
    value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const toPdfLine = (text: string, x: number, y: number, size = 12): string =>
    `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;

const buildPdf = (lines: string[]): Buffer => {
    const content = lines.join("\n");
    const objects = [
        "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
        "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
        "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
        "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
        `5 0 obj << /Length ${Buffer.byteLength(content, "utf8")} >> stream\n${content}\nendstream endobj`,
    ];

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    for (const object of objects) {
        offsets.push(Buffer.byteLength(pdf, "utf8"));
        pdf += `${object}\n`;
    }

    const xrefStart = Buffer.byteLength(pdf, "utf8");
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";

    for (let index = 1; index < offsets.length; index += 1) {
        pdf += `${offsets[index].toString().padStart(10, "0")} 00000 n \n`;
    }

    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return Buffer.from(pdf, "utf8");
};

export const createInvoicePdfBuffer = (invoice: InvoicePayload): Buffer => {
    const lines: string[] = [];
    let y = 760;

    lines.push(toPdfLine("Invoice", 255, y, 24));
    y -= 36;
    lines.push(toPdfLine(`Invoice Number: ${invoice.invoiceNumber}`, 50, y));
    y -= 18;
    lines.push(toPdfLine(`Order ID: ${invoice.orderId}`, 50, y));
    y -= 18;
    lines.push(toPdfLine(`Issued At: ${new Date(invoice.issuedAt).toLocaleString()}`, 50, y));
    y -= 18;
    lines.push(toPdfLine(`Status: ${invoice.status}`, 50, y));
    y -= 30;

    lines.push(toPdfLine("Customer", 50, y, 16));
    y -= 22;
    lines.push(toPdfLine(invoice.customerName, 50, y));
    y -= 18;
    lines.push(toPdfLine(invoice.customerEmail, 50, y));
    y -= 18;
    lines.push(toPdfLine(invoice.customerPhone, 50, y));
    y -= 18;
    lines.push(toPdfLine(invoice.shippingAddress, 50, y));
    y -= 32;

    lines.push(toPdfLine("Items", 50, y, 16));
    y -= 22;
    lines.push(toPdfLine("Product", 50, y));
    lines.push(toPdfLine("Qty", 310, y));
    lines.push(toPdfLine("Unit", 380, y));
    lines.push(toPdfLine("Total", 470, y));
    y -= 18;

    for (const item of invoice.items) {
        lines.push(toPdfLine(item.productName.slice(0, 42), 50, y));
        lines.push(toPdfLine(String(item.quantity), 310, y));
        lines.push(toPdfLine(`$${item.unitPrice.toFixed(2)}`, 380, y));
        lines.push(toPdfLine(`$${item.lineTotal.toFixed(2)}`, 470, y));
        y -= 18;
    }

    y -= 12;
    lines.push(toPdfLine(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 380, y));
    y -= 18;
    lines.push(toPdfLine(`Shipping: $${invoice.shipping.toFixed(2)}`, 380, y));
    y -= 18;
    lines.push(toPdfLine(`Grand Total: $${invoice.total.toFixed(2)}`, 380, y, 14));
    y -= 36;
    lines.push(toPdfLine("Thank you for your purchase.", 190, y, 12));

    return buildPdf(lines);
};
