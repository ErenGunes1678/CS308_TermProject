import { Router } from "express";
import { getCart, addToCart, decreaseFromCart, emptyCart } from "../controllers/cartController";
import { optionalAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", optionalAuth, getCart);
router.post("/add", optionalAuth, addToCart);
router.delete("/item/:item_id", optionalAuth, decreaseFromCart);
router.delete("/", optionalAuth, emptyCart);
    
export default router;