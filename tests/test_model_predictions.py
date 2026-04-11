"""
Tests for ML model predictions.

Validates that:
- The model can be loaded (or gracefully falls back)
- Features in india_aqi_lite.csv are compatible with the model
- Predictions fall within the expected 5-100 congestion range
- The deterministic fallback also stays within range
"""
import sys
from pathlib import Path

import pytest

# Ensure the backend package is importable when running from repo root
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from services.ml import (
    deterministic_fallback,
    load_model,
    predict_congestion,
)
from utils.model_validator import (
    check_feature_compatibility,
    check_model_file,
    run_startup_validation,
)

MODEL_AVAILABLE = load_model() is not None


# ---------------------------------------------------------------------------
# Startup validation
# ---------------------------------------------------------------------------

def test_startup_validation_does_not_raise():
    """run_startup_validation must never raise — safe to call at startup."""
    result = run_startup_validation()
    assert isinstance(result, dict)
    assert "model_file_present" in result
    assert "features_compatible" in result
    assert "prediction_range_ok" in result


def test_feature_compatibility():
    """india_aqi_lite.csv must contain all feature columns the model expects."""
    assert check_feature_compatibility(), (
        "india_aqi_lite.csv is missing one or more required feature columns."
    )


# ---------------------------------------------------------------------------
# Deterministic fallback predictions
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("hour,pm2_5,precip,temp,city", [
    (9,  85.5, 1.0, 30.0, "Delhi"),      # Morning peak, rain
    (14, 45.0, 0.0, 35.0, "Mumbai"),     # Midday
    (2,  10.0, 0.0, 22.0, "Bengaluru"),  # Night
    (18, 120.0, 1.0, 28.0, "Chennai"),   # Evening peak, rain
    (12, 60.0, 0.0, 25.0, "Hyderabad"), # Midday average
])
def test_deterministic_fallback_range(hour, pm2_5, precip, temp, city):
    """Deterministic fallback must return congestion in [5, 100]."""
    value = deterministic_fallback(hour, pm2_5, precip, temp, city)
    assert 5.0 <= value <= 100.0, f"Unexpected fallback value {value} for {city}"


# ---------------------------------------------------------------------------
# predict_congestion (model or fallback)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("hour,pm2_5,precip,temp,city", [
    (9,  85.5, 1.0, 30.0, "Delhi"),
    (14, 45.0, 0.0, 35.0, "Mumbai"),
    (2,  10.0, 0.0, 22.0, "Bengaluru"),
    (18, 120.0, 1.0, 28.0, "Chennai"),
    (12, 60.0, 0.0, 25.0, "Hyderabad"),
])
def test_predict_congestion_range(hour, pm2_5, precip, temp, city):
    """predict_congestion must always return a value clamped to [5, 100]."""
    value = predict_congestion(hour, pm2_5, precip, temp, city)
    assert 5.0 <= value <= 100.0, f"Congestion {value} out of range for {city}"


def test_predict_congestion_returns_float():
    """predict_congestion should always return a float."""
    result = predict_congestion(hour=8, pm2_5=75.0, precipitation=0.0, temp=28.0, city="Delhi")
    assert isinstance(result, float)


def test_peak_hour_higher_than_night():
    """Peak-hour congestion should be higher than night-time congestion."""
    peak = predict_congestion(hour=9, pm2_5=50.0, precipitation=0.0, temp=28.0, city="Delhi")
    night = predict_congestion(hour=3, pm2_5=50.0, precipitation=0.0, temp=28.0, city="Delhi")
    assert peak > night, f"Expected peak ({peak}) > night ({night})"


# ---------------------------------------------------------------------------
# Model-specific tests (skipped gracefully if model is absent)
# ---------------------------------------------------------------------------

@pytest.mark.skipif(not MODEL_AVAILABLE, reason="Model file not present; skipping ML-specific tests")
def test_model_prediction_range():
    """When the model is loaded its raw predictions should be near [5, 100]."""
    model = load_model()
    test_inputs = [
        [9,  85.5, 0.5, 30.0],
        [14, 45.0, 0.0, 35.0],
        [2,  10.0, 0.0, 22.0],
        [18, 120.0, 1.0, 28.0],
    ]
    for inp in test_inputs:
        pred = float(model.predict([inp])[0])
        # Allow a wider range here since city factor hasn't been applied yet
        assert 0.0 <= pred <= 200.0, f"Raw model prediction {pred} is unreasonably large/small for {inp}"


@pytest.mark.skipif(not MODEL_AVAILABLE, reason="Model file not present; skipping ML-specific tests")
def test_model_feature_count():
    """Model should expect exactly 4 features: Hour, PM2_5, Is_Raining, Temp."""
    model = load_model()
    assert model.n_features_in_ == 4, (
        f"Model expects {model.n_features_in_} features, expected 4."
    )
