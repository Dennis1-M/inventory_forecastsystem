# Forecast Service (FastAPI)
Generated: 2025-11-25T04:21:01.839725Z

## Files
- forecast_model.py : forecasting engine with Kenyan features and ensemble model
- app.py : FastAPI application exposing /run endpoint
- requirements.txt : Python dependencies
- Dockerfile : simple containerization

## Run locally
1. Create a virtualenv and install: `pip install -r requirements.txt`
2. Ensure `db.engine` is configured (module `db.py` with SQLAlchemy engine)
3. Start the app: `uvicorn app:app --reload --port 8000`

## Notes
- The service expects a `Sale` table with columns `date` (date) and `quantity` (numeric).
- Add DB credentials to `db.py` or environment variables as your project requires.
