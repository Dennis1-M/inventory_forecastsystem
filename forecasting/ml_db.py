# forecasting/ml_db.py
import os
from sqlalchemy import create_engine, text
import pandas as pd
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, future=True)

def load_sales_agg(product_id, start_date=None, end_date=None, freq='D', lookback_days=180):
    """
    Returns a DataFrame with 'period' (date) and 'quantity' aggregated by freq.
    freq: 'D' daily, 'W' weekly, 'M' monthly
    """
    # date trunc unit mapping
    unit = {'D':'day','W':'week','M':'month'}[freq]
    query = """
    SELECT date_trunc(:unit, "createdAt")::date as period,
           SUM(quantity) AS quantity
    FROM "Sale"
    WHERE "productId" = :product_id
    AND "createdAt" >= (current_date - (:lookback_days || ' days')::interval)
    GROUP BY period
    ORDER BY period;
    """
    df = pd.read_sql(text(query), engine.connect(), params={"unit": unit,"product_id": product_id,"lookback_days": lookback_days})
    # ensure continuous periods
    if df.empty:
        # create empty series of zeros
        return pd.DataFrame(columns=['period','quantity'])
    df['period'] = pd.to_datetime(df['period'])
    df = df.set_index('period').asfreq('D', fill_value=0).reset_index()
    return df

def write_forecast_run_and_points(run_meta: dict, points_df):
    """
    run_meta: dict with productId, method, params (json string or None), horizon, mae, accuracy
    points_df: DataFrame(period datetime, predicted float, lower95?, upper95?)
    Returns run_id
    """
    with engine.begin() as conn:
        r = conn.execute(
            text('INSERT INTO "ForecastRun" ("productId","method","params","horizon","mae","accuracy","createdAt") '
                 'VALUES (:productId, :method, :params::jsonb, :horizon, :mae, :accuracy, now()) RETURNING id'),
            run_meta
        )
        run_id = r.scalar()
        if not points_df.empty:
            points_df = points_df.copy()
            points_df['runId'] = run_id
            # insert rows
            rows = points_df.to_dict(orient='records')
            for row in rows:
                conn.execute(
                    text('INSERT INTO "ForecastPoint" ("runId","period","predicted","lower95","upper95") VALUES '
                         '(:runId,:period,:predicted,:lower95,:upper95)'),
                    row
                )
    return run_id
