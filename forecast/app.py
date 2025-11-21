import os
import pandas as pd
from flask import Flask, request, jsonify
from db import engine
from forecast_model import train_and_forecast
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ----------------------------------------
# Helper to convert Pandas DateTime to ISO string for safe JSON passing
# ----------------------------------------
def _to_iso_safe(dt):
    """Converts datetime to ISO format, handling Timezone-naive and Timezone-aware objects."""
    if isinstance(dt, pd.Timestamp):
        # Convert to UTC and then remove timezone info to match Prisma's expectation
        if dt.tz is not None:
            return dt.tz_convert('UTC').tz_localize(None).isoformat()
        return dt.isoformat()
    # Fallback for standard datetime objects
    return dt.isoformat()


@app.get("/")
def home():
    return jsonify({
        "message": "Forecast API is running successfully!",
        "available_endpoints": {
            "POST /run": "Run a forecast for a given product. Body: { productId, horizon }"
        }
    })

@app.post("/run")
def run_forecast():
    """
    Triggers the ML model, saves results to the database, and returns the prediction.
    """
    data = request.json or {}
    product_id = data.get("productId")
    horizon = data.get("horizon", 14)

    if not product_id:
        return jsonify({"error": "productId required"}), 400

    # train_and_forecast returns a dictionary: 
    # { out_df, mae, accuracy, model } or None
    forecast_result = train_and_forecast(product_id, horizon)

    if forecast_result is None:
        return jsonify({"error": "Insufficient sales data (need >= 7 days) or model failure."}), 400
    
    prediction_df = forecast_result.get("out_df")
    mae = forecast_result.get("mae")
    accuracy = forecast_result.get("accuracy")
    model_method = forecast_result.get("model")

    if prediction_df is None or prediction_df.empty:
        return jsonify({"error": "Forecast output is empty"}), 500

    # --- Save Run + Points to DB (Transaction) ---
    try:
        with engine.begin() as conn:
            # 1. INSERT the ForecastRun
            run = conn.execute(text('''
                INSERT INTO "ForecastRun" ("productId","method","horizon","mae","accuracy")
                VALUES (:pid,:method,:horizon,:mae,:accuracy) RETURNING id
            '''), {
                "pid": int(product_id),
                "method": model_method,
                "horizon": int(horizon),
                "mae": float(mae),
                "accuracy": float(accuracy)
            }).fetchone()
            
            run_id = run[0] if isinstance(run, tuple) else run.id

            # 2. INSERT the ForecastPoints
            for _, row in prediction_df.iterrows():
                conn.execute(text('''
                    INSERT INTO "ForecastPoint" ("runId", period, predicted, lower95, upper95)
                    VALUES (:run_id, :period, :pred, :lower, :upper)
                '''), {
                    "run_id": run_id,
                    "period": _to_iso_safe(row["ds"]), # Use safe ISO converter
                    "pred": float(row["yhat"]),
                    "lower": float(row["yhat_lower"]),
                    "upper": float(row["yhat_upper"])
                })
    except Exception as e:
        print(f"Failed to save forecast to DB: {e}")
        return jsonify({"error": "Failed to save forecast to DB", "details": str(e)}), 500

    # --- Return Normalized JSON Response ---
    predictions = []
    for _, r in prediction_df.iterrows():
        predictions.append({
            "date": _to_iso_safe(r["ds"]),
            "yhat": float(r["yhat"]),
            "lower95": float(r["yhat_lower"]),
            "upper95": float(r["yhat_upper"]),
        })

    return jsonify({
        "ok": True,
        "message": "Forecast saved and ready to be queried.", 
        "runId": run_id, 
        "mae": mae,
        "accuracy": accuracy,
        "model": model_method,
        "predictions": predictions
    })


# NOTE: The GET /forecasts/<int:product_id> endpoint is removed, 
# as the Node.js controller handles all retrieval using Prisma (see forecastController.js).


if __name__ == "__main__":
    # port configurable with PORT env var
    port = int(os.getenv("PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "1") == "1")