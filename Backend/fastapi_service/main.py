from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
from datetime import datetime

# Import ML modules
from sales_data_processor import fetch_and_prepare_data
from forecaster import run_xgboost_forecast

# Load environment variables for configuration
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="Inventory Forecasting Service",
    description="Provides demand forecasts using XGBoost for a specified product.",
    version="1.0.0"
)

# --------------------------------------------------------------------------
# Pydantic Schema for Request Body
# --------------------------------------------------------------------------
class ForecastRequest(BaseModel):
    productId: int
    horizon: int = 14 # Default forecast 14 days


# --------------------------------------------------------------------------
# API Endpoints
# --------------------------------------------------------------------------

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Forecasting Service running", "timestamp": datetime.now()}

@app.post("/run")
def run_forecast(request: ForecastRequest):
    """
    Triggers the sales demand forecast for a single product.
    """
    product_id = request.productId
    horizon = request.horizon

    # 1. Fetch and Prepare Data
    time_series_df = fetch_and_prepare_data(product_id)

    if time_series_df is None or time_series_df.empty:
        # Returning a 404/400 is appropriate if data for the product is missing
        raise HTTPException(
            status_code=404, 
            detail=f"No sufficient sales data found for Product ID {product_id} to run a forecast."
        )

    # 2. Run Forecasting Model
    try:
        forecast_result = run_xgboost_forecast(time_series_df, horizon)
        
        if not forecast_result['ok']:
             raise HTTPException(
                status_code=400, 
                detail=forecast_result.get("message", "Forecasting failed due to model or data error.")
            )
            
        return {
            "ok": True,
            "productId": product_id,
            "model": "XGBoost",
            **forecast_result # Unpack the forecast data/metrics
        }
        
    except Exception as e:
        print(f"FATAL FORECAST ERROR for Product ID {product_id}: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error during forecast generation: {e}"
        )


# --------------------------------------------------------------------------
# Server Execution
# --------------------------------------------------------------------------
if __name__ == "__main__":
    # Get port from environment variables, defaulting to 5002
    PORT = int(os.getenv("FASTAPI_PORT", 5002)) 
    print(f"Starting FastAPI server on http://127.0.0.1:{PORT}")
    # Host '0.0.0.0' makes it accessible externally, '127.0.0.1' is safer for local development
    uvicorn.run(app, host="127.0.0.1", port=PORT)