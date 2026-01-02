// backend/cron/checkExpiryAlerts.js
import { prisma } from "../db.js";
import { runAlertEngineForProduct } from "../services/alertEngine.js";

async function checkAllExpiry() {
  const products = await prisma.product.findMany();
  for (let p of products) {
    await runAlertEngineForProduct(p.id);
  }
}

// Run daily at 6 AM using node-cron