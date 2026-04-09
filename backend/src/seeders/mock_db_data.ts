// mock data for testing
// DO NOT FORGET TO REMOVE THIS BEFORE PRODUCTION DEPLOYMENT

// ID, name, model,serial number, description, quantity in stocks, price, 
// warranty status, and distributor information.

import { Op } from "sequelize";
import db from "../entities";

const mockProducts = [
  {
    id: 1,
    name: "ruj",
    model: "ruj_mavi",
    serial_number: "ruj123",
    description: "mavi ruj, parlak.",
    quantity_in_stock: 50,
    price: 129.99,
    warranty_status: true,
    distributor_info: "rujcu",
  },
  {
    id: 2,
    name: "nemlendirici-300",
    model: "nem-300",
    serial_number: "nm_301",
    description: "300 kat nemlendirme gucu, cildi yumusatir.",
    quantity_in_stock: 75,
    price: 59.95,
    warranty_status: true,
    distributor_info: "su",
  },
  {
    id: 3,
    name: "goz kalemi yesil",
    model: "gky_1",
    serial_number: "gky_123",
    description: "yesil gozler icin yesil kalem, uzun sure kalici.",
    quantity_in_stock: 30,
    price: 349.99,
    warranty_status: true,
    distributor_info: "Luma Displays",
  },
  {
    id: 4,
    name: "oje pembe",
    model: "ojep1",
    serial_number: "oj-31",
    description: "aynisi bende de var, cok iyi.",
    quantity_in_stock: 120,
    price: 39.9,
    warranty_status: false,
    distributor_info: "ojeci oya",
  },
  {
    id: 5,
    name: "sac boyasi sari",
    model: "rus_201",
    serial_number: "SN-RUS2002",
    description: "tek dokunusta sari saclar, uzun sure kalici rus guzelligi.",
    quantity_in_stock: 40,
    price: 89.5,
    warranty_status: true,
    distributor_info: "russia",
  },
];

export async function seedMockProducts() {
  const serials = mockProducts.map((item) => item.serial_number);
  const existing = await db.products.findAll({
    where: { serial_number: { [Op.in]: serials } },
  });

  const existingSerials = new Set(existing.map((product: any) => product.serial_number));
  const toCreate = mockProducts.filter(
    (product: any) => !existingSerials.has(product.serial_number)
  );

  if (toCreate.length === 0) {
    console.log("Mock products already exist, skipping seeding.");
    return;
  }

  await db.products.bulkCreate(toCreate);
  console.log(`Seeded ${toCreate.length} mock products.`);
}