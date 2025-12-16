import colors from "colors";
import  prisma  from "../config/prisma.js"

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
// Internal: Prepare Historical Sales Data
// -------------------------------------------------------
const getHistoricalData = async (productId) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    const salesData = await prisma.sale.groupBy({
        by: ["saleDate"],
        where: {
            productId,
            saleDate: { gte: sixMonthsAgo },
        },
        _sum: { quantitySold: true },
        orderBy: { saleDate: "asc" },
    });

    return salesData.map((item) => ({
        date: item.saleDate.toISOString().split("T")[0],
        quantity: item._sum.quantitySold || 0,
    }));
};

// -------------------------------------------------------
// 1. RUN FORECAST (called manually or auto-run by route)
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

        const apiUrl = `${FASTAPI_URL}/forecast`;

        const payload = {
            product_id: pId,
            periods: Number(horizon),
            historical_data: historical,
        };

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).json({
                message: "Forecasting ML service returned an error.",
                details: text,
            });
        }

        const forecastData = await response.json();

        // Save forecast to DB
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
// ADD MISSING FUNCTION FOR ROUTES
// -------------------------------------------------------
export const generateForecast = async (req, res) => {
    return runForecastForProduct(req, res);
};

// -------------------------------------------------------
// 2. SAVE FORECAST (manual override or ML push)
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
// 3. GET HISTORY OF FORECASTS FOR PRODUCT
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
    return await prisma.forecastRun.findFirst({
        where: { productId },
        orderBy: { createdAt: "desc" },
    });
};
