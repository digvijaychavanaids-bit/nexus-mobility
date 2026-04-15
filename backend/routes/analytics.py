import io
import os
import uuid
from datetime import datetime
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from services.auth_handler import get_current_analyst_or_admin, get_current_user
from services.db import add_log, log_activity
from services.ml import predict_congestion, city_factor

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROCESSED_DATA = os.path.join(BASE_DIR, "data", "processed_sample.csv")
CITY_SUMMARY = os.path.join(BASE_DIR, "data", "city_summary.json")

CITY_ALIASES = {"Bangalore": "Bengaluru"}
VALID_CITIES = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad"]


def canonical_city(city: str) -> str:
    return CITY_ALIASES.get(city, city)


def get_data() -> pd.DataFrame | None:
    if os.path.exists(PROCESSED_DATA):
        return pd.read_csv(PROCESSED_DATA)
    return None


def weekday_label(index: int) -> str:
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]


@router.get("/dashboard-stats")
def get_dashboard_stats(city: str = "Delhi", current_user: dict = Depends(get_current_user)):
    now = datetime.now()
    factor = city_factor(city)

    # Calculate current congestion for this city
    current_congestion = predict_congestion(
        hour=now.hour,
        city=city,
        day_of_week=now.weekday(),
        month=now.month,
    )

    # Calculate peak hour congestion
    peak_congestion = predict_congestion(hour=18, city=city, day_of_week=now.weekday(), month=now.month)

    # Active alerts based on congestion level
    active_alerts = 0
    if current_congestion >= 80:
        active_alerts = 3
    elif current_congestion >= 60:
        active_alerts = 2
    elif current_congestion >= 40:
        active_alerts = 1

    return {
        "avg_traffic_index": round(current_congestion, 1),
        "active_alerts": active_alerts,
        "peak_hour": "6:00 PM",
        "peak_congestion": round(peak_congestion, 1),
        "network_health": f"{max(65, min(98, 100 - (active_alerts * 3)))}%",
        "velocity": f"{max(15, round(75 - (current_congestion * 0.4)))} km/h",
        "day": weekday_label(now.weekday()),
        "time": now.strftime("%I:%M %p"),
    }


@router.get("/traffic-trends")
def get_traffic_trends(
    city: str = "Delhi",
    min_congestion: float = 0,
    time_range: str = "24h",
    current_user: dict = Depends(get_current_user),
):
    now = datetime.now()
    day_of_week = now.weekday()
    month = now.month

    if time_range == "7d":
        # Show each day of the week
        return [
            {
                "time": weekday_label(d),
                "congestion": round(predict_congestion(hour=18, city=city, day_of_week=d, month=month), 1)
            }
            for d in range(7)
            if predict_congestion(hour=18, city=city, day_of_week=d, month=month) >= min_congestion
        ]

    if time_range == "30d":
        # Simulated 4-week pattern
        week_factors = [0.96, 1.01, 1.07, 1.10]
        base = predict_congestion(hour=18, city=city, day_of_week=day_of_week, month=month)
        return [
            {
                "time": f"Week {i + 1}",
                "congestion": round(max(base * f, 5.0), 1)
            }
            for i, f in enumerate(week_factors)
            if base * f >= min_congestion
        ]

    # 24h view – show each hour
    output = []
    for h in range(24):
        congestion = predict_congestion(hour=h, city=city, day_of_week=day_of_week, month=month)
        if congestion >= min_congestion:
            # Format hour as AM/PM
            if h == 0:
                label = "12 AM"
            elif h < 12:
                label = f"{h} AM"
            elif h == 12:
                label = "12 PM"
            else:
                label = f"{h - 12} PM"
            output.append({"time": label, "congestion": round(congestion, 1)})
    return output


@router.get("/compare-cities")
def compare_cities(city1: str, city2: str, current_user: dict = Depends(get_current_user)):
    now = datetime.now()
    c1 = predict_congestion(hour=now.hour, city=city1, day_of_week=now.weekday(), month=now.month)
    c2 = predict_congestion(hour=now.hour, city=city2, day_of_week=now.weekday(), month=now.month)
    return {
        "city1": {"name": city1, "congestion": round(c1, 1)},
        "city2": {"name": city2, "congestion": round(c2, 1)},
    }


