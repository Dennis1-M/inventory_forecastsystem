"""
FastAPI application exposing /run endpoint for forecasting.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import uuid
import pandas as pd

from forecast_model import train_and_forecast
from db_utils import save_forecast_to_db


import pandas as pd

app = FastAPI(title="Forecast Service", version="1.0")

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
    runId: str
    mae: float
    accuracy: float
    model: str
    explanations: list
    feature_importance: dict
    predictions: list[PredictionOut]

@app.post("/run", response_model=RunResponse)
def run_forecast(req: RunRequest):
    product_id = req.product_id
    periods = req.periods or 14

    # 1️⃣ Generate forecast
    result = train_and_forecast(product_id, periods=periods)
    if not result:
        raise HTTPException(status_code=422, detail="Insufficient data or forecasting failed")

    # 2️⃣ Save forecast to the DB
    run_id = save_forecast_to_db(product_id, result, periods)

    # 3️⃣ Prepare response
    out_df = result.get("out_df")
    mae = result.get("mae", 0.0)
    accuracy = result.get("accuracy", 0.0)
    model_method = result.get("model", "unknown")
    explanations = result.get("explanations", [])
    feat_importance = result.get("feature_importance", {})

    predictions = []
    for _, row in out_df.iterrows():
        predictions.append(PredictionOut(
            date=row['ds'].strftime("%Y-%m-%d"),
            yhat=float(row['yhat']),
            yhat_lower=float(row.get('yhat_lower', 0.0)),
            yhat_upper=float(row.get('yhat_upper', 0.0))
        ))

    return RunResponse(
        ok=True,
        message="Forecast generated and saved to DB",
        runId=run_id,
        mae=mae,
        accuracy=accuracy,
        model=model_method,
        explanations=explanations,
        feature_importance=feat_importance,
        predictions=predictions
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
