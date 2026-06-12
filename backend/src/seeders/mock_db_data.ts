// mock data for testing
// DO NOT FORGET TO REMOVE THIS BEFORE PRODUCTION DEPLOYMENT

// ID, name, model,serial number, description, quantity in stocks, price,
// warranty status, and distributor information.

import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import db from "../entities";
import bcrypt from "bcrypt";
import { createInvoicePdfBuffer } from "../utils/invoicePdf";

const mockProducts = [
  {
    name: "Velvet Matte Lipstick",
    brand: "LumaBelle",
    category: "makeup",
    subcategory: "lipstick",
    model: "Velvet Matte Pro",
    serial_number: "LB-VML-001",
    description: "A smooth matte lipstick with rich color payoff and comfortable all-day wear.",
    quantity_in_stock: 24,
    price: 28,
    original_price: 35,
    rating: 4.6,
    review_count: 18,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa",
    badge: "BEST",
    warranty_status: true,
    distributor_info: "LumaBelle International",
  },
  {
    name: "Radiance Boost Serum",
    brand: "GlowLab",
    category: "skincare",
    subcategory: "serums",
    model: "Radiance Pro",
    serial_number: "GL-RBS-002",
    description: "A brightening serum with vitamin C, niacinamide, and hyaluronic acid.",
    quantity_in_stock: 0,
    price: 54,
    original_price: 68,
    rating: 4.7,
    review_count: 24,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
    badge: "NEW",
    warranty_status: true,
    distributor_info: "GlowLab Cosmetics",
  },
  {
    name: "Pro Glow Eyeshadow Palette",
    brand: "LumaBelle",
    category: "makeup",
    subcategory: "eyeshadow",
    model: "Pro Glow 12",
    serial_number: "LB-PGP-003",
    description: "A 12-shade eyeshadow palette with matte, shimmer, and metallic finishes.",
    quantity_in_stock: 1,
    price: 62,
    original_price: null,
    rating: 4.8,
    review_count: 13,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796",
    badge: "BEST",
    warranty_status: true,
    distributor_info: "LumaBelle International",
  },
  {
    name: "Men's Beard and Face Kit",
    brand: "ForHim",
    category: "men-care",
    subcategory: "beard-care",
    model: "Beard Face Kit",
    serial_number: "FH-BFK-004",
    description: "A grooming kit with beard oil, cleanser, and lightweight moisturizer.",
    quantity_in_stock: 0,
    price: 48,
    original_price: 60,
    rating: 4.3,
    review_count: 8,
    image: "https://images.unsplash.com/photo-1621607512214-68297480165e",
    badge: "NEW",
    warranty_status: true,
    distributor_info: "ForHim Grooming Co.",
  },
  {
    name: "Men's Active Cleanser",
    brand: "ForHim",
    category: "men-care",
    subcategory: "face-wash",
    model: "Active Cleanser",
    serial_number: "FH-MAC-005",
    description: "A daily facial cleanser made for active skin and post-workout refresh.",
    quantity_in_stock: 45,
    price: 22,
    original_price: 28,
    rating: 4.2,
    review_count: 6,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03",
    badge: null,
    warranty_status: true,
    distributor_info: "ForHim Grooming Co.",
  },
  {
    name: "Aurore Collection",
    brand: "Aurore",
    category: "makeup",
    subcategory: "blush",
    model: "Signature Trio",
    serial_number: "AU-LPC-006",
    description: "A gift-ready set of three signature blushes for day, evening, and special occasions.",
    quantity_in_stock: 9,
    price: 89,
    original_price: null,
    rating: 4.6,
    review_count: 9,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601",
    badge: "LIMITED",
    warranty_status: true,
    distributor_info: "Aurore Paris",
  },
  {
    name: "Complete Skincare Bundle",
    brand: "GlowLab",
    category: "skincare",
    subcategory: "moisturizers",
    model: "Complete Set",
    serial_number: "GL-CSB-007",
    description: "A full skincare routine with cleanser, toner, serum, moisturizer, and SPF.",
    quantity_in_stock: 0,
    price: 118,
    original_price: 160,
    rating: 4.4,
    review_count: 4,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
    badge: "SALE",
    warranty_status: true,
    distributor_info: "GlowLab Cosmetics",
  },
  {
    name: "Silk Repair Hair Oil",
    brand: "HairLux",
    category: "haircare",
    subcategory: "hair-oil",
    model: "Silk Repair Oil",
    serial_number: "HL-SHO-008",
    description: "A lightweight hair oil that adds shine and helps smooth dry ends.",
    quantity_in_stock: 27,
    price: 38,
    original_price: null,
    rating: 4.5,
    review_count: 8,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
    badge: "NEW",
    warranty_status: true,
    distributor_info: "HairLux Laboratories",
  },
  {
    name: "Deep Hydration Face Cream",
    brand: "GlowLab",
    category: "skincare",
    subcategory: "moisturizers",
    model: "Hydration Cream",
    serial_number: "GL-DHC-009",
    description: "A rich face cream that supports soft, hydrated skin through the day.",
    quantity_in_stock: 36,
    price: 42,
    original_price: null,
    rating: 4.3,
    review_count: 7,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b",
    badge: null,
    warranty_status: true,
    distributor_info: "GlowLab Cosmetics",
  },
  {
    name: "Volumizing Shampoo",
    brand: "HairLux",
    category: "haircare",
    subcategory: "shampoo",
    model: "Volume Shampoo",
    serial_number: "HL-VS-010",
    description: "A gentle shampoo that cleanses roots and gives fine hair a fuller look.",
    quantity_in_stock: 22,
    price: 26,
    original_price: 32,
    rating: 4.1,
    review_count: 5,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d",
    badge: null,
    warranty_status: true,
    distributor_info: "HairLux Laboratories",
  },
  {
    name: "Soft Focus Foundation",
    brand: "LumaBelle",
    category: "makeup",
    subcategory: "foundation",
    model: "Soft Focus 24H",
    serial_number: "LB-SFF-011",
    description: "A lightweight foundation with buildable coverage and a soft natural finish.",
    quantity_in_stock: 28,
    price: 46,
    original_price: 58,
    rating: 4.5,
    review_count: 12,
    image: "https://images.unsplash.com/photo-1631214540553-ff044a3ff3d4",
    badge: "NEW",
    warranty_status: true,
    distributor_info: "LumaBelle International",
  },
  {
    name: "Lift and Curl Mascara",
    brand: "LumaBelle",
    category: "makeup",
    subcategory: "mascara",
    model: "Lift Curl Black",
    serial_number: "LB-LCM-012",
    description: "A rich black mascara designed to lift lashes and hold curl without clumping.",
    quantity_in_stock: 41,
    price: 24,
    original_price: null,
    rating: 4.4,
    review_count: 8,
    image: "https://images.unsplash.com/photo-1631214540242-3cd8c7d52977",
    badge: null,
    warranty_status: true,
    distributor_info: "LumaBelle International",
  },
  {
    name: "Rose Cloud Blush",
    brand: "Aurore",
    category: "makeup",
    subcategory: "blush",
    model: "Rose Cloud",
    serial_number: "AU-RCB-013",
    description: "A silky powder blush that blends easily for a fresh rose-toned glow.",
    quantity_in_stock: 7,
    price: 34,
    original_price: 42,
    rating: 4.7,
    review_count: 6,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
    badge: "LIMITED",
    warranty_status: true,
    distributor_info: "Aurore Paris",
  },
  {
    name: "Gentle Foam Cleanser",
    brand: "GlowLab",
    category: "skincare",
    subcategory: "cleansers",
    model: "Gentle Foam",
    serial_number: "GL-GFC-014",
    description: "A soft foaming cleanser that removes daily buildup without stripping the skin.",
    quantity_in_stock: 52,
    price: 29,
    original_price: null,
    rating: 4.2,
    review_count: 5,
    image: "https://images.unsplash.com/photo-1556228578-dd6c1b4f4f76",
    badge: null,
    warranty_status: true,
    distributor_info: "GlowLab Cosmetics",
  },
  {
    name: "Daily Shield Sunscreen SPF 50",
    brand: "GlowLab",
    category: "skincare",
    subcategory: "sunscreen",
    model: "Daily Shield SPF50",
    serial_number: "GL-DSS-015",
    description: "A lightweight SPF 50 sunscreen that layers smoothly under makeup.",
    quantity_in_stock: 19,
    price: 36,
    original_price: 45,
    rating: 4.6,
    review_count: 14,
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273",
    badge: "BEST",
    warranty_status: true,
    distributor_info: "GlowLab Cosmetics",
  },
  {
    name: "Calming Clay Face Mask",
    brand: "PurGlow",
    category: "skincare",
    subcategory: "face-masks",
    model: "Calming Clay",
    serial_number: "PG-CCM-016",
    description: "A creamy clay mask made to refresh skin and calm the look of redness.",
    quantity_in_stock: 13,
    price: 31,
    original_price: null,
    rating: 4.1,
    review_count: 4,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908",
    badge: "NEW",
    warranty_status: true,
    distributor_info: "PurGlow Beauty",
  },
  {
    name: "Smooth Repair Conditioner",
    brand: "HairLux",
    category: "haircare",
    subcategory: "conditioner",
    model: "Smooth Repair",
    serial_number: "HL-SRC-017",
    description: "A nourishing conditioner for softer hair and easier detangling.",
    quantity_in_stock: 25,
    price: 27,
    original_price: 34,
    rating: 4.3,
    review_count: 5,
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388",
    badge: null,
    warranty_status: true,
    distributor_info: "HairLux Laboratories",
  },
  {
    name: "Flexible Hold Styling Cream",
    brand: "HairLux",
    category: "haircare",
    subcategory: "styling",
    model: "Flexible Hold",
    serial_number: "HL-FHC-018",
    description: "A styling cream that controls frizz while keeping hair touchably soft.",
    quantity_in_stock: 11,
    price: 33,
    original_price: null,
    rating: 4.0,
    review_count: 3,
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df",
    badge: null,
    warranty_status: true,
    distributor_info: "HairLux Laboratories",
  },
  {
    name: "Bond Restore Hair Treatment",
    brand: "HairLux",
    category: "haircare",
    subcategory: "treatments",
    model: "Bond Restore",
    serial_number: "HL-BRT-019",
    description: "A weekly treatment for hair that feels dry, weak, or over-styled.",
    quantity_in_stock: 6,
    price: 44,
    original_price: 55,
    rating: 4.8,
    review_count: 11,
    image: "https://images.unsplash.com/photo-1522338140262-f46f5913618a",
    badge: "BEST",
    warranty_status: true,
    distributor_info: "HairLux Laboratories",
  },
  {
    name: "Men's Daily Moisturizer",
    brand: "ForHim",
    category: "men-care",
    subcategory: "moisturizer",
    model: "Daily Moisture",
    serial_number: "FH-DM-020",
    description: "A lightweight moisturizer that absorbs quickly and leaves no greasy finish.",
    quantity_in_stock: 34,
    price: 30,
    original_price: null,
    rating: 4.2,
    review_count: 4,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b",
    badge: null,
    warranty_status: true,
    distributor_info: "ForHim Grooming Co.",
  },
  {
    name: "Travel Grooming Kit",
    brand: "ForHim",
    category: "men-care",
    subcategory: "grooming-kits",
    model: "Travel Grooming",
    serial_number: "FH-TGK-021",
    description: "A compact kit with cleanser, moisturizer, beard comb, and travel pouch.",
    quantity_in_stock: 4,
    price: 64,
    original_price: 80,
    rating: 4.5,
    review_count: 3,
    image: "https://images.unsplash.com/photo-1621607512214-68297480165e",
    badge: "SALE",
    warranty_status: true,
    distributor_info: "ForHim Grooming Co.",
  },
  // ── Demo products A–H (D is intentionally absent; added live by product manager) ──
  {
    name: "Product A – Shimmer Highlighter",
    brand: "LumaBelle",
    category: "makeup",
    subcategory: "highlighter",
    model: "Demo Product A",
    serial_number: "DEMO-A-001",
    description: "A finely milled highlighter powder for a luminous, lit-from-within glow.",
    quantity_in_stock: 0,
    price: 32,
    original_price: null,
    rating: 4.5,
    review_count: 7,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796",
    badge: null,
    warranty_status: true,
    distributor_info: "LumaBelle International",
  },
  {
    name: "Product B – Hydrating Eye Cream",
    brand: "GlowLab",
    category: "skincare",
    subcategory: "eye-care",
    model: "Demo Product B",
    serial_number: "DEMO-B-001",
    description: "A lightweight eye cream that targets puffiness and dark circles.",
    quantity_in_stock: 1,
    price: 45,
    original_price: 55,
    rating: 4.6,
    review_count: 9,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b",
    badge: "NEW",
    warranty_status: true,
    distributor_info: "GlowLab Cosmetics",
  },
  {
    name: "Product C – Rose Petal Toner",
    brand: "PurGlow",
    category: "skincare",
    subcategory: "toners",
    model: "Demo Product C",
    serial_number: "DEMO-C-001",
    description: "A balancing floral toner with rose water extract for a fresh, soft complexion.",
    quantity_in_stock: 8,
    price: 28,
    original_price: null,
    rating: 4.4,
    review_count: 6,
    image: "https://images.unsplash.com/photo-1556228578-dd6c1b4f4f76",
    badge: null,
    warranty_status: true,
    distributor_info: "PurGlow Beauty",
  },
  {
    name: "Product E – Velvet Blush Stick",
    brand: "Aurore",
    category: "makeup",
    subcategory: "blush",
    model: "Demo Product E",
    serial_number: "DEMO-E-001",
    description: "A creamy blush stick that blends seamlessly for a natural flush of color.",
    quantity_in_stock: 12,
    price: 24,
    original_price: null,
    rating: 4.3,
    review_count: 5,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
    badge: null,
    warranty_status: true,
    distributor_info: "Aurore Paris",
  },
  {
    name: "Product F – Rose Water Facial Mist",
    brand: "PurGlow",
    category: "skincare",
    subcategory: "toners",
    model: "Demo Product F",
    serial_number: "DEMO-F-001",
    description: "A refreshing facial mist with pure rose water for instant hydration.",
    quantity_in_stock: 15,
    price: 22,
    original_price: null,
    rating: 4.2,
    review_count: 8,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
    badge: null,
    warranty_status: true,
    distributor_info: "PurGlow Beauty",
  },
  {
    name: "Product G – Vitamin C Brightening Serum",
    brand: "GlowLab",
    category: "skincare",
    subcategory: "serums",
    model: "Demo Product G",
    serial_number: "DEMO-G-001",
    description: "A potent vitamin C serum that visibly brightens and evens skin tone.",
    quantity_in_stock: 18,
    price: 48,
    original_price: 60,
    rating: 4.7,
    review_count: 11,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
    badge: "BEST",
    warranty_status: true,
    distributor_info: "GlowLab Cosmetics",
  },
  {
    name: "Product H – Peptide Night Repair Mask",
    brand: "GlowLab",
    category: "skincare",
    subcategory: "face-masks",
    model: "Demo Product H",
    serial_number: "DEMO-H-001",
    description: "An overnight peptide mask that works while you sleep to restore skin elasticity.",
    quantity_in_stock: 20,
    price: 55,
    original_price: 70,
    rating: 4.8,
    review_count: 14,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908",
    badge: "BEST",
    warranty_status: true,
    distributor_info: "GlowLab Cosmetics",
  },
];

