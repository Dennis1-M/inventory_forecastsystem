# forecasting/eval_expiry_alerts.py
from ml_db import engine
import pandas as pd

def expiry_precision(window_days=30):
    q = """
    SELECT a.id as alert_id, a."createdAt" as alert_at, a."productId", p."expiryDate"
    FROM "Alert" a
    JOIN "Product" p ON p.id = a."productId"
    WHERE a."alertType" = 'EXPIRY'
    """
    df = pd.read_sql(q, engine.connect())
    df['alert_at'] = pd.to_datetime(df['alert_at'])
    df['expiryDate'] = pd.to_datetime(df['expiryDate'])
    df['expired_within_window'] = df.apply(lambda r: pd.notnull(r.expiryDate) and (r.expiryDate <= r.alert_at + pd.Timedelta(days=window_days)), axis=1)
    if len(df)==0: return {'precision': None}
    precision = df['expired_within_window'].sum() / len(df)
    return {'precision': float(precision), 'count': len(df)}

if __name__ == "__main__":
    print(expiry_precision(30))
