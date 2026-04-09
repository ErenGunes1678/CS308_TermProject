import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface AuthRequest extends Request {
    userId?: number;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Login required to proceed." });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired token. Please login." });
    }
};

// 👇 only new addition
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
            req.userId = decoded.id;
        } catch {
            // invalid token — treat as guest
        }
    }

    next(); // always continue
};