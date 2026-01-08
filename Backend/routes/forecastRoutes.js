import express from "express";
import prisma from "../config/prisma.js";
import {
    compareModels,
    getForecastHistory,
    runForecastForProduct,
    runForecastWithModel,
    saveForecast
} from "../controllers/forecastController.js";
import { evaluateStockoutRisk } from "../forecast2/index.js";
import { runProductForecast } from "../forecast2/scheduler/forecastRunner.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all latest forecasts for dashboard with full details
router.get("/", protect, async (req, res) => {
  try {
    // Get all products with their latest forecast runs and points
    const products = await prisma.product.findMany({
      include: {
        forecastRuns: {
          include: {
            points: {
              orderBy: { period: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        category: true,
        supplier: {
          select: { id: true, name: true }
        },
      },
      take: 100,
    });

    // Transform data for frontend
    const forecasts = await Promise.all(products.map(async (p) => {
      const lastForecast = p.forecastRuns[0];
      
      // Calculate forecasted demand over next 14 days
      const forecastedDemand = lastForecast?.points
        ? lastForecast.points.reduce((sum, pt) => sum + pt.predicted, 0)
        : 0;

      // Evaluate stockout risk
      const stockoutRisk = lastForecast?.points
        ? evaluateStockoutRisk(p.currentStock, lastForecast.points, p.supplier?.leadTimeDays || 3)
        : { riskLevel: 'UNKNOWN', daysToStockout: null };

      // Calculate recommended order quantity
      let recommendedOrder = 0;
      if (forecastedDemand > p.currentStock) {
        recommendedOrder = Math.ceil(forecastedDemand - p.currentStock + (p.lowStockThreshold * 0.5));
      } else if (p.currentStock < p.lowStockThreshold) {
        recommendedOrder = Math.ceil(p.lowStockThreshold * 1.5 - p.currentStock);
      }

      // Determine confidence based on forecast points and method
      let confidence = 0;
      if (lastForecast) {
        confidence = lastForecast.method === 'EXPONENTIAL_SMOOTHING' ? 85 : 70;
        if (lastForecast.accuracy) {
          // Higher accuracy = higher confidence
          confidence = Math.min(95, 90 - (lastForecast.accuracy * 5));
        }
      }

      return {
        id: p.id,
        productName: p.name,
        category: p.category?.name || 'Uncategorized',
        currentStock: p.currentStock,
        lowStockThreshold: p.lowStockThreshold,
        forecastedDemand: Math.round(forecastedDemand * 10) / 10,
        confidence: Math.round(confidence),
        method: lastForecast?.method || 'NONE',
        recommendedOrder: Math.max(0, recommendedOrder),
        riskLevel: stockoutRisk.riskLevel,
        daysToStockout: stockoutRisk.daysToStockout,
        supplier: p.supplier?.name || 'None',
        leadTime: p.supplier?.leadTimeDays || 3,
        lastUpdated: lastForecast?.createdAt || null,
        forecastPoints: lastForecast?.points?.map(pt => ({
          period: pt.period,
          predicted: Math.round(pt.predicted * 10) / 10,
          lower95: pt.lower95 ? Math.round(pt.lower95 * 10) / 10 : null,
          upper95: pt.upper95 ? Math.round(pt.upper95 * 10) / 10 : null,
        })) || [],
      };
    }));

    // Get products that need reordering
    const reorderRecommendations = forecasts
      .filter(f => f.recommendedOrder > 0)
      .sort((a, b) => b.recommendedOrder - a.recommendedOrder)
      .slice(0, 15);

    // Get high-risk items
    const highRiskItems = forecasts
      .filter(f => f.riskLevel === 'HIGH')
      .sort((a, b) => (a.daysToStockout || 0) - (b.daysToStockout || 0));

    const avgConfidence = forecasts.length > 0
      ? Math.round(forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length)
      : 0;

    const productsWithForecasts = forecasts.filter(f => f.lastUpdated).length;
    const highRiskCount = highRiskItems.length;

    res.json({
      ok: true,
      forecastData: forecasts,
      stats: {
        totalProducts: forecasts.length,
        productsWithForecasts: productsWithForecasts,
        averageConfidence: avgConfidence,
        productsAtRisk: highRiskCount,
        productsNeedingReorder: reorderRecommendations.length,
      },
      reorderRecommendations: reorderRecommendations,
      highRiskItems: highRiskItems.slice(0, 10),
      insights: [
        `${productsWithForecasts} of ${forecasts.length} products have forecasts`,
        `${highRiskCount} products at high stockout risk`,
        `${reorderRecommendations.length} products need reordering`,
        `Average forecast confidence: ${avgConfidence}%`,
      ],
    });
  } catch (err) {
    console.error("GET /forecast error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Manually trigger forecast for a specific product
router.post("/trigger/:productId", protect, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const horizon = Number(req.body.horizon) || 14;

    if (!productId) {
      return res.status(400).json({ error: "Invalid productId" });
    }

    const forecast = await runProductForecast(productId, horizon);
    
    if (!forecast) {
      return res.status(400).json({ error: "Insufficient data to generate forecast" });
    }

    res.json({ ok: true, forecast });
  } catch (err) {
    console.error("POST /forecast/trigger error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Manually trigger forecast (old endpoint)
router.post("/run", protect, runForecastForProduct);

// Save forecast manually or from external script
router.post("/save", protect, saveForecast);

// NEW: Run forecast with specific model
router.post("/run-with-model", protect, runForecastWithModel);

// NEW: Compare multiple models
router.post("/compare-models", protect, compareModels);

// Full history
router.get("/history/:productId", protect, getForecastHistory);

// Get latest forecast with full details
router.get("/:productId", protect, async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        const horizon = Number(req.query.horizon) || 14;

        if (!productId) {
            return res.status(400).json({ error: "Invalid productId" });
        }

        // Get product with latest forecast
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            forecastRuns: {
              include: {
                points: {
                  orderBy: { period: 'asc' },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            supplier: true,
          },
        });

        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }

        const lastForecast = product.forecastRuns[0];

        // Auto-run forecast if none exists
        if (!lastForecast) {
          const newForecast = await runProductForecast(productId, horizon);
          if (!newForecast) {
            return res.status(400).json({ error: "Could not generate forecast" });
          }
        }

        res.json({ 
          ok: true, 
          product: product.name,
          forecast: lastForecast || null
        });
    } catch (err) {
        console.error("GET /forecast/:productId error:", err);
        return res.status(500).json({ ok: false, error: err.message });
    }
});

export default router;
