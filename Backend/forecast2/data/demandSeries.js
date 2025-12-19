// forecast/data/demandSeries.js
// Responsible for converting raw sales data into a clean daily demand time series

import { prisma } from "../../index.js";

/**
 * Build daily demand series for a product
 * @param {number} productId
 * @param {number} daysBack - number of past days to consider
 */
export const getDailyDemandSeries = async (productId, daysBack = 60) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Aggregate sales by date
  const sales = await prisma.sale.groupBy({
    by: ["saleDate"],
    where: {
      productId,
      saleDate: { gte: startDate },
    },
    _sum: {
      quantitySold: true,
    },
    orderBy: {
      saleDate: "asc",
    },
  });

  // Normalize dates and quantities
  return sales.map((s) => ({
    date: new Date(s.saleDate).toISOString().split("T")[0],
    demand: s._sum.quantitySold || 0,
  }));
};