import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import forecastRoutes from "./routes/forecastRoutes.js";

import cron from "node-cron";
import { runExpiryAndAgingChecks } from "./controllers/alertJob.js";

// ✅ IMPORT forecast cron scheduler
import { scheduleForecastCron } from "./jobs/forecastCron.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/products", productRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/suppliers", supplierRoutes);

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/sales", salesRoutes);

app.use("/api/alerts", alertRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/forecast", forecastRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ✅ START FORECAST CRON JOB (every 6 hours)
scheduleForecastCron();

// Existing: Run expiry and aging alerts daily at 02:00 AM
cron.schedule("0 2 * * *", async () => {
  try {
    await runExpiryAndAgingChecks();
    console.log("Expiry & aging checks run");
  } catch (e) {
    console.error("Expiry job error", e);
  }
});
