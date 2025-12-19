// backend/services/forecastService.js
// --------------------------------------------------
// Service to run forecast and trigger alerts
// --------------------------------------------------

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { runAlertEngineForProduct } from "./alertEngine.js"; // use alert engine for alerts

const prisma = new PrismaClient();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5002";

/**
 * Runs forecast for a single product, saves the forecast in DB,
 * and triggers the alert engine based on the forecast.
 * @param {number} productId - ID of the product
 * @param {number} horizon - Number of days to forecast
 */
export async function runForecastForProductInternal(productId, horizon = 14) {
  try {
    // ------------------------------
    // 1. Fetch product
    // ------------------------------
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { ok: false, error: "Product not found." };

    // ------------------------------
    // 2. Call Python ML Service
    // ------------------------------
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/run`, { productId, horizon });
    const mlData = mlResponse.data;

    if (!mlData || mlData.error) {
      return { ok: false, error: mlData.error || "ML Service returned an error." };
    }

    // ------------------------------
    // 3. Save forecast run + points into DB
    // ------------------------------
    const latestRun = await prisma.forecastRun.create({
      data: {
        productId,
        method: mlData.model,
        horizon,
        mae: mlData.mae,
        accuracy: mlData.accuracy,
        points: {
          create: mlData.predictions.map(p => ({
            period: new Date(p.period),
            predicted: p.predicted,
            lower95: p.lower95 ?? null,
            upper95: p.upper95 ?? null
          }))
        }
      },
      include: { points: true, product: true }
    });

    // ------------------------------
    // 4. Run alert engine based on forecast
    // ------------------------------
    await runAlertEngineForProduct(productId);

    // ------------------------------
    // 5. Return forecast info
    // ------------------------------
    return {
      ok: true,
      run: latestRun,
      predictedTotal: latestRun.points.reduce((sum, p) => sum + p.predicted, 0)
    };

  } catch (err) {
    console.error("ForecastService Error:", err.message);
    return { ok: false, error: err.message };
  }
}

// ----------------------
// TEST FORECAST
// ----------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const testProductId = 1;
  runForecastForProductInternal(testProductId, 14)
    .then(console.log)
    .catch(console.error)
    .finally(() => process.exit());
}
