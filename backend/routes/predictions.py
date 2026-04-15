import io
import os
import uuid
from datetime import datetime, timedelta

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field
from typing import List, Optional

from services.auth_handler import get_current_analyst_or_admin, get_current_user
from services.db import add_log, log_activity
from services.ml import predict_congestion

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CITY_ALIASES = {"Bangalore": "Bengaluru"}
VALID_CITIES = {"Delhi", "Mumbai", "Bangalore", "Bengaluru", "Chennai", "Hyderabad"}
DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def canonical_city(city: str) -> str:
    return CITY_ALIASES.get(city, city)


# ── Helper Functions ──────────────────────────────────────────────────────

def _parse_date(raw: str) -> datetime | None:
    """Parse flexible date: 2026-04-15, 15/04/2026, Apr 15, 2026, etc."""
    # Try common formats
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y", "%B %d, %Y", "%b %d, %Y", "%d %b %Y", "%d %B %Y"):
        try:
            return datetime.strptime(str(raw).strip(), fmt)
        except ValueError:
            continue

    # pandas fallback
    try:
        return pd.to_datetime(raw, dayfirst=True).to_pydatetime()
    except Exception:
        return None


def _parse_time(raw: str) -> int | None:
    """Parse flexible time: '8 AM', '5:30 PM', '17:00', '14', etc. Returns hour 0-23."""
    import re
    text = str(raw).strip().upper()

    # "8 AM", "5:30 PM", "8AM", "11:00AM"
    m = re.match(r"(\d{1,2})(?::(\d{2}))?\s*(AM|PM)", text)
    if m:
        h = int(m.group(1))
        ampm = m.group(3)
        if ampm == "PM" and h != 12:
            h += 12
        elif ampm == "AM" and h == 12:
            h = 0
        return h if 0 <= h <= 23 else None

    # "17:00", "9:30"
    m = re.match(r"(\d{1,2}):(\d{2})", text)
    if m:
        h = int(m.group(1))
        return h if 0 <= h <= 23 else None

    # Just a number "8", "17"
    m = re.match(r"^(\d{1,2})$", text)
    if m:
        h = int(m.group(1))
        return h if 0 <= h <= 23 else None

    return None


def _hour_to_ampm(h: int) -> str:
    if h == 0:
        return "12:00 AM"
    elif h < 12:
        return f"{h}:00 AM"
    elif h == 12:
        return "12:00 PM"
    else:
        return f"{h - 12}:00 PM"


def _friendly_date_label(dt: datetime) -> str:
    return dt.strftime("%d %b %Y")


def _traffic_status(congestion: float) -> dict:
    if congestion >= 80:
        return {"level": "Very High", "emoji": "🔴", "advice": "Avoid travel if possible. Use metro/public transport."}
    elif congestion >= 60:
        return {"level": "High", "emoji": "🟠", "advice": "Expect 15-25 min delays. Take alternate routes."}
    elif congestion >= 40:
        return {"level": "Moderate", "emoji": "🟡", "advice": "Slight delays possible. Normal route is fine."}
    elif congestion >= 20:
        return {"level": "Low", "emoji": "🟢", "advice": "Roads are clear. Good time to travel!"}
    else:
        return {"level": "Very Low", "emoji": "🟢", "advice": "Almost no traffic. Best time to travel!"}


# ── Single Prediction ─────────────────────────────────────────────────────

class SinglePredictionRequest(BaseModel):
    date: str = Field(..., min_length=1, max_length=50, description="Date: 2026-04-15, 15/04/2026, etc.")
    time: str = Field(..., min_length=1, max_length=20, description="Time: 8 AM, 5:30 PM, 17:00, etc.")
    city: str = Field(default="Delhi", min_length=2, max_length=50)
    weather: str = Field(default="clear", description="clear, rainy, foggy, stormy")
    is_holiday: bool = Field(default=False)
    is_event: bool = Field(default=False)


