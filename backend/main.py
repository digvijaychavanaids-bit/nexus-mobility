import os
import sys
import logging
from contextlib import asynccontextmanager

# Ensure backend directory is in the path for module resolution on Render/HuggingFace
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import time
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from routes import admin, analytics, auth, predictions, analyst
from utils.model_validator import run_startup_validation

LOG_DIR = Path(__file__).resolve().parent.parent / "data" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    filename=str(LOG_DIR / "server.log"),
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_startup_validation()
    yield


app = FastAPI(title="Smart Traffic & Mobility Analytics System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    log_message = f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s"
    logger.info(log_message)

    return response

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(analyst.router, prefix="/api/analyst", tags=["Analyst"])

@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {
        "message": "Welcome to Smart Traffic API",
        "version": "2.0",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "auth": "/api/auth",
            "analytics": "/api/analytics",
            "predictions": "/api/predictions",
            "admin": "/api/admin (Admin only)",
            "analyst": "/api/analyst (Analyst/Admin only)",
        }
    }

@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }
