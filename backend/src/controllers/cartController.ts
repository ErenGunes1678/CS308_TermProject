import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db from "../entities";

async function getOrCreateCart(userId?: number, sessionId?: string): Promise<any> {
    if (userId) {
        const [cart] = await db.carts.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId },
        });
        return cart;
    }

    if (!sessionId) throw new Error("session_id is required for guest cart.");

    const [cart] = await db.carts.findOrCreate({
        where: { session_id: sessionId, user_id: null },
        defaults: { session_id: sessionId },
    });
    return cart;
}

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { session_id } = req.query as { session_id?: string };
        const cart = await getOrCreateCart(req.userId, session_id);

        const items = await db.cart_items.findAll({
            where: { cart_id: cart.id },
            include: [{ model: db.products, as: "product" }],
        });

        res.json({ cart_id: cart.id, items });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { product_id, quantity = 1, session_id } = req.body;

        if (!product_id) {
            res.status(400).json({ message: "product_id is required." });
            return;
        }

        const cart = await getOrCreateCart(req.userId, session_id);

        const product = await db.products.findByPk(product_id);
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        if (product.quantity_in_stock < quantity) {
            res.status(400).json({ message: "Insufficient stock." });
            return;
        }

        const existing = await db.cart_items.findOne({
            where: { cart_id: cart.id, product_id },
        });

        if (existing) {
            await existing.update({ quantity: existing.quantity + quantity });
        } else {
            await db.cart_items.create({ cart_id: cart.id, product_id, quantity });
        }

        res.json({ message: "Item added to cart." });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { item_id } = req.params;
        const { session_id } = req.body;

        const cart = await getOrCreateCart(req.userId, session_id);

        const deleted = await db.cart_items.destroy({
            where: { id: item_id, cart_id: cart.id },
        });

        if (!deleted) {
            res.status(404).json({ message: "Item not found in your cart." });
            return;
        }

        res.json({ message: "Item removed from cart." });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};