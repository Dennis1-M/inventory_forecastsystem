// jobs/forecastAlertJob.js
// --------------------------------------------------
// Runs alert engine after forecast completion
// --------------------------------------------------

import { prisma } from "../prismaClient.js";
import { runAlertEngineForProduct } from "../services/alertEngine.js";

export async function runAlertsForAllProducts() {
  const products = await prisma.product.findMany({
    select: { id: true }
  });

  for (const product of products) {
    await runAlertEngineForProduct(product.id);
  }
}
// jobs/forecastAlertJob.js