"""
refined forecast_model.py
FastAPI-compatible forecasting backend with Kenyan context, ensemble model,
feature engineering, explainability, and stable prediction generation.
"""
import calendar
from datetime import timedelta
import numpy as np
import pandas as pd
import holidays
from sqlalchemy import text
from db import engine

from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler

# ------------------------------
# KENYAN-SPECIFIC FEATURES
# ------------------------------
def _add_kenyan_features(df):
    """Adds Kenya-specific temporal features"""
    df = df.copy()
    df['ds'] = pd.to_datetime(df['ds'])
    ke_holidays = holidays.Kenya(years=range(df['ds'].dt.year.min(), df['ds'].dt.year.max() + 3))

    df['is_weekend'] = (df['ds'].dt.dayofweek >= 5).astype(int)
    df['is_holiday'] = df['ds'].isin(ke_holidays).astype(int)
    df['is_month_end'] = df['ds'].apply(lambda d: int(d.day == calendar.monthrange(d.year, d.month)[1]))
    df['is_month_start'] = (df['ds'].dt.day == 1).astype(int)

    # Kenyan specific seasons
    df['is_rainy_season'] = df['ds'].dt.month.isin([3,4,5,10,11]).astype(int)
    df['is_dry_season'] = df['ds'].dt.month.isin([6,7,8,9,12,1]).astype(int)

    # School calendar effects
    df['is_school_holiday'] = _get_kenyan_school_holidays(df['ds'])
    df['is_back_to_school'] = _get_back_to_school_periods(df['ds'])

    # Payday effects (last week of month)
    df['is_last_week'] = (df['ds'].dt.day >= 25).astype(int)

    return df

def _get_kenyan_school_holidays(dates):
    """Identify Kenyan school holiday periods"""
    mask = np.zeros(len(dates), dtype=int)
    for i, date in enumerate(dates):
        if date.month in (4, 8, 12):
            mask[i] = 1
    return mask

def _get_back_to_school_periods(dates):
    """Identify back-to-school periods (January, May, September)"""
    mask = np.zeros(len(dates), dtype=int)
    for i, date in enumerate(dates):
        if (date.month == 1 and date.day <= 15) or (date.month == 5 and date.day <= 10) or (date.month == 9 and date.day <= 10):
            mask[i] = 1
    return mask

# ------------------------------
# ADVANCED FEATURE ENGINEERING
# ------------------------------
def _create_advanced_features(df_ts):
    """Creates advanced features for better forecasting"""
    df_ts = df_ts.copy()
    # Rolling statistics
    df_ts['rolling_mean_7'] = df_ts['y'].rolling(window=7, min_periods=1).mean()
    df_ts['rolling_std_7'] = df_ts['y'].rolling(window=7, min_periods=1).std().fillna(0)
    df_ts['rolling_max_7'] = df_ts['y'].rolling(window=7, min_periods=1).max().fillna(0)

    # Trend features
    df_ts['day_of_month'] = df_ts['ds'].dt.day
    df_ts['week_of_year'] = df_ts['ds'].dt.isocalendar().week.astype(int)
    df_ts['quarter'] = df_ts['ds'].dt.quarter

    # Product seasonality
    df_ts['is_year_end'] = (((df_ts['ds'].dt.month == 12) & (df_ts['ds'].dt.day >= 15))).astype(int)
    df_ts['is_year_start'] = (((df_ts['ds'].dt.month == 1) & (df_ts['ds'].dt.day <= 15))).astype(int)

    # Add Kenyan features
    df_ts = _add_kenyan_features(df_ts)

    return df_ts

