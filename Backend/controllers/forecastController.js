// controllers/forecastController.js
// -------------------------------------------------------
// Forecast Controller (FIXED: uses SaleItem instead of Sale)
// -------------------------------------------------------

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
