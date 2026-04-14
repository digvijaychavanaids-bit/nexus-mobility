import io
import os
import uuid
from datetime import datetime

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from services.auth_handler import get_current_analyst_or_admin, get_current_user
from services.db import add_log, log_activity
from services.ml import predict_congestion

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROCESSED_DATA = os.path.join(BASE_DIR, "data", "processed_sample.csv")
CITY_SUMMARY = os.path.join(BASE_DIR, "data", "city_summary.json")
CITY_ALIASES = {"Bangalore": "Bengaluru"}


class PredictionRequest(BaseModel):
    hour_of_day: int = Field(..., ge=0, le=23)
    pollution_aqi: float = Field(..., ge=0, le=500)
    weather_condition: int = Field(..., ge=0, le=2)
    city: str = Field(default="Delhi", min_length=2, max_length=50)


def canonical_city(city: str) -> str:
    return CITY_ALIASES.get(city, city)


def get_city_summary(city: str) -> dict:
    if os.path.exists(CITY_SUMMARY):
        summary = pd.read_json(CITY_SUMMARY)
        row = summary[summary["City"] == canonical_city(city)]
        if not row.empty:
            record = row.iloc[0]
            return {
                "pm25": float(record.get("PM2_5_ugm3", 55.0)),
                "co": float(record.get("CO_ugm3", 380.0)),
                "no2": float(record.get("NO2_ugm3", 22.0)),
            }
    return {"pm25": 55.0, "co": 380.0, "no2": 22.0}


@router.post("/predict")
def predict(data: PredictionRequest, current_user: dict = Depends(get_current_user)):
    precipitation = 0.0
    if data.weather_condition == 1:
        precipitation = 0.5
    elif data.weather_condition == 2:
        precipitation = 0.1

    prediction = predict_congestion(
        hour=data.hour_of_day,
        pm2_5=data.pollution_aqi,
        precipitation=precipitation,
        city=data.city,
    )

    log_activity(
        {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "user_email": current_user["sub"],
            "action": "prediction_requested",
            "details": f"City: {data.city}, Hour: {data.hour_of_day}, AQI: {data.pollution_aqi}, Result: {prediction}%",
        }
    )

    add_log(
        {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "type": "prediction",
            "user": current_user["sub"],
            "city": data.city,
            "result": prediction,
        }
    )

    return {
        "predicted_congestion": prediction,
        "suggestion": "Increase green time by 10-15 seconds on inbound corridors" if prediction >= 70 else "Maintain standard signal cycle with regular monitoring",
        "confidence": 0.88 if prediction >= 70 else 0.82,
        "timestamp": datetime.utcnow().isoformat(),
    }


CSV_MAX_BYTES = 10 * 1024 * 1024  # 10 MB
CSV_MAX_ROWS = 100_000
CSV_REQUIRED_COLUMNS = {"hour_of_day", "pollution_aqi", "weather_condition", "city"}
VALID_CITIES = {"Delhi", "Mumbai", "Bangalore", "Bengaluru", "Chennai", "Hyderabad"}
RESPONSE_PREVIEW_LIMIT = 500  # max rows to include in the JSON response


