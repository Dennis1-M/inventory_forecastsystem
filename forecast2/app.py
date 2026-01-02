# app.py
# Python forecast runner – triggers Node.js alert engine after forecast

from fastapi import FastAPI
import requests

# ---------------------------
# FastAPI App Instance
# ---------------------------
app = FastAPI(title="Forecast Trigger Service")


# ---------------------------
# Forecast Logic
# ---------------------------
def run_forecast(product_id: int):
    """
    Runs forecast logic for a given product
    and notifies the Node.js backend to evaluate alerts.
    """

    # Trigger alert engine (Node.js)
    try:
        requests.post(
            "http://localhost:5001/api/forecast/trigger-alerts",
            json={"productId": product_id},
            timeout=3,
        )
    except Exception as e:
        # Non-blocking: forecast should not fail if alert trigger fails
        print(f"⚠ Alert trigger failed: {e}")


# ---------------------------
# API Endpoint
# ---------------------------
@app.post("/run/{product_id}")
def run(product_id: int):
    run_forecast(product_id)
    return {"status": "forecast triggered", "productId": product_id}


# ---------------------------
# App Runner
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)
