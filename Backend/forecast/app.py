# app.py
import os
from flask import Flask, request, jsonify
from db import engine
from forecast_model import train_and_forecast
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.get("/")
def home():
    return jsonify({
        "message": "Forecast API is running successfully!",
        "available_endpoints": {
            "POST /run": "Run a forecast for a given product. Body: { productId, horizon }",
            "GET /forecasts/<product_id>": "Get latest forecast points for a product"
        }
    })

@app.post("/run")
def run_forecast():
    data = request.json or {}
    product_id = data.get("productId")
    horizon = data.get("horizon", 7)

    if not product_id:
        return jsonify({"error": "productId required"}), 400

    # train_and_forecast returns a dataframe with columns ['ds', 'yhat'] (or None)
    forecast = train_and_forecast(product_id, horizon)

    if forecast is None or forecast.empty:
        return jsonify({"error": "No sales data found"}), 400

    # ensure ds is datetime-like and yhat exists
    if "ds" not in forecast.columns or "yhat" not in forecast.columns:
        return jsonify({"error": "Forecast output missing required columns"}), 500

    # clip negative predictions to 0 (business rule)
    forecast["yhat"] = forecast["yhat"].clip(lower=0)

    # convert (only) the future horizon points to JSON-friendly list
    # If forecast contains historical + future, select last `horizon` rows by ds
    forecast = forecast.sort_values("ds")
    prediction_rows = forecast.tail(horizon)

    # save run + points to DB (transaction)
    try:
        with engine.begin() as conn:
            run = conn.execute(text('''
                INSERT INTO "ForecastRun" ("productId","method","horizon","mae","accuracy")
                VALUES (:pid,:method,:horizon,:mae,:accuracy) RETURNING id
            '''), {
                "pid": product_id,
                "method": "Prophet",
                "horizon": int(horizon),
                "mae": None,
                "accuracy": None
            }).fetchone()
            run_id = run.id

            for _, row in prediction_rows.iterrows():
                conn.execute(text('''
                    INSERT INTO "ForecastPoint" ("runId", period, predicted)
                    VALUES (:run_id, :period, :pred)
                '''), {
                    "run_id": run_id,
                    "period": row["ds"],
                    "pred": float(row["yhat"])
                })
    except Exception as e:
        return jsonify({"error": "Failed to save forecast to DB", "details": str(e)}), 500

    # Return normalized json list of predictions
    predictions = []
    for _, r in prediction_rows.iterrows():
        predictions.append({
            "date": r["ds"].isoformat(),
            "yhat": float(r["yhat"])
        })

    return jsonify({"message": "Forecast saved", "runId": run_id, "predictions": predictions})


@app.get("/forecasts/<int:product_id>")
def get_forecast(product_id):
    """Return the most recent forecast for a given product."""
    with engine.connect() as conn:
        run = conn.execute(text('''
            SELECT id FROM "ForecastRun"
            WHERE "productId" = :pid
            ORDER BY "createdAt" DESC
            LIMIT 1
        '''), {"pid": product_id}).fetchone()

        if not run:
            return jsonify({"error": "No forecast found for this product"}), 404

        points = conn.execute(text('''
            SELECT period, predicted
            FROM "ForecastPoint"
            WHERE "runId" = :rid
            ORDER BY period ASC
        '''), {"rid": run.id}).mappings().all()

        return jsonify({
            "productId": product_id,
            "runId": run.id,
            "points": [dict(row) for row in points]
        })


if __name__ == "__main__":
    # port configurable with PORT env var
    port = int(os.getenv("PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "1") == "1")
