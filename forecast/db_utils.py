import pandas as pd
from sqlalchemy import text
from datetime import datetime
from db import engine
import json

def save_forecast_to_db(product_id, result, periods):
    """
    Save forecast results to database matching your Prisma schema.
    
    Args:
        product_id: Product ID
        result: Dictionary containing forecast results
        periods: Forecast horizon
        
    Returns:
        run_id: ID of the forecast run, or None if failed
    """
    if not result or "out_df" not in result:
        print("❌ No forecast results to save")
        return None

    out_df = result["out_df"]
    
    if out_df.empty:
        print("❌ Empty forecast dataframe")
        return None

    try:
        with engine.begin() as conn:
            # Insert into ForecastRun - matches your Prisma schema
            run_query = text("""
                INSERT INTO "ForecastRun"
                ("productId", method, horizon, mae, accuracy, "createdAt")
                VALUES (:pid, :method, :horizon, :mae, :accuracy, :created_at)
                RETURNING id
            """)

            run_id = conn.execute(run_query, {
                "pid": product_id,
                "method": result.get("model", "Ensemble"),
                "horizon": periods,
                "mae": float(result.get("mae", 0.0)),
                "accuracy": float(result.get("accuracy", 0.0)),
                "created_at": datetime.utcnow()
            }).scalar()

            print(f"✅ Created ForecastRun with ID: {run_id}")
            print(f"📊 Model: {result.get('model')}, MAE: {result.get('mae'):.2f}, Accuracy: {result.get('accuracy'):.1f}%")
            
            # Log explanations and feature importance (for debugging, not saved to DB)
            explanations = result.get("explanations", [])
            feature_importance = result.get("feature_importance", {})
            print(f"💡 Explanations: {explanations}")
            print(f"🔍 Top features: {list(feature_importance.keys())[:3] if feature_importance else 'None'}")

            # Insert ForecastPoint rows
            point_query = text("""
                INSERT INTO "ForecastPoint"
                ("runId", period, predicted, lower95, upper95, "createdAt")
                VALUES (:run_id, :period, :predicted, :lower, :upper, :created_at)
            """)

            points_inserted = 0
            for _, row in out_df.iterrows():
                # Ensure date is datetime object
                period_date = row["ds"]
                if isinstance(period_date, pd.Timestamp):
                    period_date = period_date.to_pydatetime()
                elif isinstance(period_date, str):
                    period_date = pd.to_datetime(period_date).to_pydatetime()
                
                conn.execute(point_query, {
                    "run_id": run_id,
                    "period": period_date,
                    "predicted": float(row["yhat"]),
                    "lower": float(row.get("yhat_lower", 0.0)),
                    "upper": float(row.get("yhat_upper", 0.0)),
                    "created_at": datetime.utcnow()
                })
                points_inserted += 1

            print(f"✅ Inserted {points_inserted} forecast points")
            return run_id

    except Exception as e:
        print(f"❌ Failed to save forecast to DB: {e}")
        # Log the full error for debugging
        import traceback
        traceback.print_exc()
        return None