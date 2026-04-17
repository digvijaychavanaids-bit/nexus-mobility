import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any
from .ml import predict_traffic
from utils.locations import canonicalize_location
from utils.parsers import _parse_time, _parse_date, _hour_to_ampm, _friendly_date_label, _traffic_status, _predict_pollution_metrics

def calculate_bias_factors(historical_df: pd.DataFrame) -> Dict[str, float]:
    """
    Calculates bias factors based on historical data.
    Key is formatted as 'city|location|hour'
    Value is the ratio: actual_vehicle_count / predicted_vehicle_count
    """
    bias_map = {}
    grouped_data = {}

    for _, row in historical_df.iterrows():
        try:
            city = str(row.get('city', 'Delhi')).strip()
            location = canonicalize_location(city, str(row.get('location', 'Main')))
            time_raw = str(row.get('time', '12 PM'))
            
            # Simple hour extraction if it's already an int or standard format
            hour = _parse_time(time_raw)
            date = _parse_date(str(row.get('date', '')))
            
            if hour is None or date is None:
                continue
                
            actual_vehicles = row.get('vehicle_count')
            if actual_vehicles is None or pd.isna(actual_vehicles):
                continue
                
            # Get model's baseline prediction
            baseline = predict_traffic(
                hour=hour,
                city=city,
                location=location,
                day_of_week=date.weekday(),
                month=date.month,
                weather=str(row.get('weather', 'clear'))
            )
            
            pred_vehicles = max(baseline['vehicle_count'], 1)
            bias = actual_vehicles / pred_vehicles
            
            key = f"{city.lower()}|{location.lower()}|{hour}"
            if key not in grouped_data:
                grouped_data[key] = []
            grouped_data[key].append(bias)
        except Exception:
            continue
            
    # Average bias per key
    for key, biases in grouped_data.items():
        bias_map[key] = sum(biases) / len(biases)
        
    return bias_map

def generate_forecast(
    historical_df: pd.DataFrame, 
    forecast_days: int = 7
) -> List[Dict[str, Any]]:
    """
    Generates a forecast for the next N days based on unique locations and patterns in the history.
    """
    bias_map = calculate_bias_factors(historical_df)
    
    # Identify unique segments (City, Location, Hour) found in history
    segments = []
    seen_segments = set()
    
    for _, row in historical_df.iterrows():
        city = str(row.get('city', 'Delhi')).strip()
        location = str(row.get('location', 'Main'))
        hour = _parse_time(str(row.get('time', '12 PM')))
        
        if hour is None: continue
        
        seg_key = f"{city}|{location}|{hour}"
        if seg_key not in seen_segments:
            segments.append({"city": city, "location": location, "hour": hour})
            seen_segments.add(seg_key)
            
    if not segments:
        return []
        
    # Generate future timestamps
    start_date = datetime.now() + timedelta(days=1)
    results = []
    
    for d in range(forecast_days):
        current_date = start_date + timedelta(days=d)
        day_of_week = current_date.weekday()
        month = current_date.month
        
        for seg in segments:
            city = seg["city"]
            location = canonicalize_location(city, seg["location"])
            hour = seg["hour"]
            
            # Base prediction
            pred = predict_traffic(
                hour=hour,
                city=city,
                location=location,
                day_of_week=day_of_week,
                month=month,
                weather="clear" # Assumption for forecast
            )
            
            # Apply bias correction
            bias_key = f"{city.lower()}|{location.lower()}|{hour}"
            bias = bias_map.get(bias_key, 1.0)
            
            # Clamp bias to avoid extreme outliers (0.5x to 2.0x)
            bias = min(max(bias, 0.5), 2.0)
            
            final_vehicle_count = int(pred["vehicle_count"] * bias)
            # Adjust congestion accordingly (linear-ish relation with clamp)
            final_congestion = round(min(max(pred["congestion"] * (0.8 + 0.2 * bias), 5.0), 100.0), 1)
            
            status = _traffic_status(final_congestion)
            pollution = _predict_pollution_metrics(
                congestion=final_congestion,
                vehicle_count=final_vehicle_count,
                weather="clear"
            )
            
            results.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "date_label": _friendly_date_label(current_date),
                "day": current_date.strftime("%A"),
                "time": _hour_to_ampm(hour),
                "hour": hour,
                "city": city,
                "location": location,
                "congestion": final_congestion,
                "vehicle_count": final_vehicle_count,
                "status": status["level"],
                "emoji": status["emoji"],
                "advice": status["advice"],
                **pollution
            })
            
    return results
