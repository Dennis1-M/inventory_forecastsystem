# api.py

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Example Request Body Model
class ForecastRequest(BaseModel):
    product_id: int
    past_sales: list[float]

# Example Route
@app.get("/")
def home():
    return {"message": "Forecast API is running!"}

@app.post("/forecast")
def forecast_sales(data: ForecastRequest):
    # Simple demo forecast logic
    if len(data.past_sales) == 0:
        return {"error": "No data provided."}

    average_sales = sum(data.past_sales) / len(data.past_sales)
    return {
        "product_id": data.product_id,
        "forecast": round(average_sales, 2),
        "status": "success"
    }
