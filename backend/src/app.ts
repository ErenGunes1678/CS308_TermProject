import "./env";

import express from "express";
import cors from "cors";
import { sequelize } from "./entities";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import { seedMockProducts } from "./seeders/mock_db_data"; // Mock data seeding function

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
    res.send("Backend is working");
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);

// Sync Sequelize models then start server
sequelize.authenticate()
  .then(() => {
    console.log("Database connected!");

    return sequelize.sync({ alter: true });
  })
  .then(() => {
    seedMockProducts();
    console.log("Database synced successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Startup error:", error);
    process.exit(1);
  });