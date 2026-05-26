import { NextFunction, Response, Router } from "express";
import { getAllProducts, getProductById, addProduct, editProduct, removeProduct } from "../controllers/productController";
import db from "../entities";
import { AuthRequest, requireAuth } from "../middleware/authMiddleware";

const router = Router();

const requireProductManager = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await db.users.findByPk(req.userId);

    if (!user || user.role !== "product_manager") {
        res.status(403).json({ message: "Product manager access required." });
        return;
    }

    next();
};

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", requireAuth, requireProductManager, addProduct);
router.put("/:id", requireAuth, requireProductManager, editProduct);
router.delete("/:id", requireAuth, requireProductManager, removeProduct);

export default router;