def _validate_and_predict_csv_row(row_index: int, row: dict) -> dict:
    """Validate a single CSV row and return a prediction result or an error dict."""
    errors = []

    # hour_of_day
    try:
        hour = int(row["hour_of_day"])
        if not (0 <= hour <= 23):
            errors.append("hour_of_day must be between 0 and 23")
    except (ValueError, TypeError):
        errors.append("hour_of_day must be an integer")
        hour = None

    # pollution_aqi
    try:
        aqi = float(row["pollution_aqi"])
        if not (0 <= aqi <= 500):
            errors.append("pollution_aqi must be between 0 and 500")
    except (ValueError, TypeError):
        errors.append("pollution_aqi must be a number")
        aqi = None

    # weather_condition
    try:
        weather = int(row["weather_condition"])
        if weather not in (0, 1, 2):
            errors.append("weather_condition must be 0 (Clear), 1 (Rainy), or 2 (Overcast)")
    except (ValueError, TypeError):
        errors.append("weather_condition must be an integer (0, 1, or 2)")
        weather = None

    # city
    raw_city = str(row.get("city", "")).strip()
    city = canonical_city(raw_city)
    if city not in VALID_CITIES:
        errors.append(f"city '{raw_city}' is not recognised; valid cities: Delhi, Mumbai, Bangalore, Chennai, Hyderabad")

    if errors:
        return {
            "row": row_index,
            "status": "error",
            "errors": errors,
            "input": {k: row.get(k) for k in CSV_REQUIRED_COLUMNS},
        }

    precipitation = 0.5 if weather == 1 else (0.1 if weather == 2 else 0.0)
    prediction = predict_congestion(hour=hour, pm2_5=aqi, precipitation=precipitation, city=city)

    return {
        "row": row_index,
        "status": "success",
        "input": {
            "hour_of_day": hour,
            "pollution_aqi": aqi,
            "weather_condition": weather,
            "city": city,
        },
        "predicted_congestion": prediction,
        "suggestion": (
            "Increase green time by 10-15 seconds on inbound corridors"
            if prediction >= 70
            else "Maintain standard signal cycle with regular monitoring"
        ),
        "confidence": 0.88 if prediction >= 70 else 0.82,
    }


def _batch_predict(df: pd.DataFrame) -> tuple[list, list]:
    """Vectorized batch prediction — much faster than row-by-row iteration."""
    import numpy as np
    from services.ml import load_model, city_factor, deterministic_fallback

    results = []
    errors = []

    # ---- Validate all rows at once ----
    hour_raw = pd.to_numeric(df["hour_of_day"], errors="coerce")
    aqi_raw = pd.to_numeric(df["pollution_aqi"], errors="coerce")
    weather_raw = pd.to_numeric(df["weather_condition"], errors="coerce")
    city_raw = df["city"].astype(str).str.strip()
    city_canonical = city_raw.map(lambda c: canonical_city(c))

    hour_valid = hour_raw.notna() & (hour_raw >= 0) & (hour_raw <= 23)
    aqi_valid = aqi_raw.notna() & (aqi_raw >= 0) & (aqi_raw <= 500)
    weather_valid = weather_raw.notna() & weather_raw.isin([0, 1, 2])
    city_valid = city_canonical.isin(VALID_CITIES)

    all_valid = hour_valid & aqi_valid & weather_valid & city_valid

    # ---- Collect errors for invalid rows ----
    invalid_idx = df.index[~all_valid]
    for idx in invalid_idx:
        row_errors = []
        row_num = int(idx) + 1
        if not hour_valid[idx]:
            row_errors.append("hour_of_day must be an integer between 0 and 23")
        if not aqi_valid[idx]:
            row_errors.append("pollution_aqi must be a number between 0 and 500")
        if not weather_valid[idx]:
            row_errors.append("weather_condition must be 0, 1, or 2")
        if not city_valid[idx]:
            row_errors.append(f"city '{city_raw[idx]}' is not recognised")
        errors.append({
            "row": row_num,
            "status": "error",
            "errors": row_errors,
            "input": {
                "hour_of_day": df.at[idx, "hour_of_day"],
                "pollution_aqi": df.at[idx, "pollution_aqi"],
                "weather_condition": df.at[idx, "weather_condition"],
                "city": df.at[idx, "city"],
            },
        })

    # ---- Batch predict valid rows ----
    valid_df = df.loc[all_valid].copy()
    if len(valid_df) > 0:
        hours = hour_raw[all_valid].astype(int).values
        aqis = aqi_raw[all_valid].astype(float).values
        weathers = weather_raw[all_valid].astype(int).values
        cities = city_canonical[all_valid].values
        precip = np.where(weathers == 1, 0.5, np.where(weathers == 2, 0.1, 0.0))

        # Try model-based batch prediction first
        model = load_model()
        if model is not None:
            try:
                features = np.column_stack([hours, aqis, precip, np.full(len(hours), 25.0)])
                raw_preds = model.predict(features)
                factors = np.array([city_factor(c) for c in cities])
                predictions = np.clip(raw_preds * factors, 5.0, 100.0).round(1)
            except Exception:
                # Fallback to deterministic per row
                predictions = np.array([
                    deterministic_fallback(h, a, p, 25.0, c)
                    for h, a, p, c in zip(hours, aqis, precip, cities)
                ])
                predictions = np.clip(predictions, 5.0, 100.0).round(1)
        else:
            predictions = np.array([
                deterministic_fallback(h, a, p, 25.0, c)
                for h, a, p, c in zip(hours, aqis, precip, cities)
            ])
            predictions = np.clip(predictions, 5.0, 100.0).round(1)

        for i, idx in enumerate(valid_df.index):
            pred_val = float(predictions[i])
            results.append({
                "row": int(idx) + 1,
                "status": "success",
                "input": {
                    "hour_of_day": int(hours[i]),
                    "pollution_aqi": float(aqis[i]),
                    "weather_condition": int(weathers[i]),
                    "city": str(cities[i]),
                },
                "predicted_congestion": pred_val,
                "suggestion": (
                    "Increase green time by 10-15 seconds on inbound corridors"
                    if pred_val >= 70
                    else "Maintain standard signal cycle with regular monitoring"
                ),
                "confidence": 0.88 if pred_val >= 70 else 0.82,
            })

    return results, errors


