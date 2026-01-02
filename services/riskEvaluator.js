// services/riskEvaluator.js
// --------------------------------------------------
// Probabilistic risk evaluation based on forecast ranges
// --------------------------------------------------

// Helper: risk level string based on riskScore
function getLevel(score) {
  if (score >= 80) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}

// --------------------------------------------------
// Stockout risk evaluation
// --------------------------------------------------
export function evaluateStockoutRisk(product, forecastPoints) {
  const currentStock = product.currentStock;
  let daysToStockout = null;
  let cumulativeLower = 0; // worst case
  let cumulativeMean = 0;  // expected
  let cumulativeUpper = 0; // optimistic

  forecastPoints.forEach((p, i) => {
    cumulativeLower += p.yhat_lower ?? p.yhat;
    cumulativeMean  += p.yhat;
    cumulativeUpper += p.yhat_upper ?? p.yhat;

    if (daysToStockout === null && cumulativeLower >= currentStock) {
      daysToStockout = i + 1;
    }
  });

  let riskScore = 0;
  let reason = "";

  if (currentStock <= 0) {
    riskScore = 100;
    reason = "Already out of stock";
  } else if (daysToStockout !== null && daysToStockout <= 3) {
    riskScore = 90;
    reason = "Stockout imminent";
  } else if (daysToStockout !== null && daysToStockout <= 7) {
    riskScore = 60;
    reason = "Stock likely to run low soon";
  } else {
    const prob = Math.min(50, (cumulativeMean / (currentStock + 1)) * 50);
    riskScore = prob;
    reason = "Stock sufficient with minor uncertainty";
  }

  return { level: getLevel(riskScore), riskScore, reason };
}

// --------------------------------------------------
// Overstock risk evaluation
// --------------------------------------------------
export function evaluateOverstockRisk(product, forecastPoints) {
  const currentStock = product.currentStock;
  const totalForecastUpper = forecastPoints.reduce(
    (sum, p) => sum + (p.yhat_upper ?? p.yhat),
    0
  );

  let riskScore = 0;
  let reason = "";

  if (currentStock > product.overStockLimit && totalForecastUpper < currentStock * 0.5) {
    riskScore = 70;
    reason = "Overstock risk: stock significantly higher than expected demand";
  } else if (currentStock > product.reorderPoint) {
    riskScore = 30;
    reason = "Slight overstock risk";
  } else {
    riskScore = 5;
    reason = "Stock within safe range";
  }

  return { level: getLevel(riskScore), riskScore, reason };
}

// --------------------------------------------------
// Expiry-based risk evaluation
// --------------------------------------------------
export function evaluateExpiryRisk(product) {
  const today = new Date();
  const expiry = product.expiryDate ? new Date(product.expiryDate) : null;

  if (!expiry) return { level: "LOW", riskScore: 0, reason: "No expiry date set" };

  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  let riskScore = 0;
  let reason = "";

  if (daysLeft <= 0) {
    riskScore = 100;
    reason = "Product expired";
  } else if (daysLeft <= 7) {
    riskScore = 90;
    reason = `Expiring very soon in ${daysLeft} days`;
  } else if (daysLeft <= 30) {
    riskScore = 60;
    reason = `Expiring soon in ${daysLeft} days`;
  } else {
    riskScore = 20;
    reason = `Safe, expires in ${daysLeft} days`;
  }

  return { level: getLevel(riskScore), riskScore, reason };
}
// --------------------------------------------------
// Alert engine main function
// --------------------------------------------------