// forecast/models/modelSelector.js
// Chooses forecast model based on data availability

import { exponentialSmoothingForecast } from "./exponentialSmoothing.js";
import { movingAverageForecast } from "./movingAverage.js";

export const runForecastModel = (series, horizon = 14) => {
  if (series.length < 14) {
    return {
      method: "MOVING_AVERAGE",
      points: movingAverageForecast(series, 5, horizon),
    };
  }

  return {
    method: "EXPONENTIAL_SMOOTHING",
    points: exponentialSmoothingForecast(series, 0.3, horizon),
  };
};

// forecast/models/modelSelector.js