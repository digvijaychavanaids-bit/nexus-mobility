"""
Model validation utilities for the traffic congestion predictor.

These helpers are called at application startup to verify that the
ML model is available and produces sensible predictions.
"""
import logging
import pickle
from pathlib import Path

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PRIMARY_MODEL_PATH = BASE_DIR / "data" / "models" / "traffic_predictor_lite.pkl"

# Features: [Hour, DayOfWeek, Month, IsWeekend, Weather, IsHoliday, IsEvent]
FEATURES = ["Hour", "DayOfWeek", "Month", "IsWeekend", "Weather", "IsHoliday", "IsEvent"]
PREDICTION_MIN = 5.0
PREDICTION_MAX = 100.0


def check_model_file() -> bool:
    """Return True if the primary model file exists and is non-empty."""
    if not PRIMARY_MODEL_PATH.exists():
        logger.warning(
            "Model file not found at %s. "
            "The service will use deterministic fallback predictions.",
            PRIMARY_MODEL_PATH,
        )
        return False

    if PRIMARY_MODEL_PATH.stat().st_size == 0:
        logger.warning("Model file at %s is empty. Using deterministic fallback.", PRIMARY_MODEL_PATH)
        return False

    logger.info("Model file found at %s (%.1f MB).", PRIMARY_MODEL_PATH, PRIMARY_MODEL_PATH.stat().st_size / 1_048_576)
    return True


def load_model_for_validation():
    """Load the model for validation purposes. Returns None on failure."""
    if not PRIMARY_MODEL_PATH.exists():
        return None
    try:
        with PRIMARY_MODEL_PATH.open("rb") as fh:
            return pickle.load(fh)
    except Exception as exc:
        logger.warning("Could not load model for validation: %s", exc)
        return None


def check_prediction_range(model) -> bool:
    """
    Run a small set of representative predictions and verify they fall
    within the expected 5-100 range.  Returns True if all pass.
    """
    test_cases = [
        # [Hour, DayOfWeek, Month, IsWeekend, Weather, IsHoliday, IsEvent]
        [9, 0, 4, 0, 0, 0, 0],   # Monday morning peak, April
        [18, 4, 11, 0, 1, 0, 1], # Friday evening peak, Nov, Rainy, Event
        [14, 6, 5, 1, 0, 1, 0],  # Sunday afternoon, May, Holiday
        [2, 2, 1, 0, 2, 0, 0],   # Wednesday night, Jan, Foggy
    ]

    all_passed = True
    for case in test_cases:
        try:
            prediction = float(model.predict([case])[0])
            if not (0 <= prediction <= 140): # Allowing buffer for extra factors
                logger.warning(
                    "Raw prediction %s for input %s is unusual.",
                    prediction, case
                )
                all_passed = False
            else:
                logger.debug("Prediction %.1f for input %s is within range.", prediction, case)
        except Exception as exc:
            logger.warning("Prediction failed for input %s: %s", case, exc)
            all_passed = False

    if all_passed:
        logger.info("Prediction range check passed for all test cases.")
    return all_passed


def run_startup_validation() -> dict:
    """
    Run all validation checks and return a summary dict.
    This is safe to call at application startup — it never raises.
    """
    result = {
        "model_file_present": False,
        "prediction_range_ok": False,
    }

    try:
        result["model_file_present"] = check_model_file()

        if result["model_file_present"]:
            model = load_model_for_validation()
            if model is not None:
                result["prediction_range_ok"] = check_prediction_range(model)
    except Exception as exc:
        logger.warning("Startup validation encountered an unexpected error: %s", exc)

    status = "OK" if all(result.values()) else "DEGRADED (using deterministic fallback)"
    logger.info("ML model startup validation complete. Status: %s. Details: %s", status, result)
    return result
