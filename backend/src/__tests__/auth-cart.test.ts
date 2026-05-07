/* ──────────────────────────── mock db module ──────────────────────────── */

const mockProductFindByPk = jest.fn();
const mockCartFindOne = jest.fn();
const mockCartFindOrCreate = jest.fn();
const mockCartItemCreate = jest.fn();
const mockCartItemFindOne = jest.fn();
const mockCartItemFindAll = jest.fn();
const mockCartItemDestroy = jest.fn();
const mockUserFindByPk = jest.fn();
const mockUserFindOne = jest.fn();
const mockUserCreate = jest.fn();

jest.mock("../entities", () => {
    const db: Record<string, any> = {
        products: {
            findByPk: (...args: any[]) => mockProductFindByPk(...args),
            findOne: jest.fn().mockResolvedValue(null),
            findAll: jest.fn().mockResolvedValue([]),
        },
        carts: {
            findOne: (...args: any[]) => mockCartFindOne(...args),
            findOrCreate: (...args: any[]) => mockCartFindOrCreate(...args),
        },
        cart_items: {
            create: (...args: any[]) => mockCartItemCreate(...args),
            findAll: (...args: any[]) => mockCartItemFindAll(...args),
            findOne: (...args: any[]) => mockCartItemFindOne(...args),
            destroy: (...args: any[]) => mockCartItemDestroy(...args),
        },
        users: {
            findByPk: (...args: any[]) => mockUserFindByPk(...args),
            findOne: (...args: any[]) => mockUserFindOne(...args),
            create: (...args: any[]) => mockUserCreate(...args),
        },
    };
    return {
        __esModule: true,
        default: db,
        sequelize: {
            transaction: jest.fn().mockImplementation(async (cb: Function) => {
                const t = { commit: jest.fn(), rollback: jest.fn() };
                return cb(t);
            }),
        },
    };
});

jest.mock("../utils/auth", () => ({
    getOrCreateGuestSessionId: jest.fn().mockReturnValue("guest-session-abc"),
    getGuestSessionId: jest.fn(),
    getTokenFromRequest: jest.fn(),
    verifyAuthToken: jest.fn(),
    signAuthToken: jest.fn().mockReturnValue("mock-jwt-token"),
    setAuthCookie: jest.fn(),
    clearAuthCookie: jest.fn(),
    clearGuestSessionCookie: jest.fn(),
}));

/* ──────────────────────── imports (after mocks) ──────────────────────── */

import { addToCart } from "../controllers/cartController";
import { login } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";
import { getTokenFromRequest, verifyAuthToken, getGuestSessionId } from "../utils/auth";
import bcrypt from "bcrypt";

/* ──────────────────────── helpers ──────────────────────── */

const mockRequest = (overrides: Record<string, any> = {}) => ({
    body: {},
    params: {},
    cookies: {},
    headers: {},
    ...overrides,
});

const mockResponse = () => {
    const res: Record<string, any> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
};

const sampleProductRow = (overrides: Record<string, any> = {}) => {
    const data: Record<string, any> = {
        id: 1,
        name: "Hydrating Face Cream",
        brand: "GlowUp",
        category: "skincare",
        subcategory: "moisturizers",
        model: "GU-HFC-001",
        serial_number: "SN-10001",
        description: "A deeply hydrating face cream.",
        quantity_in_stock: 50,
        price: "29.99",
        original_price: "39.99",
        rating: "4.5",
        review_count: 120,
        image: "/images/hydrating-cream.jpg",
        badge: "BEST",
        warranty_status: true,
        distributor_info: "GlowUp Inc., Istanbul",
        ...overrides,
    };

    return {
        ...data,
        get: ({ plain }: { plain: boolean }) => (plain ? data : data),
        update: jest.fn().mockImplementation(async (updates: Record<string, any>) => {
            Object.assign(data, updates);
        }),
    };
};

/* ════════════════════════════════════════════════════════════════════════
   TEST SUITES
   ════════════════════════════════════════════════════════════════════════ */

beforeEach(() => {
    jest.clearAllMocks();
});

/* ─── Test 6 ──────────────────────────────────────────────────────────── */
// Guest user can add items to the cart without logging in

describe("Test 6 – Guest user can add items to the cart without logging in", () => {
    it("should allow adding a product when userId is undefined (guest)", async () => {
        const product = sampleProductRow({ quantity_in_stock: 50 });

        mockProductFindByPk.mockResolvedValue(product);
        mockUserFindByPk.mockResolvedValue(null); // guest – no user record
        mockCartFindOrCreate.mockResolvedValue([{ id: 5 }]);
        mockCartItemFindOne.mockResolvedValue(null); // product not yet in cart
        mockCartItemCreate.mockResolvedValue({ id: 1, product_id: 1, quantity: 1 });

        // No userId → guest flow
        const req = mockRequest({
            body: { product_id: 1, quantity: 1 },
        });
        const res = mockResponse();

        await addToCart(req as any, res as any);

        // Should succeed with 200 and the expected message
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Item added to cart." }),
        );

        // Cart item should have been created
        expect(mockCartItemCreate).toHaveBeenCalledWith(
            expect.objectContaining({ cart_id: 5, product_id: 1, quantity: 1 }),
        );
    });
});

