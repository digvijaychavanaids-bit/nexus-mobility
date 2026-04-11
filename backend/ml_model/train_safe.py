"""
Production-safe training script for the traffic congestion model.

This script uses relative paths and is compatible with Linux/Docker
environments (Render, HuggingFace Spaces). It trains on india_aqi_lite.csv
and saves the model to data/models/traffic_predictor_lite.pkl.

Usage:
    python backend/ml_model/train_safe.py
"""
import logging
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
AQI_DATA_PATH = BASE_DIR / "data" / "india_aqi_lite.csv"
MODEL_DIR = BASE_DIR / "data" / "models"
MODEL_PATH = MODEL_DIR / "traffic_predictor_lite.pkl"

CITIES = ["Delhi", "Bengaluru", "Mumbai", "Chennai", "Hyderabad"]
FEATURES = ["Hour", "PM2_5_ugm3", "Is_Raining", "Temp_2m_C"]
TARGET = "Congestion"


def _calculate_congestion(row: pd.Series) -> float:
    """Synthesise a congestion label (5-100) from AQI features."""
    base = 25.0
    h = int(row["Hour"])

    if (8 <= h <= 10) or (17 <= h <= 20):
        base += 35
    elif 11 <= h <= 16:
        base += 15

    base += min(float(row.get("PM2_5_ugm3", 0)) * 0.08, 20)

    if float(row.get("Is_Raining", 0)) > 0:
        base += 15

    noise = np.random.normal(0, 3)
    return round(min(max(base + noise, 5.0), 100.0), 1)


def load_training_data() -> pd.DataFrame:
    """Load and prepare the AQI dataset for training."""
    if not AQI_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {AQI_DATA_PATH}. "
            "Ensure india_aqi_lite.csv is present in the data/ directory."
        )

    logger.info("Loading dataset from %s", AQI_DATA_PATH)
    df = pd.read_csv(AQI_DATA_PATH)
    df = df[df["City"].isin(CITIES)].copy()

    if df.empty:
        raise RuntimeError(
            "No rows found for target cities. Check the dataset contents."
        )

    logger.info("Synthesising congestion labels for %d rows...", len(df))
    df["Congestion"] = df.apply(_calculate_congestion, axis=1)

    # Fill missing feature values
    df["PM2_5_ugm3"] = df["PM2_5_ugm3"].fillna(df["PM2_5_ugm3"].median())
    df["Is_Raining"] = df["Is_Raining"].fillna(0)
    df["Temp_2m_C"] = df["Temp_2m_C"].fillna(df["Temp_2m_C"].median())

    df = df.dropna(subset=FEATURES)
    return df


def train() -> None:
    """Train the RandomForest model and save it."""
    df = load_training_data()

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    logger.info("Training RandomForestRegressor (n_estimators=80, max_depth=12)...")
    model = RandomForestRegressor(n_estimators=80, max_depth=12, random_state=42)
    model.fit(X_train, y_train)

    score = model.score(X_test, y_test)
    logger.info("Validation R² score: %.4f", score)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with MODEL_PATH.open("wb") as fh:
        pickle.dump(model, fh)

    logger.info("Model saved to %s", MODEL_PATH)


if __name__ == "__main__":
    train()
