import { Response } from "express";
import { QueryTypes } from "sequelize";
import { AuthRequest } from "../middleware/authMiddleware";
import db, { sequelize } from "../entities";

const isSalesManager = async (userId: number): Promise<boolean> => {
    const user = await db.users.findByPk(userId);
    return user?.role === "sales_manager";
};

const getPeriodInterval = (period: string): string => {
    const map: Record<string, string> = {
        "7D": "7 days",
        "30D": "30 days",
        "6M": "6 months",
        "1Y": "1 year",
    };
    return map[period] ?? "30 days";
};

const getTimeBucket = (period: string): string => {
    return period === "7D" || period === "30D" ? "day" : "month";
};

const getLabelFormat = (period: string): string => {
    return period === "7D" || period === "30D" ? "DD Mon" : "Mon";
};

export const getRevenueStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId || !(await isSalesManager(req.userId))) {
            res.status(403).json({ message: "Sales manager access required." });
            return;
        }

        const period = String(req.query.period || "30D");
        const interval = getPeriodInterval(period);

                // Use persisted invoices.amount so order-level discounts are included in totals
                const [revenue] = await sequelize.query<any>(
                        `SELECT
                             COALESCE(SUM(inv.amount), 0) AS total_revenue,
                             COUNT(DISTINCT o.id)         AS total_orders,
                             COALESCE(AVG(inv.amount), 0) AS avg_order_value
                         FROM orders o
                         JOIN invoices inv ON inv.order_id = o.id
                         WHERE o.status != 'cancelled'
                             AND inv."createdAt" >= NOW() - INTERVAL '${interval}'`,
                        { type: QueryTypes.SELECT }
                );

                const [prevRevenue] = await sequelize.query<any>(
                        `SELECT COALESCE(SUM(inv.amount), 0) AS total_revenue,
                                        COUNT(DISTINCT o.id)                 AS total_orders
                         FROM orders o
                         JOIN invoices inv ON inv.order_id = o.id
                         WHERE o.status != 'cancelled'
                             AND inv."createdAt" >= NOW() - INTERVAL '${interval}' * 2
                             AND inv."createdAt" <  NOW() - INTERVAL '${interval}'`,
                        { type: QueryTypes.SELECT }
                );

        const [refunds] = await sequelize.query<any>(
            `SELECT COUNT(*) AS approved_refunds
             FROM refund_requests
             WHERE status = 'approved'
               AND requested_at >= NOW() - INTERVAL '${interval}'`,
            { type: QueryTypes.SELECT }
        );

        const [totalItems] = await sequelize.query<any>(
            `SELECT COUNT(*) AS total_items
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE o.status != 'cancelled'
               AND o."createdAt" >= NOW() - INTERVAL '${interval}'`,
            { type: QueryTypes.SELECT }
        );

        const totalRevenue = Number(revenue.total_revenue);
        const prevTotal = Number(prevRevenue.total_revenue);
        const totalOrders = Number(revenue.total_orders);
        const prevOrders = Number(prevRevenue.total_orders);
        const approvedRefunds = Number(refunds.approved_refunds);
        const totalItemsCount = Number(totalItems.total_items);

        const revenueChange = prevTotal > 0 ? ((totalRevenue - prevTotal) / prevTotal) * 100 : 0;
        const ordersChange = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;
        const returnRate = totalItemsCount > 0 ? (approvedRefunds / totalItemsCount) * 100 : 0;

        res.json({
            totalRevenue,
            totalOrders,
            avgOrderValue: Number(revenue.avg_order_value),
            returnRate: Number(returnRate.toFixed(1)),
            revenueChange: Number(revenueChange.toFixed(1)),
            ordersChange: Number(ordersChange.toFixed(1)),
        });
    } catch (error) {
        console.error("Revenue stats error:", error);
        res.status(500).json({ message: "Failed to fetch revenue stats." });
    }
};

export const getRevenueOverTime = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId || !(await isSalesManager(req.userId))) {
            res.status(403).json({ message: "Sales manager access required." });
            return;
        }

        const period = String(req.query.period || "30D");
        const interval = getPeriodInterval(period);
        const bucket = getTimeBucket(period);
        const labelFmt = getLabelFormat(period);

                // Group by invoice creation date and use invoice.amount to reflect discounts
                const rows = await sequelize.query<any>(
                        `SELECT
                             TO_CHAR(DATE_TRUNC('${bucket}', inv."createdAt"), '${labelFmt}') AS label,
                             DATE_TRUNC('${bucket}', inv."createdAt")                          AS period,
                             COALESCE(SUM(inv.amount), 0)                                       AS revenue
                         FROM invoices inv
                         JOIN orders o ON o.id = inv.order_id
                         WHERE o.status != 'cancelled'
                             AND inv."createdAt" >= NOW() - INTERVAL '${interval}'
                         GROUP BY DATE_TRUNC('${bucket}', inv."createdAt")
                         ORDER BY period ASC`,
                        { type: QueryTypes.SELECT }
                );

        const returnRows = await sequelize.query<any>(
            `SELECT
               TO_CHAR(DATE_TRUNC('${bucket}', rr.requested_at), '${labelFmt}') AS label,
               DATE_TRUNC('${bucket}', rr.requested_at)                          AS period,
               COALESCE(SUM(rr.refund_amount), 0)                                AS returns
             FROM refund_requests rr
             WHERE rr.status = 'approved'
               AND rr.requested_at >= NOW() - INTERVAL '${interval}'
             GROUP BY DATE_TRUNC('${bucket}', rr.requested_at)
             ORDER BY period ASC`,
            { type: QueryTypes.SELECT }
        );

        const returnMap: Record<string, number> = {};
        for (const r of returnRows) {
            returnMap[r.label] = Number(r.returns);
        }

        const data = rows.map((r: any) => ({
            month: r.label,
            revenue: Number(r.revenue),
            returns: returnMap[r.label] ?? 0,
        }));

        res.json({ data });
    } catch (error) {
        console.error("Revenue over time error:", error);
        res.status(500).json({ message: "Failed to fetch revenue over time." });
    }
};