export async function seedMockCategories() {
  const categoryNames = Array.from(new Set(mockProducts.map((product) => product.category)));
  const existing = await db.categories.findAll({
    where: { name: { [Op.in]: categoryNames } },
  });

  const existingNames = new Set(existing.map((category: any) => category.name));
  const toCreate = categoryNames
    .filter((name) => !existingNames.has(name))
    .map((name) => ({ name }));

  if (toCreate.length > 0) {
    await db.categories.bulkCreate(toCreate);
  }
}

export async function seedMockProducts() {
  const preparedMockProducts = mockProducts.map((product) => ({
    ...product,

    // Preserve the original mock rating separately.
    // rating/review_count will be the displayed live values.
    // base_rating/base_review_count will stay as the starting mock values.
    base_rating: product.rating,
    base_review_count: product.review_count,
  }));

  const serials = preparedMockProducts.map((item) => item.serial_number);

  const existing = await db.products.findAll({
    where: { serial_number: { [Op.in]: serials } },
  });

  const existingBySerial = new Map<string, any>(
    existing.map((product: any) => [product.serial_number, product])
  );

  const existingSerials = new Set(existingBySerial.keys());

  const toCreate = preparedMockProducts.filter(
    (product: any) => !existingSerials.has(product.serial_number)
  );

  const toUpdate = preparedMockProducts.filter(
    (product: any) => existingSerials.has(product.serial_number)
  );

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map((product: any) =>
        existingBySerial.get(product.serial_number)?.update(product)
      )
    );
  }

  if (toCreate.length > 0) {
    await db.products.bulkCreate(toCreate);
  }

  console.log(`Seeded ${toCreate.length} and updated ${toUpdate.length} mock products.`);
}

