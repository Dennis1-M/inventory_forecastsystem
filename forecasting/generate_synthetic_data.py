# forecasting/generate_synthetic_data.py
import pandas as pd
import numpy as np
import os

np.random.seed(42)
dates = pd.date_range(start="2024-01-01", periods=365, freq="D")
products = ["Milk","Bread","Rice","Sugar","Soap","Toothpaste","Cooking Oil","Detergent","Biscuits","Juice"]

rows = []
for p in products:
    stock = np.random.randint(100, 700)
    for d in dates:
        sold = max(0, int(np.random.normal(loc=20, scale=8)))  # more realistic distribution
        price = round(np.random.uniform(0.5, 20.0),2)
        stock = max(0, stock - sold)
        rows.append([d.date().isoformat(), p, sold, stock, price])

df = pd.DataFrame(rows, columns=["date","product","qty","stock","price"])
os.makedirs("output", exist_ok=True)
df.to_csv("output/synthetic_sales_inventory_data.csv", index=False)
print("Saved to output/synthetic_sales_inventory_data.csv")
