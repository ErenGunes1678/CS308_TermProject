import { Request, Response, NextFunction } from "express";
import { getTokenFromRequest, verifyAuthToken } from "../utils/auth";

export interface AuthRequest extends Request {
    userId?: number;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = getTokenFromRequest(req);

    if (!token) {
        res.status(401).json({ message: "Login required to proceed." });
        return;
    }

    try {
        const decoded = verifyAuthToken(token);
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired token. Please login." });
    }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = getTokenFromRequest(req);

    if (token) {
        try {
            const decoded = verifyAuthToken(token);
            req.userId = decoded.id;
        } catch {
            // invalid token — treat as guest
        }
    }

    next(); // always continue
};
