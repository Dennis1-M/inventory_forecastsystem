import pandas as pd
import json
from sqlalchemy import text
from db import engine

def save_forecast_to_db(product_id, result, periods):
    if not result or "out_df" not in result:
        return None

    out_df = result["out_df"]

    with engine.begin() as conn:

        # Insert into ForecastRun
        run_query = text("""
            INSERT INTO "ForecastRun"
            ("productId", method, horizon, mae, accuracy)
            VALUES (:pid, :method, :horizon, :mae, :accuracy)
            RETURNING id
        """)

        run_id = conn.execute(run_query, {
            "pid": product_id,
            "method": result.get("model", "Ensemble"),
            "horizon": periods,
            "mae": result.get("mae", 0.0),
            "accuracy": result.get("accuracy", 0.0)
        }).scalar()

        # Insert ForecastPoint rows (MATCHES your DB SCHEMA)
        point_query = text("""
            INSERT INTO "ForecastPoint"
            ("runId", period, predicted, lower95, upper95)
            VALUES (:run_id, :period, :predicted, :lower, :upper)
        """)

        for _, row in out_df.iterrows():
            conn.execute(point_query, {
                "run_id": run_id,
                "period": row["ds"],  # timestamp
                "predicted": float(row["yhat"]),
                "lower": float(row.get("yhat_lower", 0.0)),
                "upper": float(row.get("yhat_upper", 0.0)),
            })

    return run_id