@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    # Validate file type
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    # Read and size-check
    content = await file.read()
    if len(content) > CSV_MAX_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds the 10 MB size limit.")

    # Parse CSV
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse CSV file. Ensure it is a valid CSV.")

    if len(df) > CSV_MAX_ROWS:
        raise HTTPException(
            status_code=422,
            detail=f"CSV has {len(df):,} rows which exceeds the {CSV_MAX_ROWS:,} row limit.",
        )

    # Validate required columns
    missing = CSV_REQUIRED_COLUMNS - set(df.columns.str.strip().str.lower())
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing required columns: {', '.join(sorted(missing))}. "
                   f"Expected: hour_of_day, pollution_aqi, weather_condition, city",
        )

    # Normalise column names to lowercase
    df.columns = df.columns.str.strip().str.lower()

    # Batch predict (vectorized — handles 50K+ rows fast)
    results, errors = _batch_predict(df)

    log_activity(
        {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "user_email": current_user["sub"],
            "action": "csv_upload",
            "details": (
                f"File: {file.filename}, Rows: {len(df)}, "
                f"Valid: {len(results)}, Errors: {len(errors)}"
            ),
        }
    )

    # Limit returned rows to avoid huge JSON responses
    preview_results = results[:RESPONSE_PREVIEW_LIMIT]
    preview_errors = errors[:100]

    return {
        "filename": file.filename,
        "total_rows": len(df),
        "processed": len(results),
        "failed": len(errors),
        "predictions": preview_results,
        "predictions_truncated": len(results) > RESPONSE_PREVIEW_LIMIT,
        "errors": preview_errors,
        "errors_truncated": len(errors) > 100,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/smart-signals")
def smart_signals(city: str = "Delhi", current_user: dict = Depends(get_current_analyst_or_admin)):
    now = datetime.now()
    summary = get_city_summary(city)
    
    # Predict current congestion for more realistic baseline
    congestion = predict_congestion(
        hour=now.hour,
        pm2_5=summary["pm25"],
        precipitation=0.0,
        city=city
    )

    city_intersections = {
        "Delhi": ["Connaught Place", "India Gate", "Dwarka Sector 10", "Okhla Phase 3", "Lajpat Nagar"],
        "Mumbai": ["Gateway of India", "Marine Drive", "Bandra Kurla Complex", "Borivali East", "Dadar TT"],
        "Bangalore": ["Silk Board", "Whitefield", "Koramangala", "Electronic City", "Indiranagar"],
        "Chennai": ["T. Nagar", "Marina Beach", "Anna Salai", "Velachery", "Adyar"],
        "Hyderabad": ["HITEC City", "Charminar", "Banjara Hills", "Secunderabad", "Gachibowli"],
    }
    intersections = city_intersections.get(city, city_intersections["Delhi"])

    suggestions = []
    for index, name in enumerate(intersections):
        # Slightly vary congestion per intersection for realism
        local_congestion = min(congestion + (index * 4) - 8, 100.0)
        recommended = int(min(max(35 + local_congestion * 0.45, 35), 90))
        
        # Determine status based on congestion levels
        status = "Critical Load" if local_congestion >= 75 else "Optimal Flow" if local_congestion <= 40 else "Steady"
        
        suggestions.append(
            {
                "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{city}-{name}")),
                "intersection": name,
                "recommended_green_time": recommended,
                "current_congestion": round(local_congestion, 1),
                "status": status,
                # Add mock coordinates for the "Neural Grid"
                "grid_x": 20 + (index * 15) + (now.minute % 10),
                "grid_y": 30 + (index * 10) + (now.hour % 5),
            }
        )
    return suggestions


