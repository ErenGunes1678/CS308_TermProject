import { Router } from "express";
import { getHiddenReviewProductIds, hideReviewProductId } from "../controllers/userPreferenceController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();
router.get("/review-hidden", requireAuth, getHiddenReviewProductIds);
router.post("/review-hidden", requireAuth, hideReviewProductId);
export default router;
