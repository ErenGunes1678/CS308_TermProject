import { Router } from "express";
import { getWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlistController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, getWishlist);
router.post("/:productId", requireAuth, addToWishlist);
router.delete("/:productId", requireAuth, removeFromWishlist);

export default router;
