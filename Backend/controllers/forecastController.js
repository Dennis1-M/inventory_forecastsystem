// controllers/forecastController.js
// -------------------------------------------------------
// Forecast Controller (FIXED: uses SaleItem instead of Sale)
// -------------------------------------------------------

// External Imports

import colors from "colors";
import prisma from "../config/prisma.js";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:5002";

// -------------------------------------------------------
// Helper: Consistent Forecast Error Handling
// -------------------------------------------------------
const handleForecastingError = (res, error, operation) => {
    console.error(colors.red(`Forecasting Error during ${operation}:`), error);

    if (error.code === "ECONNREFUSED" || error.message?.includes("ECONNREFUSED")) {
        return res.status(503).json({
            message: "Forecasting service is unavailable. Ensure FastAPI is running.",
            service_url: FASTAPI_URL,
        });
    }

    return res.status(500).json({
        message: `Failed to ${operation}.`,
        error: error.message,
    });
};

// -------------------------------------------------------
// Internal: Prepare Historical Sales Data (FIXED)
// -------------------------------------------------------
const getHistoricalData = async (productId) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    const saleItems = await prisma.saleItem.findMany({
        where: {
            productId,
            sale: {
                createdAt: { gte: sixMonthsAgo },
            },
        },
        select: {
            quantity: true,
            sale: {
                select: { createdAt: true },
            },
        },
    });

    const dailyTotals = {};

    saleItems.forEach(({ quantity, sale }) => {
        const date = sale.createdAt.toISOString().split("T")[0];
        dailyTotals[date] = (dailyTotals[date] || 0) + quantity;
    });

    return Object.entries(dailyTotals)
        .map(([date, quantity]) => ({ date, quantity }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// -------------------------------------------------------
// 1. RUN FORECAST
// -------------------------------------------------------
export const runForecastForProduct = async (req, res) => {
    const { productId, horizon = 14 } = req.body;
    const pId = Number(productId);

    if (!pId) return res.status(400).json({ error: "Invalid productId." });

    try {
        const historical = await getHistoricalData(pId);

        if (historical.length < 30) {
            return res.status(400).json({
                message: "Not enough history (need 30+ days).",
                dataPoints: historical.length,
            });
        }

        const response = await fetch(`${FASTAPI_URL}/forecast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_id: pId,
                periods: Number(horizon),
                historical_data: historical,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).json({
                message: "Forecasting ML service returned an error.",
                details: text,
            });
        }

        const forecastData = await response.json();

        const saved = await prisma.forecastRun.create({
            data: {
                productId: pId,
                horizon: Number(horizon),
                forecastJson: forecastData,
            },
        });

        return res.json({
            ok: true,
            message: "Forecast generated & saved.",
            run: saved,
        });

    } catch (err) {
        return handleForecastingError(res, err, "runForecastForProduct");
    }
};

// -------------------------------------------------------
// Alias for routes
// -------------------------------------------------------
export const generateForecast = async (req, res) => {
    return runForecastForProduct(req, res);
};

// -------------------------------------------------------
// 2. SAVE FORECAST
// -------------------------------------------------------
export const saveForecast = async (req, res) => {
    const { productId, horizon = 14, forecast } = req.body;

    if (!productId || !forecast) {
        return res.status(400).json({ error: "productId and forecast required." });
    }

    try {
        const saved = await prisma.forecastRun.create({
            data: {
                productId: Number(productId),
                horizon: Number(horizon),
                forecastJson: forecast,
            },
        });

        return res.json({ ok: true, saved });

    } catch (err) {
        return handleForecastingError(res, err, "saveForecast");
    }
};

// -------------------------------------------------------
// 3. GET FORECAST HISTORY
// -------------------------------------------------------
export const getForecastHistory = async (req, res) => {
    const productId = Number(req.params.productId);

    if (!productId) return res.status(400).json({ error: "Invalid productId" });

    try {
        const runs = await prisma.forecastRun.findMany({
            where: { productId },
            orderBy: { createdAt: "desc" },
        });

        return res.json({ ok: true, runs });

    } catch (err) {
        return handleForecastingError(res, err, "getForecastHistory");
    }
};

// -------------------------------------------------------
// 4. GET LATEST FORECAST
// -------------------------------------------------------
export const getLatestForecast = async (productId) => {
    return prisma.forecastRun.findFirst({
        where: { productId },
        orderBy: { createdAt: "desc" },
    });
};
// -------------------------------------------------------
// 5. RUN FORECAST WITH MODEL SELECTION
// -------------------------------------------------------
export const runForecastWithModel = async (req, res) => {
    const { productId, horizon = 14, modelType = 'auto' } = req.body;
    const pId = Number(productId);

    if (!pId) return res.status(400).json({ error: "Invalid productId." });

    // Validate model type
    const validModels = ['auto', 'moving_average', 'exponential_smoothing', 'linear_regression', 'xgboost', 'lstm'];
    if (!validModels.includes(modelType)) {
        return res.status(400).json({
            error: "Invalid modelType.",
            validModels
        });
    }

    try {
        const historical = await getHistoricalData(pId);

        // Check minimum data requirements based on model
        const minDataPoints = {
            'moving_average': 7,
            'exponential_smoothing': 14,
            'linear_regression': 30,
            'xgboost': 60,
            'lstm': 90,
            'auto': 14
        };

        const required = minDataPoints[modelType];
        if (historical.length < required) {
            return res.status(400).json({
                message: `Not enough history for ${modelType}. Need ${required}+ days, have ${historical.length}.`,
                dataPoints: historical.length,
                required
            });
        }

        // Use local model selector instead of FastAPI
        const { runForecastModel } = await import('../forecast2/models/modelSelector.js');
        const forecastResult = await runForecastModel(historical, Number(horizon), modelType);

        // Save forecast to database
        const saved = await prisma.forecastRun.create({
            data: {
                productId: pId,
                horizon: Number(horizon),
                forecastJson: {
                    method: forecastResult.method,
                    predictions: forecastResult.points,
                    metrics: forecastResult.metrics,
                    note: forecastResult.note,
                    fallback: forecastResult.fallback,
                    timestamp: new Date().toISOString()
                },
            },
        });

        return res.json({
            ok: true,
            message: `Forecast generated using ${forecastResult.method}.`,
            method: forecastResult.method,
            metrics: forecastResult.metrics,
            predictions: forecastResult.points,
            run: saved,
            fallback: forecastResult.fallback || false
        });

    } catch (err) {
        return handleForecastingError(res, err, "runForecastWithModel");
    }
};

// -------------------------------------------------------
// 6. COMPARE MODELS
// -------------------------------------------------------
export const compareModels = async (req, res) => {
    const { productId, horizon = 14 } = req.body;
    const pId = Number(productId);

    if (!pId) return res.status(400).json({ error: "Invalid productId." });

    try {
        const historical = await getHistoricalData(pId);

        if (historical.length < 30) {
            return res.status(400).json({
                message: "Need at least 30 days of history to compare models.",
                dataPoints: historical.length
            });
        }

        const { runForecastModel } = await import('../forecast2/models/modelSelector.js');

        // Run multiple models
        const models = ['exponential_smoothing', 'linear_regression'];
        
        // Add XGBoost if enough data
        if (historical.length >= 60) {
            models.push('xgboost');
        }

        const results = [];

        for (const modelType of models) {
            try {
                const result = await runForecastModel(historical, Number(horizon), modelType);
                results.push({
                    model: result.method,
                    predictions: result.points,
                    metrics: result.metrics,
                    success: true
                });
            } catch (error) {
                results.push({
                    model: modelType,
                    error: error.message,
                    success: false
                });
            }
        }

        return res.json({
            ok: true,
            productId: pId,
            dataPoints: historical.length,
            horizon,
            models: results
        });

    } catch (err) {
        return handleForecastingError(res, err, "compareModels");
    }
};