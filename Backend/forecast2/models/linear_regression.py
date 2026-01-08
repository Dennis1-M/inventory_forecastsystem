# Backend/forecast2/models/linear_regression.py
"""
Linear Regression Forecasting Model
Uses scikit-learn for time series forecasting with feature engineering
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta


class LinearRegressionForecaster:
    """
    Linear Regression model for demand forecasting
    """
    
    def __init__(self):
        self.model = LinearRegression()
        self.scaler = StandardScaler()
        self.is_fitted = False
        
    def create_features(self, data, lookback=7):
        """
        Create time series features for regression
        
        Features:
        - Lagged values (past N days)
        - Rolling averages
        - Day of week
        - Week of month
        - Trend (time index)
        """
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        df = df.set_index('date')
        
        # Ensure numeric quantity
        df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce')
        df = df.dropna()
        
        features = pd.DataFrame(index=df.index)
        
        # Trend feature (time index)
        features['trend'] = range(len(df))
        
        # Lagged features
        for i in range(1, lookback + 1):
            features[f'lag_{i}'] = df['quantity'].shift(i)
        
        # Rolling statistics
        features['rolling_mean_3'] = df['quantity'].rolling(window=3, min_periods=1).mean()
        features['rolling_mean_7'] = df['quantity'].rolling(window=7, min_periods=1).mean()
        features['rolling_std_7'] = df['quantity'].rolling(window=7, min_periods=1).std().fillna(0)
        
        # Cyclical features (day of week)
        features['day_of_week'] = df.index.dayofweek  # type: ignore
        features['week_of_month'] = (df.index.day - 1) // 7 + 1  # type: ignore
        
        # Target variable
        features['target'] = df['quantity'].values
        
        # Drop rows with NaN (from lagged features)
        features = features.dropna()
        
        return features
    
    def fit(self, historical_data, lookback=7):
        """
        Train the Linear Regression model
        
        Args:
            historical_data: List of dicts with 'date' and 'quantity'
            lookback: Number of past days to use as features
            
        Returns:
            dict with training metrics
        """
        if len(historical_data) < lookback + 5:
            raise ValueError(f"Insufficient data. Need at least {lookback + 5} days, got {len(historical_data)}")
        
        # Create features
        features_df = self.create_features(historical_data, lookback)
        
        # Separate features and target
        X = features_df.drop('target', axis=1)
        y = features_df['target']
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        self.is_fitted = True
        self.feature_names = X.columns.tolist()
        self.lookback = lookback
        
        # Calculate training metrics
        train_predictions = self.model.predict(X_scaled)
        mae = np.mean(np.abs(y - train_predictions))
        rmse = np.sqrt(np.mean((y - train_predictions) ** 2))
        
        # R² score
        r2 = self.model.score(X_scaled, y)
        
        return {
            'mae': float(mae),
            'rmse': float(rmse),
            'r2_score': float(r2),
            'training_samples': len(X)
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
            
            # Scale features
            X_scaled = self.scaler.transform(latest_features)
            
            # Predict
            pred = self.model.predict(X_scaled)[0]
            pred = max(0, pred)  # Ensure non-negative
            
            # Simple confidence interval (±15%)
            lower = max(0, pred * 0.85)
            upper = pred * 1.15
            
            # Forecast date
            forecast_date = last_date + timedelta(days=day)
            
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
        Get feature importance (coefficients)
        """
        if not self.is_fitted:
            return {}
        
        importance = dict(zip(self.feature_names, self.model.coef_))
        return {k: float(v) for k, v in sorted(importance.items(), key=lambda x: abs(x[1]), reverse=True)}


def forecast_linear_regression(historical_data, horizon=7, lookback=7):
    """
    Convenience function to train and predict in one call
    
    Args:
        historical_data: List of dicts with 'date' and 'quantity'
        horizon: Number of days to forecast
        lookback: Number of past days to use as features
        
    Returns:
        dict with predictions and metrics
    """
    forecaster = LinearRegressionForecaster()
    
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
        'model_type': 'linear_regression'
    }
