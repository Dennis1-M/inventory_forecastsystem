// forecast/data/leadTime.js
// Estimates supplier lead time using historical inventory receipts

import prisma from "../../config/prisma.js";

/**
 * Estimate average lead time for a product in days
 * Uses RECEIPT movements as proxy
 */
export const estimateLeadTime = async (productId) => {
  const receipts = await prisma.inventoryMovement.findMany({
    where: {
      productId,
      type: "RECEIPT",
    },
    orderBy: { timestamp: "asc" },
    select: { timestamp: true },
  });

  if (receipts.length < 2) return 7; // Default lead time fallback

  let totalDays = 0;
  for (let i = 1; i < receipts.length; i++) {
    const diff =
      (new Date(receipts[i].timestamp) -
        new Date(receipts[i - 1].timestamp)) /
      (1000 * 60 * 60 * 24);
    totalDays += diff;
  }

  return Math.round(totalDays / (receipts.length - 1));
};
