import pandas as pd
from sqlalchemy import text
from db import engine
from prophet import Prophet

def train_and_forecast(product_id, periods=7):
    query = text("""
        SELECT date, quantity 
        FROM "Sale" 
        WHERE "productId" = :pid
        ORDER BY date ASC
    """)
    df = pd.read_sql(query, engine, params={"pid": product_id})

    if df.empty:
        return None

    df = df.rename(columns={"date": "ds", "quantity": "y"})
    model = Prophet()
    model.fit(df)

    future = model.make_future_dataframe(periods=periods)
    forecast = model.predict(future)

    # ✅ Ensure no negative forecast values
    forecast['yhat'] = forecast['yhat'].clip(lower=0)

    return forecast[['ds', 'yhat']]
