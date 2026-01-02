// forecast/evaluation/accuracyMetrics.js
// Forecast accuracy metrics for evaluation

/**
 * Mean Absolute Error
 */
export const calculateMAE = (actual, predicted) => {
  if (!actual.length || actual.length !== predicted.length) return null;

  const error =
    actual.reduce(
      (sum, val, i) => sum + Math.abs(val - predicted[i]),
      0
    ) / actual.length;

  return Number(error.toFixed(2));
};
