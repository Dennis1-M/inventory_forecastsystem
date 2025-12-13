/**
 * Forecast Utility Functions
 * Helper functions for demand forecasting and inventory analytics
 */

/**
 * Calculate forecast accuracy metrics
 */
export const calculateAccuracyMetrics = (actualData, forecastData) => {
  if (actualData.length !== forecastData.length) {
    throw new Error("Arrays must be same length");
  }

  // Mean Absolute Error
  const mae = actualData.reduce((sum, actual, i) => {
    return sum + Math.abs(actual - forecastData[i]);
  }, 0) / actualData.length;

  // Root Mean Square Error
  const rmse = Math.sqrt(
    actualData.reduce((sum, actual, i) => {
      return sum + Math.pow(actual - forecastData[i], 2);
    }, 0) / actualData.length
  );

  // Mean Absolute Percentage Error
  const mape = (
    actualData.reduce((sum, actual, i) => {
      return sum + Math.abs((actual - forecastData[i]) / actual);
    }, 0) / actualData.length
  ) * 100;

  return { mae: mae.toFixed(2), rmse: rmse.toFixed(2), mape: mape.toFixed(2) };
};

/**
 * Determine stock status based on inventory levels
 */
export const getStockStatus = (current, reorder, threshold, overstock) => {
  if (current <= 0) return { status: "OUT_OF_STOCK", label: "Out of Stock", color: "red" };
  if (current <= threshold) return { status: "LOW_STOCK", label: "Low Stock", color: "yellow" };
  if (current > overstock) return { status: "OVERSTOCK", label: "Overstock", color: "orange" };
  return { status: "IN_STOCK", label: "In Stock", color: "green" };
};

/**
 * Calculate trend percentage change
 */
export const calculateTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};

/**
 * Get reorder quantity recommendation
 */
export const getReorderQuantity = (forecast, leadTime, safetyStock, currentStock) => {
  const demandDuringLeadTime = (forecast / 7) * leadTime; // Assuming forecast is weekly
  const reorderPoint = demandDuringLeadTime + safetyStock;
  const reorderQuantity = Math.max(0, reorderPoint - currentStock);
  return Math.ceil(reorderQuantity);
};

/**
 * Format currency values
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

/**
 * Format large numbers with K, M, B notation
 */
export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

/**
 * Calculate days of inventory remaining
 */
export const daysOfInventory = (currentStock, dailyAvgSales) => {
  if (dailyAvgSales === 0) return 0;
  return Math.ceil(currentStock / dailyAvgSales);
};

/**
 * Generate confidence interval bounds
 */
export const getConfidenceBounds = (forecast, stdDev, confidenceLevel = 0.95) => {
  const zScore = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645;
  const margin = zScore * stdDev;
  return {
    lower: Math.max(0, forecast - margin),
    upper: forecast + margin,
  };
};

/**
 * Detect seasonality pattern
 */
export const detectSeasonality = (data) => {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // Coefficient of variation

  if (cv > 0.3) return "High Seasonality";
  if (cv > 0.15) return "Moderate Seasonality";
  return "Low Seasonality";
};

/**
 * Get demand trend direction
 */
export const getTrendDirection = (recentData) => {
  if (recentData.length < 2) return "neutral";
  const first = recentData[0];
  const last = recentData[recentData.length - 1];
  const trend = ((last - first) / first) * 100;

  if (trend > 5) return "upward";
  if (trend < -5) return "downward";
  return "stable";
};

/**
 * Recommend safety stock level
 */
export const recommendSafetyStock = (avgDemand, demandStdDev, serviceLevel = 0.95) => {
  const zScore = serviceLevel === 0.95 ? 1.645 : serviceLevel === 0.99 ? 2.326 : 1.282;
  return Math.ceil(zScore * demandStdDev);
};

/**
 * Calculate inventory turnover ratio
 */
export const inventoryTurnover = (costOfGoodsSold, avgInventoryValue) => {
  if (avgInventoryValue === 0) return 0;
  return (costOfGoodsSold / avgInventoryValue).toFixed(2);
};

/**
 * Get urgency score (0-100) for restocking
 */
export const getRestockUrgency = (current, reorder, forecast, leadTime) => {
  const stockDays = current / (forecast / 7);
  const leadTimeDays = leadTime;
  
  if (stockDays <= leadTimeDays) return 100;
  if (stockDays <= leadTimeDays * 1.5) return 75;
  if (current <= reorder) return 50;
  return 0;
};
