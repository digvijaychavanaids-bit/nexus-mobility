from datetime import datetime
import pandas as pd
from typing import Optional, List, Dict, Any

VALID_CITIES = {"Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune"}
DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def _parse_date(raw: str) -> Optional[datetime]:
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y", "%B %d, %Y", "%b %d, %Y", "%d %b %Y", "%d %B %Y"):
        try:
            return datetime.strptime(str(raw).strip(), fmt)
        except ValueError:
            continue
    try:
        return pd.to_datetime(raw, dayfirst=True).to_pydatetime()
    except Exception:
        return None

def _parse_time(raw: str) -> Optional[int]:
    import re
    text = str(raw).strip().upper()
    m = re.match(r"(\d{1,2})(?::(\d{2}))?\s*(AM|PM)", text)
    if m:
        h = int(m.group(1))
        ampm = m.group(3)
        if ampm == "PM" and h != 12:
            h += 12
        elif ampm == "AM" and h == 12:
            h = 0
        return h if 0 <= h <= 23 else None
    m = re.match(r"(\d{1,2}):(\d{2})", text)
    if m:
        h = int(m.group(1))
        return h if 0 <= h <= 23 else None
    m = re.match(r"^(\d{1,2})$", text)
    if m:
        h = int(m.group(1))
        return h if 0 <= h <= 23 else None
    return None

def _hour_to_ampm(h: int) -> str:
    if h == 0: return "12:00 AM"
    elif h < 12: return f"{h}:00 AM"
    elif h == 12: return "12:00 PM"
    else: return f"{h - 12}:00 PM"

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

def _clamp(value: float, low: float, high: float) -> float:
    return min(max(value, low), high)

def _predict_pollution_metrics(
    congestion: float,
    vehicle_count: int,
    weather: str,
    pm25_input: float | None = None,
    pm10_input: float | None = None,
    co_input: float | None = None,
    no2_input: float | None = None,
) -> dict:
    weather_factor = {"clear": 1.0, "rainy": 0.9, "foggy": 1.18, "stormy": 1.08}.get(
        str(weather).lower(), 1.0
    )

    base_pm25 = pm25_input if pm25_input is not None else (16 + congestion * 0.85 + vehicle_count / 360)
    base_pm10 = pm10_input if pm10_input is not None else (24 + congestion * 1.15 + vehicle_count / 250)
    base_co = co_input if co_input is not None else (250 + congestion * 4.2 + vehicle_count * 0.06)
    base_no2 = no2_input if no2_input is not None else (8 + congestion * 0.35 + vehicle_count / 520)

    pm25 = round(_clamp(base_pm25 * weather_factor, 8.0, 500.0), 1)
    pm10 = round(_clamp(base_pm10 * weather_factor, 12.0, 700.0), 1)
    co = round(_clamp(base_co * weather_factor, 100.0, 5000.0), 1)
    no2 = round(_clamp(base_no2 * weather_factor, 5.0, 400.0), 1)

    pollution_index = round(
        _clamp((pm25 * 0.5) + (pm10 * 0.2) + ((co / 20) * 0.2) + (no2 * 0.1), 5.0, 500.0), 1
    )
    
    if pollution_index >= 200:
        pollution_status = "Hazardous"
    elif pollution_index >= 120:
        pollution_status = "Poor"
    elif pollution_index >= 70:
        pollution_status = "Moderate"
    else:
        pollution_status = "Good"

    return {
        "pollution_index": pollution_index,
        "pollution_status": pollution_status,
        "predicted_pm2_5_ugm3": pm25,
        "predicted_pm10_ugm3": pm10,
        "predicted_co_ugm3": co,
        "predicted_no2_ugm3": no2,
    }

def _normalize_city_or_raise(raw_city: str, valid_cities: set) -> str:
    from fastapi import HTTPException
    city_map = {k.lower(): k for k in valid_cities}
    city = city_map.get(raw_city.strip().lower(), raw_city.strip())
    if city not in valid_cities:
        raise HTTPException(status_code=422, detail=f"Unknown city: '{raw_city}'")
    return city

def _build_city_wise_insights(results: list[dict]) -> list[dict]:
    if not results:
        return []

    grouped: dict[str, list[dict]] = {}
    for row in results:
        grouped.setdefault(row["city"], []).append(row)

    city_summary = []
    for city, rows in grouped.items():
        avg = round(sum(r["congestion"] for r in rows) / len(rows), 1)
        top_hotspot = max(rows, key=lambda r: r["congestion"])
        city_summary.append(
            {
                "city": city,
                "rows": len(rows),
                "average_congestion": avg,
                "max_congestion": round(top_hotspot["congestion"], 1),
                "top_location": top_hotspot["location"],
            }
        )

    city_summary.sort(key=lambda x: x["average_congestion"], reverse=True)
    return city_summary

def _apply_vehicle_hint(vehicle_count: int, congestion: float, vehicle_hint: float | None) -> tuple[int, float]:
    if vehicle_hint is None or vehicle_hint <= 0:
        return vehicle_count, congestion

    hinted = int(round(vehicle_hint))
    blended_vehicle = int(round((vehicle_count + hinted) / 2))
    ratio = _clamp(hinted / max(vehicle_count, 1), 0.7, 1.35)
    adjusted = round(_clamp(congestion * (0.75 + (0.25 * ratio)), 5.0, 100.0), 1)
    return blended_vehicle, adjusted