const rawUsers = [
  {
    name: "Elif Customer",
    email: "elif.customer@gmail.com",
    password: "123456",
    role: "customer",
    tax_id: "12345678901",
    phone: "+1234567890",
  },
  {
    name: "Elif Product",
    email: "elif.product@gmail.com",
    password: "123456",
    role: "product_manager",
    tax_id: null,
    phone: null,
  },
  {
    name: "Elif Sales",
    email: "elif.sales@gmail.com",
    password: "123456",
    role: "sales_manager",
    tax_id: null,
    phone: null,
  },
  {
    name: "Dogukan Dogan",
    email: "dogukan.dogan@sabanciuniv.edu",
    password: "123",
    role: "customer",
    tax_id: "98765432101",
    phone: "+905551234567",
  },
];

export async function seedMockUsers() {
  const mockUsers = await Promise.all(
    rawUsers.map(async (user) => ({
      name: user.name,
      email: user.email,
      password_hash: await bcrypt.hash(user.password, 10),
      role: user.role,
      tax_id: user.role === "customer" ? user.tax_id : null,
      phone: (user as any).phone ?? null,
    }))
  );

  const emails = mockUsers.map((u) => u.email);

  const existing = await db.users.findAll({
    where: { email: { [Op.in]: emails } },
  });

  const existingByEmail = new Map(
    existing.map((user: any) => [user.email, user])
  );

  const existingEmails = new Set(existingByEmail.keys());

  const toCreate = mockUsers.filter(
    (user) => !existingEmails.has(user.email)
  );

  const toUpdate = mockUsers.filter(
    (user) => existingEmails.has(user.email)
  );

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate
        .map((user) => existingByEmail.get(user.email))
        .filter(Boolean)
        .map((existingUser: any, index) =>
          existingUser.update(toUpdate[index])
        )
    );
  }

  if (toCreate.length > 0) {
    await db.users.bulkCreate(toCreate);
  }

  console.log(
    `Seeded ${toCreate.length} and updated ${toUpdate.length} mock users.`
  );
}

