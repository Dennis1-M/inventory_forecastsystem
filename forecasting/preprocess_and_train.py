# forecasting/preprocess_and_train.py
import os
import argparse
import json
import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib

# optional imports
try:
    import xgboost as xgb
    HAS_XGB = True
except Exception:
    HAS_XGB = False

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense
    HAS_TF = True
except Exception:
    HAS_TF = False

def series_ready(sub, lags=7):
    sub = sub.set_index('date').asfreq('D', fill_value=0).reset_index()
    for lag in range(1, lags+1):
        sub[f'lag_{lag}'] = sub['qty'].shift(lag).fillna(0)
    sub['rmean_7'] = sub['qty'].rolling(window=7,min_periods=1).mean().shift(1).fillna(0)
    sub['dow'] = sub['date'].dt.dayofweek
    sub['month'] = sub['date'].dt.month
    return sub

def main(csv_path, out_dir="output", horizon=14, lags=7, train_lstm=False, sample_products=None):
    os.makedirs(out_dir, exist_ok=True)
    models_dir = os.path.join(out_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    df = pd.read_csv(csv_path, parse_dates=["date"])
    df = df.sort_values(["product","date"]).reset_index(drop=True)

    products = df['product'].unique().tolist()
    if sample_products:
        products = [p for p in products if p in sample_products]

    all_forecasts = []
    metrics = []
    alerts = []

    for prod in products:
        sub = df[df['product']==prod].copy().reset_index(drop=True)
        sub = series_ready(sub, lags=lags)
        if len(sub) <= horizon + lags:
            print(f"Skipping {prod}: not enough data ({len(sub)} days)")
            continue

        train = sub.iloc[:-horizon]
        test = sub.iloc[-horizon:]
        feat_cols = [f'lag_{i}' for i in range(1,lags+1)] + ['rmean_7','dow','month']
        X_train = train[feat_cols].values
        y_train = train['qty'].values
        X_test = test[feat_cols].values
        y_test = test['qty'].values

        # Linear Regression
        lr = LinearRegression()
        lr.fit(X_train, y_train)
        lr_preds = lr.predict(X_test)
        lr_mae = mean_absolute_error(y_test, lr_preds)
        lr_acc = max(0.0, 100*(1 - (lr_mae/(y_test.mean() if y_test.mean()!=0 else 1))))

        joblib.dump(lr, os.path.join(models_dir, f"{prod.replace(' ','_')}_lr.pkl"))

        # XGBoost or RandomForest
        if HAS_XGB:
            model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.05, random_state=42, verbosity=0, n_jobs=1)
            model_name = "xgboost"
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=1)
            model_name = "randomforest"
        model.fit(X_train, y_train)
        m_preds = model.predict(X_test)
        m_mae = mean_absolute_error(y_test, m_preds)
        m_acc = max(0.0, 100*(1 - (m_mae/(y_test.mean() if y_test.mean()!=0 else 1))))
        joblib.dump(model, os.path.join(models_dir, f"{prod.replace(' ','_')}_{model_name}.pkl"))

        # Optional LSTM
        lstm_mae = None
        lstm_acc = None
        if train_lstm and HAS_TF:
            seq_len = max(lags, 14)
            hist = train['qty'].values.astype(float)
            if len(hist) > seq_len + 10:
                X_l, y_l = [], []
                for i in range(seq_len, len(hist)):
                    X_l.append(hist[i-seq_len:i])
                    y_l.append(hist[i])
                X_l = np.array(X_l).reshape(-1, seq_len, 1)
                y_l = np.array(y_l)
                model_lstm = Sequential()
                model_lstm.add(LSTM(64, input_shape=(X_l.shape[1], X_l.shape[2])))
                model_lstm.add(Dense(1))
                model_lstm.compile(optimizer='adam', loss='mae')
                model_lstm.fit(X_l, y_l, epochs=20, batch_size=16, validation_split=0.1, verbose=0)
                # forecast iteratively
                hist_copy = list(train['qty'].values)
                preds_l = []
                for _ in range(horizon):
                    x_in = np.array(hist_copy[-seq_len:]).reshape(1, seq_len, 1)
                    yh = float(model_lstm.predict(x_in, verbose=0)[0][0])
                    preds_l.append(max(0.0, yh))
                    hist_copy.append(yh)
                lstm_mae = mean_absolute_error(y_test, preds_l)
                lstm_acc = max(0.0, 100*(1 - (lstm_mae/(y_test.mean() if y_test.mean()!=0 else 1))))
                model_lstm.save(os.path.join(models_dir, f"{prod.replace(' ','_')}_lstm"))
            else:
                print(f"Insufficient data for LSTM for {prod}, skipping LSTM.")

        # iterative forecasting using last window (combine preds to advance window)
        last_window = sub.iloc[-lags:].copy().reset_index(drop=True)
        temp_qty = last_window['qty'].tolist()
        preds_lr_full = []
        preds_m_full = []
        last_date = sub['date'].max()
        for step in range(horizon):
            feats = []
            for lag in range(1, lags+1):
                feats.append(temp_qty[-lag] if len(temp_qty)>=lag else 0)
            feats.append(np.mean(temp_qty[-7:]) if len(temp_qty)>=1 else 0.0)
            next_date = last_date + pd.Timedelta(days=step+1)
            feats.append(next_date.dayofweek)
            feats.append(next_date.month)
            Xf = np.array(feats).reshape(1, -1)
            lr_p = float(lr.predict(Xf)[0])
            m_p = float(model.predict(Xf)[0])
            preds_lr_full.append(max(0.0, lr_p))
            preds_m_full.append(max(0.0, m_p))
            temp_qty.append((lr_p + m_p)/2.0)

        # write predictions
        for i in range(horizon):
            forecast_date = (last_date + pd.Timedelta(days=i+1)).date().isoformat()
            all_forecasts.append({
                "product": prod,
                "date": forecast_date,
                "pred_lr": preds_lr_full[i],
                "pred_model": preds_m_full[i],
                "current_stock": int(sub['stock'].iloc[-1])
            })

        # metrics
        metrics.append({
            "product": prod,
            "lr_mae": float(lr_mae),
            "lr_acc_pct": float(lr_acc),
            f"{model_name}_mae": float(m_mae),
            f"{model_name}_acc_pct": float(m_acc),
            "lstm_mae": float(lstm_mae) if lstm_mae is not None else None,
            "lstm_acc_pct": float(lstm_acc) if lstm_acc is not None else None
        })

        total_pred = sum(preds_m_full)
        cur_stock = int(sub['stock'].iloc[-1])
        if cur_stock < total_pred:
            alerts.append({
                "product": prod,
                "current_stock": cur_stock,
                "predicted_14d": float(total_pred),
                "alert_type": "LOW_STOCK",
                "message": f"Predicted demand ({total_pred:.1f}) exceeds current stock ({cur_stock})"
            })

    # Save outputs
    forecasts_df = pd.DataFrame(all_forecasts)
    metrics_df = pd.DataFrame(metrics)
    alerts_df = pd.DataFrame(alerts)

    forecasts_csv = os.path.join(out_dir, "forecasts.csv")
    metrics_csv = os.path.join(out_dir, "metrics_summary.csv")
    alerts_csv = os.path.join(out_dir, "alerts.csv")
    forecasts_df.to_csv(forecasts_csv, index=False)
    metrics_df.to_csv(metrics_csv, index=False)
    alerts_df.to_csv(alerts_csv, index=False)

    print(json.dumps({
        "status":"done",
        "forecasts_csv": forecasts_csv,
        "metrics_csv": metrics_csv,
        "alerts_csv": alerts_csv,
        "models_dir": models_dir,
        "has_xgboost": HAS_XGB,
        "has_tf": HAS_TF
    }, indent=2))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", default="output/synthetic_sales_inventory_data.csv", help="path to CSV")
    parser.add_argument("--out", default="output", help="output folder")
    parser.add_argument("--horizon", type=int, default=14, help="forecast horizon")
    parser.add_argument("--lags", type=int, default=7)
    parser.add_argument("--lstm", action="store_true", help="train LSTM (requires tensorflow)")
    args = parser.parse_args()
    main(args.csv, args.out, args.horizon, args.lags, args.lstm)
