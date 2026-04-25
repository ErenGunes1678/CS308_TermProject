import { Router } from "express";
import { placeOrder, getUserOrders } from "../controllers/orderController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/", requireAuth, placeOrder);
router.get("/", requireAuth, getUserOrders);

export default router;