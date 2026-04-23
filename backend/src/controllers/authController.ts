import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../entities";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

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

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error during registration" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, session_id } = req.body; // session_id added

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
        if (session_id) {
            await mergeGuestCart(session_id, user.id);
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error during login" });
    }
};

async function mergeGuestCart(sessionId: string, userId: number): Promise<void> {
    const guestCart = await db.carts.findOne({
        where: { session_id: sessionId, user_id: null },
        include: [{ model: db.cart_items, as: "items" }],
    });
    if (!guestCart) return;

    const [userCart] = await db.carts.findOrCreate({
        where: { user_id: userId },
        defaults: { user_id: userId },
    });

    for (const item of guestCart.items) {
        const existing = await db.cart_items.findOne({
            where: { cart_id: userCart.id, product_id: item.product_id },
        });

        if (existing) {
            await existing.update({ quantity: existing.quantity + item.quantity });
        } else {
            await db.cart_items.create({
                cart_id: userCart.id,
                product_id: item.product_id,
                quantity: item.quantity,
            });
        }
    }

    await guestCart.destroy();
}