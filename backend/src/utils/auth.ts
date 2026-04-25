import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const AUTH_COOKIE_NAME = "auth_token";
export const GUEST_SESSION_COOKIE_NAME = "guest_session_id";

function isProduction(): boolean {
    return process.env.NODE_ENV === "production";
}

export function signAuthToken(payload: { id: number; email: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyAuthToken(token: string): { id: number; email: string } {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
}

export function setAuthCookie(res: Response, token: string): void {
    res.cookie(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction(),
        maxAge: ONE_DAY_IN_MS,
    });
}

export function clearAuthCookie(res: Response): void {
    res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction(),
    });
}

export function getTokenFromRequest(req: Request): string | undefined {
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
    const headerToken = req.headers.authorization?.split(" ")[1];
    return cookieToken || headerToken;
}

export function getOrCreateGuestSessionId(req: Request, res: Response): string {
    const existingSessionId = req.cookies?.[GUEST_SESSION_COOKIE_NAME];

    if (existingSessionId) {
        return existingSessionId;
    }

    const sessionId = randomUUID();
    res.cookie(GUEST_SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction(),
        maxAge: 30 * ONE_DAY_IN_MS,
    });
    return sessionId;
}

export function getGuestSessionId(req: Request): string | undefined {
    return req.cookies?.[GUEST_SESSION_COOKIE_NAME];
}

export function clearGuestSessionCookie(res: Response): void {
    res.clearCookie(GUEST_SESSION_COOKIE_NAME, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction(),
    });
}
