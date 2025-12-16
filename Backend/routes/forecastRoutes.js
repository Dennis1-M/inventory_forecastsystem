import express from "express";
import {
    getForecastHistory,
    getLatestForecast,
    runForecastForProduct,
    saveForecast,
} from "../controllers/forecastController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manually trigger forecast
router.post("/run", protect, runForecastForProduct);

// Save forecast manually or from external script
router.post("/save", protect, saveForecast);

// Full history
router.get("/history/:productId", protect, getForecastHistory);

// Get latest forecast or auto-run if missing
router.get("/:productId", protect, async (req, res) => {
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
