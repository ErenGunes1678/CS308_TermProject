import "./env";

import express from "express";
import cors from "cors";
import { pool } from "./config/db";
import { sequelize } from "./models";
import authRoutes from "./routes/authRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
    res.send("Backend is working");
});

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Database connection is successful",
            time: result.rows[0]
        });
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.use("/auth", authRoutes);

// Sync Sequelize models then start server
sequelize.sync({ alter: true }).then(() => {
    console.log("Database synced successfully");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error: Error) => {
    console.error("Failed to sync database:", error);
    process.exit(1);
});