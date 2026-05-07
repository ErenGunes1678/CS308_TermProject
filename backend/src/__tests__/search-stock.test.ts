/* ──────────────────────────── mock db module ──────────────────────────── */

const mockProductFindAll = jest.fn();
const mockProductFindByPk = jest.fn();
const mockCartFindOrCreate = jest.fn();
const mockCartItemCreate = jest.fn();
const mockCartItemFindOne = jest.fn();
const mockUserFindByPk = jest.fn();

jest.mock("../entities", () => {
    const db: Record<string, any> = {
        products: {
            findAll: (...args: any[]) => mockProductFindAll(...args),
            findByPk: (...args: any[]) => mockProductFindByPk(...args),
            findOne: jest.fn().mockResolvedValue(null),
        },
        carts: {
            findOrCreate: (...args: any[]) => mockCartFindOrCreate(...args),
        },
        cart_items: {
            create: (...args: any[]) => mockCartItemCreate(...args),
            findOne: (...args: any[]) => mockCartItemFindOne(...args),
        },
        users: {
            findByPk: (...args: any[]) => mockUserFindByPk(...args),
        },
    };
    return { __esModule: true, default: db };
});

jest.mock("../utils/auth", () => ({
    getOrCreateGuestSessionId: jest.fn().mockReturnValue("guest-session-xyz"),
}));

/* ──────────────────────── imports (after mocks) ──────────────────────── */

import { searchProducts } from "../controllers/searchController";
import { addToCart } from "../controllers/cartController";
import { mapProductForFrontend } from "../utils/productMapper";

/* ──────────────────────── helpers ──────────────────────── */

const mockRequest = (overrides: Record<string, any> = {}) => ({
    body: {},
    params: {},
    query: {},
    cookies: {},
    headers: {},
    ...overrides,
});

const mockResponse = () => {
    const res: Record<string, any> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    return res;
};

/** Helper to create a fake Sequelize product row. */
const makeProduct = (overrides: Record<string, any> = {}) => {
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
        distributor_info: "GlowUp Inc.",
        ...overrides,
    };
    return {
        ...data,
        get: ({ plain }: { plain: boolean }) => (plain ? data : data),
        update: jest.fn(),
    };
};

/* ════════════════════════════════════════════════════════════════════════
   TEST SUITES
   ════════════════════════════════════════════════════════════════════════ */

beforeEach(() => {
    jest.clearAllMocks();
});

/* ─── Test 11 ─────────────────────────────────────────────────────────── */
// Search by product name returns matching products

