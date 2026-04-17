import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from .ml import predict_traffic
from utils.locations import canonicalize_location
from utils.parsers import _parse_time, _parse_date, _hour_to_ampm, _friendly_date_label, _traffic_status, _predict_pollution_metrics

def calculate_bias_factors(historical_df: pd.DataFrame) -> Dict[str, float]:
    """
    Calculates bias factors based on historical data.
    Key is formatted as 'city|location|weekday|hour'
    Value is the ratio: actual_vehicle_count / predicted_vehicle_count
    """
    bias_map = {}
    grouped_data = {}
    general_hour_data = {}

    for _, row in historical_df.iterrows():
        try:
            city = str(row.get('city', 'Delhi')).strip()
            location = canonicalize_location(city, str(row.get('location', 'Main')))
            time_raw = str(row.get('time', '12 PM'))
            
            hour = _parse_time(time_raw)
            date = _parse_date(str(row.get('date', '')))
            
            if hour is None or date is None:
                continue
                
            actual_vehicles = row.get('vehicle_count')
            if actual_vehicles is None or pd.isna(actual_vehicles):
                continue
            
            weekday = date.weekday()
                
            # Get model's baseline prediction
            baseline = predict_traffic(
                hour=hour,
                city=city,
                location=location,
                day_of_week=weekday,
                month=date.month,
                weather=str(row.get('weather', 'clear'))
            )
            
            pred_vehicles = max(baseline['vehicle_count'], 1)
            bias = actual_vehicles / pred_vehicles
            
            # 1. Weekday-specific key
            key = f"{city.lower()}|{location.lower()}|{weekday}|{hour}"
            if key not in grouped_data:
                grouped_data[key] = []
            grouped_data[key].append(bias)
            
            # 2. General hour key (fallback)
            gen_key = f"{city.lower()}|{location.lower()}|general|{hour}"
            if gen_key not in general_hour_data:
                general_hour_data[gen_key] = []
            general_hour_data[gen_key].append(bias)
            
        except Exception:
            continue
            
    # Average bias per weekday-specific key
    for key, biases in grouped_data.items():
        bias_map[key] = sum(biases) / len(biases)
        
    # Average bias for general fallback
    for key, biases in general_hour_data.items():
        bias_map[key] = sum(biases) / len(biases)
        
    return bias_map

def generate_forecast(
    historical_df: pd.DataFrame, 
    forecast_days: int = 7
) -> List[Dict[str, Any]]:
    """
    Generates a forecast for the next N days based on unique locations and patterns in the history.
    Strictly chronological sequence (Date -> Hour).
    """
    bias_map = calculate_bias_factors(historical_df)
    
    # Identify unique segments (City, Location, Hour) found in history
    # We want to forecast for all locations/hours seen in the past
    loc_segments = []
    seen_locs = set()
    
    for _, row in historical_df.iterrows():
        city = str(row.get('city', 'Delhi')).strip()
        location = str(row.get('location', 'Main'))
        hour = _parse_time(str(row.get('time', '12 PM')))
        
        if hour is None: continue
        
        seg_key = f"{city}|{location}|{hour}"
        if seg_key not in seen_locs:
            loc_segments.append({"city": city, "location": location, "hour": hour})
            seen_locs.add(seg_key)
            
    if not loc_segments:
        return []
        
    # Generate future timestamps
    # Start forecasting from "Tomorrow"
    start_date = (datetime.now() + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    results = []
    
    for d in range(forecast_days):
        current_date = start_date + timedelta(days=d)
        day_of_week = current_date.weekday()
        month = current_date.month
        
        # Gather all hours for this day
        for seg in loc_segments:
            city = seg["city"]
            location = canonicalize_location(city, seg["location"])
            hour = seg["hour"]
            
            # Base prediction from global model
            pred = predict_traffic(
                hour=hour,
                city=city,
                location=location,
                day_of_week=day_of_week,
                month=month,
                weather="clear"
            )
            
            # Pattern matching: Try specific DayOfWeek-Hour bias first
            bias_key = f"{city.lower()}|{location.lower()}|{day_of_week}|{hour}"
            bias = bias_map.get(bias_key)
            
            # Fallback to General-Hour bias if specific weekday wasn't in history
            if bias is None:
                bias_key = f"{city.lower()}|{location.lower()}|general|{hour}"
                bias = bias_map.get(bias_key, 1.0)
            
            # Safety clamp for bias
            bias = min(max(bias, 0.4), 2.5)
            
            final_vehicle_count = int(pred["vehicle_count"] * bias)
            # Factor in bias to congestion (weighted)
            final_congestion = round(min(max(pred["congestion"] * (0.7 + 0.3 * bias), 5.0), 100.0), 1)
            
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
            
    # Strict chronological sort (Date, then Hour)
    results.sort(key=lambda x: (x['date'], x['hour']))
    
    return results
