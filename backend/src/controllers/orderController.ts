import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db, { sequelize } from "../entities";
import { createInvoicePdfBuffer } from "../utils/invoicePdf";

const SHIPPING_COST = 5.99;
const FREE_SHIPPING_MINIMUM = 50;

const formatMoney = (value: number): number => Number(value.toFixed(2));

const buildAddressLabel = (shippingAddress: any): string =>
    [
        `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
        shippingAddress.street,
        `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`.trim(),
        shippingAddress.country,
    ]
        .filter(Boolean)
        .join(", ");

const confirmMockBankPayment = (amount: number, paymentMethod: string) => ({
    approved: true,
    amount: formatMoney(amount),
    paymentMethod,
    provider: "Mock National Bank",
    transactionId: `MB-${Date.now()}`,
    confirmedAt: new Date().toISOString(),
});

export const placeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const t = await sequelize.transaction();

    try {
        const { shippingAddress, payment } = req.body ?? {};

        const requiredAddressFields = [
            "firstName",
            "lastName",
            "email",
            "phone",
            "country",
            "street",
            "city",
            "state",
            "zip",
        ];

        if (!shippingAddress || !payment?.method) {
            await t.rollback();
            res.status(400).json({ message: "Shipping address and payment details are required." });
            return;
        }

        for (const field of requiredAddressFields) {
            if (!shippingAddress[field]?.trim()) {
                await t.rollback();
                res.status(400).json({ message: `Missing required field: ${field}` });
                return;
            }
        }

        const cart = await db.carts.findOne({
            where: { user_id: userId },
            include: [{ model: db.cart_items, as: "items" }],
            transaction: t,
        });

        if (!cart || cart.items.length === 0) {
            await t.rollback();
            res.status(400).json({ message: "Your cart is empty." });
            return;
        }

        let subtotal = 0;

        // Validate stock and calculate total
        for (const item of cart.items) {
            const product = await db.products.findByPk(item.product_id, { transaction: t });
            if (!product || product.quantity_in_stock < item.quantity) {
                await t.rollback();
                res.status(400).json({
                    message: `Insufficient stock for: ${product?.name || "unknown product"}`
                });
                return;
            }
            subtotal += parseFloat(product.price) * item.quantity;
        }

        const shipping = subtotal > 0 && subtotal < FREE_SHIPPING_MINIMUM ? SHIPPING_COST : 0;
        const totalAmount = formatMoney(subtotal + shipping);
        const bankConfirmation = confirmMockBankPayment(totalAmount, payment.method);

        // Create order
        const order = await db.orders.create(
            { user_id: userId, total_amount: totalAmount, status: bankConfirmation.approved ? "paid" : "pending" },
            { transaction: t }
        );

        // Create order items and deduct stock
        for (const item of cart.items) {
            const product = await db.products.findByPk(item.product_id, { transaction: t });

            await db.order_items.create({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: product.price,
            }, { transaction: t });

            await product.update(
                { quantity_in_stock: product.quantity_in_stock - item.quantity },
                { transaction: t }
            );
        }

        // Clear cart after order
        await db.cart_items.destroy({ where: { cart_id: cart.id }, transaction: t });

        await t.commit();

        const populatedOrder = await db.orders.findByPk(order.id, {
            include: [
                { model: db.users, as: "user", attributes: ["id", "name", "email"] },
                {
                    model: db.order_items,
                    as: "items",
                    include: [{ model: db.products, as: "product" }],
                },
            ],
        });

        if (!populatedOrder) {
            res.status(500).json({ message: "Order created but could not be loaded." });
            return;
        }

        const invoice = {
            invoiceNumber: `INV-${order.id}-${Date.now().toString().slice(-6)}`,
            issuedAt: new Date().toISOString(),
            orderId: populatedOrder.id,
            status: populatedOrder.status,
            customerName: shippingAddress.firstName && shippingAddress.lastName
                ? `${shippingAddress.firstName} ${shippingAddress.lastName}`
                : populatedOrder.user?.name || "N/A",
            customerEmail: shippingAddress.email || populatedOrder.user?.email || "N/A",
            customerPhone: shippingAddress.phone || "N/A",
            shippingAddress: buildAddressLabel(shippingAddress),
            items: populatedOrder.items.map((item: any) => ({
                productId: item.product_id,
                productName: item.product?.name || `Product #${item.product_id}`,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unit_price),
                lineTotal: formatMoney(Number(item.quantity) * Number(item.unit_price)),
            })),
            subtotal: formatMoney(subtotal),
            shipping: formatMoney(shipping),
            total: totalAmount,
        };

        const pdfBuffer = createInvoicePdfBuffer(invoice);
        const pdfFilename = `invoice-${invoice.invoiceNumber}.pdf`;
        const pdfBase64 = pdfBuffer.toString("base64");

        res.status(201).json({
            message: "Payment confirmed and invoice generated.",
            bankConfirmation,
            invoice: {
                ...invoice,
                pdfFilename,
                pdfBase64,
            },
        });
    } catch (error) {
        if (!(t as typeof t & { finished?: string }).finished) {
            await t.rollback();
        }
        console.error("Place order error:", error);
        res.status(500).json({ message: "Failed to place order." });
    }
};

export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orders = await db.orders.findAll({
            where: { user_id: req.userId },
            include: [{ model: db.order_items, as: "items",
                include: [{ model: db.products, as: "product" }]
            }],
            order: [["createdAt", "DESC"]],
        });

        res.json({ orders });
    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({ message: "Failed to fetch orders." });
    }
};