@router.post("/predict")
def predict(data: SinglePredictionRequest, current_user: dict = Depends(get_current_user)):
    # Parse date
    parsed_date = _parse_date(data.date)
    if parsed_date is None:
        raise HTTPException(status_code=422, detail=f"Invalid date: '{data.date}'. Use formats like YYYY-MM-DD or DD/MM/YYYY")

    # Parse time
    parsed_hour = _parse_time(data.time)
    if parsed_hour is None:
        raise HTTPException(status_code=422, detail=f"Invalid time: '{data.time}'. Use: 8 AM, 5:30 PM, 17:00")

    # Validate city
    city = canonical_city(data.city.strip())
    if city not in VALID_CITIES:
        raise HTTPException(status_code=422, detail=f"Unknown city: '{data.city}'. Valid: Delhi, Mumbai, Bangalore, Chennai, Hyderabad")

    day_of_week = parsed_date.weekday()
    month = parsed_date.month

    # Predict
    congestion = predict_congestion(
        hour=parsed_hour,
        city=city,
        day_of_week=day_of_week,
        month=month,
        weather=data.weather,
        is_holiday=data.is_holiday,
        is_event=data.is_event
    )

    status = _traffic_status(congestion)
    is_peak = 7 <= parsed_hour <= 10 or 17 <= parsed_hour <= 20

    log_activity({
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "user_email": current_user["sub"],
        "action": "prediction_requested",
        "details": f"City: {city}, Date: {data.date}, Time: {data.time}, Weather: {data.weather}, Result: {congestion}%",
    })

    return {
        "date": parsed_date.strftime("%Y-%m-%d"),
        "date_label": _friendly_date_label(parsed_date),
        "day": DAY_NAMES[day_of_week],
        "time": _hour_to_ampm(parsed_hour),
        "hour": parsed_hour,
        "city": city,
        "weather": data.weather,
        "is_holiday": data.is_holiday,
        "is_event": data.is_event,
        "congestion": congestion,
        "status": status["level"],
        "emoji": status["emoji"],
        "advice": status["advice"],
        "is_weekend": day_of_week >= 5,
        "peak_hour": is_peak,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ── Batch Prediction (JSON) ──────────────────────────────────────────────

class BatchRow(BaseModel):
    date: str = Field(..., min_length=1, max_length=50)
    time: str = Field(..., min_length=1, max_length=20)
    city: str = Field(default="Delhi", min_length=2, max_length=50)
    weather: str = Field(default="clear")
    is_holiday: bool = Field(default=False)
    is_event: bool = Field(default=False)


class BatchPredictionRequest(BaseModel):
    rows: List[BatchRow]


@router.post("/predict-batch")
def predict_batch(data: BatchPredictionRequest, current_user: dict = Depends(get_current_user)):
    if len(data.rows) > 100:
        raise HTTPException(status_code=422, detail="Maximum 100 rows allowed per batch.")

    results = []
    errors = []

    for idx, row in enumerate(data.rows):
        row_num = idx + 1
        row_errors = []

        parsed_date = _parse_date(row.date)
        if parsed_date is None:
            row_errors.append(f"Invalid date: '{row.date}'")

        parsed_hour = _parse_time(row.time)
        if parsed_hour is None:
            row_errors.append(f"Invalid time: '{row.time}'")

        city = canonical_city(row.city.strip())
        if city not in VALID_CITIES:
            row_errors.append(f"Unknown city: '{row.city}'")

        if row_errors:
            errors.append({"row": row_num, "errors": row_errors, "date": row.date, "time": row.time, "city": row.city})
            continue

        day_of_week = parsed_date.weekday()
        month = parsed_date.month

        congestion = predict_congestion(
            hour=parsed_hour, 
            city=city, 
            day_of_week=day_of_week, 
            month=month,
            weather=row.weather,
            is_holiday=row.is_holiday,
            is_event=row.is_event
        )
        status = _traffic_status(congestion)

        results.append({
            "row": row_num,
            "date": parsed_date.strftime("%Y-%m-%d"),
            "date_label": _friendly_date_label(parsed_date),
            "day": DAY_NAMES[day_of_week],
            "time": _hour_to_ampm(parsed_hour),
            "hour": parsed_hour,
            "city": city,
            "weather": row.weather,
            "congestion": congestion,
            "status": status["level"],
            "emoji": status["emoji"],
            "advice": status["advice"],
            "is_weekend": day_of_week >= 5,
            "peak_hour": 7 <= parsed_hour <= 10 or 17 <= parsed_hour <= 20,
        })

    # Compute insights
    if results:
        avg_congestion = round(sum(r["congestion"] for r in results) / len(results), 1)
        peak_result = max(results, key=lambda r: r["congestion"])
        best_result = min(results, key=lambda r: r["congestion"])
        high_count = sum(1 for r in results if r["congestion"] >= 60)
    else:
        avg_congestion = 0
        peak_result = None
        best_result = None
        high_count = 0

    log_activity({
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "user_email": current_user["sub"],
        "action": "batch_prediction",
        "details": f"Batch: {len(data.rows)} rows, Predicted: {len(results)}, Errors: {len(errors)}",
    })

    return {
        "total_rows": len(data.rows),
        "processed": len(results),
        "failed": len(errors),
        "predictions": results,
        "errors": errors,
        "insights": {
            "average_congestion": avg_congestion,
            "worst_time": {
                "date_label": peak_result["date_label"],
                "day": peak_result["day"],
                "time": peak_result["time"],
                "city": peak_result["city"],
                "congestion": peak_result["congestion"],
            } if peak_result else None,
            "best_time": {
                "date_label": best_result["date_label"],
                "day": best_result["day"],
                "time": best_result["time"],
                "city": best_result["city"],
                "congestion": best_result["congestion"],
            } if best_result else None,
            "high_traffic_count": high_count,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


# ── CSV Upload ────────────────────────────────────────────────────────────

CSV_MAX_BYTES = 10 * 1024 * 1024  # 10 MB
CSV_MAX_ROWS = 100_000
SIMPLE_REQUIRED = {"date", "time", "city"} # weather, is_holiday, is_event are optional
RESPONSE_PREVIEW_LIMIT = 500


def _simple_batch_predict(df: pd.DataFrame) -> tuple[list, list]:
    """Process expanded CSV and predict traffic."""
    results = []
    errors = []

    for idx, row in df.iterrows():
        row_num = int(idx) + 1
        row_errors = []

        parsed_date = _parse_date(row.get("date", ""))
        if parsed_date is None:
            row_errors.append(f"Invalid date: '{row.get('date', '')}'")

        parsed_hour = _parse_time(str(row.get("time", "")))
        if parsed_hour is None:
            row_errors.append(f"Invalid time: '{row.get('time', '')}'")

        raw_city = str(row.get("city", "")).strip()
        city = canonical_city(raw_city)
        if city not in VALID_CITIES:
            row_errors.append(f"Unknown city: '{raw_city}'")

        if row_errors:
            errors.append({"row": row_num, "errors": row_errors, "date": str(row.get("date", "")), "time": str(row.get("time", "")), "city": raw_city})
            continue

        day_of_week = parsed_date.weekday()
        month = parsed_date.month
        
        # Optional columns with defaults
        weather = str(row.get("weather", "clear")).lower()
        is_holiday = str(row.get("is_holiday", "no")).lower() in ["yes", "y", "true", "1"]
        is_event = str(row.get("is_event", "no")).lower() in ["yes", "y", "true", "1"]

        congestion = predict_congestion(
            hour=parsed_hour, 
            city=city, 
            day_of_week=day_of_week, 
            month=month,
            weather=weather,
            is_holiday=is_holiday,
            is_event=is_event
        )
        status = _traffic_status(congestion)

        results.append({
            "row": row_num,
            "date": parsed_date.strftime("%Y-%m-%d"),
            "date_label": _friendly_date_label(parsed_date),
            "day": DAY_NAMES[day_of_week],
            "time": _hour_to_ampm(parsed_hour),
            "hour": parsed_hour,
            "city": city,
            "weather": weather,
            "is_holiday": is_holiday,
            "is_event": is_event,
            "congestion": congestion,
            "status": status["level"],
            "emoji": status["emoji"],
            "advice": status["advice"],
            "is_weekend": day_of_week >= 5,
            "peak_hour": 7 <= parsed_hour <= 10 or 17 <= parsed_hour <= 20,
        })

    return results, errors


@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content = await file.read()
    if len(content) > CSV_MAX_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds the 10 MB size limit.")

    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse CSV file. Please check it is a valid CSV.")

    if len(df) > CSV_MAX_ROWS:
        raise HTTPException(status_code=422, detail=f"Too many rows ({len(df):,}). Maximum is {CSV_MAX_ROWS:,}.")

    # Normalise columns
    df.columns = df.columns.str.strip().str.lower()

    missing = SIMPLE_REQUIRED - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing columns: {', '.join(sorted(missing))}. Your CSV needs at least: date, time, city",
        )

    results, errors = _simple_batch_predict(df)

    # Compute summary insights
    if results:
        avg_congestion = round(sum(r["congestion"] for r in results) / len(results), 1)
        peak_result = max(results, key=lambda r: r["congestion"])
        best_result = min(results, key=lambda r: r["congestion"])
        high_count = sum(1 for r in results if r["congestion"] >= 60)
    else:
        avg_congestion = 0
        peak_result = None
        best_result = None
        high_count = 0

    log_activity({
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "user_email": current_user["sub"],
        "action": "csv_prediction",
        "details": f"File: {file.filename}, Rows: {len(df)}, Predicted: {len(results)}, Errors: {len(errors)}",
    })

    preview = results[:RESPONSE_PREVIEW_LIMIT]
    preview_errors = errors[:100]

    return {
        "filename": file.filename,
        "total_rows": len(df),
        "processed": len(results),
        "failed": len(errors),
        "predictions": preview,
        "predictions_truncated": len(results) > RESPONSE_PREVIEW_LIMIT,
        "errors": preview_errors,
        "errors_truncated": len(errors) > 100,
        "insights": {
            "average_congestion": avg_congestion,
            "worst_time": {
                "date_label": peak_result["date_label"] if peak_result else None,
                "day": peak_result["day"] if peak_result else None,
                "time": peak_result["time"] if peak_result else None,
                "city": peak_result["city"] if peak_result else None,
                "congestion": peak_result["congestion"] if peak_result else None,
            } if peak_result else None,
            "best_time": {
                "date_label": best_result["date_label"] if best_result else None,
                "day": best_result["day"] if best_result else None,
                "time": best_result["time"] if best_result else None,
                "city": best_result["city"] if best_result else None,
                "congestion": best_result["congestion"] if best_result else None,
            } if best_result else None,
            "high_traffic_count": high_count,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


# ── Forecast (next 6 hours) ──────────────────────────────────────────────

@router.get("/forecast")
def get_traffic_forecast(city: str = "Delhi", current_user: dict = Depends(get_current_user)):
    now = datetime.now()
    current_hour = now.hour
    day_of_week = now.weekday()
    month = now.month

    forecast = []
    for i in range(1, 7):
        target_hour = (current_hour + i) % 24
        # If we pass midnight, adjust day
        target_day = day_of_week if (current_hour + i) < 24 else (day_of_week + 1) % 7

        congestion = predict_congestion(
            hour=target_hour,
            city=city,
            day_of_week=target_day,
            month=month,
        )
        forecast.append({
            "hour": _hour_to_ampm(target_hour),
            "congestion": round(congestion, 1)
        })

    return forecast


# ── Peak Hours ────────────────────────────────────────────────────────────

@router.get("/peak-hours")
def get_peak_hours(city: str = "Delhi", current_user: dict = Depends(get_current_user)):
    now = datetime.now()
    day_of_week = now.weekday()
    month = now.month

    # Calculate peak hours for this city on this day
    hourly = []
    for h in range(24):
        c = predict_congestion(hour=h, city=city, day_of_week=day_of_week, month=month)
        hourly.append({"hour": h, "congestion": c})

    sorted_hours = sorted(hourly, key=lambda x: x["congestion"], reverse=True)
    worst = sorted_hours[0]
    best = sorted_hours[-1]

    return {
        "id": str(uuid.uuid4()),
        "city": city,
        "day": DAY_NAMES[day_of_week],
        "morning_peak": {"start": "8:00 AM", "end": "10:00 AM", "congestion_level": round(predict_congestion(hour=9, city=city, day_of_week=day_of_week, month=month), 1)},
        "evening_peak": {"start": "5:00 PM", "end": "8:00 PM", "congestion_level": round(predict_congestion(hour=18, city=city, day_of_week=day_of_week, month=month), 1)},
        "predicted_worst_hour": _hour_to_ampm(worst["hour"]),
        "predicted_best_hour": _hour_to_ampm(best["hour"]),
    }


# ── Smart Signals (kept for admin/analyst) ────────────────────────────────

@router.get("/smart-signals")
def smart_signals(city: str = "Delhi", current_user: dict = Depends(get_current_analyst_or_admin)):
    now = datetime.now()

    congestion = predict_congestion(
        hour=now.hour,
        city=city,
        day_of_week=now.weekday(),
        month=now.month,
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
        local_congestion = min(congestion + (index * 4) - 8, 100.0)
        recommended = int(min(max(35 + local_congestion * 0.45, 35), 90))
        status = "Critical Load" if local_congestion >= 75 else "Optimal Flow" if local_congestion <= 40 else "Steady"

        suggestions.append({
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{city}-{name}")),
            "intersection": name,
            "recommended_green_time": recommended,
            "current_congestion": round(local_congestion, 1),
            "status": status,
            "grid_x": 20 + (index * 15) + (now.minute % 10),
            "grid_y": 30 + (index * 10) + (now.hour % 5),
        })
    return suggestions


@router.get("/signal-insights")
def signal_insights(city: str = "Delhi", current_user: dict = Depends(get_current_analyst_or_admin)):
    now = datetime.now()
    congestion = predict_congestion(hour=now.hour, city=city, day_of_week=now.weekday(), month=now.month)
    efficiency = max(15, min(45, int(congestion * 0.4) + 10))
    reliability = round(99.1 + (now.second % 9) / 10.0, 2)

    return {
        "efficiency": f"{efficiency}%",
        "co2_saved": "1.2t",
        "reliability": f"{reliability}%",
        "total_nodes": "4,821",
        "last_sync": datetime.utcnow().isoformat()
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

    log_activity({
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "user_email": current_user["sub"],
        "action": "traffic_rerouted",
        "details": f"Optimization triggered for {intersection} in {city}",
    })

    return {
        "status": "success",
        "optimization_id": str(uuid.uuid4()),
        "original_intersection": intersection,
        "city": city,
        "alternatives": alternatives,
        "timestamp": datetime.utcnow().isoformat(),
    }
