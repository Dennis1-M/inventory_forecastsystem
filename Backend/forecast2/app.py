# app.py (inside run_forecast function)

import requests

# ------------------------------------
# Trigger alert engine in Node backend
# ------------------------------------
try:
    requests.post(
        "http://backend:5000/api/forecast/trigger-alerts",
        json={"productId": product_id},
        timeout=3
    )
except Exception as e:
    # Non-blocking: forecast succeeds even if alert trigger fails
    print(f"⚠ Alert trigger failed: {e}")
# app.py