import request from "supertest";
import app from "../app";
 
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
 
// ══════════════════════════════════════════════
//  REGISTER (Test 17-18)
// ══════════════════════════════════════════════
describe("User Registration", () => {
 
  test("User registers successfully with valid info", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "New User",
      email: "newuser_unique999@example.com",
      password: "NewPass1234!",
      address: "New Street 5",
      taxId: "98765432101",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", "newuser_unique999@example.com");
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
      .send({ text: "Great product!" });
 
    const res = await request(app)
      .get(`/products/${productId}/comments`);
 
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find(
      (c: any) => c.text === "Great product!" && c.approved === false
    );
    expect(found).toBeUndefined();
  });
 
  test("Approved comments are listed for a product", async () => {
    const res = await request(app)
      .get(`/products/${productId}/comments`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
 
// ══════════════════════════════════════════════
//  ORDERS (Test 21-23)
// ══════════════════════════════════════════════
describe("Orders", () => {
 
  test("Order is created successfully after payment", async () => {
    const res = await request(app)
      .post("/order")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        items: [{ productId, quantity: 1 }],
        paymentInfo: { cardNumber: "4111111111111111", cvv: "123", expiry: "12/26" },
        address: "Test Street 1",
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });
 
  test("User can retrieve their own orders", async () => {
    const res = await request(app)
      .get("/order")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
 
  test("Unauthenticated user cannot place an order", async () => {
    const res = await request(app)
      .post("/order")
      .send({
        items: [{ productId, quantity: 1 }],
        paymentInfo: { cardNumber: "4111111111111111", cvv: "123", expiry: "12/26" },
        address: "Test Street 1",
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
      .send({ productId, quantity: 1 });
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
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("price");
    expect(res.body).toHaveProperty("quantity");
  });
});