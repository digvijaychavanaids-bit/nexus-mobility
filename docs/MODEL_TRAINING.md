# Model Training Guide

This document explains how to train, validate, and deploy the traffic
congestion prediction model used by the Nexus Mobility API.

---

## Overview

The API uses a **RandomForestRegressor** trained on the `india_aqi_lite.csv`
dataset to predict traffic congestion (5–100 scale) for five major Indian
cities: Delhi, Bengaluru, Mumbai, Chennai, and Hyderabad.

If the model file is unavailable the service automatically falls back to
deterministic rule-based predictions, so **the live service is never
disrupted** by a missing or corrupt model file.

---

## Model Files

| File | Purpose |
|------|---------|
| `data/models/traffic_predictor_lite.pkl` | Primary model (RandomForest) |
| `data/india_aqi_lite.csv` | Training dataset (~145k rows) |

---

## Training Scripts

| Script | Description |
|--------|-------------|
| `backend/ml_model/train_safe.py` | **Recommended** – production-safe, uses relative paths |
| `backend/ml_model/train.py` | Full training pipeline (also production-safe) |
| `backend/scripts/train_model.py` | Legacy script (kept for reference only) |

---

## How to Train (Safe Procedure)

### Prerequisites

```bash
pip install -r requirements.txt
```

### Step 1 – Verify dataset

```bash
python -c "import pandas as pd; df = pd.read_csv('data/india_aqi_lite.csv'); print(df.shape, df.columns.tolist())"
```

Expected output: roughly `(145200, 9)` with columns:
`City Hour Day_Name Temp_2m_C Is_Raining PM2_5_ugm3 PM10_ugm3 CO_ugm3 NO2_ugm3`

### Step 2 – Train the model

```bash
python backend/ml_model/train_safe.py
```

This will:
1. Load `data/india_aqi_lite.csv`
2. Synthesise congestion labels from AQI features
3. Train a `RandomForestRegressor(n_estimators=80, max_depth=12)`
4. Print the R² validation score
5. Save the model to `data/models/traffic_predictor_lite.pkl`

### Step 3 – Validate predictions

```bash
pytest tests/test_model_predictions.py -v
```

All tests should pass. The output includes:
- Feature compatibility with the CSV
- Prediction range checks (5–100)
- Peak-hour vs night-time comparison

---

## Retraining in Production (Render / HuggingFace Spaces)

> **Safety principle**: the live API never crashes if the model file is
> missing — it falls back to deterministic predictions automatically.

Recommended workflow:

1. **Retrain locally** using `backend/ml_model/train_safe.py`
2. **Run the test suite** to verify correctness
3. **Commit `data/models/traffic_predictor_lite.pkl`** to the repository
4. **Push and redeploy** — Render/HuggingFace will pick up the new model

Alternatively, run the training inside a one-off container/job on the
hosting platform using the same script (no path changes required).

---

## Model Architecture

```
RandomForestRegressor
  n_estimators : 80
  max_depth    : 12
  random_state : 42
  features     : [Hour, PM2_5_ugm3, Is_Raining, Temp_2m_C]
  target       : Congestion (synthesised, 5–100 scale)
  train/test   : 80 / 20 split
```

### Feature Engineering

| Feature | Source | Notes |
|---------|--------|-------|
| `Hour` | `india_aqi_lite.csv` | 0–23 |
| `PM2_5_ugm3` | `india_aqi_lite.csv` | μg/m³, median-imputed |
| `Is_Raining` | `india_aqi_lite.csv` | 0 / 1, zero-imputed |
| `Temp_2m_C` | `india_aqi_lite.csv` | °C, median-imputed |

### Target Synthesis

Congestion is synthesised (not directly observed) using:
- Base congestion: 25%
- Peak hours (08-10, 17-20): +35%
- Mid-day (11-16): +15%
- PM2.5 impact: `min(pm2_5 × 0.08, 20)`
- Rain: +15%
- Gaussian noise σ=3 for realism

---

## Expected Performance

| Metric | Typical Value |
|--------|--------------|
| R² (test set) | 0.74 – 0.82 |
| Congestion range | 5 – 100 |
| Training time | ~2–5 min on CPU |
| Model file size | ~25–30 MB |

---

## Startup Validation

On every application startup `backend/utils/model_validator.py` runs
automatically and logs:

- Whether the model file is present
- Whether the dataset features match the expected columns
- Whether test predictions stay within the 5–100 range

Any issues are logged as **warnings** only — the service continues running.
