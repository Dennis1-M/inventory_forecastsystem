// routes/forecastRoutes.js
import { PrismaClient } from "@prisma/client";
import express from "express";
import {
  getForecastHistory,
  getLatestForecast,
  runForecastForProduct,
  saveForecast,
} from "../controllers/forecastController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/forecast/run  -> trigger forecast (manual)
router.post("/run", verifyToken, runForecastForProduct);

// POST /api/forecast/save -> save existing predictions into DB (manual)
router.post("/save", verifyToken, saveForecast);

// GET /api/forecast/history/:productId -> all runs + points
router.get("/history/:productId", verifyToken, getForecastHistory);

/**
 * GET /api/forecast/:productId
 * - returns latest run + points if exists
 * - if none exists -> auto-run model (calls runForecastForProduct) and returns the new run
 */
router.get("/:productId", verifyToken, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const horizon = Number(req.query.horizon) || 14;
    if (!productId) return res.status(400).json({ error: "Invalid productId" });

    const existing = await getLatestForecast(productId);
    if (existing) return res.json({ ok: true, run: existing });

    // No existing forecast — run automatically
    req.body = { productId, horizon }; // inject body for runForecastForProduct
    return runForecastForProduct(req, res);
  } catch (err) {
    console.error("GET /:productId error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
