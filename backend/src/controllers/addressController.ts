import { Response } from "express";
import db from "../entities";
import { AuthRequest } from "../middleware/authMiddleware";

const Address = db.addresses;

const toAddressDto = (address: any) => ({
    id: address.id,
    label: address.label,
    street: address.street,
    city: address.city,
    state: address.state || "",
    zip: address.zip,
    country: address.country,
    isDefault: Boolean(address.is_default),
});

const hasDefaultValue = (body: any) => body?.isDefault !== undefined || body?.is_default !== undefined;

const getDefaultValue = (body: any) => Boolean(body?.isDefault ?? body?.is_default);

const getAddressPayload = (body: any) => ({
    label: String(body?.label || "").trim(),
    street: String(body?.street || "").trim(),
    city: String(body?.city || "").trim(),
    state: String(body?.state || "").trim() || null,
    zip: String(body?.zip || "").trim(),
    country: String(body?.country || "").trim(),
    ...(hasDefaultValue(body) && { is_default: getDefaultValue(body) }),
});

const validateAddressPayload = (payload: any) => {
    if (!payload.label || !payload.street || !payload.city || !payload.zip || !payload.country) {
        return "Label, street, city, ZIP, and country are required.";
    }

    return null;
};

const ensureCustomer = async (userId: number) => {
    const user = await db.users.findByPk(userId);
    return user?.role === "customer";
};

export const getAddresses = async (req: AuthRequest, res: Response) => {
    try {
        if (!(await ensureCustomer(req.userId!))) {
            return res.status(403).json({ message: "Only customers can manage delivery addresses." });
        }

        const addresses = await Address.findAll({
            where: { user_id: req.userId },
            order: [["is_default", "DESC"], ["createdAt", "ASC"]],
        });

        return res.status(200).json({ addresses: addresses.map(toAddressDto) });
    } catch (error) {
        console.error("Get addresses error:", error);
        return res.status(500).json({ message: "Server error while fetching addresses" });
    }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
    try {
        if (!(await ensureCustomer(req.userId!))) {
            return res.status(403).json({ message: "Only customers can manage delivery addresses." });
        }

        const payload = getAddressPayload(req.body);
        const validationError = validateAddressPayload(payload);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const existingCount = await Address.count({ where: { user_id: req.userId } });
        const shouldBeDefault = payload.is_default === true || existingCount === 0;

        if (shouldBeDefault) {
            await Address.update({ is_default: false }, { where: { user_id: req.userId } });
        }

        const address = await Address.create({
            ...payload,
            is_default: shouldBeDefault,
            user_id: req.userId,
        });

        return res.status(201).json({ address: toAddressDto(address) });
    } catch (error) {
        console.error("Create address error:", error);
        return res.status(500).json({ message: "Server error while creating address" });
    }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
    try {
        if (!(await ensureCustomer(req.userId!))) {
            return res.status(403).json({ message: "Only customers can manage delivery addresses." });
        }

        const address = await Address.findOne({ where: { id: req.params.id, user_id: req.userId } });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const payload = getAddressPayload(req.body);
        const validationError = validateAddressPayload(payload);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const addressCount = await Address.count({ where: { user_id: req.userId } });
        const shouldBeDefault = addressCount === 1
            ? true
            : hasDefaultValue(req.body)
                ? getDefaultValue(req.body)
                : Boolean(address.is_default);

        if (shouldBeDefault) {
            await Address.update({ is_default: false }, { where: { user_id: req.userId } });
        }

        await address.update({
            ...payload,
            is_default: shouldBeDefault,
        });
        return res.status(200).json({ address: toAddressDto(address) });
    } catch (error) {
        console.error("Update address error:", error);
        return res.status(500).json({ message: "Server error while updating address" });
    }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
    try {
        if (!(await ensureCustomer(req.userId!))) {
            return res.status(403).json({ message: "Only customers can manage delivery addresses." });
        }

        const address = await Address.findOne({ where: { id: req.params.id, user_id: req.userId } });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const wasDefault = Boolean(address.is_default);
        await address.destroy();

        if (wasDefault) {
            const nextAddress = await Address.findOne({
                where: { user_id: req.userId },
                order: [["createdAt", "ASC"]],
            });
            if (nextAddress) {
                await nextAddress.update({ is_default: true });
            }
        }

        return res.status(200).json({ message: "Address removed successfully" });
    } catch (error) {
        console.error("Delete address error:", error);
        return res.status(500).json({ message: "Server error while deleting address" });
    }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
    try {
        if (!(await ensureCustomer(req.userId!))) {
            return res.status(403).json({ message: "Only customers can manage delivery addresses." });
        }

        const address = await Address.findOne({ where: { id: req.params.id, user_id: req.userId } });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        await Address.update({ is_default: false }, { where: { user_id: req.userId } });
        await address.update({ is_default: true });

        return res.status(200).json({ address: toAddressDto(address) });
    } catch (error) {
        console.error("Set default address error:", error);
        return res.status(500).json({ message: "Server error while updating address" });
    }
};
