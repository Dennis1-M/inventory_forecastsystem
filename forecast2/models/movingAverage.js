// forecast/models/movingAverage.js
// Simple moving average forecasting model

/**
 * Moving Average Forecast
 * @param {Array} series - [{date, demand}]
 * @param {number} window
 * @param {number} horizon
 */
export const movingAverageForecast = (series, window = 7, horizon = 14) => {
  const values = series.map((s) => s.demand);
  const avg =
    values.slice(-window).reduce((a, b) => a + b, 0) / window || 0;

  const forecast = [];
  for (let i = 1; i <= horizon; i++) {
    forecast.push({
      period: i,
      predicted: avg,
      lower95: avg * 0.8,
      upper95: avg * 1.2,
    });
  }

  return forecast;
};
