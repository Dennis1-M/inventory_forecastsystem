import cron from "node-cron";
import { runForecastForProductInternal } from "../controllers/forecastController.js";

export function scheduleForecastCron() {
    cron.schedule("0 */6 * * *", async () => {
        console.log("Running forecast cron job...");
        await runForecastForProductInternal();
    });
}
