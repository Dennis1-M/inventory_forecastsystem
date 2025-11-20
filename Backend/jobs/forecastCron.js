import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
// CRITICAL FIX: runForecastForProductInternal is moved to the Service layer
import { runForecastForProductInternal } from "../services/forecastService.js";

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
    // Set a reasonable limit on the number of products to forecast in one job run
    // for scalability in a real-world scenario.
    // For this project, we iterate all of them.
    for (const p of products) {
        try {
            // Default 14-day horizon for scheduled runs
            const res = await runForecastForProductInternal(p.id, 14); 
            if (res.ok) {
                const maeText = res.run?.mae ? ` MAE=${res.run.mae.toFixed(2)}` : '';
                console.log(`[cron] Forecast saved for product ${p.id} (${p.name}) runId=${res.run.id}${maeText}. Predicted total: ${Math.round(res.predictedTotal || 0)}`);
                if (res.alertCreated) console.log(`[cron] Alert created id=${res.alertCreated.id} for product ${p.id}`);
            } else {
                console.warn(`[cron] Forecast skipped for product ${p.id} (${p.name}) reason=`, res.error || res.details);
            }
            // Small delay to prevent hammering the database/ML service
            await new Promise(r => setTimeout(r, 250)); 
        } catch (err) {
            console.error(`[cron] Error forecasting product ${p.id}`, err);
        }
    }
}