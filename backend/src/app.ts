import "./env";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sequelize } from "./entities";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import commentRoutes from "./routes/commentRoutes";
import searchRoutes from "./routes/searchRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import revenueRoutes from "./routes/revenueRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import discountRoutes from "./routes/discountRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import { seedDefaultCategories, seedMockProducts, seedMockUsers } from "./seeders/mock_db_data"; // Mock data seeding function

const app = express();
const PORT = process.env.PORT || 3000;

async function migrateProductCategoryColumn() {
  await sequelize.query(`
    ALTER TABLE IF EXISTS "products"
    DROP CONSTRAINT IF EXISTS "products_category_fkey";
  `);

  await sequelize.query(`
    ALTER TABLE IF EXISTS "products"
    ALTER COLUMN "category" TYPE VARCHAR(255)
    USING "category"::text;
  `);

  await sequelize.query(`
    DROP TYPE IF EXISTS "enum_products_category";
  `);
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true, // required so browser sends cookies
}));

app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/search", searchRoutes);
app.use("/category", categoryRoutes);
app.use("/", commentRoutes);
app.use("/notifications", notificationRoutes);
app.use("/revenue", revenueRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/discount", discountRoutes);
app.use("/invoices", invoiceRoutes);

// Sync Sequelize models then start server (only when run directly, not imported by tests)
if (require.main === module) {
  sequelize.authenticate()
    .then(() => {
      console.log("Database connected!");

      return migrateProductCategoryColumn();
    })
    .then(() => {
      return sequelize.sync({alter: true});
    })
    .then(() => {
      seedDefaultCategories();
      seedMockProducts();
      seedMockUsers();
      console.log("Database synced successfully");

      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Startup error:", error);
      process.exit(1);
    });
}
export default app;
