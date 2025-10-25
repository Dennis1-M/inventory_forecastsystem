# forecasting/evaluate_forecasts.py
import pandas as pd
import json
metrics_csv = "output/metrics_summary.csv"
df = pd.read_csv(metrics_csv)
print("Per-product metrics:")
print(df.head())
# Save a simple aggregated report
report = {
    "count_products": int(len(df)),
    "avg_lr_mae": float(df['lr_mae'].mean()),
    "avg_model_mae": float(df[[c for c in df.columns if c.endswith('_mae') and c!='lr_mae']].mean().mean())
}
with open("output/metrics_report.json","w") as f:
    json.dump(report, f, indent=2)
print("Saved output/metrics_report.json")