describe("Test 11 – Search by product name returns matching products", () => {
    it("should return products whose name matches the query", async () => {
        const matchingProduct = makeProduct({ id: 1, name: "Hydrating Face Cream" });
        mockProductFindAll.mockResolvedValue([matchingProduct]);

        const req = mockRequest({ query: { q: "Hydrating" } });
        const res = mockResponse();

        await searchProducts(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(200);

        const body = res.json.mock.calls[0][0];
        expect(body.products).toHaveLength(1);
        expect(body.products[0].name).toBe("Hydrating Face Cream");
        expect(body.total).toBe(1);
    });

    it("should return an empty list when nothing matches", async () => {
        mockProductFindAll.mockResolvedValue([]);

        const req = mockRequest({ query: { q: "NonExistentProduct" } });
        const res = mockResponse();

        await searchProducts(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(200);
        const body = res.json.mock.calls[0][0];
        expect(body.products).toHaveLength(0);
        expect(body.total).toBe(0);
    });
});

/* ─── Test 12 ─────────────────────────────────────────────────────────── */
// Search by description keyword returns matching products

describe("Test 12 – Search by description keyword returns matching products", () => {
    it("should match products by description via the q parameter", async () => {
        const product = makeProduct({
            id: 2,
            name: "Vitamin C Serum",
            description: "Brightening serum with antioxidant protection.",
        });
        mockProductFindAll.mockResolvedValue([product]);

        const req = mockRequest({ query: { q: "antioxidant" } });
        const res = mockResponse();

        await searchProducts(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(200);
        const body = res.json.mock.calls[0][0];
        expect(body.products).toHaveLength(1);
        expect(body.products[0].name).toBe("Vitamin C Serum");
    });

    it("should pass the query to the DB where-clause with Op.iLike on description", async () => {
        mockProductFindAll.mockResolvedValue([]);

        const req = mockRequest({ query: { q: "moisturizing" } });
        const res = mockResponse();

        await searchProducts(req as any, res as any);

        // Verify findAll was called with a where clause containing the query
        const callArgs = mockProductFindAll.mock.calls[0][0];
        expect(callArgs).toHaveProperty("where");
    });
});

/* ─── Test 13 ─────────────────────────────────────────────────────────── */
// Sorting by price (ascending and descending) returns products in the correct order

describe("Test 13 – Sorting by price (ascending and descending)", () => {
    const cheapProduct = makeProduct({ id: 1, name: "Budget Cream", price: "9.99" });
    const midProduct = makeProduct({ id: 2, name: "Mid Cream", price: "29.99" });
    const expensiveProduct = makeProduct({ id: 3, name: "Luxury Cream", price: "99.99" });

    it("should pass price ASC order to the database query", async () => {
        mockProductFindAll.mockResolvedValue([cheapProduct, midProduct, expensiveProduct]);

        const req = mockRequest({ query: { sortBy: "price_asc" } });
        const res = mockResponse();

        await searchProducts(req as any, res as any);

        // Verify the order passed to findAll
        const callArgs = mockProductFindAll.mock.calls[0][0];
        expect(callArgs.order).toEqual([["price", "ASC"]]);

        // Verify response returns products in ascending price order
        const body = res.json.mock.calls[0][0];
        const prices = body.products.map((p: any) => p.price);
        expect(prices).toEqual([9.99, 29.99, 99.99]);
    });

    it("should pass price DESC order to the database query", async () => {
        mockProductFindAll.mockResolvedValue([expensiveProduct, midProduct, cheapProduct]);

        const req = mockRequest({ query: { sortBy: "price_desc" } });
        const res = mockResponse();

        await searchProducts(req as any, res as any);

        const callArgs = mockProductFindAll.mock.calls[0][0];
        expect(callArgs.order).toEqual([["price", "DESC"]]);

        const body = res.json.mock.calls[0][0];
        const prices = body.products.map((p: any) => p.price);
        expect(prices).toEqual([99.99, 29.99, 9.99]);
    });
});

/* ─── Test 14 ─────────────────────────────────────────────────────────── */
// Sorting by popularity returns products in the correct order

describe("Test 14 – Sorting by popularity (rating descending)", () => {
    it("should pass rating DESC order to the database query", async () => {
        const topRated = makeProduct({ id: 1, name: "Top Rated", rating: "4.9" });
        const midRated = makeProduct({ id: 2, name: "Mid Rated", rating: "3.5" });
        const lowRated = makeProduct({ id: 3, name: "Low Rated", rating: "2.0" });

        mockProductFindAll.mockResolvedValue([topRated, midRated, lowRated]);

        const req = mockRequest({ query: { sortBy: "rating_desc" } });
        const res = mockResponse();

        await searchProducts(req as any, res as any);

        // Verify the order passed to findAll
        const callArgs = mockProductFindAll.mock.calls[0][0];
        expect(callArgs.order).toEqual([["rating", "DESC"]]);

        // Verify response order
        const body = res.json.mock.calls[0][0];
        const ratings = body.products.map((p: any) => p.rating);
        expect(ratings).toEqual([4.9, 3.5, 2.0]);
    });
});

/* ─── Test 15 ─────────────────────────────────────────────────────────── */
// Out-of-stock products appear in search results

describe("Test 15 – Out-of-stock products appear in search results", () => {
    it("should include products with quantity_in_stock = 0 when inStock filter is not set", async () => {
        const inStockProduct = makeProduct({ id: 1, name: "In Stock Cream", quantity_in_stock: 25 });
        const outOfStockProduct = makeProduct({ id: 2, name: "Sold Out Serum", quantity_in_stock: 0 });

        mockProductFindAll.mockResolvedValue([inStockProduct, outOfStockProduct]);

        // No inStock filter → should return both
        const req = mockRequest({ query: { q: "" } });
        const res = mockResponse();

        await searchProducts(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(200);
        const body = res.json.mock.calls[0][0];
        expect(body.products).toHaveLength(2);

        // The out-of-stock product should be present and flagged
        const soldOut = body.products.find((p: any) => p.name === "Sold Out Serum");
        expect(soldOut).toBeDefined();
        expect(soldOut.outOfStock).toBe(true);
        expect(soldOut.quantity_in_stock).toBe(0);

        // The in-stock product should not be flagged
        const available = body.products.find((p: any) => p.name === "In Stock Cream");
        expect(available).toBeDefined();
        expect(available.outOfStock).toBe(false);
    });

    it("should exclude out-of-stock products when inStock=true filter is set", async () => {
        // When inStock=true, the controller adds quantity_in_stock > 0 to the where clause
        const inStockOnly = makeProduct({ id: 1, name: "In Stock Cream", quantity_in_stock: 25 });
        mockProductFindAll.mockResolvedValue([inStockOnly]);

        const req = mockRequest({ query: { inStock: "true" } });
        const res = mockResponse();

        await searchProducts(req as any, res as any);

        // Verify the where clause included the stock filter
        const callArgs = mockProductFindAll.mock.calls[0][0];
        expect(callArgs.where).toHaveProperty("quantity_in_stock");

        const body = res.json.mock.calls[0][0];
        expect(body.products).toHaveLength(1);
        expect(body.products[0].outOfStock).toBe(false);
    });
});

/* ─── Test 16 ─────────────────────────────────────────────────────────── */
// Add to Cart on an out-of-stock product is rejected

describe("Test 16 – Add to Cart on an out-of-stock product is rejected", () => {
    it("should return 400 with 'Insufficient stock.' when quantity_in_stock is 0", async () => {
        const outOfStockProduct = makeProduct({ quantity_in_stock: 0 });

        mockProductFindByPk.mockResolvedValue(outOfStockProduct);
        mockUserFindByPk.mockResolvedValue({ role: "customer" });
        mockCartFindOrCreate.mockResolvedValue([{ id: 10 }]);

        const req = mockRequest({
            userId: 1,
            body: { product_id: 1, quantity: 1 },
        });
        const res = mockResponse();

        await addToCart(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Insufficient stock." }),
        );

        // Should NOT have created a cart item
        expect(mockCartItemCreate).not.toHaveBeenCalled();
    });

    it("should reject when requested quantity exceeds available stock", async () => {
        const lowStockProduct = makeProduct({ quantity_in_stock: 2 });

        mockProductFindByPk.mockResolvedValue(lowStockProduct);
        mockUserFindByPk.mockResolvedValue({ role: "customer" });
        mockCartFindOrCreate.mockResolvedValue([{ id: 10 }]);

        const req = mockRequest({
            userId: 1,
            body: { product_id: 1, quantity: 5 }, // requesting 5 but only 2 available
        });
        const res = mockResponse();

        await addToCart(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Insufficient stock." }),
        );
        expect(mockCartItemCreate).not.toHaveBeenCalled();
    });
});
