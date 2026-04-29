import { Router } from "express";
import {
    createComment,
    getApprovedCommentsByProduct,
    getPendingComments,
    approveComment,
    rejectComment
} from "../controllers/commentController";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware";
const router = Router();

// Public: get approved comments of a product
router.get("/products/:productId/comments", optionalAuth, getApprovedCommentsByProduct);

// Customer: create a new comment for a product
router.post("/products/:productId/comments", requireAuth, createComment);

// Product manager: view all pending comments
router.get("/comments/pending", requireAuth, getPendingComments);

// Product manager: approve a comment
router.patch("/comments/:id/approve", requireAuth, approveComment);

// Product manager: reject a comment
router.patch("/comments/:id/reject", requireAuth, rejectComment);

export default router;