@router.get("/signal-insights")
def signal_insights(city: str = "Delhi", current_user: dict = Depends(get_current_analyst_or_admin)):
    summary = get_city_summary(city)
    # Derive insights from city data
    efficiency = min(max(int(summary["pm25"] * 0.4) + 10, 15), 45)
    co2_saved = round(summary["co"] / 200.0, 1)
    reliability = round(99.1 + (datetime.now().second % 9) / 10.0, 2)
    
    return {
        "efficiency": f"{efficiency}%",
        "co2_saved": f"{co2_saved}t",
        "reliability": f"{reliability}%",
        "total_nodes": "4,821",
        "last_sync": datetime.utcnow().isoformat()
    }


@router.get("/peak-hours")
def get_peak_hours(city: str = "Delhi", current_user: dict = Depends(get_current_analyst_or_admin)):
    summary = get_city_summary(city)
    intensity = min(max(int(summary["pm25"] * 0.45), 55), 95)
    return {
        "id": str(uuid.uuid4()),
        "city": city,
        "morning_peak": {"start": "08:00", "end": "10:00", "congestion_level": intensity - 6},
        "evening_peak": {"start": "17:30", "end": "19:30", "congestion_level": intensity},
        "predicted_worst_hour": "18:00",
        "predicted_best_hour": "14:00",
    }


@router.post("/reroute")
def reroute_traffic(
    intersection: str = Query(..., min_length=2, max_length=120),
    city: str = "Delhi",
    current_user: dict = Depends(get_current_analyst_or_admin),
):
    alternatives = [
        {"id": 1, "route": f"Via {city} Inner Ring", "estimated_saving": "14 mins", "congestion_level": "Clear"},
        {"id": 2, "route": f"Alternate {intersection} Bypass", "estimated_saving": "9 mins", "congestion_level": "Moderate"},
        {"id": 3, "route": f"{city} Transit Corridor", "estimated_saving": "11 mins", "congestion_level": "Clear"},
    ]

    log_activity(
        {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "user_email": current_user["sub"],
            "action": "traffic_rerouted",
            "details": f"Optimization triggered for {intersection} in {city}",
        }
    )

    return {
        "status": "success",
        "optimization_id": str(uuid.uuid4()),
        "original_intersection": intersection,
        "city": city,
        "alternatives": alternatives,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/forecast")
def get_traffic_forecast(city: str = "Delhi", aqi: float = 50.0, weather: int = 0, current_user: dict = Depends(get_current_user)):
    now = datetime.now()
    current_hour = now.hour
    
    forecast = []
    for i in range(1, 7):
        target_hour = (current_hour + i) % 24
        prediction = predict_congestion(
            hour=target_hour,
            pm2_5=aqi,
            precipitation=0.5 if weather == 1 else 0.0,
            city=city
        )
        forecast.append({
            "hour": f"{target_hour:02d}:00",
            "congestion": round(prediction, 1)
        })
        
    return forecast
