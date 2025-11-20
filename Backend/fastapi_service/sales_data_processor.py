import requests
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv

# Load environment variables for configuration
load_dotenv()
# The Node.js API URL where the sales data endpoint is located
# Ensure this matches your Express API setup!
NODE_API_URL = os.getenv("NODE_API_URL", "http://127.0.0.1:5000")
SALES_DATA_ENDPOINT = f"{NODE_API_URL}/api/v1/sales/data/forecast"
# NOTE: In a real system, you would need to securely obtain and pass an admin JWT token
# to the NODE_API_AUTH_TOKEN header for authenticated access.
NODE_API_AUTH_TOKEN = os.getenv("NODE_API_AUTH_TOKEN", "YOUR_ADMIN_JWT_TOKEN")


def fetch_and_prepare_data(product_id: int) -> pd.DataFrame or None:
    """
    Fetches raw sales data from the Node.js API, filters it for the specified product,
    and aggregates it into a daily time series suitable for forecasting.
    """
    print(f"Fetching sales data from: {SALES_DATA_ENDPOINT}")
    
    try:
        # NOTE: Authentication is critical here. Pass the JWT token.
        headers = {"Authorization": f"Bearer {NODE_API_AUTH_TOKEN}"}
        response = requests.get(SALES_DATA_ENDPOINT, headers=headers, timeout=10)
        response.raise_for_status() # Raises HTTPError for bad responses (4xx or 5xx)
        
        raw_data = response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from Node.js API: {e}")
        return None

    if not raw_data:
        print("Received empty dataset.")
        return None

    # 1. Convert to DataFrame
    df = pd.DataFrame(raw_data)

    # 2. Filter by Product ID
    df['productId'] = df['productId'].astype(int)
    df_product = df[df['productId'] == product_id].copy()
    
    if df_product.empty:
        print(f"No sales data found for Product ID: {product_id}")
        return None

    # 3. Clean and Aggregate Data
    try:
        df_product['date'] = pd.to_datetime(df_product['date'], utc=True).dt.date
        
        # Aggregate quantity sold by day
        daily_sales = df_product.groupby('date')['quantity'].sum().reset_index()
        daily_sales.rename(columns={'date': 'ds', 'quantity': 'y'}, inplace=True)
        
        # Ensure the date column is set as the index
        daily_sales.set_index('ds', inplace=True)
        daily_sales.index = pd.to_datetime(daily_sales.index)
        
        # Resample to ensure all days are present, filling missing days with zero sales
        time_series = daily_sales.resample('D').sum().fillna(0)
        
    except Exception as e:
        print(f"Error processing sales data: {e}")
        return None

    # Check if we have enough data (e.g., more than a week)
    if len(time_series) < 7:
        print(f"Insufficient data ({len(time_series)} days). Need at least 7 days for meaningful forecasting.")
        return None
        
    return time_series