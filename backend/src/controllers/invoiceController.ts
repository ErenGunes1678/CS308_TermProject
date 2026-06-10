import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db from "../entities";

const INVOICES_DIR = path.resolve(process.cwd(), "invoices");

export const getAllInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { from, to, q } = req.query as Record<string, string>;

        const where: Record<string, unknown> = {};

        if (from || to) {
            const range: Record<string, Date> = {};
            if (from) range[Op.gte as unknown as string] = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                range[Op.lte as unknown as string] = toDate;
            }
            where.createdAt = range;
        }

        if (q) {
            where[Op.or as unknown as string] = [
                { invoice_number: { [Op.iLike]: `%${q}%` } },
                { customer_name: { [Op.iLike]: `%${q}%` } },
            ];
        }

        const invoices = await db.invoices.findAll({
            where,
            include: [
                {
                    model: db.orders,
                    as: "order",
                    attributes: ["id", "status", "total_amount"],
                    include: [
                        {
                            model: db.order_items,
                            as: "items",
                            attributes: ["id", "quantity", "unit_price"],
                            include: [
                                {
                                    model: db.products,
                                    as: "product",
                                    attributes: ["name"],
                                },
                            ],
                        },
                        {
                            model: db.users,
                            as: "user",
                            attributes: ["email"],
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(invoices);
    } catch (error) {
        console.error("getAllInvoices error:", error);
        res.status(500).json({ message: "Failed to fetch invoices." });
    }
};

export const downloadInvoicePdf = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const invoice = await db.invoices.findByPk(req.params.id);

        if (!invoice) {
            res.status(404).json({ message: "Invoice not found." });
            return;
        }

        const filePath = path.join(INVOICES_DIR, invoice.file_name);

        if (!fs.existsSync(filePath)) {
            res.status(404).json({ message: "PDF file not found on server." });
            return;
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${invoice.file_name}"`);
        fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        console.error("downloadInvoicePdf error:", error);
        res.status(500).json({ message: "Failed to download invoice." });
    }
};
