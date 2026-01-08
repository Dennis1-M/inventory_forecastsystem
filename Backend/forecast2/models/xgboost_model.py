# Backend/forecast2/models/xgboost_model.py
"""
XGBoost Forecasting Model
Gradient boosting for time series forecasting
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("⚠️  XGBoost not installed. Install with: pip install xgboost")


class XGBoostForecaster:
    """
    XGBoost model for demand forecasting
    """
    
    def __init__(self, **kwargs):
        if not XGBOOST_AVAILABLE:
            raise ImportError("XGBoost is not installed. Install with: pip install xgboost")
        
        # Default XGBoost parameters
        self.params = {
            'objective': 'reg:squarederror',
            'max_depth': 6,
            'learning_rate': 0.1,
            'n_estimators': 100,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'random_state': 42
        }
        self.params.update(kwargs)
        
        self.model = xgb.XGBRegressor(**self.params)
        self.is_fitted = False
        
    def create_features(self, data, lookback=7):
        """
        Create time series features for XGBoost
        
        Features:
        - Lagged values
        - Rolling statistics
        - Date-based features
        - Interaction features
        """
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        df = df.set_index('date')
        
        # Ensure numeric quantity
        df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce')
        df = df.dropna()
        
        features = pd.DataFrame(index=df.index)
        
        # Trend feature
        features['trend'] = range(len(df))
        
        # Lagged features (more lags for XGBoost)
        for i in range(1, lookback + 1):
            features[f'lag_{i}'] = df['quantity'].shift(i)
        
        # Rolling statistics (multiple windows)
        for window in [3, 7, 14]:
            if len(df) >= window:
                features[f'rolling_mean_{window}'] = df['quantity'].rolling(window=window, min_periods=1).mean()
                features[f'rolling_std_{window}'] = df['quantity'].rolling(window=window, min_periods=1).std().fillna(0)
                features[f'rolling_min_{window}'] = df['quantity'].rolling(window=window, min_periods=1).min()
                features[f'rolling_max_{window}'] = df['quantity'].rolling(window=window, min_periods=1).max()
        
        # Exponential weighted moving average
        features['ewm_mean'] = df['quantity'].ewm(span=7, adjust=False).mean()
        
        # Date features
        features['day_of_week'] = df.index.dayofweek  # type: ignore
        features['day_of_month'] = df.index.day  # type: ignore
        features['week_of_month'] = (df.index.day - 1) // 7 + 1  # type: ignore
        features['month'] = df.index.month  # type: ignore
        features['is_weekend'] = (df.index.dayofweek >= 5).astype(int)  # type: ignore
        features['is_month_start'] = df.index.is_month_start.astype(int)  # type: ignore
        features['is_month_end'] = df.index.is_month_end.astype(int)  # type: ignore
        
        # Interaction features
        if 'lag_1' in features.columns and 'lag_7' in features.columns:
            features['lag_1_7_ratio'] = features['lag_1'] / (features['lag_7'] + 1)
        
        # Target variable
        features['target'] = df['quantity'].values
        
        # Drop rows with NaN
        features = features.dropna()
        
        return features
    
    def fit(self, historical_data, lookback=7, verbose=False):
        """
        Train the XGBoost model
        
        Args:
            historical_data: List of dicts with 'date' and 'quantity'
            lookback: Number of past days to use as features
            verbose: Print training progress
            
        Returns:
            dict with training metrics
        """
        if len(historical_data) < lookback + 10:
            raise ValueError(f"Insufficient data. Need at least {lookback + 10} days, got {len(historical_data)}")
        
        # Create features
        features_df = self.create_features(historical_data, lookback)
        
        # Separate features and target
        X = features_df.drop('target', axis=1)
        y = features_df['target']
        
        # Train model
        self.model.fit(
            X, y,
            eval_set=[(X, y)],
            verbose=verbose
        )
        
        self.is_fitted = True
        self.feature_names = X.columns.tolist()
        self.lookback = lookback
        
        # Calculate training metrics
        train_predictions = self.model.predict(X)
        mae = np.mean(np.abs(y - train_predictions))
        rmse = np.sqrt(np.mean((y - train_predictions) ** 2))
        
        # R² score
        r2 = self.model.score(X, y)
        
        return {
            'mae': float(mae),
            'rmse': float(rmse),
            'r2_score': float(r2),
            'training_samples': len(X),
            'n_estimators': self.params['n_estimators']
        }
    
    def predict(self, historical_data, horizon=7):
        """
        Generate forecasts for the next N days
        
        Args:
            historical_data: List of dicts with 'date' and 'quantity'
            horizon: Number of days to forecast
            
        Returns:
            List of predictions with confidence intervals
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        predictions = []
        current_data = list(historical_data)
        
        # Get last date from historical data
        last_date = pd.to_datetime(current_data[-1]['date'])
        
        for day in range(1, horizon + 1):
            # Create features for prediction
            features_df = self.create_features(current_data, self.lookback)
            
            # Get latest features
            latest_features = features_df.drop('target', axis=1).iloc[-1:].copy()
            
            # Update trend for future day
            latest_features['trend'] = latest_features['trend'] + day
            
            # Update date features for forecast date
            forecast_date = last_date + timedelta(days=day)
            latest_features['day_of_week'] = forecast_date.dayofweek
            latest_features['day_of_month'] = forecast_date.day
            latest_features['week_of_month'] = (forecast_date.day - 1) // 7 + 1
            latest_features['month'] = forecast_date.month
            latest_features['is_weekend'] = int(forecast_date.dayofweek >= 5)
            latest_features['is_month_start'] = int(forecast_date.day == 1)
            latest_features['is_month_end'] = int(forecast_date.day == forecast_date.days_in_month)
            
            # Predict
            pred = self.model.predict(latest_features)[0]
            pred = max(0, pred)  # Ensure non-negative
            
            # Confidence interval based on prediction variance
            # XGBoost doesn't provide native uncertainty, so use ±20%
            lower = max(0, pred * 0.80)
            upper = pred * 1.20
            
            predictions.append({
                'period': day,
                'date': forecast_date.strftime('%Y-%m-%d'),
                'predicted': float(pred),
                'lower95': float(lower),
                'upper95': float(upper),
                'yhat': float(pred),
                'yhat_lower': float(lower),
                'yhat_upper': float(upper)
            })
            
            # Add prediction to current_data for next iteration
            current_data.append({
                'date': forecast_date.strftime('%Y-%m-%d'),
                'quantity': pred
            })
        
        return predictions
    
    def get_feature_importance(self):
        """
        Get feature importance from XGBoost model
        """
        if not self.is_fitted:
            return {}
        
        importance = self.model.feature_importances_
        importance_dict = dict(zip(self.feature_names, importance))
        return {k: float(v) for k, v in sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)}


def forecast_xgboost(historical_data, horizon=7, lookback=7, **kwargs):
    """
    Convenience function to train and predict with XGBoost
    
    Args:
        historical_data: List of dicts with 'date' and 'quantity'
        horizon: Number of days to forecast
        lookback: Number of past days to use as features
        **kwargs: Additional XGBoost parameters
        
    Returns:
        dict with predictions and metrics
    """
    if not XGBOOST_AVAILABLE:
        raise ImportError("XGBoost is not installed. Install with: pip install xgboost")
    
    forecaster = XGBoostForecaster(**kwargs)
    
    # Train model
    metrics = forecaster.fit(historical_data, lookback)
    
    # Generate predictions
    predictions = forecaster.predict(historical_data, horizon)
    
    # Get feature importance
    feature_importance = forecaster.get_feature_importance()
    
    return {
        'predictions': predictions,
        'metrics': metrics,
        'feature_importance': feature_importance,
        'model_type': 'xgboost'
    }
