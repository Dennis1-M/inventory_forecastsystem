# Backend/forecast2/models/lstm_model.py
"""
LSTM Forecasting Model (Experimental)
Deep learning model for time series forecasting using TensorFlow/Keras
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

try:
    import tensorflow as tf
    from tensorflow import keras  # type: ignore
    from tensorflow.keras import layers  # type: ignore
    from tensorflow.keras.callbacks import EarlyStopping  # type: ignore
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("⚠️  TensorFlow not installed. Install with: pip install tensorflow")


class LSTMForecaster:
    """
    LSTM model for demand forecasting (experimental)
    """
    
    def __init__(self, units=50, dropout=0.2, epochs=50, batch_size=32):
        if not TENSORFLOW_AVAILABLE:
            raise ImportError("TensorFlow is not installed. Install with: pip install tensorflow")
        
        self.units = units
        self.dropout = dropout
        self.epochs = epochs
        self.batch_size = batch_size
        self.model = None
        self.is_fitted = False
        self.scaler_min = None
        self.scaler_max = None
        
    def normalize_data(self, data):
        """
        Min-max normalization
        """
        data_min = np.min(data)
        data_max = np.max(data)
        
        if data_max == data_min:
            return np.zeros_like(data), data_min, data_max
        
        normalized = (data - data_min) / (data_max - data_min)
        return normalized, data_min, data_max
    
    def denormalize_data(self, normalized_data):
        """
        Reverse min-max normalization
        """
        if self.scaler_max == self.scaler_min:
            return np.full_like(normalized_data, self.scaler_min)
        
        return normalized_data * (self.scaler_max - self.scaler_min) + self.scaler_min  # type: ignore
    
    def create_sequences(self, data, lookback):
        """
        Create sequences for LSTM training
        
        Args:
            data: Array of values
            lookback: Number of time steps to look back
            
        Returns:
            X (features), y (targets)
        """
        X, y = [], []
        for i in range(lookback, len(data)):
            X.append(data[i-lookback:i])
            y.append(data[i])
        return np.array(X), np.array(y)
    
    def build_model(self, input_shape):
        """
        Build LSTM architecture
        """
        model = keras.Sequential([
            layers.LSTM(self.units, return_sequences=True, input_shape=input_shape),
            layers.Dropout(self.dropout),
            layers.LSTM(self.units // 2, return_sequences=False),
            layers.Dropout(self.dropout),
            layers.Dense(25),
            layers.Dense(1)
        ])
        
        model.compile(
            optimizer='adam',
            loss='mean_squared_error',
            metrics=['mae']
        )
        
        return model
    
    def fit(self, historical_data, lookback=14, validation_split=0.2, verbose=0):
        """
        Train the LSTM model
        
        Args:
            historical_data: List of dicts with 'date' and 'quantity'
            lookback: Number of time steps to look back
            validation_split: Fraction of data to use for validation
            verbose: Training verbosity (0=silent, 1=progress bar, 2=one line per epoch)
            
        Returns:
            dict with training metrics
        """
        min_required = lookback + 20
        if len(historical_data) < min_required:
            raise ValueError(f"Insufficient data. Need at least {min_required} days, got {len(historical_data)}")
        
        # Prepare data
        df = pd.DataFrame(historical_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce')
        df = df.dropna()
        
        quantities = df['quantity'].values
        
        # Normalize data
        normalized_data, self.scaler_min, self.scaler_max = self.normalize_data(quantities)
        
        # Create sequences
        X, y = self.create_sequences(normalized_data, lookback)
        
        # Reshape for LSTM [samples, time steps, features]
        X = X.reshape(X.shape[0], X.shape[1], 1)
        
        # Build model
        self.model = self.build_model(input_shape=(lookback, 1))
        
        # Early stopping to prevent overfitting
        early_stop = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        # Train model
        history = self.model.fit(
            X, y,
            epochs=self.epochs,
            batch_size=self.batch_size,
            validation_split=validation_split,
            callbacks=[early_stop],
            verbose=verbose
        )
        
        self.is_fitted = True
        self.lookback = lookback
        
        # Calculate metrics
        train_predictions = self.model.predict(X, verbose=0).flatten()
        train_predictions = self.denormalize_data(train_predictions)
        y_denorm = self.denormalize_data(y)
        
        mae = np.mean(np.abs(y_denorm - train_predictions))
        rmse = np.sqrt(np.mean((y_denorm - train_predictions) ** 2))
        
        # Get final loss from history
        final_loss = history.history['loss'][-1]
        final_val_loss = history.history.get('val_loss', [final_loss])[-1]
        
        return {
            'mae': float(mae),
            'rmse': float(rmse),
            'final_loss': float(final_loss),
            'final_val_loss': float(final_val_loss),
            'epochs_trained': len(history.history['loss']),
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
        
        # Prepare data
        df = pd.DataFrame(historical_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce')
        df = df.dropna()
        
        quantities = df['quantity'].values
        last_date = df['date'].iloc[-1]
        
        # Normalize
        normalized_data, _, _ = self.normalize_data(quantities)
        
        # Use last lookback values as initial sequence
        current_sequence = normalized_data[-self.lookback:]
        predictions = []
        
        for day in range(1, horizon + 1):
            # Reshape for prediction
            X_pred = current_sequence[-self.lookback:].reshape(1, self.lookback, 1)
            
            # Predict next value
            pred_normalized = self.model.predict(X_pred, verbose=0)[0, 0]  # type: ignore
            
            # Denormalize
            pred = self.denormalize_data(np.array([pred_normalized]))[0]
            pred = max(0, pred)  # Ensure non-negative
            
            # Confidence interval (±25% for LSTM due to higher uncertainty)
            lower = max(0, pred * 0.75)
            upper = pred * 1.25
            
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
            
            # Update sequence with new prediction (normalized)
            current_sequence = np.append(current_sequence, pred_normalized)
        
        return predictions


def forecast_lstm(historical_data, horizon=7, lookback=14, **kwargs):
    """
    Convenience function to train and predict with LSTM
    
    Args:
        historical_data: List of dicts with 'date' and 'quantity'
        horizon: Number of days to forecast
        lookback: Number of time steps to look back
        **kwargs: Additional LSTM parameters (units, dropout, epochs, batch_size)
        
    Returns:
        dict with predictions and metrics
    """
    if not TENSORFLOW_AVAILABLE:
        raise ImportError("TensorFlow is not installed. Install with: pip install tensorflow")
    
    forecaster = LSTMForecaster(**kwargs)
    
    # Train model
    metrics = forecaster.fit(historical_data, lookback)
    
    # Generate predictions
    predictions = forecaster.predict(historical_data, horizon)
    
    return {
        'predictions': predictions,
        'metrics': metrics,
        'model_type': 'lstm',
        'note': 'LSTM is experimental and requires substantial data for good performance'
    }
