# alerts_from_forecast.py
import pandas as pd
import requests
import os
import time

NODE_ALERT_ENDPOINT = "http://localhost:3000/api/alerts"
ALERTS = "output/alerts.csv"

def push_alerts(alerts_df):
    results = []
    for _, row in alerts_df.iterrows():
        payload = {
            "productId": None,
            "alertType": row.get("alert_type") or row.get("alertType") or "LOW_STOCK",
            "message": row.get("message", ""),
            "product": row.get("product")
        }
        try:
            r = requests.post(NODE_ALERT_ENDPOINT, json=payload, timeout=10)
            results.append((row.get("product"), r.status_code, r.ok, r.text[:500]))
            time.sleep(0.1)  # small delay between requests
        except Exception as e:
            results.append((row.get("product"), None, False, str(e)))
    return results

if __name__ == "__main__":
    if os.path.exists(ALERTS):
        alerts = pd.read_csv(ALERTS)
        print(f"Found {len(alerts)} alerts")
        res = push_alerts(alerts)
        for r in res:
            product, status, ok, text = r
            print(f"{product} -> {status} (ok={ok})")
    else:
        print("No alerts file present.")