export const getOrdersVolume = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId || !(await isSalesManager(req.userId))) {
            res.status(403).json({ message: "Sales manager access required." });
            return;
        }

        const period = String(req.query.period || "30D");
        const interval = getPeriodInterval(period);
        const bucket = getTimeBucket(period);
        const labelFmt = getLabelFormat(period);

        const rows = await sequelize.query<any>(
            `SELECT
               TO_CHAR(DATE_TRUNC('${bucket}', o."createdAt"), '${labelFmt}') AS label,
               DATE_TRUNC('${bucket}', o."createdAt")                          AS period,
               COUNT(DISTINCT o.id)                                            AS orders
             FROM orders o
             WHERE o.status != 'cancelled'
               AND o."createdAt" >= NOW() - INTERVAL '${interval}'
             GROUP BY DATE_TRUNC('${bucket}', o."createdAt")
             ORDER BY period ASC`,
            { type: QueryTypes.SELECT }
        );

        const data = rows.map((r: any) => ({
            month: r.label,
            orders: Number(r.orders),
        }));

        res.json({ data });
    } catch (error) {
        console.error("Orders volume error:", error);
        res.status(500).json({ message: "Failed to fetch orders volume." });
    }
};

export const getRevenueByCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId || !(await isSalesManager(req.userId))) {
            res.status(403).json({ message: "Sales manager access required." });
            return;
        }

        const period = String(req.query.period || "30D");
        const interval = getPeriodInterval(period);

        const rows = await sequelize.query<any>(
            `SELECT
               p.category,
               COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS revenue
             FROM order_items oi
             JOIN orders o   ON o.id  = oi.order_id
             JOIN products p ON p.id  = oi.product_id
             WHERE o.status != 'cancelled'
               AND o."createdAt" >= NOW() - INTERVAL '${interval}'
             GROUP BY p.category
             ORDER BY revenue DESC`,
            { type: QueryTypes.SELECT }
        );

        const total = rows.reduce((sum: number, r: any) => sum + Number(r.revenue), 0);
        const CATEGORY_COLORS = ["#f43f5e", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#06b6d4"];

        const data = rows.map((r: any, i: number) => ({
            name: r.category,
            percent: total > 0 ? Math.round((Number(r.revenue) / total) * 100) : 0,
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        }));

        res.json({ data });
    } catch (error) {
        console.error("Revenue by category error:", error);
        res.status(500).json({ message: "Failed to fetch revenue by category." });
    }
};

export const getRecentTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId || !(await isSalesManager(req.userId))) {
            res.status(403).json({ message: "Sales manager access required." });
            return;
        }

        const rows = await sequelize.query<any>(
            `(SELECT
               u.name                                         AS customer,
               p.category                                     AS detail,
               (oi.unit_price * oi.quantity)                 AS amount,
               o."createdAt"                                  AS created_at,
               'sale'                                         AS type
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN products p     ON p.id = oi.product_id
             JOIN users u        ON u.id = o.user_id
             WHERE o.status != 'cancelled'
             ORDER BY o."createdAt" DESC
             LIMIT 5)
            UNION ALL
            (SELECT
               u.name             AS customer,
               'Return'           AS detail,
               rr.refund_amount   AS amount,
               rr.requested_at   AS created_at,
               'return'           AS type
             FROM refund_requests rr
             JOIN users u ON u.id = rr.user_id
             WHERE rr.status = 'approved'
             ORDER BY rr.requested_at DESC
             LIMIT 5)
            ORDER BY created_at DESC
            LIMIT 8`,
            { type: QueryTypes.SELECT }
        );

        const data = rows.map((r: any) => ({
            customer: r.customer,
            detail: r.detail,
            amount: r.type === "return"
                ? `-$${Number(r.amount).toFixed(0)}`
                : `+$${Number(r.amount).toFixed(0)}`,
            type: r.type,
            createdAt: r.created_at,
        }));

        res.json({ data });
    } catch (error) {
        console.error("Recent transactions error:", error);
        res.status(500).json({ message: "Failed to fetch recent transactions." });
    }
};
