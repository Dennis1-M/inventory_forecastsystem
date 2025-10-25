# fastapi_forecast_api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import subprocess, json, os, sys, tempfile
import pandas as pd
import requests

app = FastAPI(title="Forecast API")

NODE_ALERT_ENDPOINT = "http://localhost:3000/api/alerts"  # confirmed target

# ------------------------
# Models
# ------------------------
class RunRequest(BaseModel):
    csv: str = "output/synthetic_sales_inventory_data.csv"
    horizon: int = 14
    product: Optional[str] = None
    lstm: bool = False
    out: str = "output"

# ------------------------
# Helpers
# ------------------------
def safe_read_csv(path: str) -> pd.DataFrame:
    if not os.path.exists(path):
        return pd.DataFrame()
    try:
        return pd.read_csv(path)
    except Exception:
        return pd.DataFrame()

def push_alerts_to_node(alerts_df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Post each alert row to Node endpoint.
    Returns list of results {product:..., status_code:..., success: bool, text: ...}
    """
    results = []
    if alerts_df.empty:
        return results

    for _, row in alerts_df.iterrows():
        payload = {
            "productId": None,
            "alertType": row.get("alert_type") or row.get("alertType") or "LOW_STOCK",
            "message": row.get("message", ""),
            "product": row.get("product")
        }
        try:
            r = requests.post(NODE_ALERT_ENDPOINT, json=payload, timeout=10)
            results.append({
                "product": payload.get("product"),
                "status_code": r.status_code,
                "ok": r.ok,
                "response_text": r.text[:1000]
            })
        except Exception as e:
            results.append({
                "product": payload.get("product"),
                "status_code": None,
                "ok": False,
                "error": str(e)
            })
    return results

# ------------------------
# Routes
# ------------------------
@app.get("/")
def home():
    return {"message": "Forecast API is running successfully!"}

@app.post("/run")
def run_forecast(req: RunRequest):
    # Prepare command using current python interpreter
    cmd = [
        sys.executable, "preprocess_and_train.py",
        "--csv", req.csv,
        "--out", req.out,
        "--horizon", str(req.horizon)
    ]
    if req.lstm:
        cmd.append("--lstm")

    temp_csv = None
    # If product filter is requested create a temporary filtered CSV
    if req.product:
        df = safe_read_csv(req.csv)
        if df.empty:
            raise HTTPException(status_code=400, detail=f"CSV not found or empty: {req.csv}")
        filtered = df[df["product"] == req.product]
        if filtered.empty:
            raise HTTPException(status_code=404, detail=f"No rows found for product '{req.product}'")
        fd, temp_csv = tempfile.mkstemp(prefix="filtered_", suffix=".csv", dir=".")
        os.close(fd)
        filtered.to_csv(temp_csv, index=False)
        # update csv arg
        cmd[cmd.index("--csv") + 1] = temp_csv

    # Run training script
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, check=True)
        out_text = proc.stdout.strip()

        # try parse JSON printed by preprocess_and_train.py
        parsed = None
        try:
            parsed = json.loads(out_text)
        except Exception:
            parsed = None

        # After successful run, attempt to read alerts.csv and push to Node
        alerts_path = os.path.join(req.out, "alerts.csv")
        alerts_df = safe_read_csv(alerts_path)
        push_results = []
        if not alerts_df.empty:
            push_results = push_alerts_to_node(alerts_df)

        # Clean up temp csv if used
        if temp_csv:
            try:
                os.remove(temp_csv)
            except Exception:
                pass

        return {
            "status": "ok",
            "stdout": out_text,
            "parsed": parsed,
            "alerts_count": len(alerts_df),
            "alerts_push_results": push_results
        }

    except subprocess.CalledProcessError as e:
        if temp_csv:
            try:
                os.remove(temp_csv)
            except Exception:
                pass
        return {
            "status": "error",
            "returncode": e.returncode,
            "stdout": e.stdout,
            "stderr": e.stderr
        }

@app.get("/forecasts")
def get_forecasts(out: str = "output"):
    forecasts_path = os.path.join(out, "forecasts.csv")
    df = safe_read_csv(forecasts_path)
    if df.empty:
        return {"count": 0, "forecasts": []}
    # convert datetimes to iso if present
    if "date" in df.columns:
        df["date"] = df["date"].astype(str)
    return {"count": len(df), "forecasts": df.to_dict(orient="records")}

@app.get("/alerts")
def get_alerts(out: str = "output"):
    alerts_path = os.path.join(out, "alerts.csv")
    df = safe_read_csv(alerts_path)
    if df.empty:
        return {"count": 0, "alerts": []}
    return {"count": len(df), "alerts": df.to_dict(orient="records")}

@app.post("/alerts/push")
def alerts_push(out: str = "output"):
    alerts_path = os.path.join(out, "alerts.csv")
    df = safe_read_csv(alerts_path)
    if df.empty:
        return {"status": "ok", "message": "no alerts to push", "pushed": []}
    results = push_alerts_to_node(df)
    return {"status": "ok", "alerts_count": len(df), "push_results": results}
