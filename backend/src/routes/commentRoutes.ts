import { Router } from "express";
import {
    createComment,
    getApprovedCommentsByProduct,
    getPendingComments,
    approveComment,
    rejectComment
} from "../controllers/commentController";
import { authMiddleware } from "../authMiddleware";
const router = Router();

// Public: get approved comments of a product
router.get("/products/:productId/comments", getApprovedCommentsByProduct);

// Customer: create a new comment for a product
router.post("/products/:productId/comments", authMiddleware, createComment);

// Product manager: view all pending comments
router.get("/comments/pending", authMiddleware, getPendingComments);

// Product manager: approve a comment
router.patch("/comments/:id/approve", authMiddleware, approveComment);

// Product manager: reject a comment
router.patch("/comments/:id/reject", authMiddleware, rejectComment);

export default router;