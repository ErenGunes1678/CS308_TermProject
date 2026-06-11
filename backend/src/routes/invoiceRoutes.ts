import { NextFunction, Response, Router } from "express";
import { getAllInvoices, downloadInvoicePdf } from "../controllers/invoiceController";
import { AuthRequest, requireAuth } from "../middleware/authMiddleware";
import db from "../entities";

const router = Router();

const requireInvoiceAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await db.users.findByPk(req.userId);

    if (!user || !["sales_manager", "product_manager"].includes(user.role)) {
        res.status(403).json({ message: "Invoice access required." });
        return;
    }

    next();
};

router.get("/", requireAuth, requireInvoiceAccess, getAllInvoices);
router.get("/:id/download", requireAuth, requireInvoiceAccess, downloadInvoicePdf);

export default router;
