"""
detection.py — AI Vision and Road Damage Detection endpoint.
"""

from fastapi import APIRouter, HTTPException, status
from backend.schemas import DetectionRequest, DetectionResponse
from backend.services.inference import inference_engine

router = APIRouter(prefix="/detection", tags=["AI Vision & Detection"])


@router.post("/infer", response_model=DetectionResponse)
def infer_damage_frame(payload: DetectionRequest):
    """
    Execute AI road damage detection inference on an extracted video frame.

    Accepts base64 JPEG image, session telemetry, and GPS fixes.
    When a trained YOLO model is mounted, returns detected RDD2022 bounding boxes.
    When weights are not configured, explicitly returns model_not_configured with
    an empty detections array without generating synthetic or fabricated predictions.
    """
    try:
        response = inference_engine.infer_frame(
            image_payload=payload.image,
            confidence_threshold=payload.confidence_threshold,
            gps=payload.gps,
        )
        return response
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        ) from val_err
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline execution error: {str(exc)}",
        ) from exc
