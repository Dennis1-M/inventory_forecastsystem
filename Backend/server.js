import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express from "express";

// Routes
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// 🧩 Middleware
app.use(express.json());

// 🚀 Root route
app.get("/", (req, res) => {
  res.send("🚀 Inventory API is running with Prisma and Auth!");
});

// 🔐 Auth routes
app.use("/api/auth", authRoutes);

// 📦 Product routes
app.use("/api/products", productRoutes);

// 🧾 Inventory routes
app.use("/api/inventory", inventoryRoutes);

// 💰 Sales routes

app.use("/api/sales", saleRoutes);

// ⚠️ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ⚠️ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start server with DB connection
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});
// - --- IGNORE ---
// End of recent edits