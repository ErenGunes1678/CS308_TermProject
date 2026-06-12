import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendPriceDropEmail = async (
    toEmail: string,
    customerName: string,
    productName: string,
    productId: number,
    oldPrice: number,
    newPrice: number
): Promise<void> => {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@store.com";
    const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    const productUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/product/${productId}`;

    await transporter.sendMail({
        from: `"Lumière Store" <${from}>`,
        to: toEmail,
        subject: `Price drop on your wishlist: ${productName}`,
        html: `
            <h2>Good news, ${customerName}!</h2>
            <p>A product on your wishlist just got cheaper.</p>
            <table style="border-collapse:collapse;margin:16px 0;">
                <tr>
                    <td style="padding:4px 12px 4px 0;color:#888;">Product</td>
                    <td style="padding:4px 0;"><strong>${productName}</strong></td>
                </tr>
                <tr>
                    <td style="padding:4px 12px 4px 0;color:#888;">Old price</td>
                    <td style="padding:4px 0;text-decoration:line-through;color:#999;">$${oldPrice.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="padding:4px 12px 4px 0;color:#888;">New price</td>
                    <td style="padding:4px 0;color:#e44;"><strong>$${newPrice.toFixed(2)}</strong> (${discount}% off)</td>
                </tr>
            </table>
            <a href="${productUrl}" style="display:inline-block;padding:10px 20px;background:#222;color:#fff;text-decoration:none;border-radius:4px;">View product</a>
            <p style="margin-top:24px;color:#aaa;font-size:12px;">You received this because the product is on your wishlist.</p>
        `,
    });
};

export const sendInvoiceEmail = async (
    toEmail: string,
    customerName: string,
    invoiceNumber: string,
    pdfBuffer: Buffer
): Promise<void> => {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@store.com";

    await transporter.sendMail({
        from: `"Lumière Store " <${from}>`,
        to: toEmail,
        subject: `Your Invoice – ${invoiceNumber}`,
        html: `
            <h2>Thank you for your order, ${customerName}!</h2>
            <p>Your invoice is attached to this email as a PDF.</p>
            <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p>If you have any questions, please contact our support team.</p>
        `,
        attachments: [
            {
                filename: `${invoiceNumber}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    });
};
