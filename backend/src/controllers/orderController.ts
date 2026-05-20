import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db, { sequelize } from "../entities";
import { createInvoicePdfBuffer } from "../utils/invoicePdf";
import { sendInvoiceEmail } from "../utils/emailService";

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

        // Create order using allowed status values only
        const order = await db.orders.create(
            { user_id: userId, total_amount: totalAmount, status: bankConfirmation.approved ? "processing" : "cancelled" },
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

        try {
            await sendInvoiceEmail(invoice.customerEmail, invoice.customerName, invoice.invoiceNumber, pdfBuffer);
        } catch (emailError) {
            console.error("Invoice email failed (order still confirmed):", emailError);
        }

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

const isProductManager = async (userId: number) => {
    const user = await db.users.findByPk(userId);
    return user?.role === "product_manager";
};

const canReadOrdersForAdmin = async (userId: number) => {
    const user = await db.users.findByPk(userId);
    return user?.role === "product_manager" || user?.role === "sales_manager";
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

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId || !(await canReadOrdersForAdmin(req.userId))) {
            res.status(403).json({ message: "Admin access required." });
            return;
        }

        const orders = await db.orders.findAll({
            include: [
                { model: db.users, as: "user", attributes: ["id", "name", "email"] },
                { model: db.order_items, as: "items", include: [{ model: db.products, as: "product" }] },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json({ orders });
    } catch (error) {
        console.error("Get all orders error:", error);
        res.status(500).json({ message: "Failed to fetch all orders." });
    }
};

export const cancelUserOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orderId = Number(req.params.id);
        const order = await db.orders.findOne({
            where: { id: orderId, user_id: req.userId },
        });

        if (!order) {
            res.status(404).json({ message: "Order not found." });
            return;
        }

        if (order.status !== "processing") {
            res.status(400).json({ message: "Only processing orders can be cancelled." });
            return;
        }

        await order.update({ status: "cancelled" });
        res.json({ message: "Order cancelled.", order });
    } catch (error) {
        console.error("Cancel order error:", error);
        res.status(500).json({ message: "Failed to cancel order." });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId || !(await isProductManager(req.userId))) {
            res.status(403).json({ message: "Admin access required." });
            return;
        }

        const orderId = Number(req.params.id);
        const requestedStatus = String(req.body.status || '').trim().toLowerCase();
        const allowedNextStatus: Record<string, string> = {
            processing: 'in-transit',
            'in-transit': 'delivered',
        };

        const order = await db.orders.findByPk(orderId, {
            include: [
                { model: db.users, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: db.order_items, as: 'items', include: [{ model: db.products, as: 'product' }] },
            ],
        });

        if (!order) {
            res.status(404).json({ message: 'Order not found.' });
            return;
        }

        const currentStatus = order.status as string;
        const expectedNextStatus = allowedNextStatus[currentStatus];

        if (!requestedStatus || requestedStatus !== expectedNextStatus) {
            res.status(400).json({ message: 'Invalid status transition.' });
            return;
        }

        await order.update({ status: requestedStatus });

        const message =
            requestedStatus === 'in-transit'
                ? 'Order forwarded to delivery department.'
                : requestedStatus === 'delivered'
                ? 'Order marked as delivered.'
                : 'Order status updated.';

        res.json({ message, order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Failed to update order status.' });
    }
};
