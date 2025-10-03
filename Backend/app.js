import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { sequelize } from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import saleRecordRoutes from "./routes/saleRecordRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRecordRoutes);
app.use("/api/alerts", alertRoutes);

// DB connection test
sequelize.authenticate()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB connection error:", err));

export default app;
