import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db from "../entities";

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const notifications: any[] = [];

        // ── Orders ─────────────────────────────────────────────────────────
        const orders = await db.orders.findAll({
            where: { user_id: userId },
            attributes: ["id", "status", "createdAt", "updatedAt"],
        });

        for (const order of orders) {
            const status = order.status as string;
            const ts = (order as any).updatedAt || (order as any).createdAt;

            if (status === "in-transit") {
                notifications.push({
                    id: `order-${order.id}-in-transit`,
                    type: "order",
                    icon: "📦",
                    title: `Order #${order.id} is on its way`,
                    body: "Your package has been handed to the courier and is now in transit.",
                    createdAt: ts,
                    link: `/customer/orders?order=${order.id}`,
                });
            }
            if (status === "delivered") {
                notifications.push({
                    id: `order-${order.id}-delivered`,
                    type: "order",
                    icon: "✅",
                    title: `Order #${order.id} delivered`,
                    body: "Your order has been delivered. Don't forget to leave a review!",
                    createdAt: ts,
                    link: `/customer/orders?order=${order.id}`,
                });
            }
            if (status === "cancelled") {
                notifications.push({
                    id: `order-${order.id}-cancelled`,
                    type: "order",
                    icon: "❌",
                    title: `Order #${order.id} was cancelled`,
                    body: "Your order has been cancelled.",
                    createdAt: ts,
                    link: `/customer/orders?order=${order.id}`,
                });
            }
        }

        // ── Refund requests ────────────────────────────────────────────────
        const refunds = await db.refund_requests.findAll({
            where: { user_id: userId },
            include: [{
                model: db.order_items,
                as: "orderItem",
                include: [
                    { model: db.products, as: "product" },
                    { model: db.orders, as: "order", attributes: ["id"] },
                ],
            }],
        });

        for (const refund of refunds) {
            const productName = refund.orderItem?.product?.name || "item";
            const orderId = refund.orderItem?.order?.id || refund.orderItem?.order_id;
            const orderLink = orderId ? `/customer/orders?order=${orderId}` : "/customer/orders";
            const ts = (refund as any).resolved_at || (refund as any).requested_at || (refund as any).createdAt;

            notifications.push({
                id: `refund-${refund.id}-received`,
                type: "refund",
                icon: "🔄",
                title: "Refund request received",
                body: `Your refund request for "${productName}" is under review.`,
                createdAt: (refund as any).requested_at || (refund as any).createdAt,
                link: orderLink,
            });

            if (refund.status === "approved") {
                notifications.push({
                    id: `refund-${refund.id}-approved`,
                    type: "refund",
                    icon: "💰",
                    title: "Refund approved",
                    body: `Your refund for "${productName}" has been approved.`,
                    createdAt: ts,
                    link: orderLink,
                });
            }
            if (refund.status === "rejected") {
                notifications.push({
                    id: `refund-${refund.id}-rejected`,
                    type: "refund",
                    icon: "⚠️",
                    title: "Refund rejected",
                    body: `Your refund request for "${productName}" was not approved.`,
                    createdAt: ts,
                    link: orderLink,
                });
            }
        }

        // ── Comments ───────────────────────────────────────────────────────
        const comments = await db.comments.findAll({
            where: { user_id: userId },
            include: [{ model: db.products, as: "product", attributes: ["id", "name"] }],
        });

        for (const comment of comments) {
            const productName = comment.product?.name || "a product";
            const ts = (comment as any).approved_at || (comment as any).updatedAt || (comment as any).createdAt;

            if (comment.status === "approved") {
                notifications.push({
                    id: `comment-${comment.id}-approved`,
                    type: "comment",
                    icon: "⭐",
                    title: "Review published",
                    body: `Your review for "${productName}" has been approved and is now visible.`,
                    createdAt: ts,
                    link: `/product/${comment.product?.id}`,
                });
            }
            if (comment.status === "rejected") {
                notifications.push({
                    id: `comment-${comment.id}-rejected`,
                    type: "comment",
                    icon: "💬",
                    title: "Review not approved",
                    body: `Your review for "${productName}" did not pass moderation.`,
                    createdAt: ts,
                    link: `/customer/notifications`,
                });
            }
            if (comment.status === "pending" && comment.comment_text) {
                notifications.push({
                    id: `comment-${comment.id}-pending`,
                    type: "comment",
                    icon: "🕐",
                    title: "Review under moderation",
                    body: `Your review for "${productName}" is being reviewed and will appear soon.`,
                    createdAt: (comment as any).createdAt,
                    link: `/product/${comment.product?.id}`,
                });
            }
        }

        // ── Price drops ────────────────────────────────────────────────────
        const priceDrops = await db.price_drop_notifications.findAll({
            where: { user_id: userId },
            include: [{ model: db.products, as: "product", attributes: ["id", "name"] }],
        });

        for (const drop of priceDrops) {
            const productName = drop.product?.name || "a product";
            notifications.push({
                id: `price-drop-${drop.id}`,
                type: "price_drop",
                icon: "🏷️",
                title: "Price drop on your wishlist!",
                body: `"${productName}" dropped from $${Number(drop.old_price).toFixed(2)} to $${Number(drop.new_price).toFixed(2)}.`,
                createdAt: (drop as any).createdAt,
                link: `/product/${drop.product?.id}`,
            });
        }

        // Load user seen notification IDs from backend state
        const seenRecords = await db.notification_seen.findAll({
            where: { user_id: userId },
            attributes: ["notification_id"],
        });

        const seenIds = seenRecords.map((record: any) => record.notification_id);

        // Sort newest first
        notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        res.json({ notifications, seenIds });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
};

export const markNotificationsSeen = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const notificationIds: string[] = Array.isArray(req.body.notificationIds)
            ? req.body.notificationIds.filter(Boolean)
            : [];

        if (!notificationIds.length) {
            res.status(400).json({ message: "notificationIds are required." });
            return;
        }

        await Promise.all(notificationIds.map((notificationId) =>
            db.notification_seen.findOrCreate({
                where: { user_id: userId, notification_id: notificationId },
            })
        ));

        res.json({ message: "Notifications marked as seen.", seenIds: notificationIds });
    } catch (error) {
        console.error("Mark notifications seen error:", error);
        res.status(500).json({ message: "Failed to mark notifications as seen." });
    }
};
