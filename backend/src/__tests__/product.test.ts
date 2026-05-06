/* ──────────────────────────── mock db module ──────────────────────────── */

// We mock the entire `../entities` module so the controllers never touch a
// real database.  Each test can customise the mock return values it needs.

const mockProductFindByPk = jest.fn();
const mockProductCreate = jest.fn();
const mockCartFindOne = jest.fn();
const mockCartFindOrCreate = jest.fn();
const mockCartItemCreate = jest.fn();
const mockCartItemFindAll = jest.fn();
const mockCartItemFindOne = jest.fn();
const mockCartItemDestroy = jest.fn();
const mockOrderCreate = jest.fn();
const mockOrderFindByPk = jest.fn();
const mockOrderItemCreate = jest.fn();
const mockUserFindByPk = jest.fn();

jest.mock("../entities", () => {
    const db: Record<string, any> = {
        products: {
            findByPk: (...args: any[]) => mockProductFindByPk(...args),
            create: (...args: any[]) => mockProductCreate(...args),
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
        orders: {
            create: (...args: any[]) => mockOrderCreate(...args),
            findByPk: (...args: any[]) => mockOrderFindByPk(...args),
        },
        order_items: {
            create: (...args: any[]) => mockOrderItemCreate(...args),
        },
        users: {
            findByPk: (...args: any[]) => mockUserFindByPk(...args),
        },
    };
    return {
        __esModule: true,
        default: db,
        sequelize: {
            transaction: jest.fn().mockResolvedValue({
                commit: jest.fn(),
                rollback: jest.fn(),
            }),
        },
    };
});

jest.mock("../utils/auth", () => ({
    getOrCreateGuestSessionId: jest.fn().mockReturnValue("guest-session-123"),
}));

jest.mock("../utils/invoicePdf", () => ({
    createInvoicePdfBuffer: jest.fn().mockReturnValue(Buffer.from("fake-pdf")),
}));

/* ──────────────────────── imports (after mocks) ──────────────────────── */

import { mapProductForFrontend } from "../utils/productMapper";
import { addToCart } from "../controllers/cartController";
import { placeOrder } from "../controllers/orderController";
import { addProduct } from "../controllers/productController";
import { sequelize } from "../entities";

/* ──────────────────────── helpers ──────────────────────── */

/** Build a minimal Express-like Request object. */
const mockRequest = (overrides: Record<string, any> = {}) => ({
    body: {},
    params: {},
    cookies: {},
    headers: {},
    ...overrides,
});

/** Build a minimal Express-like Response object with spies. */
const mockResponse = () => {
    const res: Record<string, any> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    return res;
};

/** A complete product row as it would come from Sequelize. */
const sampleProductRow = (overrides: Record<string, any> = {}) => {
    const data: Record<string, any> = {
        id: 1,
        name: "Hydrating Face Cream",
        brand: "GlowUp",
        category: "skincare",
        subcategory: "moisturizers",
        model: "GU-HFC-001",
        serial_number: "SN-10001",
        description: "A deeply hydrating face cream with hyaluronic acid.",
        quantity_in_stock: 50,
        price: "29.99",
        original_price: "39.99",
        rating: "4.5",
        review_count: 120,
        image: "/images/hydrating-cream.jpg",
        badge: "BEST",
        warranty_status: true,
        distributor_info: "GlowUp Inc., Istanbul, Turkey",
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

/* ─── Test 1 ──────────────────────────────────────────────────────────── */
// Product created with all required properties

describe("Test 1 – Product is created with all required properties", () => {
    it("should include ID, name, model, serial number, description, quantity, price, warranty, and distributor", async () => {
        const productData = {
            name: "Hydrating Face Cream",
            brand: "GlowUp",
            category: "skincare",
            subcategory: "moisturizers",
            model: "GU-HFC-001",
            serial_number: "SN-10001",
            description: "A deeply hydrating face cream with hyaluronic acid.",
            quantity_in_stock: 50,
            price: "29.99",
            original_price: "39.99",
            image: "/images/hydrating-cream.jpg",
            warranty_status: true,
            distributor_info: "GlowUp Inc., Istanbul, Turkey",
        };

        const createdRow = sampleProductRow();
        mockProductCreate.mockResolvedValue(createdRow);

        const req = mockRequest({ body: productData });
        const res = mockResponse();

        await addProduct(req as any, res as any);

        // Controller should respond 201
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalled();

        // Extract the mapped product from the response
        const responseBody = res.json.mock.calls[0][0];
        const product = responseBody.product;

        // Verify every required property is present and correct
        expect(product).toHaveProperty("id", 1);
        expect(product).toHaveProperty("name", "Hydrating Face Cream");
        expect(product).toHaveProperty("model", "GU-HFC-001");
        expect(product).toHaveProperty("serial_number", "SN-10001");
        expect(product).toHaveProperty("description", "A deeply hydrating face cream with hyaluronic acid.");
        expect(product).toHaveProperty("quantity_in_stock", 50);
        expect(product).toHaveProperty("price", 29.99);
        expect(product).toHaveProperty("warranty_status", true);
        expect(product).toHaveProperty("distributor_info", "GlowUp Inc., Istanbul, Turkey");
    });
});

/* ─── Test 2 ──────────────────────────────────────────────────────────── */
// Stock decreases after purchase

describe("Test 2 – Stock quantity decreases after a successful purchase", () => {
    it("should decrement quantity_in_stock by the purchased amount", async () => {
        const initialStock = 50;
        const purchaseQty = 3;

        const product = sampleProductRow({ quantity_in_stock: initialStock });

        // Simulate a cart with one item
        const cartItems = [{ product_id: 1, quantity: purchaseQty }];
        const cart = { id: 10, items: cartItems };

        // Mock DB calls used by placeOrder
        mockCartFindOne.mockResolvedValue(cart);
        mockProductFindByPk.mockResolvedValue(product);
        mockOrderCreate.mockResolvedValue({ id: 100 });
        mockOrderItemCreate.mockResolvedValue({});
        mockCartItemDestroy.mockResolvedValue(1);
        mockOrderFindByPk.mockResolvedValue({
            id: 100,
            status: "paid",
            user: { id: 1, name: "Test User", email: "test@example.com" },
            items: [{ product_id: 1, quantity: purchaseQty, unit_price: "29.99", product: { name: "Hydrating Face Cream" } }],
        });

        const req = mockRequest({
            userId: 1,
            body: {
                shippingAddress: {
                    firstName: "Test",
                    lastName: "User",
                    email: "test@example.com",
                    phone: "1234567890",
                    country: "Turkey",
                    street: "123 Test St",
                    city: "Istanbul",
                    state: "IST",
                    zip: "34000",
                },
                payment: { method: "credit_card" },
            },
        });
        const res = mockResponse();

        await placeOrder(req as any, res as any);

        // The product.update call should have reduced stock
        expect(product.update).toHaveBeenCalledWith(
            { quantity_in_stock: initialStock - purchaseQty },
            expect.objectContaining({ transaction: expect.anything() }),
        );

        // Order should be created successfully
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

/* ─── Test 3 ──────────────────────────────────────────────────────────── */
// Product cannot be purchased when stock is 0

describe("Test 3 – Product cannot be purchased when stock is 0", () => {
    it("should return 400 with an insufficient-stock message", async () => {
        const product = sampleProductRow({ quantity_in_stock: 0 });

        const cartItems = [{ product_id: 1, quantity: 1 }];
        const cart = { id: 10, items: cartItems };

        mockCartFindOne.mockResolvedValue(cart);
        mockProductFindByPk.mockResolvedValue(product);

        const req = mockRequest({
            userId: 1,
            body: {
                shippingAddress: {
                    firstName: "Test",
                    lastName: "User",
                    email: "test@example.com",
                    phone: "1234567890",
                    country: "Turkey",
                    street: "123 Test St",
                    city: "Istanbul",
                    state: "IST",
                    zip: "34000",
                },
                payment: { method: "credit_card" },
            },
        });
        const res = mockResponse();

        await placeOrder(req as any, res as any);

        // Should reject because stock = 0
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining("Insufficient stock"),
            }),
        );

        // Stock should NOT have been mutated
        expect(product.update).not.toHaveBeenCalled();
    });
});

/* ─── Test 4 ──────────────────────────────────────────────────────────── */
// Stock count displayed matches the database value

describe("Test 4 – Stock count displayed matches the database value", () => {
    it("should map quantity_in_stock from the DB row to the frontend payload", () => {
        const dbStockValue = 37;
        const product = sampleProductRow({ quantity_in_stock: dbStockValue });

        const mapped = mapProductForFrontend(product);

        // The frontend-facing field must exactly equal the DB value
        expect(mapped.quantity_in_stock).toBe(dbStockValue);
        // Derived flags should also be consistent
        expect(mapped.outOfStock).toBe(false);
        expect(mapped.lowStock).toBe(null); // 37 > 10 → not "low"
    });

    it("should flag outOfStock when stock is 0", () => {
        const product = sampleProductRow({ quantity_in_stock: 0 });
        const mapped = mapProductForFrontend(product);

        expect(mapped.quantity_in_stock).toBe(0);
        expect(mapped.outOfStock).toBe(true);
    });

    it("should flag lowStock when stock is between 1 and 10", () => {
        const product = sampleProductRow({ quantity_in_stock: 5 });
        const mapped = mapProductForFrontend(product);

        expect(mapped.quantity_in_stock).toBe(5);
        expect(mapped.lowStock).toBe(5);
        expect(mapped.outOfStock).toBe(false);
    });
});

/* ─── Test 5 ──────────────────────────────────────────────────────────── */
// Adding item to cart does NOT decrement stock

describe("Test 5 – Adding item to cart does NOT decrement stock", () => {
    it("should leave quantity_in_stock unchanged after addToCart", async () => {
        const initialStock = 50;
        const product = sampleProductRow({ quantity_in_stock: initialStock });

        // findByPk is called inside addToCart to validate stock
        mockProductFindByPk.mockResolvedValue(product);
        // findOrCreate returns the cart
        mockUserFindByPk.mockResolvedValue({ role: "customer" });
        mockCartFindOrCreate.mockResolvedValue([{ id: 10 }]);
        // No existing cart item for this product
        mockCartItemFindOne.mockResolvedValue(null);
        mockCartItemCreate.mockResolvedValue({ id: 1, product_id: 1, quantity: 1 });

        const req = mockRequest({
            userId: 1,
            body: { product_id: 1, quantity: 2 },
        });
        const res = mockResponse();

        await addToCart(req as any, res as any);

        // addToCart should succeed
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Item added to cart." }),
        );

        // The product's stock must NOT have been decremented
        expect(product.update).not.toHaveBeenCalled();
        // Verify the original stock value is still intact
        expect(product.get({ plain: true }).quantity_in_stock).toBe(initialStock);
    });
});
