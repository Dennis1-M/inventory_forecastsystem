// backend/jobs/inventoryCron.js
import colors from "colors";
import cron from "node-cron";
import { prisma } from "../index.js";
import { emitAlert } from "../sockets/index.js";

/**
 * Run a full scan and generate alerts for products.
 * This uses the same thresholds your controllers expect:
 * - lowStockThreshold (if present)
 * - out of stock (<= 0)
 * - overstock (>= 200)  <-- change threshold if needed
 */
async function runDailyInventoryCheck() {
  console.log(colors.cyan("🔄 Running daily inventory alert check..."));

  try {
    const products = await prisma.product.findMany();

    for (const product of products) {
      const { id, name, currentStock, lowStockThreshold } = product;

      // Skip if no thresholds and not interesting
      // OUT OF STOCK
      if (currentStock <= 0) {
        const alert = await prisma.alert.create({
          data: {
            productId: id,
            type: "OUT_OF_STOCK",
            message: `${name} is OUT OF STOCK!`,
            isRead: false,
            isResolved: false,
          },
        });
        try { emitAlert({ id: alert.id, productId: alert.productId, type: alert.type, message: alert.message, createdAt: alert.createdAt }); } catch (e) { console.warn('Emit alert failed', e.message); }
        continue;
      }

      // LOW STOCK
      if (lowStockThreshold != null && currentStock <= lowStockThreshold) {
        const alert = await prisma.alert.create({
          data: {
            productId: id,
            type: "LOW_STOCK",
            message: `${name} is LOW on stock.`,
            isRead: false,
            isResolved: false,
          },
        });
        try { emitAlert({ id: alert.id, productId: alert.productId, type: alert.type, message: alert.message, createdAt: alert.createdAt }); } catch (e) { console.warn('Emit alert failed', e.message); }
      }

      // OVERSTOCK
      if (currentStock >= 200) {
        const alert = await prisma.alert.create({
          data: {
            productId: id,
            type: "OVERSTOCK",
            message: `${name} is OVERSTOCKED (>${200} units).`,
            isRead: false,
            isResolved: false,
          },
        });
        try { emitAlert({ id: alert.id, productId: alert.productId, type: alert.type, message: alert.message, createdAt: alert.createdAt }); } catch (e) { console.warn('Emit alert failed', e.message); }
      }
    }

    console.log(colors.green("✅ Daily inventory alert check completed"));
  } catch (error) {
    console.error(colors.red("❌ Error in daily alert cron:"), error);
  }
}

// Schedule: run every day at 00:10 (server time) to avoid midnight race with other tasks
cron.schedule("10 0 * * *", runDailyInventoryCheck, {
  timezone: "Africa/Nairobi", // optional: set to your timezone
});

// Optional: export for manual trigger in dev
export default runDailyInventoryCheck;
