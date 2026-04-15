import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from routes.predictions import _apply_vehicle_hint, _predict_pollution_metrics


def test_vehicle_hint_adjusts_outputs():
    vehicle_count, congestion = _apply_vehicle_hint(4000, 70.0, 5200)
    assert vehicle_count > 4000
    assert 5.0 <= congestion <= 100.0


def test_pollution_prediction_outputs_expected_shape():
    pollution = _predict_pollution_metrics(
        congestion=72.5,
        vehicle_count=5100,
        weather="foggy",
        pm25_input=60.0,
        pm10_input=90.0,
        co_input=620.0,
        no2_input=34.0,
    )
    assert set(
        [
            "pollution_index",
            "pollution_status",
            "predicted_pm2_5_ugm3",
            "predicted_pm10_ugm3",
            "predicted_co_ugm3",
            "predicted_no2_ugm3",
        ]
    ).issubset(pollution.keys())
    assert pollution["pollution_index"] >= 5.0
