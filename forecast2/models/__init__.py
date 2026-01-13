"""
Models package for AI-Enabled Inventory Forecasting System
"""

from .linear_regression import LinearRegressionForecaster as _LRForecaster
from .xgboost_model import XGBoostForecaster

# Import the wrapper if it exists
try:
    from .linear_regression_model import LinearRegressionForecaster
except ImportError:
    # Fallback to original if wrapper doesn't exist
    LinearRegressionForecaster = _LinearRegressionForecaster  # type: ignore

__all__ = ['LinearRegressionForecaster', 'XGBoostForecaster']
