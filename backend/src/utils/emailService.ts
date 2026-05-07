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

export const sendInvoiceEmail = async (
    toEmail: string,
    customerName: string,
    invoiceNumber: string,
    pdfBuffer: Buffer
): Promise<void> => {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@store.com";

    await transporter.sendMail({
        from: `"CS308 Store" <${from}>`,
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
