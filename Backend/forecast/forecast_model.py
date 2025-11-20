import pandas as pd
import numpy as np
from sqlalchemy import text
from db import engine
from datetime import timedelta
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from xgboost import XGBRegressor
from statsmodels.stats.weightstats import DescrStatsW

# ------------------------------
# 1. FETCH RAW SALES FROM DB
# ------------------------------
def _fetch_sales(product_id):
    """Fetches raw sales data from the DB for a specific product."""
    query = text("""
        SELECT date, quantity
        FROM "Sale"
        WHERE "productId" = :pid
        ORDER BY date ASC
    """)
    # Note: df is the Pandas DataFrame where columns match the SQL query.
    df = pd.read_sql(query, engine, params={"pid": int(product_id)})
    return df

# ------------------------------
# 2. PREPROCESS SALES DATA
# ------------------------------
def _preprocess_sales(df):
    """
    Aggregates sales by day and creates time-series features.
    
    The ML model (XGBoost) requires features, not just a pure time series.
    We create simple features like day of week and day of year.
    """
    # 1. Clean and validate data
    if df.empty or len(df) < 7: # Require at least 7 days of sales
        return None, None 

    df['date'] = pd.to_datetime(df['date'])
    df = df.rename(columns={"date": "ds", "quantity": "y"})
    
    # Aggregate sales by day (in case of multiple sales per day)
    df = df.groupby('ds')['y'].sum().reset_index()

    # Create a continuous date range and fill missing days with 0 sales
    date_range = pd.date_range(start=df['ds'].min(), end=df['ds'].max(), freq='D')
    df_ts = df.set_index('ds').reindex(date_range).fillna(0).reset_index()
    df_ts.columns = ['ds', 'y']
    df_ts['y'] = df_ts['y'].astype(float)
    
    # 2. Feature Engineering (for XGBoost)
    df_ts['dayofweek'] = df_ts['ds'].dt.dayofweek
    df_ts['dayofyear'] = df_ts['ds'].dt.dayofyear
    df_ts['month'] = df_ts['ds'].dt.month
    df_ts['year'] = df_ts['ds'].dt.year
    df_ts['weekofyear'] = df_ts['ds'].dt.isocalendar().week.astype(int)

    # Lag features (sales from previous 1, 7, and 14 days)
    df_ts['y_lag1'] = df_ts['y'].shift(1).fillna(0)
    df_ts['y_lag7'] = df_ts['y'].shift(7).fillna(0)
    df_ts['y_lag14'] = df_ts['y'].shift(14).fillna(0)
    
    # Drop rows where lag features were originally NaN (start of the series)
    df_ts = df_ts.dropna().reset_index(drop=True) 
    
    return df_ts, date_range

# ------------------------------
# 3. FORECASTING FUNCTION (XGBOOST)
# ------------------------------
def train_and_forecast(product_id, periods=14):
    """
    Trains XGBoost on sales data and predicts N future periods.
    
    Returns:
    {
        "predictions": [...],
        "mae": <float>,
        "accuracy": <float>,
        "model": "XGBoost"
    }
    """
    df_raw = _fetch_sales(product_id)
    df_ts, _ = _preprocess_sales(df_raw)
    
    if df_ts is None:
        return None # Not enough data for modeling

    # --- 3.1 Training Data Preparation ---
    features = [c for c in df_ts.columns if c not in ['ds', 'y']]
    X = df_ts[features].values
    y = df_ts['y'].values
    
    # Use the last 'periods' days as a simple test set for evaluation
    train_size = max(len(df_ts) - periods, 1) 
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    # --- 3.2 Model Training ---
    try:
        model = XGBRegressor(
            n_estimators=100, 
            learning_rate=0.05, 
            random_state=42, 
            n_jobs=-1
        )
        model.fit(X_train, y_train)
    except Exception as e:
        print("XGBoost training failed:", e)
        return None

    # --- 3.3 Evaluation (on test set) ---
    y_pred_test = model.predict(X_test)
    y_pred_test = np.maximum(y_pred_test, 0) # Clip negative predictions

    mae = float(mean_absolute_error(y_test, y_pred_test))
    
    # Custom Accuracy (based on project goal: 85% accuracy)
    # R2 is a common measure of fit, so we use it for "accuracy"
    accuracy = float(r2_score(y_test, y_pred_test)) * 100 # Convert to percentage
    
    # --- 3.4 Future Prediction Dataframe Setup ---
    last_date = df_ts['ds'].max()
    future_dates = [last_date + timedelta(days=i + 1) for i in range(int(periods))]
    
    # Create the future feature matrix (X_future)
    X_future = []
    
    # Start with the last known row's features for creating the first day's features
    last_row = df_ts.iloc[-1]
    
    for i, date in enumerate(future_dates):
        # Create features for the prediction date
        row = {
            'dayofweek': date.dayofweek,
            'dayofyear': date.timetuple().tm_yday,
            'month': date.month,
            'year': date.year,
            'weekofyear': date.isocalendar()[1]
        }
        
        # Lag features need to be calculated dynamically from known/predicted values
        # This is an iterative process: prediction for day T is used to calculate lag for T+1
        
        # Lag 1: Yesterday's actual (if i=0) or predicted (if i>0) sale
        lag1 = last_row['y'] if i == 0 else X_future[-1]['y_hat']
        
        # Lag 7 & 14: Use actual historical data for the first few days
        lag7 = last_row['y_lag7'] if i < 7 else 0 # Simplified: assume 0 if lag extends past historical data
        lag14 = last_row['y_lag14'] if i < 14 else 0 # Simplified: assume 0 if lag extends past historical data

        row['y_lag1'] = lag1
        row['y_lag7'] = lag7
        row['y_lag14'] = lag14
        
        # Convert to DataFrame row for feature selection
        X_future_row = pd.DataFrame([row])[features]
        
        # Predict the demand for this future date
        y_hat = model.predict(X_future_row.values)[0]
        y_hat = max(0, y_hat) # Clip to 0
        
        # Add prediction to the row for subsequent lag calculations
        row['y_hat'] = y_hat
        X_future.append(row)
        
        # Update last_row features for the next iteration (a dynamic update)
        last_row['y'] = y_hat # Use predicted value for next day's lag1

    # --- 3.5 Final Output Formatting ---
    out = pd.DataFrame(X_future)
    out['ds'] = future_dates
    out = out.rename(columns={'y_hat': 'yhat'})

    # Calculate 95% Confidence Interval (simplified approach using past error distribution)
    # The standard deviation of the residuals (errors)
    residuals = y_test - y_pred_test
    if len(residuals) > 1:
        # Use DescrStatsW for weighted stats (though weights are uniform here)
        dsw = DescrStatsW(residuals)
        std_err = dsw.std
        # Z-score for 95% is approx 1.96
        z_score = 1.96 
        out['yhat_lower'] = np.maximum(out['yhat'] - (z_score * std_err), 0.0)
        out['yhat_upper'] = out['yhat'] + (z_score * std_err)
    else:
        # Fallback if insufficient test data for stats
        out['yhat_lower'] = np.maximum(out['yhat'] * 0.8, 0.0) # Assume +/- 20% error
        out['yhat_upper'] = out['yhat'] * 1.2


    # Return the forecast dataframe with required columns
    return {
        "out_df": out, # Contains ds, yhat, yhat_lower, yhat_upper
        "mae": mae,
        "accuracy": accuracy,
        "model": "XGBoost"
    }