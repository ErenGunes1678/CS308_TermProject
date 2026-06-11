import { Router } from "express";
import { getNotifications, markNotificationsSeen } from "../controllers/notificationController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();
router.get("/", requireAuth, getNotifications);
router.post("/seen", requireAuth, markNotificationsSeen);
export default router;
