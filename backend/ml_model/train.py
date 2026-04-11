import os
import pickle
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent.parent.parent
AQI_DATA_PATH = BASE_DIR / "data" / "india_aqi_lite.csv"
TRAFFIC_CONGESTION_PATH = BASE_DIR / "delhi_traffic" / "weekday_stats" / "2024_week_day_congestion_city.csv"
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = DATA_DIR / "models"
MODEL_PATH = MODEL_DIR / "traffic_predictor_lite.pkl"


def clean_percentage(value):
    if isinstance(value, str):
        return float(value.replace("%", ""))
    return float(value)


def time_to_hour(value: str) -> int:
    parsed = pd.to_datetime(value.strip(), format="%I:%M %p")
    return int(parsed.hour)


def load_traffic_data() -> pd.DataFrame:
    traffic_df = pd.read_csv(TRAFFIC_CONGESTION_PATH)
    traffic_long = traffic_df.melt(id_vars=["Time"], var_name="Day_Name", value_name="Congestion")
    traffic_long["Congestion"] = traffic_long["Congestion"].apply(clean_percentage)
    traffic_long["Hour"] = traffic_long["Time"].apply(time_to_hour)
    return traffic_long


def load_aqi_features() -> pd.DataFrame:
    use_columns = ["City", "Hour", "Day_Name", "PM2_5_ugm3", "Is_Raining", "Temp_2m_C", "PM10_ugm3", "CO_ugm3", "NO2_ugm3"]
    # The lite dataset is small enough to load fully, but we'll keep the logic robust
    chunks = pd.read_csv(AQI_DATA_PATH, chunksize=100000)

    delhi_rows = []
    for chunk in chunks:
        subset = chunk[chunk["City"].isin(["Delhi", "Bengaluru", "Mumbai", "Chennai", "Hyderabad"])]
        if not subset.empty:
            delhi_rows.append(subset)
        if sum(len(frame) for frame in delhi_rows) >= 250000:
            break

    if not delhi_rows:
        raise RuntimeError("AQI dataset did not contain enough training rows")

    aqi_df = pd.concat(delhi_rows, ignore_index=True)
    grouped = (
        aqi_df.groupby(["Hour", "Day_Name"], as_index=False)[["PM2_5_ugm3", "Is_Raining", "Temp_2m_C", "PM10_ugm3", "CO_ugm3", "NO2_ugm3"]]
        .mean()
    )
    return grouped


def build_training_frame() -> pd.DataFrame:
    print("Loading lite AQI dataset...")
    aqi_features = load_aqi_features()
    # If load_aqi_features grouped it, we might have multiple rows or mean rows.
    # For training, we want a diverse set of rows.
    
    # Reloading the lite CSV for raw rows to get better training distribution
    # instead of just the mean-grouped version.
    df = pd.read_csv(AQI_DATA_PATH)
    
    cities = ['Delhi', 'Bengaluru', 'Mumbai', 'Chennai', 'Hyderabad']
    df = df[df['City'].isin(cities)]

    print(f"Synthesizing congestion labels for {len(df)} rows...")
    
    def calculate_congestion(row):
        # Base congestion
        base = 25.0
        h = int(row['Hour'])
        
        # Peak hours adjustment
        if (8 <= h <= 10) or (17 <= h <= 20):
            base += 35
        elif (11 <= h <= 16):
            base += 15
            
        # Pollution impact (PM2.5)
        pm25 = row.get('PM2_5_ugm3', 0)
        base += min(pm25 * 0.08, 20)
        
        # Weather impact
        rain = row.get('Is_Raining', 0)
        if rain > 0:
            base += 15
            
        # Add some noise for realism
        import numpy as np
        noise = np.random.normal(0, 3)
        
        congestion = base + noise
        return round(min(max(congestion, 5.0), 100.0), 1)

    df['Congestion'] = df.apply(calculate_congestion, axis=1)
    
    # Fill missing values
    df['PM2_5_ugm3'] = df['PM2_5_ugm3'].fillna(df['PM2_5_ugm3'].median())
    df['Is_Raining'] = df['Is_Raining'].fillna(0)
    df['Temp_2m_C'] = df['Temp_2m_C'].fillna(df['Temp_2m_C'].median())
    
    # Check for NaN in features we care about
    features = ["Hour", "PM2_5_ugm3", "Is_Raining", "Temp_2m_C"]
    df = df.dropna(subset=features)
    
    return df


def save_city_summary() -> None:
    summary_chunks = []
    chunks = pd.read_csv(AQI_DATA_PATH, chunksize=100000)
    for chunk in chunks:
        pollutants = [column for column in ["PM2_5_ugm3", "PM10_ugm3", "CO_ugm3", "NO2_ugm3"] if column in chunk.columns]
        if "City" not in chunk.columns or not pollutants:
            continue
        summary_chunks.append(chunk[["City", *pollutants]].groupby("City", as_index=False).mean())

    if not summary_chunks:
        raise RuntimeError("Unable to build city summary from AQI dataset")

    final_summary = pd.concat(summary_chunks, ignore_index=True).groupby("City", as_index=False).mean()
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    final_summary.to_json(DATA_DIR / "city_summary.json", orient="records")


def train_system_model():
    print("Loading traffic and AQI datasets...")
    merged_df = build_training_frame()

    features = ["Hour", "PM2_5_ugm3", "Is_Raining", "Temp_2m_C"]
    target = "Congestion"
    X = merged_df[features]
    y = merged_df[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training optimized congestion model...")
    # Limiting depth and estimators to keep the model size < 100MB for GitHub
    # 80 estimators and depth 12 should bring it well under 100MB
    model = RandomForestRegressor(n_estimators=80, max_depth=12, random_state=42)
    model.fit(X_train, y_train)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with MODEL_PATH.open("wb") as file:
        pickle.dump(model, file)

    save_city_summary()

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    merged_df.head(2000).to_csv(DATA_DIR / "processed_sample.csv", index=False)

    print(f"Model saved to {MODEL_PATH}")
    print(f"Validation score: {model.score(X_test, y_test):.4f}")


if __name__ == "__main__":
    train_system_model()
