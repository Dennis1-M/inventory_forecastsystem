# main.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ForecastRequest(BaseModel):
    productId: int
    horizon: int

@app.post("/run")
async def run_forecast(req: ForecastRequest):
    # Dummy forecast response
    return {
        "runId": 1,
        "predictions": [{"period": "2025-12-18", "predicted": 10}],
        "mae": 0.5,
        "accuracy": 0.95,
        "model": "dummy_model"
    }
