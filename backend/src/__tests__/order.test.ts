import request from "supertest";
import app from "../app";
import { sequelize } from "../entities";
 
// ─────────────────────────────────────────────
//  GERÇEK ROUTE PREFIX'LER (app.ts'den):
//  /auth        → authRoutes
//  /product     → productRoutes
//  /cart        → cartRoutes
//  /order       → orderRoutes
//  /search      → searchRoutes
//  /            → commentRoutes
// ─────────────────────────────────────────────
 
const testUser = {
  name: "Test User",
  email: "testuser_order@example.com",
  password: "Test1234!",
  address: "Test Street 1",
  taxId: "12345678901",
};
 
let authToken: string = "";
let productId: number = 1;
 
beforeAll(async () => {
  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  authToken = res.body.token;
});
 
afterAll(async () => {
  await sequelize.close();
});
 
// ══════════════════════════════════════════════
//  REGISTER (Test 17-18)
// ══════════════════════════════════════════════
describe("User Registration", () => {
 
  test("User registers successfully with valid info", async () => {
    const uniqueEmail = `newuser_${Date.now()}@example.com`;
    const res = await request(app).post("/auth/register").send({
      name: "New User",
      email: uniqueEmail,
      password: "NewPass1234!",
      address: "New Street 5",
      taxId: "98765432101",
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("email", uniqueEmail);
  });
 
  test("Registration fails with duplicate email", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Duplicate User",
      email: testUser.email,
      password: "AnotherPass1!",
      address: "Another Street",
      taxId: "11111111111",
    });
    expect([400, 409]).toContain(res.status);
  });
});
 
// ══════════════════════════════════════════════
//  COMMENTS (Test 19-20)
// ══════════════════════════════════════════════
describe("Comments", () => {
 
  test("Comment is not visible before manager approval", async () => {
    await request(app)
      .post(`/products/${productId}/comments`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ rating: 5, comment_text: "Great product!" });
 
    const res = await request(app)
      .get(`/products/${productId}/comments`);
 
    expect(Array.isArray(res.body.comments)).toBe(true);
    const found = res.body.comments.find(
      (c: any) => c.comment_text === "Great product!" && c.status === "pending"
    );
    // Pending comments should NOT appear in approved-only listing
    expect(found).toBeUndefined();
  });
 
  test("Approved comments are listed for a product", async () => {
    const res = await request(app)
      .get(`/products/${productId}/comments`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.comments)).toBe(true);
  });
});
 
// ══════════════════════════════════════════════
//  ORDERS (Test 21-23)
// ══════════════════════════════════════════════
describe("Orders", () => {
 
  test("Order is created successfully after payment", async () => {
    // First add an item to cart so placeOrder has something to process
    await request(app)
      .post("/cart/add")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ product_id: productId, quantity: 1 });

    const res = await request(app)
      .post("/order")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        shippingAddress: {
          firstName: "Test",
          lastName: "User",
          email: "testuser_order@example.com",
          phone: "1234567890",
          country: "Turkey",
          street: "Test Street 1",
          city: "Istanbul",
          state: "IST",
          zip: "34000",
        },
        payment: { method: "credit_card" },
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("invoice");
  });
 
  test("User can retrieve their own orders", async () => {
    const res = await request(app)
      .get("/order")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  test("Customer cannot cancel order without sales manager approval", async () => {
    const ordersRes = await request(app)
      .get("/order")
      .set("Authorization", `Bearer ${authToken}`);

    const order = (ordersRes.body.orders || []).find((o: any) => o.status === "processing");
    expect(order).toBeDefined();

    const cancelRes = await request(app)
      .patch(`/order/${order.id}/cancel`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(cancelRes.status).toBe(403);
    expect(cancelRes.body.message).toMatch(/Sales manager approval required/i);
  });

  test("Sales manager can cancel a processing order", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "elif.sales@gmail.com", password: "123456" });

    const salesToken = loginRes.body.token;
    expect(salesToken).toBeDefined();

    const ordersRes = await request(app)
      .get("/order")
      .set("Authorization", `Bearer ${authToken}`);

    const order = (ordersRes.body.orders || []).find((o: any) => o.status === "processing");
    expect(order).toBeDefined();

    const cancelRes = await request(app)
      .patch(`/order/${order.id}/cancel`)
      .set("Authorization", `Bearer ${salesToken}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.order.status).toBe("cancelled");
  });
 
  test("Unauthenticated user cannot place an order", async () => {
    const res = await request(app)
      .post("/order")
      .send({
        shippingAddress: {
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          phone: "1234567890",
          country: "Turkey",
          street: "Test Street 1",
          city: "Istanbul",
          state: "IST",
          zip: "34000",
        },
        payment: { method: "credit_card" },
      });
    expect(res.status).toBe(401);
  });
});
 
// ══════════════════════════════════════════════
//  CART (Test 24)
// ══════════════════════════════════════════════
describe("Cart", () => {
 
  test("Authenticated user can add item to cart", async () => {
    const res = await request(app)
      .post("/cart/add")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ product_id: productId, quantity: 1 });
    expect(res.status).toBe(200);
  });
});
 
// ══════════════════════════════════════════════
//  PRODUCT (Test 25)
// ══════════════════════════════════════════════
describe("Product Details", () => {
 
  test("Product details are returned correctly", async () => {
    const res = await request(app).get(`/product/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.product).toHaveProperty("id");
    expect(res.body.product).toHaveProperty("name");
    expect(res.body.product).toHaveProperty("price");
    expect(res.body.product).toHaveProperty("quantity_in_stock");
  });
});