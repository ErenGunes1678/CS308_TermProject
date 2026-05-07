import { Router } from "express";
import { placeOrder, getUserOrders, getAllOrders, updateOrderStatus } from "../controllers/orderController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/", requireAuth, placeOrder);
router.get("/", requireAuth, getUserOrders);
router.get("/admin", requireAuth, getAllOrders);
router.patch("/:id/status", requireAuth, updateOrderStatus);

export default router;