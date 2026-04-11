import logging
import os
import pickle
from pathlib import Path

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "data" / "models"
PRIMARY_MODEL_PATH = MODEL_DIR / "traffic_predictor_lite.pkl"
LEGACY_MODEL_PATH = BASE_DIR / "backend" / "ml_model" / "model.pkl"

CITY_ALIASES = {"Bangalore": "Bengaluru"}
CITY_FACTORS = {
    "Delhi": 1.18,
    "Mumbai": 1.12,
    "Bangalore": 1.15,
    "Bengaluru": 1.15,
    "Chennai": 0.92,
    "Hyderabad": 0.98,
}


def get_model_path() -> Path | None:
    if PRIMARY_MODEL_PATH.exists():
        return PRIMARY_MODEL_PATH
    if LEGACY_MODEL_PATH.exists():
        return LEGACY_MODEL_PATH
    return None


def check_model_availability() -> bool:
    """
    Log the model availability status at startup.

    Returns True if a model file is present, False otherwise.
    This never raises — it is safe to call during application startup.
    """
    model_path = get_model_path()
    if model_path is None:
        logger.warning(
            "No ML model file found (checked %s and %s). "
            "The service will use deterministic fallback predictions. "
            "Run backend/ml_model/train_safe.py to generate the model.",
            PRIMARY_MODEL_PATH,
            LEGACY_MODEL_PATH,
        )
        return False
    logger.info("ML model available at %s.", model_path)
    return True


def load_model():
    model_path = get_model_path()
    if model_path is None:
        return None

    try:
        with model_path.open("rb") as file:
            return pickle.load(file)
    except Exception as exc:
        logger.warning("Unable to load traffic model from %s: %s", model_path, exc)
        return None


def city_factor(city: str) -> float:
    canonical = CITY_ALIASES.get(city, city)
    return CITY_FACTORS.get(canonical, 1.0)


def deterministic_fallback(hour: int, pm2_5: float, precipitation: float, temp: float, city: str) -> float:
    factor = city_factor(city)
    base = 24.0 * factor

    if 7 <= hour <= 10:
        base += 30
    elif 17 <= hour <= 20:
        base += 34
    elif 11 <= hour <= 16:
        base += 14
    elif 0 <= hour <= 5:
        base -= 8

    base += min(pm2_5 * 0.1, 26.0)
    base += precipitation * 22.0
    base += max(0.0, temp - 32.0) * 0.8

    return base


def predict_congestion(hour: int, pm2_5: float, precipitation: float, temp: float = 25.0, city: str = "Delhi"):
    model = load_model()
    factor = city_factor(city)

    congestion = 0.0
    if model is not None:
        try:
            prediction = model.predict([[hour, pm2_5, precipitation, temp]])
            congestion = float(prediction[0]) * factor
        except Exception as exc:
            logger.warning("Prediction failed, falling back to deterministic rule set: %s", exc)

    if congestion <= 0:
        congestion = deterministic_fallback(hour, pm2_5, precipitation, temp, city)

    return round(min(max(congestion, 5.0), 100.0), 1)
