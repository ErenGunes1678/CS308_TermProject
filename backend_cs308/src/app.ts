import express from "express";
import { pool } from "./config/db";

const app = express();
const PORT = 3000;

app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});