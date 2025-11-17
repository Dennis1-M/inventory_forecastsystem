# forecast_model.py
import pandas as pd
import numpy as np
from sqlalchemy import text
from db import engine
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tools.sm_exceptions import ConvergenceWarning
import warnings
from datetime import timedelta

warnings.simplefilter("ignore", ConvergenceWarning)


# ------------------------------
# 1. FETCH RAW SALES FROM DB
# ------------------------------
def _fetch_sales(product_id):
    query = text("""
        SELECT date, quantity
        FROM "Sale"
        WHERE "productId" = :pid
        ORDER BY date ASC
    """)
    df = pd.read_sql(query, engine, params={"pid": int(product_id)})
    return df


# ------------------------------
# 2. SAFE FLOAT CLEANER
# ------------------------------
def _safe_float(x):
    try:
        return float(x)
    except:
        return np.nan


# ------------------------------
# 3. MAIN FORECAST FUNCTION
# ------------------------------
def train_and_forecast(product_id, periods=7):
    """
    Trains ARIMA(1,1,1) on sales data and predicts N future periods.
    Returns:
    {
        "predictions": [...],
        "mae": <float or None>,
        "model": "ARIMA(1,1,1)"
    }

    Returns None if:
      - No sales
      - Non-numeric values
      - Model fails
      - Not enough time-series points
    """

    df = _fetch_sales(product_id)

    if df.empty:
        print("No sales found in DB.")
        return None

    # Clean numeric values
    df["quantity"] = df["quantity"].apply(_safe_float)
    df = df.dropna(subset=["quantity"])

    if df.empty or len(df) < 3:
        print("Not enough numeric sales data.")
        return None

    # Normalize column names
    df = df.rename(columns={"date": "ds", "quantity": "y"})
    df["ds"] = pd.to_datetime(df["ds"])

    # ------------------------------
    # FIX: remove duplicate dates
    # ------------------------------
    df = df.groupby("ds")["y"].sum().reset_index()

    # Time-series index
    df = df.set_index("ds").asfreq("D", method=None)

    # Fill missing days with 0 sales
    df["y"] = df["y"].fillna(0).astype(float)

    # ------------------------------
    # TRAIN ARIMA
    # ------------------------------
    try:
        model = ARIMA(
            df["y"],
            order=(1, 1, 1),
            enforce_stationarity=False,
            enforce_invertibility=False
        )
        res = model.fit(method_kwargs={"warn_convergence": False})
    except Exception as e:
        print("ARIMA training failed:", e)
        return None

    # ------------------------------
    # FORECAST
    # ------------------------------
    try:
        fc = res.get_forecast(steps=int(periods))
        yhat = fc.predicted_mean
        conf = fc.conf_int(alpha=0.05)
    except Exception as e:
        print("ARIMA forecast failed:", e)
        return None

    # Build future dates
    last_date = df.index.max()
    future_dates = [last_date + timedelta(days=i + 1) for i in range(int(periods))]

    # Output dataframe
    out = pd.DataFrame({
        "ds": future_dates,
        "yhat": np.maximum(yhat.values, 0.0),
        "yhat_lower": np.maximum(conf.iloc[:, 0].values, 0.0),
        "yhat_upper": np.maximum(conf.iloc[:, 1].values, 0.0),
    })

    # ------------------------------
    # Compute MAE (simple backtest)
    # ------------------------------
    mae = None
    try:
        # Compare last N observation errors
        n = min(len(df), int(periods))
        if n >= 1:
            pred = res.predict(start=len(df)-n, end=len(df)-1, typ="levels")
            mae = float(np.mean(np.abs(pred - df["y"].tail(n))))
    except Exception:
        mae = None

    # ------------------------------
    # Build final JSON response
    # ------------------------------
    preds = []
    for _, r in out.iterrows():
        preds.append({
            "date": r["ds"].isoformat(),
            "yhat": float(r["yhat"]),
            "yhat_lower": float(r["yhat_lower"]),
            "yhat_upper": float(r["yhat_upper"])
        })

    return {
        "predictions": preds,
        "mae": mae,
        "model": "ARIMA(1,1,1)"
    }
