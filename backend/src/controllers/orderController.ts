import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db, { sequelize } from "../entities";

export const placeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const t = await sequelize.transaction();

    try {
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

        let totalAmount = 0;

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
            totalAmount += parseFloat(product.price) * item.quantity;
        }

        // Create order
        const order = await db.orders.create(
            { user_id: userId, total_amount: totalAmount, status: "pending" },
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
        res.status(201).json({ message: "Order placed successfully.", order });
    } catch (error) {
        await t.rollback();
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