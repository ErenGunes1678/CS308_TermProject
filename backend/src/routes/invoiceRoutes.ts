import { NextFunction, Response, Router } from "express";
import { getAllInvoices, downloadInvoicePdf } from "../controllers/invoiceController";
import { AuthRequest, requireAuth } from "../middleware/authMiddleware";
import db from "../entities";

const router = Router();

const requireSalesManager = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await db.users.findByPk(req.userId);

    if (!user || user.role !== "sales_manager") {
        res.status(403).json({ message: "Sales manager access required." });
        return;
    }

    next();
};

router.get("/", requireAuth, requireSalesManager, getAllInvoices);
router.get("/:id/download", requireAuth, requireSalesManager, downloadInvoicePdf);

export default router;
