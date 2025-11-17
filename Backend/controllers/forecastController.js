// controllers/forecastController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:5002";

/** -------------------------------------------------------------------
 *  Normalize predictions returned by Flask model
 * -------------------------------------------------------------------*/
function normalizePredictionsFromFlask(payload) {
  if (!payload) return [];

  const raw = Array.isArray(payload)
    ? payload
    : payload.predictions ??
      payload.data ??
      payload.forecast ??
      [];

  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    const date =
      item.date ??
      item.ds ??
      item.period ??
      item.timestamp;

    const value =
      item.yhat ??
      item.predicted ??
      item.value ??
      item.predictedValue ??
      item.predicted_quantity;

    const lower95 =
      item.yhat_lower ??
      item.lower ??
      item.predicted_lower ??
      null;

    const upper95 =
      item.yhat_upper ??
      item.upper ??
      item.predicted_upper ??
      null;

    return {
      date,
      value: Number(value ?? 0),
      lower95: lower95 != null ? Number(lower95) : null,
      upper95: upper95 != null ? Number(upper95) : null,
    };
  });
}

/** -------------------------------------------------------------------
 *  INTERNAL FORECAST RUN (used by POST /run AND auto-run)
 * -------------------------------------------------------------------*/
export async function runForecastForProductInternal(productId, horizon = 14) {
  if (!productId) throw new Error("productId required");

  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });
  if (!product) return { ok: false, error: "Product not found" };

  /* -------- CALL PYTHON FORECAST SERVICE -------- */
  let resp;
  try {
    resp = await fetch(`${FASTAPI_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: Number(productId),
        horizon: Number(horizon),
      }),
    });
  } catch (err) {
    return {
      ok: false,
      error: "Forecast service unreachable",
      details: err.message,
    };
  }

  let raw;
  try {
    raw = await resp.json();
  } catch {
    raw = null;
  }

  if (!resp.ok) {
    return {
      ok: false,
      error: "Forecast service error",
      details: raw ?? resp.statusText,
    };
  }

  /* -------- NORMALIZE PREDICTIONS -------- */
  const preds = normalizePredictionsFromFlask(raw);

  if (!preds || preds.length === 0) {
    return {
      ok: false,
      error: "Forecast service returned no predictions",
      raw,
    };
  }

  /* -------- SAVE RUN -------- */
  const run = await prisma.forecastRun.create({
    data: {
      productId: Number(productId),
      method: raw.model ?? "ARIMA",
      params: raw.params ?? {},
      horizon: preds.length,
      mae: raw.mae ?? null,
      accuracy: raw.accuracy ?? null,
    },
  });

  /* -------- SAVE FORECAST POINTS -------- */
  const pointsData = preds.map((p) => ({
    runId: run.id,
    period: new Date(p.date),
    predicted: Number(p.value),
    lower95: p.lower95,
    upper95: p.upper95,
  }));

  await prisma.forecastPoint.createMany({ data: pointsData });

  /* -------- ALERT LOGIC -------- */
  let alertCreated = null;

  try {
    const stock = Number(product.stock ?? 0);
    const predictedTotal = pointsData
      .reduce((sum, p) => sum + p.predicted, 0);

    if (stock < predictedTotal) {
      alertCreated = await prisma.alert.create({
        data: {
          alertType: "FORECAST",
          message: `⚠️ ${product.name} likely stock-out in ${horizon} days. Predicted demand ${predictedTotal.toFixed(
            1
          )} > stock ${stock}.`,
          productId: product.id,
        },
      });
    }

    if (predictedTotal < stock * 0.3) {
      alertCreated = await prisma.alert.create({
        data: {
          alertType: "FORECAST",
          message: `ℹ️ ${product.name} may be overstocked. Predicted (${predictedTotal.toFixed(
            1
          )}) < 30% of stock (${stock}).`,
          productId: product.id,
        },
      });
    }
  } catch (err) {
    console.error("Alert creation error:", err);
  }

  return {
    ok: true,
    run,
    predictions: preds,
    alertCreated,
  };
}

/** -------------------------------------------------------------------
 *  EXPRESS WRAPPERS
 * -------------------------------------------------------------------*/

export const runForecastForProduct = async (req, res) => {
  try {
    const { productId, horizon } = req.body;
    const result = await runForecastForProductInternal(
      productId,
      horizon || 14
    );

    if (!result.ok) return res.status(400).json(result);
    return res.json(result);
  } catch (err) {
    console.error("runForecastForProduct ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const saveForecast = async (req, res) => {
  try {
    const {
      productId,
      predictions,
      method,
      params,
      horizon,
      mae,
      accuracy,
    } = req.body;

    if (!productId)
      return res.status(400).json({ error: "productId required" });

    if (!predictions || !Array.isArray(predictions))
      return res.status(400).json({ error: "predictions required" });

    const run = await prisma.forecastRun.create({
      data: {
        productId: Number(productId),
        method: method ?? "MANUAL",
        params: params ?? {},
        horizon: predictions.length,
        mae: mae ?? null,
        accuracy: accuracy ?? null,
      },
    });

    const points = predictions.map((p) => ({
      runId: run.id,
      period: new Date(p.date),
      predicted: Number(p.value),
      lower95: p.lower95 ?? null,
      upper95: p.upper95 ?? null,
    }));

    await prisma.forecastPoint.createMany({ data: points });

    return res.json({
      ok: true,
      runId: run.id,
      pointsSaved: points.length,
    });
  } catch (err) {
    console.error("saveForecast ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getForecastHistory = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    if (!productId)
      return res.status(400).json({ error: "Invalid productId" });

    const runs = await prisma.forecastRun.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: {
        points: { orderBy: { period: "asc" } },
      },
    });

    return res.json({
      ok: true,
      productId,
      history: runs,
    });
  } catch (err) {
    console.error("getForecastHistory ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getLatestForecast = async (productId) => {
  try {
    return await prisma.forecastRun.findFirst({
      where: { productId: Number(productId) },
      orderBy: { createdAt: "desc" },
      include: {
        points: { orderBy: { period: "asc" } },
      },
    });
  } catch (err) {
    console.error("getLatestForecast ERROR:", err);
    return null;
  }
};
