// forecast/data/demandSeries.js
import { prisma } from "../../index.js";

/**
 * Build daily demand series for a product
 * @param {number} productId
 * @param {number} daysBack
 */
export const getDailyDemandSeries = async (productId, daysBack = 60) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Step 1: Aggregate quantities sold per sale
  const saleItems = await prisma.saleItem.findMany({
    where: { productId },
    select: {
      quantity: true,
      sale: { select: { createdAt: true } },
    },
  });

  // Step 2: Aggregate by date
  const dailyMap = {};
  saleItems.forEach(({ quantity, sale }) => {
    const date = sale.createdAt.toISOString().split("T")[0];
    if (!dailyMap[date]) dailyMap[date] = 0;
    dailyMap[date] += quantity;
  });

  // Step 3: Convert to sorted array
  return Object.entries(dailyMap)
    .map(([date, demand]) => ({ date, demand }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};
