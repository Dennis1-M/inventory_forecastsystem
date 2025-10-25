# forecasting/utils.py
import numpy as np
from sklearn.metrics import mean_absolute_error

def series_to_supervised(y, n_lags=7):
    X, y_out = [], []
    for i in range(n_lags, len(y)):
        X.append(y[i-n_lags:i])
        y_out.append(y[i])
    return np.array(X), np.array(y_out)

def mae(y_true, y_pred):
    return float(mean_absolute_error(y_true, y_pred))

def forecast_accuracy_pct(y_true, y_pred):
    # 100 * (1 - MAE / mean_actual)
    import numpy as np
    mean_actual = np.mean(y_true) if np.mean(y_true) != 0 else 1.0
    return float(max(0.0, 100.0 * (1 - (np.mean(np.abs(y_true - y_pred)) / mean_actual))))
