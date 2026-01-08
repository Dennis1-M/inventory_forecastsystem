// forecast/models/modelSelector.js
// Chooses forecast model based on data availability and model selection

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { exponentialSmoothingForecast } from "./exponentialSmoothing.js";
import { movingAverageForecast } from "./movingAverage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run Python ML model
 * @param {string} modelName - 'linear_regression', 'xgboost', or 'lstm'
 * @param {Array} historicalData - Array of {date, quantity} objects
 * @param {number} horizon - Forecast horizon
 * @returns {Promise<Object>} - Predictions and metrics
 */
function runPythonModel(modelName, historicalData, horizon) {
  return new Promise((resolve, reject) => {
    const modelsDir = __dirname;
    const pythonScript = path.join(modelsDir, `${modelName}.py`);
    
    // Create inline Python script that reads from the correct path
    const pythonCode = `
import sys
import json
import os

# Add models directory to Python path
sys.path.insert(0, r"${modelsDir.replace(/\\/g, '\\\\')}")

try:
    if "${modelName}" == "linear_regression":
        from linear_regression import forecast_linear_regression
        forecast_func = forecast_linear_regression
    elif "${modelName}" == "xgboost_model":
        from xgboost_model import forecast_xgboost
        forecast_func = forecast_xgboost
    elif "${modelName}" == "lstm_model":
        from lstm_model import forecast_lstm
        forecast_func = forecast_lstm
    else:
        raise ValueError(f"Unknown model: ${modelName}")
    
    # Read input
    input_data = json.loads(sys.stdin.read())
    historical_data = input_data['historical_data']
    horizon = input_data['horizon']
    
    # Run forecast
    result = forecast_func(historical_data, horizon)
    
    # Output result
    print(json.dumps(result))
except Exception as e:
    import traceback
    error_msg = {
        "error": str(e),
        "traceback": traceback.format_exc()
    }
    print(json.dumps(error_msg))
    sys.exit(1)
`;
    
    // Spawn Python process
    const python = spawn('python', ['-c', pythonCode]);

    // Send data to Python
    python.stdin.write(JSON.stringify({ historical_data: historicalData, horizon }));
    python.stdin.end();

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
      } else {
        try {
          const result = JSON.parse(stdout);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(new Error(`Failed to parse Python output: ${err.message}\nOutput: ${stdout}`));
        }
      }
    });
  });
}

/**
 * Run forecast with specified model
 * @param {Array} series - Historical sales data
 * @param {number} horizon - Forecast horizon (days)
 * @param {string} modelType - 'moving_average', 'exponential_smoothing', 'linear_regression', 'xgboost', 'lstm', 'auto'
 * @returns {Promise<Object>} - Forecast results
 */
export const runForecastModel = async (series, horizon = 14, modelType = 'auto') => {
  // Auto-select model based on data availability
  if (modelType === 'auto') {
    if (series.length < 14) {
      modelType = 'moving_average';
    } else if (series.length < 30) {
      modelType = 'exponential_smoothing';
    } else if (series.length < 60) {
      modelType = 'linear_regression';
    } else {
      modelType = 'xgboost'; // Best for medium-large datasets
    }
  }

  // Simple statistical models (synchronous)
  if (modelType === 'moving_average') {
    return {
      method: 'MOVING_AVERAGE',
      points: movingAverageForecast(series, 5, horizon),
      metrics: { dataPoints: series.length }
    };
  }

  if (modelType === 'exponential_smoothing') {
    return {
      method: 'EXPONENTIAL_SMOOTHING',
      points: exponentialSmoothingForecast(series, 0.3, horizon),
      metrics: { dataPoints: series.length }
    };
  }

  // ML models (Python)
  try {
    // Prepare historical data for Python
    const historicalData = series.map(point => ({
      date: point.date,
      quantity: point.quantity
    }));

    let result;
    switch (modelType) {
      case 'linear_regression':
        result = await runPythonModel('linear_regression', historicalData, horizon);
        return {
          method: 'LINEAR_REGRESSION',
          points: result.predictions,
          metrics: result.metrics
        };

      case 'xgboost':
        result = await runPythonModel('xgboost_model', historicalData, horizon);
        return {
          method: 'XGBOOST',
          points: result.predictions,
          metrics: result.metrics
        };

      case 'lstm':
        result = await runPythonModel('lstm_model', historicalData, horizon);
        return {
          method: 'LSTM',
          points: result.predictions,
          metrics: result.metrics,
          note: result.note
        };

      default:
        throw new Error(`Unknown model type: ${modelType}`);
    }
  } catch (error) {
    console.error(`ML model ${modelType} failed:`, error.message);
    
    // Fallback to exponential smoothing
    console.log('Falling back to exponential smoothing');
    return {
      method: 'EXPONENTIAL_SMOOTHING',
      points: exponentialSmoothingForecast(series, 0.3, horizon),
      metrics: { dataPoints: series.length },
      fallback: true,
      originalError: error.message
    };
  }
};

// forecast/models/modelSelector.js