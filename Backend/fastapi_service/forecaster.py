import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# --------------------------------------------------------------------------
# Feature Engineering Helpers
# --------------------------------------------------------------------------
def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Creates time-based and lag features for the XGBoost model.
    """
    df['dayofweek'] = df.index.dayofweek
    df['dayofyear'] = df.index.dayofyear
    df['weekofyear'] = df.index.isocalendar().week.astype(int)
    df['month'] = df.index.month
    df['year'] = df.index.year
    df['quarter'] = df.index.quarter
    
    # Lag features (sales from previous days)
    for lag in [1, 7, 30]:
        df[f'y_lag_{lag}'] = df['y'].shift(lag)
        
    # Simple rolling mean
    df['rolling_mean_7'] = df['y'].shift(1).rolling(window=7).mean()
    
    return df.dropna()

# --------------------------------------------------------------------------
# Main Forecasting Function
# --------------------------------------------------------------------------
def run_xgboost_forecast(time_series: pd.DataFrame, horizon: int) -> dict:
    """
    Trains an XGBoost model on the time series and forecasts future demand.

    :param time_series: DataFrame with 'y' (quantity) as the column and DateIndex.
    :param horizon: Number of future days to forecast.
    :return: Dictionary containing forecast data and metrics.
    """
    
    # 1. Feature Engineering
    df_features = create_features(time_series.copy())
    
    if df_features.empty:
        return {"ok": False, "message": "Insufficient data after feature creation (need at least 30 days of clean data)."}

    TARGET = 'y'
    FEATURES = [col for col in df_features.columns if col != TARGET]

    X = df_features[FEATURES]
    y = df_features[TARGET]

    # 2. Train/Test Split (Use the most recent data for testing)
    test_size = min(30, int(len(df_features) * 0.2)) # Test on last 20% or 30 days
    
    X_train, X_test = X.iloc[:-test_size], X.iloc[-test_size:]
    y_train, y_test = y.iloc[:-test_size], y.iloc[-test_size:]

    # 3. Model Training (Hyperparameters can be tuned)
    reg = XGBRegressor(
        n_estimators=100,
        learning_rate=0.05,
        objective='reg:squarederror',
        n_jobs=-1,
        random_state=42
    )
    reg.fit(X_train, y_train)

    # 4. Evaluation on Test Set
    test_predictions = reg.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, test_predictions))
    
    # 5. Iterative Forecasting for the Horizon
    last_date = df_features.index.max()
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=horizon, freq='D')
    
    # Initialize the future dataframe with the features of the last known date
    future_df = pd.DataFrame(index=future_dates, columns=FEATURES)
    # Start with the last known data point to generate initial lag features
    current_df = df_features.copy() 
    
    forecasts = {}

    for i in range(horizon):
        date_to_predict = future_dates[i]
        
        # Append the new date index
        new_row = pd.Series(index=current_df.columns, dtype=float)
        current_df.loc[date_to_predict] = new_row
        
        # Recalculate time features for the new date
        current_df.loc[date_to_predict, 'dayofweek'] = date_to_predict.dayofweek
        current_df.loc[date_to_predict, 'dayofyear'] = date_to_predict.dayofyear
        current_df.loc[date_to_predict, 'weekofyear'] = date_to_predict.isocalendar().week
        current_df.loc[date_to_predict, 'month'] = date_to_predict.month
        current_df.loc[date_to_predict, 'year'] = date_to_predict.year
        current_df.loc[date_to_predict, 'quarter'] = date_to_predict.quarter
        
        # Calculate lag features using the entire (growing) current_df
        for lag in [1, 7, 30]:
            current_df.loc[date_to_predict, f'y_lag_{lag}'] = current_df['y'].shift(lag).loc[date_to_predict]
            
        current_df.loc[date_to_predict, 'rolling_mean_7'] = current_df['y'].shift(1).rolling(window=7).mean().loc[date_to_predict]
        
        # Prepare the feature vector for prediction
        X_future = current_df.loc[[date_to_predict], FEATURES]
        
        # Predict the demand
        predicted_demand = reg.predict(X_future)[0]
        
        # Ensure demand is not negative and round up to the nearest integer for inventory units
        predicted_demand = max(0, predicted_demand)
        final_forecast = np.ceil(predicted_demand).astype(int)
        
        # Store prediction and use it as the "actual" value for the next day's lag features
        current_df.loc[date_to_predict, 'y'] = final_forecast
        forecasts[date_to_predict.strftime('%Y-%m-%d')] = final_forecast
        
    return {
        "ok": True,
        "rmse": round(rmse, 2),
        "horizon": horizon,
        "startDate": future_dates.min().strftime('%Y-%m-%d'),
        "endDate": future_dates.max().strftime('%Y-%m-%d'),
        "data": forecasts
    }