@router.get("/export-report")
def export_report(
    city: str | None = None,
    min_congestion: float | None = None,
    max_congestion: float | None = None,
    current_user: dict = Depends(get_current_analyst_or_admin),
):
    now = datetime.now()
    day_of_week = now.weekday()
    month = now.month

    # Generate a hourly report for the city
    rows = []
    target_city = city or "Delhi"
    for h in range(24):
        c = predict_congestion(hour=h, city=target_city, day_of_week=day_of_week, month=month)
        if min_congestion is not None and c < min_congestion:
            continue
        if max_congestion is not None and c > max_congestion:
            continue
        rows.append({
            "City": target_city,
            "Hour": h,
            "Time": f"{h:02d}:00",
            "Congestion": round(c, 1),
            "Day": weekday_label(day_of_week),
        })

    if not rows:
        raise HTTPException(status_code=404, detail="No data available with given filters")

    df = pd.DataFrame(rows)

    log_activity({
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "user_email": current_user["sub"],
        "action": "report_exported",
        "details": f"Exported {len(df)} records for {target_city}",
    })

    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)

    filename_city = target_city.replace(" ", "_").lower()
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=traffic_report_{filename_city}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
        },
    )


@router.get("/alerts")
def get_alerts(city: str = "Delhi", current_user: dict = Depends(get_current_user)):
    now = datetime.now()
    congestion = predict_congestion(hour=now.hour, city=city, day_of_week=now.weekday(), month=now.month)
    alerts = []

    if congestion >= 70:
        alerts.append({
            "id": str(uuid.uuid4()),
            "type": "congestion",
            "severity": "high" if congestion >= 85 else "medium",
            "title": "High traffic congestion detected",
            "message": f"Current congestion is {congestion:.1f}% in {city}.",
            "city": city,
        })

    if congestion >= 50:
        alerts.append({
            "id": str(uuid.uuid4()),
            "type": "advisory",
            "severity": "low",
            "title": "Travel Advisory",
            "message": f"Moderate to high traffic expected. Consider alternate routes in {city}.",
            "city": city,
        })

    return alerts


@router.post("/clear-alerts")
def clear_alerts(city: str = "Delhi", current_user: dict = Depends(get_current_user)):
    log_activity({
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "user_email": current_user["sub"],
        "action": "alerts_cleared",
        "details": f"User cleared all alerts for {city}",
    })
    add_log({
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "type": "alerts_cleared",
        "email": current_user["sub"],
        "city": city,
    })
    return {"message": f"Alerts cleared for {city}"}


@router.get("/sector-stats")
def get_sector_stats(city: str = "Delhi", current_user: dict = Depends(get_current_user)):
    now = datetime.now()
    base_congestion = predict_congestion(hour=now.hour, city=city, day_of_week=now.weekday(), month=now.month)

    sector_multipliers = {
        "A1": 0.85, "A2": 1.15, "A3": 0.92, "A4": 1.28,
        "B1": 0.76, "B2": 0.98, "C1": 1.34, "C2": 1.12,
        "D3": 0.88, "E5": 1.05
    }

    sectors = []
    for sector_id, m in sector_multipliers.items():
        val = min(max(base_congestion * m, 5.0), 100.0)
        sectors.append({
            "id": sector_id,
            "val": round(val, 1),
            "alert": val >= 80
        })

    return sectors


@router.get("/metropolitan-leaderboard")
def get_metropolitan_leaderboard(current_user: dict = Depends(get_current_user)):
    now = datetime.now()

    leaderboard = []
    for city in VALID_CITIES:
        congestion = predict_congestion(hour=now.hour, city=city, day_of_week=now.weekday(), month=now.month)
        mobility_score = round(100 - congestion, 1)

        leaderboard.append({
            "city": city,
            "congestion": round(congestion, 1),
            "mobility_score": mobility_score,
            "status": "Optimal" if congestion < 40 else "Steady" if congestion < 70 else "Congested"
        })

    return sorted(leaderboard, key=lambda x: x["congestion"])
