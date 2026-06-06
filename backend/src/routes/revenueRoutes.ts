import { Router } from "express";
import {
    getRevenueStats,
    getRevenueOverTime,
    getOrdersVolume,
    getRevenueByCategory,
    getRecentTransactions,
} from "../controllers/revenueController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/stats", requireAuth, getRevenueStats);
router.get("/over-time", requireAuth, getRevenueOverTime);
router.get("/orders-volume", requireAuth, getOrdersVolume);
router.get("/by-category", requireAuth, getRevenueByCategory);
router.get("/transactions", requireAuth, getRecentTransactions);

export default router;
