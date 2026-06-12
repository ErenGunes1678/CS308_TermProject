import fs from "fs";
import path from "path";
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db, { sequelize } from "../entities";
import { createInvoicePdfBuffer } from "../utils/invoicePdf";
import { sendInvoiceEmail } from "../utils/emailService";

const INVOICES_DIR = path.resolve(process.cwd(), "invoices");
fs.mkdirSync(INVOICES_DIR, { recursive: true });

const SHIPPING_COST = 5.99;
const FREE_SHIPPING_MINIMUM = 50;
const RETURN_WINDOW_DAYS = 30;

const formatMoney = (value: number): number => Number(value.toFixed(2));

const calculateRefundAmount = (orderItem: any): number =>
    formatMoney(Number(orderItem.unit_price) * Number(orderItem.quantity));

const isWithinReturnWindow = (createdAt: string | Date): boolean => {
    const purchasedAt = new Date(createdAt).getTime();
    const ageMs = Date.now() - purchasedAt;
    return ageMs >= 0 && ageMs <= RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
};

const buildAddressLabel = (shippingAddress: any): string =>
    [
        getShippingCustomerName(shippingAddress),
        shippingAddress.street,
        `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`.trim(),
        shippingAddress.country,
    ]
        .filter(Boolean)
        .join(", ");

const getShippingCustomerName = (shippingAddress: any): string =>
    String(
        shippingAddress?.name ||
        `${shippingAddress?.firstName || ""} ${shippingAddress?.lastName || ""}`.trim()
    ).trim();

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
        const { shippingAddress, payment, discount_code } = req.body ?? {};

        const requiredAddressFields = [
            "email",
            "taxId",
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

        if (!getShippingCustomerName(shippingAddress)) {
            await t.rollback();
            res.status(400).json({ message: "Missing required field: name" });
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

        let shipping = subtotal > 0 && subtotal < FREE_SHIPPING_MINIMUM ? SHIPPING_COST : 0;
        let discountAmount = 0;

        if (discount_code) {
            const discountCode = await db.discount_codes.findOne({
                where: { code: String(discount_code).toUpperCase() },
                transaction: t,
            });

            if (!discountCode) {
                await t.rollback();
                res.status(400).json({ message: "Discount code not found." });
                return;
            }
            if (!discountCode.is_active) {
                await t.rollback();
                res.status(400).json({ message: "This discount code is not active." });
                return;
            }
            if (new Date(discountCode.expiry_date) <= new Date()) {
                await t.rollback();
                res.status(400).json({ message: "This discount code has expired." });
                return;
            }
            if (discountCode.min_order !== null && subtotal < Number(discountCode.min_order)) {
                await t.rollback();
                res.status(400).json({
                    message: `This code requires a minimum order of $${Number(discountCode.min_order).toFixed(2)}.`,
                });
                return;
            }

            if (discountCode.type === "free_shipping") {
                shipping = 0;
            } else if (discountCode.type === "percentage") {
                discountAmount = formatMoney((subtotal + shipping) * Number(discountCode.value) / 100);
            } else if (discountCode.type === "fixed") {
                discountAmount = formatMoney(Math.min(Number(discountCode.value), subtotal + shipping));
            }

            await discountCode.increment("uses_count", { transaction: t });
        }

        const totalAmount = formatMoney(subtotal + shipping - discountAmount);
        const bankConfirmation = confirmMockBankPayment(totalAmount, payment.method);

        // Create order using allowed status values only
        const order = await db.orders.create(
            {
                user_id: userId,
                total_amount: totalAmount,
                status: bankConfirmation.approved ? "processing" : "cancelled",
                delivery_address: {
                    name: getShippingCustomerName(shippingAddress),
                    email: shippingAddress.email,
                    phone: shippingAddress.phone,
                    taxId: shippingAddress.taxId,
                    street: shippingAddress.street,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    zip: shippingAddress.zip,
                    country: shippingAddress.country,
                    label: buildAddressLabel(shippingAddress),
                },
            },
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
            customerName: getShippingCustomerName(shippingAddress) || populatedOrder.user?.name || "N/A",
            customerEmail: shippingAddress.email || populatedOrder.user?.email || "N/A",
            customerPhone: shippingAddress.phone || "N/A",
            customerTaxId: shippingAddress.taxId || "N/A",
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
            discount: formatMoney(discountAmount),
            total: totalAmount,
        };

        const pdfBuffer = createInvoicePdfBuffer(invoice);
        const pdfFilename = `invoice-${invoice.invoiceNumber}.pdf`;
        const pdfBase64 = pdfBuffer.toString("base64");

        fs.writeFileSync(path.join(INVOICES_DIR, pdfFilename), pdfBuffer);

        await db.invoices.create({
            invoice_number: invoice.invoiceNumber,
            file_name: pdfFilename,
            customer_name: invoice.customerName,
            amount: invoice.total,
            order_id: order.id,
        });

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

const isSalesManager = async (userId: number) => {
    const user = await db.users.findByPk(userId);
    return user?.role === "sales_manager";
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
                include: [
                    { model: db.products, as: "product" },
                    { model: db.refund_requests, as: "refundRequest" },
                ]
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
                {
                    model: db.order_items,
                    as: "items",
                    include: [
                        { model: db.products, as: "product" },
                        { model: db.refund_requests, as: "refundRequest" },
                    ],
                },
                {
                    model: db.invoices,
                    as: "invoice",
                    attributes: ["id", "invoice_number", "file_name", "amount", "createdAt"],
                },
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
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }

        const userIsSalesManager = await isSalesManager(userId);
        const order = await db.orders.findOne({
            where: userIsSalesManager ? { id: orderId } : { id: orderId, user_id: userId },
        });

        if (!order) {
            res.status(404).json({ message: "Order not found." });
            return;
        }

        if (!userIsSalesManager) {
            res.status(403).json({ message: "Sales manager approval required to cancel this order." });
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

export const requestRefund = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orderItemId = Number(req.params.itemId);
        const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : null;

        if (!Number.isInteger(orderItemId) || orderItemId <= 0) {
            res.status(400).json({ message: "Valid order item id is required." });
            return;
        }

        const orderItem = await db.order_items.findByPk(orderItemId, {
            include: [
                {
                    model: db.orders,
                    as: "order",
                    where: { user_id: req.userId },
                    required: true,
                },
                { model: db.products, as: "product" },
                { model: db.refund_requests, as: "refundRequest" },
            ],
        });

        if (!orderItem) {
            res.status(404).json({ message: "Purchased product not found in your order history." });
            return;
        }

        if (!isWithinReturnWindow(orderItem.order.createdAt)) {
            res.status(400).json({ message: "The 30-day return window has closed for this product." });
            return;
        }

        if (orderItem.refundRequest) {
            res.status(409).json({ message: "A refund request already exists for this product." });
            return;
        }

        const refundAmount = calculateRefundAmount(orderItem);
        const refundRequest = await db.refund_requests.create({
            order_item_id: orderItem.id,
            user_id: req.userId,
            reason: reason || null,
            status: "pending",
            refund_amount: refundAmount,
        });

        res.status(201).json({
            message: "Refund request submitted for sales manager review.",
            refundRequest,
        });
    } catch (error) {
        console.error("Request refund error:", error);
        res.status(500).json({ message: "Failed to submit refund request." });
    }
};

export const getRefundRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId || !(await isSalesManager(req.userId))) {
            res.status(403).json({ message: "Sales manager access required." });
            return;
        }

        const refundRequests = await db.refund_requests.findAll({
            include: [
                { model: db.users, as: "user", attributes: ["id", "name", "email"] },
                { model: db.users, as: "resolver", attributes: ["id", "name", "email"] },
                {
                    model: db.order_items,
                    as: "orderItem",
                    include: [
                        { model: db.products, as: "product" },
                        { model: db.orders, as: "order" },
                    ],
                },
            ],
            order: [["requested_at", "DESC"]],
        });

        res.json({ refundRequests });
    } catch (error) {
        console.error("Get refund requests error:", error);
        res.status(500).json({ message: "Failed to fetch refund requests." });
    }
};

