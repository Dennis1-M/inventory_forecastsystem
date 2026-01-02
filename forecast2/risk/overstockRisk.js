// forecast/risk/overstockRisk.js
// Detects slow-moving or overstock risk

export const evaluateOverstockRisk = (
  currentStock,
  forecastPoints,
  overStockLimit
) => {
  const totalDemand = forecastPoints.reduce(
    (sum, p) => sum + p.predicted,
    0
  );

  if (currentStock > overStockLimit && currentStock > totalDemand) {
    return {
      riskLevel: "HIGH",
      excessUnits: currentStock - totalDemand,
    };
  }

  if (currentStock > totalDemand * 1.5) {
    return { riskLevel: "MEDIUM", excessUnits: currentStock - totalDemand };
  }

  return { riskLevel: "LOW", excessUnits: 0 };
};
// forecast/risk/overstockRisk.js