import { Router } from "express";
import { getNotifications } from "../controllers/notificationController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();
router.get("/", requireAuth, getNotifications);
export default router;