export const resolveRefundRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    const t = await sequelize.transaction();

    try {
        if (!req.userId || !(await isSalesManager(req.userId))) {
            await t.rollback();
            res.status(403).json({ message: "Sales manager access required." });
            return;
        }

        const refundRequestId = Number(req.params.id);
        const requestedStatus = String(req.body?.status || "").trim().toLowerCase();

        if (!["approved", "rejected"].includes(requestedStatus)) {
            await t.rollback();
            res.status(400).json({ message: "Refund request status must be approved or rejected." });
            return;
        }

        const refundRequest = await db.refund_requests.findByPk(refundRequestId, {
            include: [
                {
                    model: db.order_items,
                    as: "orderItem",
                    include: [
                        { model: db.products, as: "product" },
                        { model: db.orders, as: "order" },
                    ],
                },
            ],
            transaction: t,
        });

        if (!refundRequest) {
            await t.rollback();
            res.status(404).json({ message: "Refund request not found." });
            return;
        }

        if (refundRequest.status !== "pending") {
            await t.rollback();
            res.status(400).json({ message: "Only pending refund requests can be resolved." });
            return;
        }

        const refundAmount = calculateRefundAmount(refundRequest.orderItem);

        if (requestedStatus === "approved") {
            const product = await db.products.findByPk(refundRequest.orderItem.product_id, { transaction: t });
            if (!product) {
                await t.rollback();
                res.status(404).json({ message: "Returned product no longer exists." });
                return;
            }

            await product.update({
                quantity_in_stock: Number(product.quantity_in_stock) + Number(refundRequest.orderItem.quantity),
            }, { transaction: t });
        }

        await refundRequest.update({
            status: requestedStatus,
            refund_amount: refundAmount,
            resolved_at: new Date(),
            resolved_by: req.userId,
        }, { transaction: t });

        await t.commit();

        const resolvedRequest = await db.refund_requests.findByPk(refundRequest.id, {
            include: [
                { model: db.users, as: "user", attributes: ["id", "name", "email"] },
                { model: db.users, as: "resolver", attributes: ["id", "name", "email"] },
                {
                    model: db.order_items,
                    as: "orderItem",
                    include: [
                        { model: db.products, as: "product" },
                        { model: db.orders, as: "order" },
                    ],
                },
            ],
        });

        res.json({
            message: requestedStatus === "approved"
                ? "Refund approved. Stock has been restored and the purchase price has been refunded to the customer's account."
                : "Refund request rejected.",
            refundRequest: resolvedRequest,
        });
    } catch (error) {
        if (!(t as typeof t & { finished?: string }).finished) {
            await t.rollback();
        }
        console.error("Resolve refund request error:", error);
        res.status(500).json({ message: "Failed to resolve refund request." });
    }
};
