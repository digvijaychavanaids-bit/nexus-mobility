import os
import pickle
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = DATA_DIR / "models"
MODEL_PATH = MODEL_DIR / "traffic_predictor_lite.pkl"

def generate_synthetic_traffic_data(num_samples=30000):
    """
    Generate synthetic traffic data based on realistic urban patterns.
    New Features: Weather, IsHoliday, IsEvent
    Target: Congestion (0-100)
    """
    np.random.seed(42)
    
    hours = np.random.randint(0, 24, num_samples)
    days = np.random.randint(0, 7, num_samples)
    months = np.random.randint(1, 13, num_samples)
    is_weekend = (days >= 5).astype(int)
    
    # Weather: 0: Clear, 1: Rainy, 2: Foggy, 3: Stormy
    weather = np.random.choice([0, 1, 2, 3], size=num_samples, p=[0.7, 0.15, 0.1, 0.05])
    is_holiday = np.random.choice([0, 1], size=num_samples, p=[0.95, 0.05])
    is_event = np.random.choice([0, 1], size=num_samples, p=[0.9, 0.1])
    
    congestion = []
    
    for i in range(num_samples):
        h = hours[i]
        d = days[i]
        m = months[i]
        iw = is_weekend[i]
        w = weather[i]
        ih = is_holiday[i]
        ie = is_event[i]
        
        # Base congestion
        base = 20.0
        
        # Peak hours (Morning: 8-10 AM, Evening: 5-8 PM)
        if 8 <= h <= 10:
            peak_intensity = 40 if h == 9 else 30
            base += peak_intensity
        elif 17 <= h <= 20:
            peak_intensity = 45 if h == 18 else 35
            base += peak_intensity
        elif 11 <= h <= 16:
            base += 15
        elif 0 <= h <= 5:
            base -= 10
            
        # Weekend adjustment
        if iw:
            base *= 0.7
            if 11 <= h <= 20: # Weekend afternoon/evening rush
                base += 10
        else:
            if d == 4: # Friday heavier
                base *= 1.1
                
        # Weather impact
        if w == 1: # Rainy
            base += 15
        elif w == 2: # Foggy
            base += 10
        elif w == 3: # Stormy
            base += 25
            
        # Holiday impact (usually less commute traffic, but maybe more leisure)
        if ih:
            base *= 0.6
            
        # Event impact
        if ie:
            base += 20
                
        # Monthly/Seasonal adjustment
        if m in [10, 11, 12]:
            base *= 1.15
        elif m in [5, 6]:
            base *= 0.9
            
        # Random noise
        noise = np.random.normal(0, 4)
        
        final_congestion = base + noise
        congestion.append(round(min(max(final_congestion, 5.0), 100.0), 1))
        
    df = pd.DataFrame({
        'Hour': hours,
        'DayOfWeek': days,
        'Month': months,
        'IsWeekend': is_weekend,
        'Weather': weather,
        'IsHoliday': is_holiday,
        'IsEvent': is_event,
        'Congestion': congestion
    })
    
    return df

def train_system_model():
    print("Generating expanded synthetic traffic dataset...")
    df = generate_synthetic_traffic_data()

    features = ["Hour", "DayOfWeek", "Month", "IsWeekend", "Weather", "IsHoliday", "IsEvent"]
    target = "Congestion"
    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Enhanced Random Forest model...")
    model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42)
    model.fit(X_train, y_train)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with MODEL_PATH.open("wb") as file:
        pickle.dump(model, file)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    df.head(1000).to_csv(DATA_DIR / "traffic_training_sample.csv", index=False)

    print(f"✅ Model saved to {MODEL_PATH}")
    print(f"Validation score: {model.score(X_test, y_test):.4f}")

if __name__ == "__main__":
    train_system_model()
