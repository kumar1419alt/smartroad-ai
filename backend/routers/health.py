"""
health.py — Health check and readiness probe endpoint.
Reports database connectivity and YOLO model status honestly.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from backend.config import settings
from backend.database import get_db
from backend.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health(db: Session = Depends(get_db)):
    """
    Service health check probe.
    Verifies API availability, database connectivity, and YOLO model status.
    """
    # Database check
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    # YOLO model check — import singleton to get live status
    try:
        from backend.services.inference import inference_engine
        yolo_status = "loaded" if inference_engine.is_configured else "not_configured"
    except Exception as exc:
        yolo_status = f"error: {str(exc)}"

    overall_status = "healthy" if db_status == "connected" else "degraded"

    return HealthResponse(
        status=overall_status,
        version=settings.PROJECT_VERSION,
        database=db_status,
        yolo_model=yolo_status,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
