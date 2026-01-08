# ML Forecasting Models

This directory contains machine learning models for demand forecasting in the inventory management system.

## Available Models

### 1. Moving Average (Simple Statistical)
- **Best for**: Very short history (< 14 days)
- **Requirements**: 7+ days of data
- **Speed**: Very fast
- **Accuracy**: Baseline
- **Dependencies**: None

### 2. Exponential Smoothing (Simple Statistical)
- **Best for**: Short history (14-30 days)
- **Requirements**: 14+ days of data
- **Speed**: Very fast
- **Accuracy**: Good for stable patterns
- **Dependencies**: None

### 3. Linear Regression (Machine Learning)
- **Best for**: Medium history (30-60 days)
- **Requirements**: 30+ days of data
- **Speed**: Fast
- **Accuracy**: Good for linear trends
- **Dependencies**: scikit-learn, numpy, pandas
- **Features**:
  - Lagged values (1, 7, 14 days)
  - Rolling statistics (7-day mean, std)
  - Trend component
  - Day of week cyclical patterns

### 4. XGBoost (Advanced ML)
- **Best for**: Large history (60+ days)
- **Requirements**: 60+ days of data
- **Speed**: Medium
- **Accuracy**: Best for complex patterns
- **Dependencies**: xgboost, scikit-learn, numpy, pandas
- **Features**:
  - Multiple rolling windows (7, 14, 30 days)
  - Exponentially weighted moving average
  - Date features (day, week, month, quarter)
  - Interaction terms
  - Feature importance analysis

### 5. LSTM (Experimental Deep Learning)
- **Best for**: Very large history (90+ days)
- **Requirements**: 90+ days of data
- **Speed**: Slow (requires training)
- **Accuracy**: Excellent for sequential patterns
- **Dependencies**: tensorflow, keras, numpy, pandas
- **Features**:
  - Deep neural network with 2 LSTM layers
  - Dropout regularization
  - Early stopping
  - Sequence-to-sequence learning

## Installation

### Python Dependencies

```bash
cd Backend/forecast2
pip install -r requirements.txt
```

### Optional: LSTM Support
If you want to use LSTM models (experimental), install TensorFlow:

```bash
pip install tensorflow
```

Note: TensorFlow is large (~500MB) and requires Python 3.8-3.11.

## Usage

### From Node.js API

#### Auto-select best model
```javascript
POST /api/forecast/run-with-model
{
  "productId": 1,
  "horizon": 14,
  "modelType": "auto"  // Automatically selects best model based on data
}
```

#### Specify model explicitly
```javascript
POST /api/forecast/run-with-model
{
  "productId": 1,
  "horizon": 14,
  "modelType": "xgboost"  // Options: moving_average, exponential_smoothing, linear_regression, xgboost, lstm
}
```

#### Compare multiple models
```javascript
POST /api/forecast/compare-models
{
  "productId": 1,
  "horizon": 14
}
```

### From JavaScript Code

```javascript
import { runForecastModel } from './forecast2/models/modelSelector.js';

const historicalData = [
  { date: '2024-01-01', quantity: 45 },
  { date: '2024-01-02', quantity: 52 },
  // ... more data
];

// Auto-select model
const result = await runForecastModel(historicalData, 14, 'auto');

// Use specific model
const result = await runForecastModel(historicalData, 14, 'xgboost');

console.log(result.method);      // XGBOOST
console.log(result.points);      // Array of predictions
console.log(result.metrics);     // MAE, RMSE, R², etc.
```

### From Python

```python
from models.linear_regression import forecast_linear_regression
from models.xgboost_model import forecast_xgboost
from models.lstm_model import forecast_lstm

historical_data = [
    {'date': '2024-01-01', 'quantity': 45},
    {'date': '2024-01-02', 'quantity': 52},
    # ... more data
]

# Linear Regression
result = forecast_linear_regression(historical_data, horizon=14)
print(f"Predictions: {result['predictions']}")
print(f"Metrics: {result['metrics']}")

# XGBoost
result = forecast_xgboost(historical_data, horizon=14)

# LSTM (requires TensorFlow)
result = forecast_lstm(historical_data, horizon=14, lookback=14)
```

## Testing

Run the test suite to validate all models:

```bash
cd Backend
node test-ml-models.js
```

This will:
1. Generate 90 days of synthetic sales data
2. Test each model with the same data
3. Display performance metrics and sample predictions
4. Report any installation issues

## Model Selection Logic

The system automatically selects the best model based on data availability:

| Data Points | Auto-Selected Model |
|-------------|---------------------|
| < 14 days   | Moving Average      |
| 14-29 days  | Exponential Smoothing |
| 30-59 days  | Linear Regression   |
| 60+ days    | XGBoost             |

You can override this by specifying `modelType` explicitly.

## Performance Considerations

### Speed Comparison (for 90 days of data, 14-day forecast)
- Moving Average: ~1ms
- Exponential Smoothing: ~1ms
- Linear Regression: ~50ms
- XGBoost: ~200ms
- LSTM: ~2-5 seconds (first run with training)

### Accuracy vs Data Requirements
More sophisticated models require more data but provide better accuracy:
- Simple models (MA, ES) work with limited data but may miss complex patterns
- ML models (Linear, XGBoost) capture trends and seasonality better
- LSTM excels with long sequences but needs substantial training data

## Fallback Strategy

If a model fails (e.g., due to missing dependencies or insufficient data), the system automatically falls back to Exponential Smoothing, which has no external dependencies and works with minimal data.

## Troubleshooting

### "sklearn not found"
```bash
pip install scikit-learn
```

### "xgboost not found"
```bash
pip install xgboost
```

### "TensorFlow not installed"
```bash
pip install tensorflow
# Note: Requires Python 3.8-3.11, ~500MB download
```

### "Not enough history"
Each model has minimum data requirements. Check the table above or the error message for specifics.

### Python subprocess errors
Ensure Python is in your PATH:
```bash
python --version  # Should show Python 3.8+
```

## Future Enhancements

- [ ] Ensemble models (combine multiple models)
- [ ] Hyperparameter tuning
- [ ] Multi-step ahead forecasting
- [ ] Probabilistic forecasts
- [ ] External factors (holidays, promotions)
- [ ] Model caching/serialization
- [ ] GPU acceleration for LSTM
- [ ] AutoML for automatic model selection

## References

- [scikit-learn Documentation](https://scikit-learn.org/)
- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [TensorFlow/Keras Documentation](https://www.tensorflow.org/)
- [Prophet (Facebook) - Alternative](https://facebook.github.io/prophet/)