# ------------------------------
# ENSEMBLE MODEL
# ------------------------------
class EnsembleForecaster:
    def __init__(self):
        self.models = {
            'xgb': XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42, n_jobs=-1, verbosity=0),
            'rf': RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        }
        self.weights = None
        self.scaler = StandardScaler()
        self.fitted = False

    def fit(self, X, y):
        # Fit scaler then models
        X_scaled = self.scaler.fit_transform(X)
        for name, model in self.models.items():
            model.fit(X_scaled, y)
        self._calculate_weights(X_scaled, y)
        self.fitted = True

    def predict(self, X):
        if not self.fitted:
            raise RuntimeError("EnsembleForecaster not fitted")
        X_scaled = self.scaler.transform(X)
        preds = []
        for _, model in self.models.items():
            preds.append(model.predict(X_scaled))
        preds = np.vstack(preds)  # shape (n_models, n_samples)
        if self.weights is None:
            return np.mean(preds, axis=0)
        return np.average(preds, axis=0, weights=self.weights)

    def _calculate_weights(self, X_scaled, y):
        # use last 30% for validation
        n = len(X_scaled)
        split = int(0.7 * n)
        if split >= n:
            self.weights = None
            return
        X_val = X_scaled[split:]
        y_val = y[split:]
        errors = []
        for _, model in self.models.items():
            pred = model.predict(X_val)
            errors.append(mean_absolute_error(y_val, pred))
        total = sum(errors)
        if total <= 0:
            self.weights = None
            return
        inv = [1 - (e / total) for e in errors]
        s = sum(inv)
        if s <= 0:
            self.weights = None
            return
        self.weights = [v / s for v in inv]

# ------------------------------
# PREPROCESSING
# ------------------------------
def _preprocess_sales(df):
    """Enhanced preprocessing that reindexes to a continuous daily timeline (fills missing days with 0).
    This allows forecasting even when the DB returns very few rows (option B).
    Returns (df_ts, full_range)
    """
    if df is None or df.empty:
        return None, None

    df = df.copy()
    # Ensure date parsing
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])
    if df.empty:
        return None, None

    # Standard columns
    df = df.rename(columns={'date': 'ds', 'quantity': 'y'})

    # aggregate by day (sum)
    df = df.groupby('ds', as_index=False)['y'].sum()

    # create continuous date range (from min to max). If only one day, still creates single-day range.
    start = df['ds'].min()
    end = df['ds'].max()
    full_range = pd.date_range(start, end, freq='D')

    # reindex to full daily timeline and fill missing with 0
    df_ts = df.set_index('ds').reindex(full_range).fillna(0).reset_index()
    df_ts.columns = ['ds', 'y']
    df_ts['ds'] = pd.to_datetime(df_ts['ds'])
    df_ts['y'] = df_ts['y'].astype(float)

    # remove extreme outliers (replace with mean) - keep behavior
    mu = df_ts['y'].mean()
    sigma = df_ts['y'].std()
    if pd.notna(sigma) and sigma > 0:
        mask = (df_ts['y'] > mu + 3 * sigma) | (df_ts['y'] < mu - 3 * sigma)
        df_ts.loc[mask, 'y'] = mu

    # basic time features
    df_ts['dayofweek'] = df_ts['ds'].dt.dayofweek
    df_ts['dayofyear'] = df_ts['ds'].dt.dayofyear
    df_ts['month'] = df_ts['ds'].dt.month
    df_ts['year'] = df_ts['ds'].dt.year

    # lags: fill missing shifts with 0 (safe for short histories)
    for lag in [1, 2, 3, 7, 14, 30]:
        df_ts[f'y_lag{lag}'] = df_ts['y'].shift(lag).fillna(0)

    # advanced features (rolling uses min_periods=1 so it works with very short series)
    df_ts = _create_advanced_features(df_ts)

    # keep all rows (don't drop too aggressively). Only drop rows that are fully NaN (shouldn't happen)
    df_ts = df_ts.reset_index(drop=True)

    return df_ts, full_range


# ------------------------------
# EXPLAINABLE AI
# ------------------------------
def _generate_explanations(features_map, prediction, last_actual):
    """Return a list of human readable explanations."""
    explanations = []
    try:
        if last_actual is not None and last_actual > 0:
            if prediction > last_actual * 1.2:
                explanations.append("Higher than usual demand expected")
            elif prediction < last_actual * 0.8:
                explanations.append("Lower than usual demand expected")
            else:
                explanations.append("Stable demand pattern expected")
    except Exception:
        explanations.append("Trend relative to last actual unavailable")

    if features_map.get('is_holiday'):
        explanations.append("Holiday season typically increases demand")
    if features_map.get('is_rainy_season'):
        explanations.append("Rainy season may affect shopping patterns")
    if features_map.get('is_last_week'):
        explanations.append("End-of-month payday may boost sales")
    return explanations

