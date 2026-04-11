"""
Model validation utilities for the traffic congestion predictor.

These helpers are called at application startup to verify that the
ML model is available and produces sensible predictions.  All errors
are logged as warnings so the service continues running via the
deterministic fallback defined in backend/services/ml.py.
"""
import logging
import pickle
from pathlib import Path

import pandas as pd

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PRIMARY_MODEL_PATH = BASE_DIR / "data" / "models" / "traffic_predictor_lite.pkl"
AQI_DATA_PATH = BASE_DIR / "data" / "india_aqi_lite.csv"

FEATURES = ["Hour", "PM2_5_ugm3", "Is_Raining", "Temp_2m_C"]
PREDICTION_MIN = 5.0
PREDICTION_MAX = 100.0


def check_model_file() -> bool:
    """Return True if the primary model file exists and is non-empty."""
    if not PRIMARY_MODEL_PATH.exists():
        logger.warning(
            "Model file not found at %s. "
            "The service will use deterministic fallback predictions. "
            "Run backend/ml_model/train_safe.py to generate the model.",
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


def check_feature_compatibility() -> bool:
    """
    Verify that the AQI dataset contains all features expected by the model.
    Returns True if compatible, False otherwise.
    """
    if not AQI_DATA_PATH.exists():
        logger.warning("AQI dataset not found at %s; skipping feature compatibility check.", AQI_DATA_PATH)
        return False

    try:
        sample = pd.read_csv(AQI_DATA_PATH, nrows=5)
        missing = [f for f in FEATURES if f not in sample.columns]
        if missing:
            logger.warning("Dataset is missing expected feature columns: %s", missing)
            return False
        logger.info("Feature compatibility check passed. All required columns present: %s", FEATURES)
        return True
    except Exception as exc:
        logger.warning("Feature compatibility check failed: %s", exc)
        return False


def check_prediction_range(model) -> bool:
    """
    Run a small set of representative predictions and verify they fall
    within the expected 5-100 range.  Returns True if all pass.
    """
    test_cases = [
        # [Hour, PM2_5_ugm3, Is_Raining, Temp_2m_C]
        [9, 85.5, 1.0, 30.0],   # Morning peak, high pollution, rain
        [14, 45.0, 0.0, 35.0],  # Midday, moderate pollution
        [2, 10.0, 0.0, 22.0],   # Night, low pollution
        [18, 120.0, 1.0, 28.0], # Evening peak, very high pollution, rain
    ]

    all_passed = True
    for case in test_cases:
        try:
            prediction = float(model.predict([case])[0])
            clamped = round(min(max(prediction, PREDICTION_MIN), PREDICTION_MAX), 1)
            if clamped != round(prediction, 1):
                logger.warning(
                    "Prediction %s for input %s is outside [%s, %s]; will be clamped.",
                    prediction, case, PREDICTION_MIN, PREDICTION_MAX,
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
        "features_compatible": False,
        "prediction_range_ok": False,
    }

    try:
        result["model_file_present"] = check_model_file()
        result["features_compatible"] = check_feature_compatibility()

        if result["model_file_present"]:
            model = load_model_for_validation()
            if model is not None:
                result["prediction_range_ok"] = check_prediction_range(model)
    except Exception as exc:
        logger.warning("Startup validation encountered an unexpected error: %s", exc)

    status = "OK" if all(result.values()) else "DEGRADED (using deterministic fallback)"
    logger.info("ML model startup validation complete. Status: %s. Details: %s", status, result)
    return result
