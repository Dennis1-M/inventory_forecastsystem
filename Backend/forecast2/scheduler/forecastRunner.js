// forecast/scheduler/forecastRunner.js
// Orchestrates forecast execution and persistence

import { prisma } from "../../index.js";
import { getDailyDemandSeries } from "../data/demandSeries.js";
import { runForecastModel } from "../models/modelSelector.js";

/**
 * Run forecast for a single product
 */
export const runProductForecast = async (productId, horizon = 14) => {
  const series = await getDailyDemandSeries(productId);

  if (series.length < 5) return null;

  const result = runForecastModel(series, horizon);

  const forecastRun = await prisma.forecastRun.create({
    data: {
      productId,
      method: result.method,
      horizon,
    },
  });

  await prisma.forecastPoint.createMany({
    data: result.points.map((p) => ({
      runId: forecastRun.id,
      period: p.period,
      predicted: p.predicted,
      lower95: p.lower95,
      upper95: p.upper95,
    })),
  });

  return forecastRun;
};
// forecast/scheduler/forecastRunner.js