# ------------------------------
# FORECAST WRAPPER
# ------------------------------
def train_and_forecast(product_id: int, periods: int = 14):
    """
    Main forecast wrapper.
    Fetches data → preprocess → trains ensemble → fallback if needed.
    Returns dict with:
        out_df, mae, accuracy, model, explanations, feature_importance
    """

    print("\n" + "="*80)
    print(f"🚀 FORECAST DEBUG START – product_id = {product_id}, periods = {periods}")
    print("="*80)

    # 1️⃣ LOAD RAW SALES DATA
    df_raw = _fetch_sales(product_id)
    print("\n📌 RAW DATA FROM DB:")
    print(df_raw.head())
    print("Row count (raw):", len(df_raw))

    if df_raw is None or len(df_raw) == 0:
        print("❌ ERROR: No raw data found for this product.")
        return None

    # 2️⃣ PREPROCESS
    df_ts, meta = _preprocess_sales(df_raw)
    print("\n📌 AFTER PREPROCESSING:")
    print(df_ts.head())
    print("Row count (processed):", len(df_ts))

    if df_ts is None or len(df_ts) < 14:
        print("❌ ERROR: Not enough valid time-series rows (<14).")
        return None

    # 3️⃣ FEATURE MATRIX
    features = [c for c in df_ts.columns if c not in ('ds', 'y')]
    X = df_ts[features].values
    y = df_ts['y'].values

    # Split: ensure test set always exists
    train_size = max(len(df_ts) - periods, int(0.7 * len(df_ts)))
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]

    print(f"\n📊 TRAIN SIZE: {len(X_train)}")
    print(f"📊 TEST SIZE: {len(X_test)}")

    # 4️⃣ TRAIN ENSEMBLE MODEL
    model = EnsembleForecaster()

    try:
        print("\n🤖 Training EnsembleForecaster...")
        model.fit(X_train, y_train)

        print("🔍 Predicting test set...")
        y_pred_test = model.predict(X_test)

        mae = float(mean_absolute_error(y_test, y_pred_test))
        accuracy = float(max(r2_score(y_test, y_pred_test), 0.0) * 100)

        # 5️⃣ FUTURE PREDICTIONS
        print("\n⏳ Generating future predictions...")
        out_df = _generate_future_predictions(model, df_ts, features, periods)

        # Prepare explanations
        first_row = out_df.iloc[0].to_dict() if len(out_df) else {}
        feat_map = {f: first_row.get(f, 0) for f in features}
        explanations = _generate_explanations(
            feat_map,
            float(first_row.get('yhat', 0)),
            float(df_ts['y'].iloc[-1])
        )

        feature_importance = _get_feature_importance(model, features)

        print("✅ Ensemble forecast completed successfully.")
        print("="*80 + "\n")

        return {
            "out_df": out_df,
            "mae": mae,
            "accuracy": accuracy,
            "model": "Ensemble(XGBoost+RF)",
            "explanations": explanations,
            "feature_importance": feature_importance
        }

    except Exception as e:
        print("\n❌ ENSEMBLE MODEL FAILED:", e)
        print("⚠ Switching to fallback forecast...")

        fallback = _fallback_forecast(df_ts, features, periods)

        if fallback:
            print("✅ Fallback forecast successful.")
        else:
            print("❌ Fallback forecast also failed.")

        print("="*80 + "\n")
        return fallback


