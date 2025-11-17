// routes/forecastRoutes.js
import express from "express";
import {
  getForecastHistory,
  getLatestForecast,
  runForecastForProduct,
  saveForecast,
} from "../controllers/forecastController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ------------------------------------------------------
// POST /api/forecast/run  -> manual run
// ------------------------------------------------------
router.post("/run", verifyToken, runForecastForProduct);

// ------------------------------------------------------
// POST /api/forecast/save -> save predictions manually
// ------------------------------------------------------
router.post("/save", verifyToken, saveForecast);

// ------------------------------------------------------
// GET /api/forecast/history/:productId -> all runs
// ------------------------------------------------------
router.get("/history/:productId", verifyToken, getForecastHistory);

// ------------------------------------------------------
// GET /api/forecast/:productId
// Returns latest OR auto-runs if missing
// ------------------------------------------------------
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

    // No previous run → auto-run forecast
    req.body = { productId, horizon };
    return runForecastForProduct(req, res);

  } catch (err) {
    console.error("GET /:productId error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