/* ─── Test 7 ──────────────────────────────────────────────────────────── */
// Placing an order requires authentication

describe("Test 7 – Placing an order requires authentication (unauthenticated request is rejected)", () => {
    it("should return 401 when no auth token is provided", () => {
        // Simulate no token in the request
        (getTokenFromRequest as jest.Mock).mockReturnValue(undefined);

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        requireAuth(req as any, res as any, next);

        // Should block with 401
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Login required to proceed." }),
        );

        // next() should NOT have been called
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when an invalid token is provided", () => {
        (getTokenFromRequest as jest.Mock).mockReturnValue("bad-token");
        (verifyAuthToken as jest.Mock).mockImplementation(() => {
            throw new Error("invalid token");
        });

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        requireAuth(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Invalid or expired token. Please login.",
            }),
        );
        expect(next).not.toHaveBeenCalled();
    });
});

/* ─── Test 8 ──────────────────────────────────────────────────────────── */
// Guest cart merges correctly after login

describe("Test 8 – Guest cart persists/merges correctly after login", () => {
    it("should merge guest cart items into the user cart on login", async () => {
        const hashedPassword = await bcrypt.hash("securePass123", 10);

        // Simulate a guest session cookie
        (getGuestSessionId as jest.Mock).mockReturnValue("guest-session-abc");

        // User exists in DB
        mockUserFindOne.mockResolvedValue({
            id: 1,
            name: "Test User",
            email: "test@test.com",
            password_hash: hashedPassword,
            role: "customer",
        });

        // Guest cart with 2 items
        const guestCartItems = [
            { product_id: 10, quantity: 2 },
            { product_id: 20, quantity: 1 },
        ];
        const guestCart = {
            id: 99,
            items: guestCartItems,
            destroy: jest.fn(),
        };

        mockCartFindOne.mockResolvedValue(guestCart);

        // User has a cart already
        mockCartFindOrCreate.mockResolvedValue([{ id: 50 }]);

        // No overlapping items in user cart
        mockCartItemFindOne.mockResolvedValue(null);
        mockCartItemCreate.mockResolvedValue({});

        // findByPk for user inside mergeGuestCart
        mockUserFindByPk.mockResolvedValue({ role: "customer" });

        const req = mockRequest({
            body: { email: "test@test.com", password: "securePass123" },
        });
        const res = mockResponse();

        await login(req as any, res as any);

        // Login should succeed
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Login successful" }),
        );

        // Guest cart items should have been copied to user cart
        expect(mockCartItemCreate).toHaveBeenCalledTimes(2);
        expect(mockCartItemCreate).toHaveBeenCalledWith(
            expect.objectContaining({ cart_id: 50, product_id: 10, quantity: 2 }),
            expect.anything(),
        );
        expect(mockCartItemCreate).toHaveBeenCalledWith(
            expect.objectContaining({ cart_id: 50, product_id: 20, quantity: 1 }),
            expect.anything(),
        );

        // Guest cart should have been destroyed
        expect(guestCart.destroy).toHaveBeenCalled();
    });
});

/* ─── Test 9 ──────────────────────────────────────────────────────────── */
// Password hashing — stored password should not equal the plaintext password

describe("Test 9 – Password hashing (stored password ≠ plaintext)", () => {
    it("should produce a hash that differs from the original password", async () => {
        const plaintext = "MySecurePassword123!";
        const hash = await bcrypt.hash(plaintext, 10);

        // The hash must NOT equal the plaintext
        expect(hash).not.toBe(plaintext);
    });

    it("should still match when verified with bcrypt.compare", async () => {
        const plaintext = "MySecurePassword123!";
        const hash = await bcrypt.hash(plaintext, 10);

        const isMatch = await bcrypt.compare(plaintext, hash);
        expect(isMatch).toBe(true);
    });

    it("should NOT match a different password", async () => {
        const hash = await bcrypt.hash("CorrectPassword", 10);

        const isMatch = await bcrypt.compare("WrongPassword", hash);
        expect(isMatch).toBe(false);
    });
});

/* ─── Test 10 ─────────────────────────────────────────────────────────── */
// Login fails with incorrect credentials

describe("Test 10 – Login fails with incorrect credentials", () => {
    it("should return 401 when the email does not exist", async () => {
        (getGuestSessionId as jest.Mock).mockReturnValue(undefined);
        mockUserFindOne.mockResolvedValue(null); // no user found

        const req = mockRequest({
            body: { email: "nobody@test.com", password: "anything" },
        });
        const res = mockResponse();

        await login(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Invalid email or password" }),
        );
    });

    it("should return 401 when the password is wrong", async () => {
        const correctHash = await bcrypt.hash("RealPassword", 10);
        (getGuestSessionId as jest.Mock).mockReturnValue(undefined);

        mockUserFindOne.mockResolvedValue({
            id: 1,
            name: "Test User",
            email: "user@test.com",
            password_hash: correctHash,
            role: "customer",
        });

        const req = mockRequest({
            body: { email: "user@test.com", password: "WrongPassword" },
        });
        const res = mockResponse();

        await login(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Invalid email or password" }),
        );
    });
});
