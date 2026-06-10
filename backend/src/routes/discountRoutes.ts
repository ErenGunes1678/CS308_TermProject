import { Router } from "express";
import {
    getDiscountCodes,
    createDiscountCode,
    toggleDiscountCode,
    deleteDiscountCode,
    validateDiscountCode,
} from "../controllers/discountController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, getDiscountCodes);
router.post("/", requireAuth, createDiscountCode);
router.patch("/:id/toggle", requireAuth, toggleDiscountCode);
router.delete("/:id", requireAuth, deleteDiscountCode);
router.post("/validate", validateDiscountCode);

export default router;
