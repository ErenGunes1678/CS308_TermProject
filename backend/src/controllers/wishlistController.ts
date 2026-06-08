import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db from "../entities";

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const items = await db.wishlists.findAll({
            where: { user_id: req.userId },
            include: [{ model: db.products, as: "product" }],
        });

        res.json({ items });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;

        const product = await db.products.findByPk(productId);
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }

        const existing = await db.wishlists.findOne({
            where: { user_id: req.userId, product_id: productId },
        });

        if (existing) {
            res.status(409).json({ message: "Product is already in your wishlist." });
            return;
        }

        await db.wishlists.create({ user_id: req.userId, product_id: productId });

        res.status(201).json({ message: "Product added to wishlist." });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;

        const item = await db.wishlists.findOne({
            where: { user_id: req.userId, product_id: productId },
        });

        if (!item) {
            res.status(404).json({ message: "Product not found in your wishlist." });
            return;
        }

        await item.destroy();

        res.json({ message: "Product removed from wishlist." });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
