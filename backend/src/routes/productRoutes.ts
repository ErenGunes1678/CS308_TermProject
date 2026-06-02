import { NextFunction, Response, Router } from "express";
import {
    getAllProducts,
    getProductById,
    getManageProducts,
    getPendingPricingProducts,
    updateProductPrice,
    addProduct,
    editProduct,
    removeProduct
} from "../controllers/productController";
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

const requireInventoryManager = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await db.users.findByPk(req.userId);

    if (!user || !["product_manager", "sales_manager"].includes(user.role)) {
        res.status(403).json({ message: "Inventory manager access required." });
        return;
    }

    next();
};

const requireSalesManager = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await db.users.findByPk(req.userId);

    if (!user || user.role !== "sales_manager") {
        res.status(403).json({ message: "Sales manager access required." });
        return;
    }

    next();
};

router.get("/", getAllProducts);
router.get("/manage/all", requireAuth, requireInventoryManager, getManageProducts);
router.get("/pricing/pending", requireAuth, requireSalesManager, getPendingPricingProducts);
router.get("/:id", getProductById);
router.post("/", requireAuth, requireProductManager, addProduct);
router.put("/:id/price", requireAuth, requireSalesManager, updateProductPrice);
router.put("/:id", requireAuth, requireProductManager, editProduct);
router.delete("/:id", requireAuth, requireProductManager, removeProduct);

export default router;
