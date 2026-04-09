import { Router } from "express";
import { getCart, addToCart, removeFromCart } from "../controllers/cartController";
import { optionalAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", optionalAuth, getCart);
router.post("/add", optionalAuth, addToCart);
router.delete("/item/:item_id", optionalAuth, removeFromCart);

export default router;