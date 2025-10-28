from flask import Flask, request, jsonify
from forecast_model import train_and_forecast
from db import engine
from sqlalchemy import text

app = Flask(__name__)

@app.post("/run")
def run_forecast():
    data = request.json
    product_id = data.get("productId")
    horizon = data.get("horizon", 7)

    forecast = train_and_forecast(product_id, horizon)

    if forecast is None:
        return jsonify({"error": "No sales data found"}), 400

    # ✅ Use transaction so inserts are committed automatically
    with engine.begin() as conn:
        run = conn.execute(text('''
            INSERT INTO "ForecastRun" ("productId", "method", "horizon", "mae", "accuracy")
            VALUES (:pid, :method, :horizon, :mae, :accuracy)
            RETURNING id
        '''), {
            "pid": product_id,
            "method": "Prophet",
            "horizon": horizon,
            "mae": None,
            "accuracy": None
        }).fetchone()

        run_id = run.id

        for _, row in forecast.iterrows():
            conn.execute(text("""
                INSERT INTO "ForecastPoint" ("runId", period, "predictedValue")
                VALUES (:run_id, :period, :pred)
            """), {
                "run_id": run_id,
                "period": row["ds"],
                "pred": float(row["yhat"])
            })

    return jsonify({"message": "Forecast saved", "runId": run_id})


#  ABOVE app.run()
@app.get("/forecasts/<int:product_id>")
def get_forecast(product_id):
    """Return the most recent forecast for a given product."""
    with engine.connect() as conn:
        run = conn.execute(text("""
            SELECT id FROM "ForecastRun"
            WHERE "productId" = :pid
            ORDER BY "createdAt" DESC
            LIMIT 1
        """), {"pid": product_id}).fetchone()

        if not run:
            return jsonify({"error": "No forecast found for this product"}), 404

        points = conn.execute(text("""
            SELECT period, "predictedValue"
            FROM "ForecastPoint"
            WHERE "runId" = :rid
            ORDER BY period ASC
        """), {"rid": run.id}).mappings().all()

        return jsonify({
            "productId": product_id,
            "runId": run.id,
            "points": [dict(row) for row in points]
        })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
