import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db from "../entities";

export const getHiddenReviewProductIds = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const hiddenEntries = await db.hidden_review_prompts.findAll({
            where: { user_id: userId },
            attributes: ["product_id"],
        });

        const hiddenProductIds = hiddenEntries.map((item: any) => item.product_id);
        res.status(200).json({ hiddenProductIds });
    } catch (error) {
        console.error("Get hidden review product ids error:", error);
        res.status(500).json({ message: "Failed to load hidden review preferences." });
    }
};

export const hideReviewProductId = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { productId } = req.body;

        if (!productId) {
            res.status(400).json({ message: "productId is required." });
            return;
        }

        await db.hidden_review_prompts.findOrCreate({
            where: { user_id: userId, product_id: productId },
        });

        const hiddenEntries = await db.hidden_review_prompts.findAll({
            where: { user_id: userId },
            attributes: ["product_id"],
        });

        const hiddenProductIds = hiddenEntries.map((item: any) => item.product_id);
        res.status(200).json({ hiddenProductIds });
    } catch (error) {
        console.error("Hide review product id error:", error);
        res.status(500).json({ message: "Failed to save hidden review preference." });
    }
};
