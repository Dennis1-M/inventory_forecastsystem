// jobs/forecastCron.js
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { runForecastForProductInternal } from "../controllers/forecastController.js";

const prisma = new PrismaClient();

// Runs every 6 hours
// Cron expression: 0 */6 * * *

export function scheduleForecastCron() {
  // run immediately once on scheduler start (optional)
  (async () => {
    try {
      console.log("[cron] Running initial forecast pass...");
      await runForecastsForAllProducts();
      console.log("[cron] Initial forecast pass complete");
    } catch (e) {
      console.error("[cron] initial run error", e);
    }
  })();

  cron.schedule("0 */6 * * *", async () => {
    console.log("[cron] Running scheduled forecast pass (every 6 hours)...");
    try {
      await runForecastsForAllProducts();
      console.log("[cron] Scheduled forecast pass complete");
    } catch (err) {
      console.error("[cron] Scheduled run error:", err);
    }
  }, { timezone: process.env.TZ || "UTC" });
}

async function runForecastsForAllProducts() {
  const products = await prisma.product.findMany();
  for (const p of products) {
    try {
      // you can customize horizon per product if needed
      const res = await runForecastForProductInternal(p.id, 14);
      if (res.ok) {
        console.log(`[cron] Forecast saved for product ${p.id} (${p.name}) runId=${res.run.id} predictedTotal=${res.predictedTotal || 0}`);
        if (res.alertCreated) console.log(`[cron] Alert created id=${res.alertCreated.id} for product ${p.id}`);
      } else {
        console.warn(`[cron] Forecast skipped for product ${p.id} (${p.name}) reason=`, res.error || res.details);
      }
      // small delay between calls to avoid hammering FastAPI (optional)
      await new Promise(r => setTimeout(r, 250));
    } catch (err) {
      console.error(`[cron] Error forecasting product ${p.id}`, err);
    }
  }
}
