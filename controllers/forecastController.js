// controllers/forecastController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const FASTAPI_RUN = process.env.FASTAPI_URL || "http://127.0.0.1:5002";

/** Helper to normalize fastapi prediction shapes */
function normalizePredictions(payload) {
  if (!payload) return [];
  const raw = Array.isArray(payload)
    ? payload
    : payload.predictions ?? payload.data ?? [];
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    const date = item.date ?? item.ds ?? item.period ?? item.timestamp;
    const value =
      item.value ??
      item.yhat ??
      item.predicted ??
      item.predictedValue ??
      item.predicted_quantity;
    const lower95 =
      item.lower95 ??
      item.yhat_lower ??
      item.lower ??
      item.predicted_lower ??
      null;
    const upper95 =
      item.upper95 ??
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

/**
 * Internal: runs forecast for productId, saves run+points, creates alert if needed.
 * Returns an object { ok, run, predictions, alertCreated? }
 */
export async function runForecastForProductInternal(productId, horizon = 14) {
  if (!productId) throw new Error("productId required");

  // 1) Fetch product & sales
  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });
  if (!product) return { ok: false, error: "Product not found" };

  const sales = await prisma.sale.findMany({
    where: { productId: Number(productId) },
    orderBy: { date: "asc" },
  });

  // 2) Call Flask forecast service
  let resp;
  try {
    resp = await fetch(`${FASTAPI_RUN}/run`, {
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
  } catch (e) {
    raw = null;
  }

  if (!resp.ok) {
    return {
      ok: false,
      error: "Forecast service error",
      details: raw ?? resp.statusText,
    };
  }

  const predictions = normalizePredictions(raw);
  if (!predictions.length) {
    return {
      ok: false,
      error: "Forecast service returned no predictions",
      raw,
    };
  }

  // 3) Save ForecastRun
  const run = await prisma.forecastRun.create({
    data: {
      productId: Number(productId),
      method: raw.model ?? raw.method ?? "Prophet",
      params: raw.params ?? raw.meta ?? {},
      horizon: Number(horizon ?? predictions.length),
      mae: raw.mae ?? null,
      accuracy: raw.accuracy ?? null,
    },
  });

  // 4) Save ForecastPoints
  const pointsData = predictions.map((p) => ({
    runId: run.id,
    period: new Date(p.date),
    predicted: Number(p.value),
    lower95: p.lower95 ?? null,
    upper95: p.upper95 ?? null,
  }));

  await prisma.forecastPoint.createMany({ data: pointsData });

  // 5) Check stock vs predicted demand → create alert if needed
  const predictedTotal = pointsData.reduce(
    (s, r) => s + Number(r.predicted || 0),
    0
  );
  let alertCreated = null;

  try {
    if (product.stock != null && Number(product.stock) < predictedTotal) {
      const message = `Predicted demand (${predictedTotal.toFixed(
        1
      )}) over horizon exceeds current stock (${product.stock}).`;
      alertCreated = await prisma.alert.create({
        data: {
          alertType: "FORECAST",
          message,
          productId: product.id,
        },
      });
    }
  } catch (err) {
    console.error("Alert create error:", err);
  }

  return { ok: true, run, predictions, predictedTotal, alertCreated };
}

/** Express wrapper for API */
export const runForecastForProduct = async (req, res) => {
  try {
    const { productId, horizon } = req.body;
    const result = await runForecastForProductInternal(
      productId,
      horizon || 14
    );
    if (!result.ok) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error("runForecastForProduct ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

/** Save forecast (manual) - expects arrays of predictions */
export const saveForecast = async (req, res) => {
  try {
    const { productId, predictions, method, params, horizon, mae, accuracy } =
      req.body;
    if (!productId)
      return res.status(400).json({ error: "productId required" });
    if (!predictions || !Array.isArray(predictions) || predictions.length === 0)
      return res.status(400).json({ error: "predictions required" });

    const run = await prisma.forecastRun.create({
      data: {
        productId: Number(productId),
        method: method ?? "MANUAL",
        params: params ?? {},
        horizon: Number(horizon ?? predictions.length),
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

    return res.json({ ok: true, runId: run.id, pointsSaved: points.length });
  } catch (err) {
    console.error("saveForecast error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/** Get forecast history for product */
export const getForecastHistory = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    if (!productId) return res.status(400).json({ error: "Invalid productId" });

    const runs = await prisma.forecastRun.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: { points: { orderBy: { period: "asc" } } },
    });

    return res.json({ ok: true, productId, history: runs });
  } catch (err) {
    console.error("getForecastHistory error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/** Get latest forecast run + its forecast points */
export const getLatestForecast = async (productId) => {
  try {
    const latestRun = await prisma.forecastRun.findFirst({
      where: { productId: Number(productId) },
      orderBy: { createdAt: "desc" },
      include: { points: { orderBy: { period: "asc" } } },
    });

    return latestRun || null;
  } catch (err) {
    console.error("getLatestForecast error:", err);
    return null;
  }
};
