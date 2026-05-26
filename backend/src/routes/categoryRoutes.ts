import { NextFunction, Response, Router } from "express";
import { addCategory, getCategories, removeCategory } from "../controllers/categoryController";
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

router.get("/", getCategories);
router.post("/", requireAuth, requireProductManager, addCategory);
router.delete("/:slug", requireAuth, requireProductManager, removeCategory);

export default router;
