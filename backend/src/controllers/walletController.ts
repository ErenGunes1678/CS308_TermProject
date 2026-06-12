import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db from "../entities";

export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;

        const user = await db.users.findByPk(userId, { attributes: ["wallet_balance"] });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        const transactions = await db.wallet_transactions.findAll({
            where: { user_id: userId },
            order: [["createdAt", "DESC"]],
            limit: 50,
        });

        res.json({
            balance: Number(user.wallet_balance),
            transactions,
        });
    } catch (error) {
        console.error("Get wallet error:", error);
        res.status(500).json({ message: "Failed to fetch wallet." });
    }
};