export async function seedDemoOrders() {
  const user = await db.users.findOne({ where: { email: "dogukan.dogan@sabanciuniv.edu" } });
  if (!user) return;

  // Saved home address for Dogukan (shown on profile)
  await db.addresses.create({
    user_id: user.id,
    label: "Home",
    street: "Orhanli Campus, University Ave",
    city: "Tuzla",
    state: "Istanbul",
    zip: "34956",
    country: "Turkey",
    is_default: true,
  });

  const INVOICES_DIR = path.resolve(process.cwd(), "invoices");
  fs.mkdirSync(INVOICES_DIR, { recursive: true });

  const deliveryAddress = {
    name: "Dogukan Dogan",
    email: "dogukan.dogan@sabanciuniv.edu",
    phone: "+905551234567",
    taxId: "98765432101",
    street: "Orhanli Campus, University Ave",
    city: "Tuzla",
    state: "Istanbul",
    zip: "34956",
    country: "Turkey",
    label: "Dogukan Dogan, Orhanli Campus, University Ave, Tuzla, Istanbul 34956, Turkey",
  };

  const now = Date.now();
  const daysMs = (d: number) => d * 24 * 60 * 60 * 1000;

  // E: >30 days ago (no refund allowed), F: <30 days ago (refund allowed),
  // G: recent processing (cancellation demo), H: recent in-transit
  const orderConfigs: Array<{ serial: string; daysAgo: number; status: "delivered" | "processing" | "in-transit" }> = [
    { serial: "DEMO-E-001", daysAgo: 45, status: "delivered" },
    { serial: "DEMO-F-001", daysAgo: 15, status: "delivered" },
    { serial: "DEMO-G-001", daysAgo:  1, status: "processing" },
    { serial: "DEMO-H-001", daysAgo:  2, status: "in-transit" },
  ];

  for (const config of orderConfigs) {
    const product = await db.products.findOne({ where: { serial_number: config.serial } });
    if (!product) continue;

    const unitPrice = Number(product.price);
    const shipping = unitPrice < 50 ? 5.99 : 0;
    const totalAmount = Number((unitPrice + shipping).toFixed(2));

    const order = await db.orders.create({
      user_id: user.id,
      total_amount: totalAmount,
      status: config.status,
      delivery_address: deliveryAddress,
    });

    const pastDate = new Date(now - daysMs(config.daysAgo));
    await db.sequelize.query(
      `UPDATE orders SET "createdAt" = :date, "updatedAt" = :date WHERE id = :id`,
      { replacements: { date: pastDate, id: order.id } }
    );

    await db.order_items.create({
      order_id: order.id,
      product_id: product.id,
      quantity: 1,
      unit_price: unitPrice,
    });

    const letter = config.serial.split("-")[1]; // "E", "F", "G", "H"
    const invoiceNumber = `INV-DEMO-${letter}`;
    const pdfFilename = `invoice-${invoiceNumber}.pdf`;

    const pdfBuffer = createInvoicePdfBuffer({
      invoiceNumber,
      issuedAt: pastDate.toISOString(),
      orderId: order.id,
      status: config.status,
      customerName: "Dogukan Dogan",
      customerEmail: "dogukan.dogan@sabanciuniv.edu",
      customerPhone: "+905551234567",
      customerTaxId: "98765432101",
      shippingAddress: deliveryAddress.label,
      items: [{ productName: product.name, quantity: 1, unitPrice, lineTotal: unitPrice }],
      subtotal: unitPrice,
      shipping,
      total: totalAmount,
    });

    fs.writeFileSync(path.join(INVOICES_DIR, pdfFilename), pdfBuffer);

    await db.invoices.create({
      invoice_number: invoiceNumber,
      file_name: pdfFilename,
      customer_name: "Dogukan Dogan",
      amount: totalAmount,
      order_id: order.id,
    });

    await db.sequelize.query(
      `UPDATE invoices SET "createdAt" = :date, "updatedAt" = :date WHERE order_id = :orderId`,
      { replacements: { date: pastDate, orderId: order.id } }
    );
  }

  console.log("Demo orders seeded for Dogukan Dogan.");
}
