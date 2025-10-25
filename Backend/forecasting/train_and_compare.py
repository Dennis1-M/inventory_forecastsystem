# forecasting/train_and_compare.py
import json
import numpy as np
import pandas as pd
import joblib
from datetime import timedelta
from ml_db import load_sales_agg, write_forecast_run_and_points
from utils import series_to_supervised, mae, forecast_accuracy_pct

# ML libs
from sklearn.linear_model import LinearRegression
from xgboost import XGBRegressor
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping

MODELS_DIR = "models"

import os
os.makedirs(MODELS_DIR, exist_ok=True)

def train_lr(train_series, n_lags=7):
    X, y = series_to_supervised(train_series, n_lags)
    model = LinearRegression()
    model.fit(X, y)
    return model

def train_xgb(train_series, n_lags=7):
    X, y = series_to_supervised(train_series, n_lags)
    model = XGBRegressor(n_estimators=200, learning_rate=0.05, random_state=42)
    model.fit(X, y)
    return model

def train_lstm(train_series, n_lags=14, epochs=30, batch_size=16):
    X, y = series_to_supervised(train_series, n_lags)
    X = X.reshape((X.shape[0], X.shape[1], 1))
    model = Sequential()
    model.add(LSTM(64, input_shape=(X.shape[1], X.shape[2])))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mae')
    es = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    model.fit(X, y, epochs=epochs, batch_size=batch_size, validation_split=0.1, callbacks=[es], verbose=0)
    return model

def forecast_with_model(model, history, horizon, n_lags=7, model_type='lr'):
    preds = []
    hist = list(history)
    for _ in range(horizon):
        x_in = hist[-n_lags:]
        if len(x_in) < n_lags:
            x_in = [0]*(n_lags - len(x_in)) + x_in
        if model_type in ('lr','xgb'):
            import numpy as np
            x_arr = np.array(x_in).reshape(1, -1)
            yhat = float(model.predict(x_arr)[0])
        else:
            import numpy as np
            x_arr = np.array(x_in).reshape(1, n_lags, 1)
            yhat = float(model.predict(x_arr)[0][0])
        preds.append(max(0.0, yhat))
        hist.append(yhat)
    return preds

def run_for_product(product_id:int, horizon=14, lookback=180, n_lags=7, methods=('lr','xgb','lstm')):
    # load data
    df = load_sales_agg(product_id=product_id, lookback_days=lookback, freq='D')
    if df.empty:
        raise ValueError("No sales data for product")
    series = df['quantity'].astype(float).values
    # split train/test (last horizon as test)
    if len(series) <= horizon + n_lags:
        # if too short, use all as train and no test
        train = series
        test = np.array([])
    else:
        train = series[:-horizon]
        test = series[-horizon:]
    results = {}
    for method in methods:
        if method == 'lr':
            model = train_lr(train, n_lags=n_lags)
            model_type='lr'
            joblib.dump(model, os.path.join(MODELS_DIR, f'{product_id}_lr.pkl'))
        elif method == 'xgb':
            model = train_xgb(train, n_lags=n_lags)
            model_type='xgb'
            joblib.dump(model, os.path.join(MODELS_DIR, f'{product_id}_xgb.pkl'))
        elif method == 'lstm':
            # LSTM uses larger n_lags by default
            model = train_lstm(train, n_lags=max(n_lags,14))
            model_type='lstm'
            model.save(os.path.join(MODELS_DIR, f'{product_id}_lstm'))
        else:
            continue

        preds = forecast_with_model(model, train, horizon, n_lags=n_lags, model_type=model_type)
        metrics = {}
        if test.size:
            metrics['mae'] = mae(test, preds)
            metrics['accuracy_pct'] = forecast_accuracy_pct(test, preds)
        else:
            metrics['mae'] = None
            metrics['accuracy_pct'] = None

        # build points df
        last_date = pd.to_datetime(df['period'].max())
        future_dates = [ (last_date + pd.Timedelta(days=i+1)).to_pydatetime() for i in range(horizon) ]
        points = pd.DataFrame({'period': future_dates, 'predicted': preds})
        # write into DB using ml_db helper
        run_meta = {
            "productId": product_id,
            "method": method,
            "params": json.dumps({"n_lags": n_lags, "lookback": lookback}),
            "horizon": horizon,
            "mae": metrics['mae'],
            "accuracy": metrics['accuracy_pct']
        }
        run_id = write_forecast_run_and_points(run_meta, points)
        results[method] = {"run_id": run_id, "metrics": metrics}
    return results

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--product', type=int, required=True)
    parser.add_argument('--horizon', type=int, default=14)
    args = parser.parse_args()
    out = run_for_product(args.product, horizon=args.horizon)
    print(out)
