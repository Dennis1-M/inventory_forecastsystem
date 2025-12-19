// forecast/risk/stockoutRisk.js
// Predicts stockout risk using forecast and inventory state

export const evaluateStockoutRisk = (
  currentStock,
  forecastPoints,
  leadTime
) => {
  const expectedDemand = forecastPoints
    .slice(0, leadTime)
    .reduce((sum, p) => sum + p.predicted, 0);

  if (currentStock <= 0) {
    return { riskLevel: "HIGH", daysToStockout: 0 };
  }

  if (expectedDemand > currentStock) {
    return {
      riskLevel: "HIGH",
      daysToStockout: Math.floor(
        (currentStock / expectedDemand) * leadTime
      ),
    };
  }

  if (expectedDemand > currentStock * 0.7) {
    return { riskLevel: "MEDIUM", daysToStockout: leadTime };
  }

  return { riskLevel: "LOW", daysToStockout: null };
};
// forecast/risk/stockoutRisk.js