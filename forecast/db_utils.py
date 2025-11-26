import pandas as pd
from sqlalchemy import text
from db import engine

def save_forecast_to_db(product_id, result, periods):
    if not result or "out_df" not in result:
        return None

    # 1️⃣ Insert ForecastRun
    run_query = text("""
        INSERT INTO "ForecastRun" 
        ("productId", period, mae, accuracy, model, explanations, feature_importance)
        VALUES (:pid, :period, :mae, :accuracy, :model, :explanations::jsonb, :feat_importance::jsonb)
        RETURNING id
    """)
    run_id = engine.execute(run_query, {
        "pid": product_id,
        "period": periods,
        "mae": result.get("mae", 0.0),
        "accuracy": result.get("accuracy", 0.0),
        "model": result.get("model", "unknown"),
        "explanations": pd.io.json.dumps(result.get("explanations", [])),
        "feat_importance": pd.io.json.dumps(result.get("feature_importance", {}))
    }).scalar()

    # 2️⃣ Insert ForecastPoint for each day
    out_df = result["out_df"]
    for _, row in out_df.iterrows():
        point_query = text("""
            INSERT INTO "ForecastPoint"
            ("forecastRunId", "forecastDate", predictedSales, predictedSalesLower, predictedSalesUpper)
            VALUES (:run_id, :fdate, :yhat, :yhat_lower, :yhat_upper)
        """)
        engine.execute(point_query, {
            "run_id": run_id,
            "fdate": row['ds'].date(),
            "yhat": float(row['yhat']),
            "yhat_lower": float(row.get('yhat_lower', 0.0)),
            "yhat_upper": float(row.get('yhat_upper', 0.0))
        })

    return run_id
