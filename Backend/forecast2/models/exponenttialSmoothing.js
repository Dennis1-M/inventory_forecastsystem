// forecast/models/exponentialSmoothing.js
// Single exponential smoothing forecasting model

/**
 * Exponential Smoothing Forecast
 * @param {Array} series - [{date, demand}]
 * @param {number} alpha
 * @param {number} horizon
 */
export const exponentialSmoothingForecast = (
  series,
  alpha = 0.3,
  horizon = 14
) => {
  let level = series[0]?.demand || 0;

  series.forEach((point) => {
    level = alpha * point.demand + (1 - alpha) * level;
  });

  const forecast = [];
  for (let i = 1; i <= horizon; i++) {
    forecast.push({
      period: new Date(Date.now() + i * 86400000),
      predicted: level,
      lower95: level * 0.75,
      upper95: level * 1.25,
    });
  }

  return forecast;
};

// forecast/models/exponenttialSmoothing.js