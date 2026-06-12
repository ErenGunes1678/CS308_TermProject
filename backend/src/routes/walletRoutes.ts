import { Router } from "express";
import { getWallet } from "../controllers/walletController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, getWallet);

export default router;
