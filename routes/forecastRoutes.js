import express from "express";
import {
  getForecastHistory,
  getLatestForecast,
  runForecastForProduct,
  saveForecast,
} from "../controllers/forecastController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manually trigger forecast
router.post("/run", verifyToken, runForecastForProduct);

// Save forecasts from ML script or manual input
router.post("/save", verifyToken, saveForecast);

// History of forecast runs
router.get("/history/:productId", verifyToken, getForecastHistory);

// Get latest forecast; auto-run if missing
router.get("/:productId", verifyToken, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const horizon = Number(req.query.horizon) || 14;

    if (!productId) {
      return res.status(400).json({ error: "Invalid productId" });
    }

    const existing = await getLatestForecast(productId);

    if (existing) {
      return res.json({ ok: true, run: existing });
    }

    // Auto-run forecast if none exists
    req.body = { productId, horizon };
    return runForecastForProduct(req, res);

  } catch (err) {
    console.error("GET /forecast/:productId error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
