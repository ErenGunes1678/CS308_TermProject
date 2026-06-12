import { Router } from "express";
import { register, login, logout, getCurrentUser, updateCurrentUser, changePassword, getDemoAccounts } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/demo-accounts", getDemoAccounts);
router.get("/me", requireAuth, getCurrentUser);
router.patch("/me", requireAuth, updateCurrentUser);
router.patch("/change-password", requireAuth, changePassword);

export default router;
