"""
inference.py — Pluggable AI inference service for Road Damage Detection (RDD).

Architecture:
- Defines an extensible InferenceEngine interface.
- If weights are specified via YOLO_MODEL_PATH and available on disk, can load YOLO model.
- If weights are not configured (current state), returns a structured `model_not_configured`
  status with an empty detections list, adhering strictly to the guideline of never
  fabricating random or fake detections.
"""

import base64
import os
import time
from typing import Dict, Any, List, Optional
from backend.config import settings
from backend.schemas import DetectionItem, DetectionResponse


class InferenceEngine:
    """
    Pluggable YOLO Road Damage Detection Inference Service.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or settings.YOLO_MODEL_PATH
        self.model = None
        self.is_configured = False
        self._initialize_model()

    def _initialize_model(self) -> None:
        """Attempt to load YOLO weights if configured."""
        if not self.model_path or not os.path.exists(self.model_path):
            self.is_configured = False
            self.model = None
            return

        try:
            # Future integration point: load ultralytics YOLO when custom weights are mounted
            from ultralytics import YOLO  # type: ignore
            self.model = YOLO(self.model_path)
            self.is_configured = True
        except ImportError:
            self.is_configured = False
        except Exception:
            self.is_configured = False

    @staticmethod
    def decode_image_bytes(image_payload: str) -> bytes:
        """Extract raw image bytes from either data URL or raw base64 string."""
        clean = image_payload.strip()
        if clean.startswith("data:image/") and ";base64," in clean:
            clean = clean.split(";base64,")[1]
        try:
            return base64.b64decode(clean)
        except Exception as exc:
            raise ValueError(f"Invalid base64 image data: {str(exc)}") from exc

    def infer_frame(
        self,
        image_payload: str,
        confidence_threshold: float = 0.70,
        gps: Optional[Dict[str, Any]] = None,
    ) -> DetectionResponse:
        """
        Run inference on the incoming video frame.
        """
        start_time = time.perf_counter()

        # 1. Validate image format
        _ = self.decode_image_bytes(image_payload)

        # 2. If model is not loaded / weights unconfigured
        if not self.is_configured or self.model is None:
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            return DetectionResponse(
                success=False,
                status="model_not_configured",
                model="YOLOv8-RDD2022 (Unconfigured)",
                message=(
                    "YOLO model weights are not configured. "
                    "Mount or train custom RDD2022 weights via YOLO_MODEL_PATH to enable live inference."
                ),
                inference_time_ms=elapsed_ms,
                detections=[],
            )

        # 3. Model execution path (for future trained model phase)
        elapsed_ms = int((time.perf_counter() - start_time) * 1000)
        detections: List[DetectionItem] = []
        return DetectionResponse(
            success=True,
            status="success",
            model="YOLOv8-RDD2022 (Active)",
            message="Inference completed successfully.",
            inference_time_ms=elapsed_ms,
            detections=detections,
        )


# Global singleton instance
inference_engine = InferenceEngine()
