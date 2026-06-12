import { Request, Response } from "express";
import db from "../entities";
import { AuthRequest } from "../middleware/authMiddleware";

const DiscountCode = db["discount_codes"];

const isSalesManager = async (userId?: number): Promise<boolean> => {
    if (!userId) return false;
    const user = await db.users.findByPk(userId, { attributes: ["role"] });
    return user?.role === "sales_manager";
};

export const getDiscountCodes = async (req: AuthRequest, res: Response) => {
    try {
        if (!(await isSalesManager(req.userId))) {
            return res.status(403).json({ message: "Access denied." });
        }

        const codes = await DiscountCode.findAll({ order: [["createdAt", "DESC"]] });

        const mapped = codes.map(mapDiscountForFrontend);

        return res.status(200).json({ message: "Discount codes fetched successfully", codes: mapped });
    } catch (error) {
        console.error("Get discount codes error:", error);
        return res.status(500).json({ message: "Server error while fetching discount codes" });
    }
};

export const createDiscountCode = async (req: AuthRequest, res: Response) => {
    try {
        if (!(await isSalesManager(req.userId))) {
            return res.status(403).json({ message: "Access denied." });
        }

        const { code, type, value, min_order, expiry_date } = req.body;

        if (!code || !type || !expiry_date) {
            return res.status(400).json({ message: "code, type, and expiry_date are required." });
        }

        if (!["percentage", "fixed", "free_shipping"].includes(type)) {
            return res.status(400).json({ message: "type must be percentage, fixed, or free_shipping." });
        }

        if (type !== "free_shipping" && (value === undefined || value === null)) {
            return res.status(400).json({ message: "value is required for percentage and fixed types." });
        }

        if (type === "percentage" && (Number(value) <= 0 || Number(value) > 100)) {
            return res.status(400).json({ message: "Percentage value must be between 1 and 100." });
        }

        if (type === "fixed" && Number(value) <= 0) {
            return res.status(400).json({ message: "Fixed discount value must be greater than 0." });
        }

        const expiryDate = new Date(expiry_date);
        if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
            return res.status(400).json({ message: "expiry_date must be a valid future date." });
        }

        const upperCode = String(code).toUpperCase();
        const existing = await DiscountCode.findOne({ where: { code: upperCode } });
        if (existing) {
            return res.status(409).json({ message: "A discount code with this code already exists." });
        }

        const discountCode = await DiscountCode.create({
            code: upperCode,
            type,
            value: type === "free_shipping" ? null : Number(value),
            min_order: min_order != null ? Number(min_order) : null,
            expiry_date: expiryDate,
        });

        return res.status(201).json({ message: "Discount code created successfully", discountCode: mapDiscountForFrontend(discountCode) });
    } catch (error) {
        console.error("Create discount code error:", error);
        return res.status(500).json({ message: "Server error while creating discount code" });
    }
};

export const toggleDiscountCode = async (req: AuthRequest, res: Response) => {
    try {
        if (!(await isSalesManager(req.userId))) {
            return res.status(403).json({ message: "Access denied." });
        }

        const { id } = req.params;
        const discountCode = await DiscountCode.findByPk(id);

        if (!discountCode) {
            return res.status(404).json({ message: "Discount code not found." });
        }

        const isExpired = new Date(discountCode.expiry_date) <= new Date();
        if (!discountCode.is_active && isExpired) {
            return res.status(400).json({ message: "Cannot activate an expired discount code." });
        }

        const nextActive = !discountCode.is_active;
        await discountCode.update({ is_active: nextActive });

        return res.status(200).json({
            message: `Discount code ${nextActive ? "activated" : "deactivated"} successfully.`,
            discountCode: mapDiscountForFrontend(discountCode),
        });
    } catch (error) {
        console.error("Toggle discount code error:", error);
        return res.status(500).json({ message: "Server error while toggling discount code" });
    }
};

export const deleteDiscountCode = async (req: AuthRequest, res: Response) => {
    try {
        if (!(await isSalesManager(req.userId))) {
            return res.status(403).json({ message: "Access denied." });
        }

        const { id } = req.params;
        const discountCode = await DiscountCode.findByPk(id);

        if (!discountCode) {
            return res.status(404).json({ message: "Discount code not found." });
        }

        await discountCode.destroy();

        return res.status(200).json({ message: "Discount code deleted successfully." });
    } catch (error) {
        console.error("Delete discount code error:", error);
        return res.status(500).json({ message: "Server error while deleting discount code" });
    }
};

export const validateDiscountCode = async (req: Request, res: Response) => {
    try {
        const { code, orderTotal } = req.body;

        if (!code || orderTotal === undefined) {
            return res.status(400).json({ message: "code and orderTotal are required." });
        }

        const total = Number(orderTotal);
        if (!Number.isFinite(total) || total < 0) {
            return res.status(400).json({ message: "orderTotal must be a valid non-negative number." });
        }

        const discountCode = await DiscountCode.findOne({
            where: { code: String(code).toUpperCase() },
        });

        if (!discountCode) {
            return res.status(404).json({ message: "Discount code not found." });
        }

        if (!discountCode.is_active) {
            return res.status(400).json({ message: "This discount code is not active." });
        }

        if (new Date(discountCode.expiry_date) <= new Date()) {
            return res.status(400).json({ message: "This discount code has expired." });
        }

        if (discountCode.min_order !== null && total < Number(discountCode.min_order)) {
            return res.status(400).json({
                message: `This code requires a minimum order of $${Number(discountCode.min_order).toFixed(2)}.`,
            });
        }

        let discountAmount = 0;
        if (discountCode.type === "percentage") {
            discountAmount = parseFloat((total * Number(discountCode.value) / 100).toFixed(2));
        } else if (discountCode.type === "fixed") {
            discountAmount = parseFloat(Math.min(Number(discountCode.value), total).toFixed(2));
        }
        // free_shipping: discountAmount stays 0; the type field signals the frontend to waive shipping

        return res.status(200).json({
            message: "Discount code applied successfully.",
            type: discountCode.type,
            discountAmount,
        });
    } catch (error) {
        console.error("Validate discount code error:", error);
        return res.status(500).json({ message: "Server error while validating discount code" });
    }
};

/* helper: map DB snake_case fields to frontend-friendly camelCase */
const mapDiscountForFrontend = (instance: any) => {
    const plain = instance?.get ? instance.get({ plain: true }) : instance;

    return {
        id: plain.id,
        code: plain.code,
        type: plain.type,
        value: plain.value !== null && plain.value !== undefined ? Number(plain.value) : null,
        minOrder: plain.min_order !== null && plain.min_order !== undefined ? Number(plain.min_order) : null,
        expires: plain.expiry_date ? new Date(plain.expiry_date).toISOString() : null,
        active: Boolean(plain.is_active),
        uses: Number(plain.uses_count ?? 0),
        createdAt: plain.createdAt ?? plain.created_at,
    };
};
