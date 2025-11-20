import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// --- Global Middleware ---

// Enable CORS for all origins (or configure specific origins for production)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming request bodies in JSON format
app.use(express.json());

// --- Root Endpoint ---
app.get("/", (req, res) => {
    res.json({ message: "AI-Enabled Inventory Forecasting System API is Running", status: "ok" });
});

// --- Public Routes (Authentication) ---
app.use("/api/auth", authRoutes);

// --- Protected API Routes (All other resources) ---
app.use("/api/v1", apiRoutes);

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!", message: err.message });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Optional: Connect to Prisma on startup (Prisma usually handles connection pooling automatically)
    prisma.$connect()
        .then(() => console.log("Database connection successful."))
        .catch(e => console.error("Database connection failed:", e));
});

// Graceful shutdown on termination signal
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    app.close(() => {
        console.log('HTTP server closed');
        prisma.$disconnect();
    });
});