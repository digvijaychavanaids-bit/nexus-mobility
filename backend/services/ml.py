import logging
import os
import pickle
from pathlib import Path
from datetime import datetime
from threading import Lock
from utils.locations import encode_city, encode_location, get_location_base_volume

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "data" / "models"
PRIMARY_MODEL_PATH = MODEL_DIR / "traffic_predictor_lite.pkl"

WEATHER_MAPPING = {
    "clear": 0,
    "rainy": 1,
    "foggy": 2,
    "stormy": 3
}

_MODEL_CACHE = {
    "path": None,
    "mtime": None,
    "model": None,
}
_MODEL_LOCK = Lock()

def get_model_path() -> Path | None:
    if PRIMARY_MODEL_PATH.exists():
        return PRIMARY_MODEL_PATH
    return None

def load_model():
    model_path = get_model_path()
    if model_path is None:
        with _MODEL_LOCK:
            _MODEL_CACHE["path"] = None
            _MODEL_CACHE["mtime"] = None
            _MODEL_CACHE["model"] = None
        return None

    try:
        model_mtime = model_path.stat().st_mtime
    except OSError:
        return None

    with _MODEL_LOCK:
        if (
            _MODEL_CACHE["model"] is not None
            and _MODEL_CACHE["path"] == str(model_path)
            and _MODEL_CACHE["mtime"] == model_mtime
        ):
            return _MODEL_CACHE["model"]

    try:
        with model_path.open("rb") as file:
            model = pickle.load(file)
            with _MODEL_LOCK:
                _MODEL_CACHE["path"] = str(model_path)
                _MODEL_CACHE["mtime"] = model_mtime
                _MODEL_CACHE["model"] = model
            return model
    except Exception as exc:
        logger.warning("Unable to load traffic model: %s", exc)
        return None

def deterministic_fallback(
    hour: int, 
    city: str, 
    location: str,
    day_of_week: int = 0, 
    month: int = 1,
    weather: int = 0,
    is_holiday: int = 0,
    is_event: int = 0
) -> dict:
    """Smart fallback prediction predicting both VehicleCount and Congestion."""
    base_volume = get_location_base_volume(city, location)
    
    multiplier = 0.3
    if 8 <= hour <= 10:
        multiplier = 0.9 if hour == 9 else 0.75
    elif 17 <= hour <= 20:
        multiplier = 0.95 if hour == 18 else 0.8
    elif 11 <= hour <= 16:
        multiplier = 0.6
    elif 6 <= hour <= 7:
        multiplier = 0.5
    elif 21 <= hour <= 23:
        multiplier = 0.4
        
    is_weekend = 1 if (day_of_week >= 5) else 0
    if is_weekend:
        multiplier *= 0.6
        if 11 <= hour <= 20:
            multiplier *= 1.4
    else:
        if day_of_week == 4:
            multiplier *= 1.1
            
    weather_penalty = 0
    if weather == 1:
        multiplier *= 0.9
        weather_penalty = 15
    elif weather == 2:
        multiplier *= 0.85
        weather_penalty = 10
    elif weather == 3:
        multiplier *= 0.6
        weather_penalty = 25
        
    if is_holiday:
        multiplier *= 0.5
    if is_event:
        multiplier *= 1.3
            
    if month in [10, 11, 12]:
        multiplier *= 1.15
    elif month in [5, 6]:
        multiplier *= 0.9
        
    vehicle_count = int(base_volume * multiplier)
    vehicle_count = max(50, vehicle_count)
    
    max_capacity = base_volume * 1.2
    congestion = (vehicle_count / max_capacity) * 100 + weather_penalty
    congestion = round(min(max(congestion, 5.0), 100.0), 1)
    
    return {"vehicle_count": vehicle_count, "congestion": congestion}

def predict_traffic(
    hour: int, 
    city: str = "Delhi", 
    location: str = "Connaught Place",
    day_of_week: int = 0, 
    month: int = 1,
    weather: str = "clear",
    is_holiday: bool = False,
    is_event: bool = False
):
    """
    Predict traffic congestion and vehicle count.
    """
    model = load_model()
    is_weekend = 1 if (day_of_week >= 5) else 0
    weather_val = WEATHER_MAPPING.get(weather.lower(), 0)
    holiday_val = 1 if is_holiday else 0
    event_val = 1 if is_event else 0
    
    city_enc = encode_city(city)
    loc_enc = encode_location(city, location)

    if model is not None and city_enc != -1 and loc_enc != -1:
        try:
            # Model expects: [City, Location, Hour, DayOfWeek, Month, IsWeekend, Weather, IsHoliday, IsEvent]
            prediction = model.predict([[city_enc, loc_enc, hour, day_of_week, month, is_weekend, weather_val, holiday_val, event_val]])
            # Model returns [VehicleCount, Congestion]
            vehicle_count = int(prediction[0][0])
            congestion = round(min(max(float(prediction[0][1]), 5.0), 100.0), 1)
            return {"vehicle_count": vehicle_count, "congestion": congestion}
        except Exception as exc:
            logger.warning("Prediction failed, using fallback: %s", exc)
            return deterministic_fallback(hour, city, location, day_of_week, month, weather_val, holiday_val, event_val)
    else:
        return deterministic_fallback(hour, city, location, day_of_week, month, weather_val, holiday_val, event_val)
