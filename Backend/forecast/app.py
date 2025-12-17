"""
FastAPI application exposing /run endpoint for forecasting.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import pandas as pd

from forecast_model import train_and_forecast
from db_utils import save_forecast_to_db

app = FastAPI(title="Forecast Service", version="1.0")

# --------------------------
# Request & Response Models
# --------------------------

   # Request model for /run endpoint
class RunRequest(BaseModel):
    product_id: int = Field(..., description="Product id to forecast")
    periods: Optional[int] = Field(14, description="Forecast horizon in days")

class PredictionOut(BaseModel):
    date: str
    yhat: float
    yhat_lower: float
    yhat_upper: float

class RunResponse(BaseModel):
    ok: bool
    message: str
    runId: int
    mae: float
    accuracy: float
    model: str
    explanations: List
    feature_importance: Dict
    predictions: List[PredictionOut]


# --------------------------
# /run endpoint
# --------------------------

@app.post("/run", response_model=RunResponse)
def run_forecast(req: RunRequest):
    product_id = req.product_id
    periods = req.periods or 14

    # 1. Run forecast
    result = train_and_forecast(product_id, periods=periods)
    if not result:
        raise HTTPException(status_code=422, detail="Insufficient data or forecasting failed")

    out_df = result["out_df"]

    # 2. Save to DB
    try:
        run_id = save_forecast_to_db(
            product_id=product_id,
            result=result,
            periods=periods
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB save failed: {e}")

    # 3. Convert DF → list of predictions
    predictions_list = [
        PredictionOut(
            date=str(row["ds"]),
            yhat=float(row["yhat"]),
            yhat_lower=float(row["yhat_lower"]),
            yhat_upper=float(row["yhat_upper"])
        )
        for _, row in out_df.iterrows()
    ]

    # 4. Return response
    return RunResponse(
        ok=True,
        message="Forecast generated and saved to DB",
        runId=run_id,
        mae=float(result["mae"]),
        accuracy=float(result["accuracy"]),
        model=result["model"],
        explanations=result["explanations"],
        feature_importance=result["feature_importance"],
        predictions=predictions_list
    )


# --------------------------
# Root checker
# --------------------------

@app.get("/")
def root():
    return {"message": "Forecast API is running", "status": "ok"}


# --------------------------
# Start server (if run directly)
# --------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
