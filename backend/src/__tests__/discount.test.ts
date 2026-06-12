import request from "supertest";
import app from "../app";
import db, { sequelize } from "../entities";

describe("Discount validation", () => {
  const codesToCleanup: any[] = [];

  afterAll(async () => {
    // cleanup created discount codes
    for (const c of codesToCleanup) {
      try {
        await db.discount_codes.destroy({ where: { code: c } });
      } catch (e) {
        // ignore
      }
    }
    await sequelize.close();
  });

  test("applies percentage discount correctly", async () => {
    const code = `TESTPCT${Date.now()}`;
    codesToCleanup.push(code);

    await db.discount_codes.create({
      code,
      type: "percentage",
      value: 10,
      min_order: null,
      expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24),
      is_active: true,
    });

    const res = await request(app).post("/discount/validate").send({ code, orderTotal: 100 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("type", "percentage");
    expect(res.body).toHaveProperty("discountAmount");
    expect(Number(res.body.discountAmount)).toBeCloseTo(10.0, 2);
  });

  test("applies fixed discount correctly", async () => {
    const code = `TESTFIX${Date.now()}`;
    codesToCleanup.push(code);

    await db.discount_codes.create({
      code,
      type: "fixed",
      value: 15,
      min_order: null,
      expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24),
      is_active: true,
    });

    const res = await request(app).post("/discount/validate").send({ code, orderTotal: 50 });
    expect(res.status).toBe(200);
    expect(res.body.type).toBe("fixed");
    expect(Number(res.body.discountAmount)).toBeCloseTo(15.0, 2);
  });

  test("applies free shipping discount (no monetary discount)", async () => {
    const code = `TESTFS${Date.now()}`;
    codesToCleanup.push(code);

    await db.discount_codes.create({
      code,
      type: "free_shipping",
      value: null,
      min_order: null,
      expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24),
      is_active: true,
    });

    const res = await request(app).post("/discount/validate").send({ code, orderTotal: 20 });
    expect(res.status).toBe(200);
    expect(res.body.type).toBe("free_shipping");
    expect(Number(res.body.discountAmount)).toBe(0);
  });

  test("rejects expired discount code", async () => {
    const code = `TESTEXP${Date.now()}`;
    codesToCleanup.push(code);

    await db.discount_codes.create({
      code,
      type: "percentage",
      value: 5,
      min_order: null,
      expiry_date: new Date(Date.now() - 1000 * 60 * 60),
      is_active: true,
    });

    const res = await request(app).post("/discount/validate").send({ code, orderTotal: 100 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/expired/i);
  });

  test("rejects when min_order not met", async () => {
    const code = `TESTMIN${Date.now()}`;
    codesToCleanup.push(code);

    await db.discount_codes.create({
      code,
      type: "fixed",
      value: 20,
      min_order: 100,
      expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24),
      is_active: true,
    });

    const res = await request(app).post("/discount/validate").send({ code, orderTotal: 50 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/minimum order/i);
  });

  test("placing an order with a discount applies discount and increments uses_count", async () => {
    // create a user and login
    const uniqueEmail = `order_user_${Date.now()}@example.com`;
    await request(app).post("/auth/register").send({
      name: "Order User",
      email: uniqueEmail,
      password: "OrderPass1!",
      address: "Somewhere",
      taxId: "00011122233",
    });

    const loginRes = await request(app).post("/auth/login").send({ email: uniqueEmail, password: "OrderPass1!" });
    const token = loginRes.body.token;
    expect(token).toBeDefined();

    // create discount
    const code = `ORDDISC${Date.now()}`;
    codesToCleanup.push(code);
    const percent = 20;
    await db.discount_codes.create({
      code,
      type: "percentage",
      value: percent,
      min_order: null,
      expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24),
      is_active: true,
    });

    // add an in-stock product to cart
    const { Op } = require("sequelize");
    const product = await db.products.findOne({ where: { quantity_in_stock: { [Op.gt]: 5 } } });
    expect(product).toBeDefined();

    await request(app).post("/cart/add").set("Authorization", `Bearer ${token}`).send({ product_id: product.id, quantity: 1 });

    // place order with discount code
    const res = await request(app).post("/order").set("Authorization", `Bearer ${token}`).send({
      shippingAddress: {
        firstName: "Order",
        lastName: "User",
        email: uniqueEmail,
        taxId: "00011122233",
        phone: "1234567890",
        country: "Turkey",
        street: "Some Street",
        city: "Istanbul",
        state: "IST",
        zip: "34000",
      },
      payment: { method: "credit_card" },
      discount_code: code,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("invoice");
    const invoice = res.body.invoice;
    // invoice.discount should be > 0 and approx (price + shipping) * percent / 100
    expect(invoice).toHaveProperty("discount");
    expect(Number(invoice.discount)).toBeGreaterThanOrEqual(0);

    // uses_count incremented
    const dbCode = await db.discount_codes.findOne({ where: { code } });
    expect(dbCode).toBeDefined();
    expect(Number(dbCode.uses_count || 0)).toBeGreaterThanOrEqual(1);
  });

  test("GET /discount returns camelCase fields for frontend", async () => {
    // login as sales manager (exists in seed data)
    const loginRes = await request(app).post("/auth/login").send({ email: "elif.sales@gmail.com", password: "123456" });
    const salesToken = loginRes.body.token;
    expect(salesToken).toBeDefined();

    const code = `CMCASE${Date.now()}`;
    await db.discount_codes.create({
      code,
      type: "fixed",
      value: 5,
      min_order: null,
      expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24),
      is_active: true,
    });

    const res = await request(app).get("/discount").set("Authorization", `Bearer ${salesToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.codes)).toBe(true);
    const found = (res.body.codes || []).find((c: any) => c.code === code);
    expect(found).toBeDefined();
    // fields expected by frontend
    expect(found).toHaveProperty("id");
    expect(found).toHaveProperty("code");
    expect(found).toHaveProperty("type");
    expect(found).toHaveProperty("value");
    expect(found).toHaveProperty("minOrder");
    expect(found).toHaveProperty("expires");
    expect(found).toHaveProperty("active");
    expect(found).toHaveProperty("uses");
  });
});
