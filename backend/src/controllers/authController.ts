import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db, { sequelize } from "../entities";
import { AuthRequest } from "../middleware/authMiddleware";
import {
    clearAuthCookie,
    clearGuestSessionCookie,
    getGuestSessionId,
    setAuthCookie,
    signAuthToken,
} from "../utils/auth";

const toSafeUser = (user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
});

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const sessionId = getGuestSessionId(req);

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        const existingUser = await db.users.findOne({ where: { email } });

        if (existingUser) {
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await db.users.create({ name, email, password_hash });

        // Merge guest cart into user cart on login
        if (sessionId) {
            await mergeGuestCart(sessionId, user.id);
            clearGuestSessionCookie(res);
        }        

        const token = signAuthToken({ id: user.id, email: user.email });
        setAuthCookie(res, token);

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: toSafeUser(user)
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error during registration" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const sessionId = getGuestSessionId(req);

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await db.users.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Merge guest cart into user cart on login
        if (sessionId) {
            await mergeGuestCart(sessionId, user.id);
            clearGuestSessionCookie(res);
        }

        const token = signAuthToken({ id: user.id, email: user.email });
        setAuthCookie(res, token);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: toSafeUser(user)
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error during login" });
    }
};

export const logout = async (_req: Request, res: Response) => {
    clearAuthCookie(res);

    return res.status(200).json({
        message: "Logout successful",
    });
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
        const user = await db.users.findByPk(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            user: toSafeUser(user),
        });
    } catch (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({ message: "Server error while fetching current user" });
    }
};

async function mergeGuestCart(sessionId: string, userId: number): Promise<void> {
    await sequelize.transaction(async (t) => {
        const guestCart = await db.carts.findOne({
            where: { session_id: sessionId, user_id: null },
            include: [{ model: db.cart_items, as: "items" }],
            transaction: t,
        });
        if (!guestCart) return;

        const [userCart] = await db.carts.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId },
            transaction: t,
        });

        for (const item of guestCart.items) {
            const existing = await db.cart_items.findOne({
                where: { cart_id: userCart.id, product_id: item.product_id },
                transaction: t,
            });
            if (existing) {
                await existing.update(
                    { quantity: existing.quantity + item.quantity },
                    { transaction: t }
                );
            } else {
                await db.cart_items.create({
                    cart_id: userCart.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                }, { transaction: t });
            }
        }
        await guestCart.destroy({ transaction: t });
    });
}