# ------------------------------
# FUTURE PREDICTIONS
# ------------------------------
def _generate_future_predictions(model, df_ts, features, periods):
    future_dates = [df_ts['ds'].max() + timedelta(days=i+1) for i in range(periods)]
    preds = []
    last_row = df_ts.iloc[-1].copy()
    historical = df_ts['y'].tolist()

    for i, date in enumerate(future_dates):
        row = {}
        # time features
        row['dayofweek'] = date.dayofweek
        row['dayofyear'] = date.timetuple().tm_yday
        row['month'] = date.month
        row['year'] = date.year
        row['week_of_year'] = date.isocalendar()[1]
        row['day_of_month'] = date.day
        row['quarter'] = (date.month-1)//3 + 1

        # kenyan features
        ke_holidays = holidays.Kenya(years=range(date.year-1, date.year+3))
        row['is_weekend'] = int(date.dayofweek >= 5)
        row['is_holiday'] = int(date in ke_holidays)
        last_day = calendar.monthrange(date.year, date.month)[1]
        row['is_month_end'] = int(date.day == last_day)
        row['is_month_start'] = int(date.day == 1)
        row['is_rainy_season'] = int(date.month in [3,4,5,10,11])
        row['is_last_week'] = int(date.day >= 25)
        row['is_school_holiday'] = int(date.month in [4,8,12])
        row['is_back_to_school'] = int((date.month==1 and date.day<=15) or (date.month==5 and date.day<=10) or (date.month==9 and date.day<=10))

        # lag features
        row['y_lag1'] = last_row['y'] if i==0 else preds[-1]['yhat']
        for lag in [2,3,7,14,30]:
            if i >= lag:
                row[f'y_lag{lag}'] = preds[i-lag]['yhat']
            else:
                idx = len(historical) - (lag - i)
                row[f'y_lag{lag}'] = historical[idx] if idx >= 0 else 0

        # rolling
        recent = (historical + [p['yhat'] for p in preds])[-7:]
        row['rolling_mean_7'] = float(np.mean(recent)) if recent else 0.0
        row['rolling_std_7'] = float(np.std(recent)) if recent else 0.0

        X_arr = np.array([[row.get(f,0) for f in features]])
        yhat = float(model.predict(X_arr)[0])
        yhat = max(0.0, yhat)

        row['ds'] = date
        row['yhat'] = yhat
        preds.append(row)
        last_row['y'] = yhat

    out_df = pd.DataFrame(preds)
    out_df['yhat_lower'] = out_df['yhat'] * 0.8
    out_df['yhat_upper'] = out_df['yhat'] * 1.3
    cols = ['ds','yhat','yhat_lower','yhat_upper'] + [f for f in features if f in out_df.columns]
    return out_df[cols]

# ------------------------------
# FEATURE IMPORTANCE
# ------------------------------
def _get_feature_importance(model, feature_names):
    importance = {f:0.0 for f in feature_names}
    for _, m in model.models.items():
        if hasattr(m,'feature_importances_'):
            imp = np.array(m.feature_importances_, dtype=float)
            if imp.sum()>0:
                imp = imp / imp.sum()
            for i, s in enumerate(imp):
                importance[feature_names[i]] += float(s)
    total = sum(importance.values())
    if total>0:
        return {k: v/total for k,v in sorted(importance.items(), key=lambda x:-x[1])[:10]}
    return importance

# ------------------------------
# FALLBACK
# ------------------------------
def _fallback_forecast(df_ts, features, periods):
    last_7_avg = float(df_ts['y'].tail(7).mean()) if len(df_ts)>0 else 0.0
    future_dates = [df_ts['ds'].max() + timedelta(days=i+1) for i in range(periods)]
    out_df = pd.DataFrame({'ds':future_dates, 'yhat':[last_7_avg]*periods})
    out_df['yhat_lower'] = out_df['yhat'] * 0.7
    out_df['yhat_upper'] = out_df['yhat'] * 1.3
    return {'out_df': out_df, 'mae': float(abs(last_7_avg - df_ts['y'].iloc[-1]) if len(df_ts)>0 else 0.0),
            'accuracy': 50.0, 'model':'MovingAverage(Fallback)', 'explanations':['Fallback average used'],
            'feature_importance':{}}

# ------------------------------
# DB ACCESS (existing function)
# ------------------------------
def _fetch_sales(product_id):
    query = """
        SELECT "saleDate" AS date, "quantitySold" AS quantity
        FROM "Sale"
        WHERE "productId" = %(pid)s
        ORDER BY "saleDate" ASC
    """
    df = pd.read_sql(query, engine, params={"pid": int(product_id)})
    return df
