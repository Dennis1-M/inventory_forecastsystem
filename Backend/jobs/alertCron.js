import cron from "node-cron";
import { prisma } from "../index.js";

// DAILY CRON RUNS 00:00
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Running daily inventory alert check...");

  try {
    const products = await prisma.product.findMany();

    for (const product of products) {
      const { id, name, currentStock, lowStockThreshold } = product;

      // OUT OF STOCK
      if (currentStock <= 0) {
        await prisma.alert.create({
          data: {
            productId: id,
            type: "OUT_OF_STOCK",
            message: `${name} is OUT OF STOCK!`,
          },
        });
        continue;
      }

      // LOW STOCK
      if (currentStock <= lowStockThreshold) {
        await prisma.alert.create({
          data: {
            productId: id,
            type: "LOW_STOCK",
            message: `${name} is LOW on stock.`,
          },
        });
        continue;
      }

      // OVERSTOCK (>200)
      if (currentStock >= 200) {
        await prisma.alert.create({
          data: {
            productId: id,
            type: "OVERSTOCK",
            message: `${name} is OVERSTOCKED (>${200} units).`,
          },
        });
      }
    }

    console.log("✅ Daily inventory alert check completed");
  } catch (error) {
    console.error("❌ Error in daily alert cron:", error);
  }
});
