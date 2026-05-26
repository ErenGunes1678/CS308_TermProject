import { Router } from "express";
import {
    placeOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    cancelUserOrder,
    requestRefund,
    getRefundRequests,
    resolveRefundRequest,
} from "../controllers/orderController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/", requireAuth, placeOrder);
router.get("/", requireAuth, getUserOrders);
router.get("/admin", requireAuth, getAllOrders);
router.get("/refund-requests", requireAuth, getRefundRequests);
router.post("/items/:itemId/refund-request", requireAuth, requestRefund);
router.patch("/refund-requests/:id", requireAuth, resolveRefundRequest);
router.patch("/:id/cancel", requireAuth, cancelUserOrder);
router.patch("/:id/status", requireAuth, updateOrderStatus);

export default router;
