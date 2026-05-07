import { Request, Response } from "express";
import db from "../entities";
import { AuthRequest } from "../middleware/authMiddleware";

const Comment = db["comments"];
const Product = db["products"];
const User = db["users"];

const updateProductRatingStats = async (productId: number) => {
    const product = await Product.findByPk(productId);

    if (!product) {
        return {
            rating: 0,
            review_count: 0
        };
    }

    const ratedComments = await Comment.findAll({
        where: {
            product_id: productId
        },
        attributes: ["rating"]
    });

    const baseRating = Number(product.base_rating || 0);
    const baseReviewCount = Number(product.base_review_count || 0);

    let commentTotalRating = 0;

    for (let i = 0; i < ratedComments.length; i++) {
        commentTotalRating += Number(ratedComments[i].rating);
    }

    const totalReviewCount = baseReviewCount + ratedComments.length;
    const totalRatingValue = (baseRating * baseReviewCount) + commentTotalRating;

    const averageRating =
        totalReviewCount > 0
            ? Number((totalRatingValue / totalReviewCount).toFixed(1))
            : 0;

    await Product.update(
        {
            rating: averageRating,
            review_count: totalReviewCount
        },
        {
            where: {
                id: productId
            }
        }
    );

    return {
        rating: averageRating,
        review_count: totalReviewCount
    };
};

const getCurrentUser = async (req: AuthRequest) => {
    if (!req.userId) {
        return null;
    }

    return await User.findByPk(req.userId);
};

export const createComment = async (req: AuthRequest, res: Response) => {
    try {
        const { productId } = req.params;
        const { rating, comment_text } = req.body;

        if (!req.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (currentUser.role !== "customer") {
            return res.status(403).json({
                message: "Only customers can create comments"
            });
        }

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        if (rating === undefined || !comment_text) {
            return res.status(400).json({
                message: "Rating and comment text are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const comment = await Comment.create({
            product_id: Number(productId),
            user_id: currentUser.id,
            rating,
            comment_text,
            status: "pending"
        });

        const ratingStats = await updateProductRatingStats(Number(productId));

        return res.status(201).json({
            message: "Comment submitted successfully and is waiting for approval",
            comment,
            rating: ratingStats.rating,
            review_count: ratingStats.review_count
        });
    } catch (error) {
        console.error("Create comment error:", error);
        return res.status(500).json({
            message: "Server error while creating comment"
        });
    }
};

export const getApprovedCommentsByProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const comments = await Comment.findAll({
            where: {
                product_id: Number(productId),
                status: "approved"
            },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            message: "Approved comments fetched successfully",
            comments,

            // Important:
            // We only READ product rating here.
            // We do NOT recalculate on product page visit.
            // This prevents mock ratings from resetting to 0.
            rating: Number(product.rating),
            review_count: Number(product.review_count)
        });
    } catch (error) {
        console.error("Get approved comments error:", error);
        return res.status(500).json({
            message: "Server error while fetching approved comments"
        });
    }
};

export const getPendingComments = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (currentUser.role !== "product_manager") {
            return res.status(403).json({
                message: "Only product managers can view pending comments"
            });
        }

        const comments = await Comment.findAll({
            where: {
                status: "pending"
            },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "email"]
                },
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "name", "model"]
                }
            ],
            order: [["createdAt", "ASC"]]
        });

        return res.status(200).json({
            message: "Pending comments fetched successfully",
            comments
        });
    } catch (error) {
        console.error("Get pending comments error:", error);
        return res.status(500).json({
            message: "Server error while fetching pending comments"
        });
    }
};

export const approveComment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (currentUser.role !== "product_manager") {
            return res.status(403).json({
                message: "Only product managers can approve comments"
            });
        }

        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        await comment.update({
            status: "approved",
            approved_by: currentUser.id,
            approved_at: new Date()
        });

        const ratingStats = await updateProductRatingStats(Number(comment.product_id));

        return res.status(200).json({
            message: "Comment approved successfully",
            comment,
            rating: ratingStats.rating,
            review_count: ratingStats.review_count
        });

    } catch (error) {
        console.error("Approve comment error:", error);
        return res.status(500).json({
            message: "Server error while approving comment"
        });
    }
};

export const rejectComment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (currentUser.role !== "product_manager") {
            return res.status(403).json({
                message: "Only product managers can reject comments"
            });
        }

        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        await comment.update({
            status: "rejected",
            approved_by: currentUser.id,
            approved_at: new Date()
        });

        const ratingStats = await updateProductRatingStats(Number(comment.product_id));

        return res.status(200).json({
            message: "Comment rejected successfully",
            comment,
            rating: ratingStats.rating,
            review_count: ratingStats.review_count
        });
    } catch (error) {
        console.error("Reject comment error:", error);
        return res.status(500).json({
            message: "Server error while rejecting comment"
        });
    }
};