# backend/routes/alerts.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime
import json
import os

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

# Define Alert Model
class TrafficAlert(BaseModel):
    id: str
    city: str
    location: str
    alert_type: str  # "congestion", "incident", "accident"
    severity: str    # "low", "medium", "high"
    message: str
    timestamp: str
    is_read: bool = False

# Path to alerts data
ALERTS_FILE = "data/alerts.json"

def load_alerts():
    if os.path.exists(ALERTS_FILE):
        with open(ALERTS_FILE, "r") as f:
            return json.load(f)
    return {"alerts": []}

def save_alerts(data):
    os.makedirs(os.path.dirname(ALERTS_FILE), exist_ok=True)
    with open(ALERTS_FILE, "w") as f:
        json.dump(data, f, indent=2)

# API Endpoints
@router.get("/", response_model=List[TrafficAlert])
def get_alerts(unread_only: bool = False):
    """Fetch all traffic alerts or unread only"""
    data = load_alerts()
    alerts = data.get("alerts", [])
    
    if unread_only:
        alerts = [a for a in alerts if not a.get("is_read", False)]
    
    return alerts

@router.post("/", response_model=TrafficAlert)
def create_alert(alert: TrafficAlert):
    """Create a new traffic alert"""
    data = load_alerts()
    alert.id = f"alert_{len(data['alerts']) + 1}"
    alert.timestamp = datetime.now().isoformat()
    
    data["alerts"].append(alert.dict())
    save_alerts(data)
    
    return alert

@router.put("/{alert_id}/mark-read")
def mark_alert_read(alert_id: str):
    """Mark an alert as read"""
    data = load_alerts()
    
    for alert in data["alerts"]:
        if alert.get("id") == alert_id:
            alert["is_read"] = True
            save_alerts(data)
            return {"status": "success", "message": "Alert marked as read"}
    
    raise HTTPException(status_code=404, detail="Alert not found")

@router.delete("/{alert_id}")
def delete_alert(alert_id: str):
    """Delete an alert"""
    data = load_alerts()
    data["alerts"] = [a for a in data["alerts"] if a.get("id") != alert_id]
    save_alerts(data)
    return {"status": "success", "message": "Alert deleted"}
