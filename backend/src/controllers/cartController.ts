import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db from "../entities";
import { getOrCreateGuestSessionId } from "../utils/auth";

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
        const sessionId = req.userId ? undefined : getOrCreateGuestSessionId(req, res);
        const cart = await getOrCreateCart(req.userId, sessionId);

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
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            res.status(400).json({ message: "product_id is required." });
            return;
        }

        const sessionId = req.userId ? undefined : getOrCreateGuestSessionId(req, res);
        const cart = await getOrCreateCart(req.userId, sessionId);

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

export const decreaseFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { item_id } = req.params;
        const sessionId = req.userId ? undefined : getOrCreateGuestSessionId(req, res);
        const cart = await getOrCreateCart(req.userId, sessionId);

        const item = await db.cart_items.findOne({
            where: { id: item_id, cart_id: cart.id },
        });

        if (!item) {
            res.status(404).json({ message: "Item not found in your cart." });
            return;
        }

        if (item.quantity > 1) {
            await item.update({ quantity: item.quantity - 1 });
            res.json({
                message: "Item quantity decreased.",
                item: { id: item.id, quantity: item.quantity },
            });
            return;
        }

        // quantity is 1 — removing the line entirely
        await item.destroy();
        res.json({ message: "Item removed from cart." });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const emptyCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sessionId = req.userId ? undefined : getOrCreateGuestSessionId(req, res);
        const cart = await getOrCreateCart(req.userId, sessionId);

        const deleted = await db.cart_items.destroy({
            where: { cart_id: cart.id },
        });

        res.json({
            message: "Cart emptied.",
            removed_items: deleted,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
