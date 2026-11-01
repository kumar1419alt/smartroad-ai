"""
inference.py — YOLOv8 Road Damage Detection Inference Service.

Model: YOLOv8m trained on RDD2022 dataset (best.pt, 52 MB)
Architecture: Pluggable InferenceEngine — returns model_not_configured when
              weights are absent, runs real YOLO inference when configured.

RDD2022 Class Mapping (5 YOLO classes → 4 damage codes):
    0: longitudinal crack  → D00
    1: transverse crack    → D10
    2: alligator crack     → D20
    3: other corruption    → IGNORED (filtered out, never returned)
    4: Pothole             → D40

Coordinate contract:
    YOLO outputs normalised floats in [0, 1] (xyxyn).
    Frontend expects percentages in [0, 100].
    Conversion: pct = norm * 100

Severity mapping (confidence → severity):
    >= 0.80  → "critical"
    >= 0.65  → "high"
    >= 0.50  → "medium"
    <  0.50  → "low"
"""

from __future__ import annotations

import base64
import io
import logging
import os
import time
from typing import Any, Dict, List, Optional

from backend.config import settings
from backend.schemas import DetectionItem, DetectionResponse

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# RDD2022 class mapping — class 3 (other corruption) is intentionally None
# (ignored and never returned as a detection result)
# ---------------------------------------------------------------------------
YOLO_CLASS_MAP: Dict[int, Optional[str]] = {
    0: "D00",   # longitudinal crack
    1: "D10",   # transverse crack
    2: "D20",   # alligator crack
    3: None,    # other corruption — IGNORE
    4: "D40",   # Pothole
}

YOLO_CLASS_NAMES: Dict[int, str] = {
    0: "Longitudinal Crack",
    1: "Transverse Crack",
    2: "Alligator Crack",
    3: "Other Corruption",   # never exposed, kept for logging
    4: "Pothole",
}


def _confidence_to_severity(confidence: float) -> str:
    """Map raw confidence score to a human-readable severity label."""
    if confidence >= 0.80:
        return "critical"
    if confidence >= 0.65:
        return "high"
    if confidence >= 0.50:
        return "medium"
    return "low"


class InferenceEngine:
    """
    Pluggable YOLOv8 Road Damage Detection Inference Service.

    Lifecycle:
        - Created once as a module-level singleton.
        - _initialize_model() loads weights on construction.
        - If weights are missing / unreadable, is_configured stays False and
          infer_frame() returns model_not_configured rather than crashing.
        - reload() can hot-swap weights without restarting the server.
    """

    def __init__(self, model_path: Optional[str] = None) -> None:
        self.model_path: str = model_path or settings.YOLO_MODEL_PATH
        self.model = None
        self.is_configured: bool = False
        self._model_label: str = "YOLOv8-RDD2022"
        self._initialize_model()

    # ------------------------------------------------------------------
    # Initialisation
    # ------------------------------------------------------------------

    def _initialize_model(self) -> None:
        """Attempt to load YOLO weights from the configured path."""
        self.model = None
        self.is_configured = False

        if not self.model_path:
            logger.info("YOLO_MODEL_PATH is not set — running without model (demo mode).")
            return

        # Resolve relative paths
        path = self.model_path
        if not os.path.isabs(path):
            if os.path.exists(path):
                path = os.path.abspath(path)
            else:
                repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                candidate_repo = os.path.join(repo_root, path)
                backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                candidate_backend = os.path.join(backend_dir, path)
                if os.path.exists(candidate_repo):
                    path = candidate_repo
                elif os.path.exists(candidate_backend):
                    path = candidate_backend
                else:
                    path = candidate_repo

        if not os.path.exists(path):
            logger.warning(
                "YOLO model weights not found at '%s'. "
                "Running without model (demo mode). "
                "Copy best.pt to backend/weights/ and set YOLO_MODEL_PATH.",
                path,
            )
            return

        try:
            from ultralytics import YOLO  # type: ignore[import]

            logger.info("Loading YOLO model from '%s' …", path)
            self.model = YOLO(path)
            # Verify that the loaded model has the expected class structure
            loaded_nc = len(self.model.names)
            logger.info(
                "YOLO model loaded successfully. Classes (%d): %s",
                loaded_nc,
                self.model.names,
            )
            self.is_configured = True
            self._model_label = f"YOLOv8m-RDD2022 ({loaded_nc} classes)"
        except ImportError:
            logger.error(
                "ultralytics is not installed in this environment. "
                "Run: pip install 'ultralytics>=8.0.0'"
            )
        except Exception as exc:
            logger.exception("Failed to load YOLO model: %s", exc)

    def reload(self, new_path: Optional[str] = None) -> bool:
        """Hot-reload weights. Returns True if model is now configured."""
        if new_path:
            self.model_path = new_path
        self._initialize_model()
        return self.is_configured

    # ------------------------------------------------------------------
    # Image helpers
    # ------------------------------------------------------------------

    @staticmethod
    def decode_image_bytes(image_payload: str) -> bytes:
        """
        Extract raw image bytes from a data URL or raw base64 string.

        Accepts:
            - data:image/jpeg;base64,<b64>
            - data:image/png;base64,<b64>
            - <raw_b64>
        """
        clean = image_payload.strip()
        if clean.startswith("data:image/") and ";base64," in clean:
            clean = clean.split(";base64,")[1]
        try:
            return base64.b64decode(clean)
        except Exception as exc:
            raise ValueError(f"Invalid base64 image data: {exc}") from exc

    @staticmethod
    def _bytes_to_pil(image_bytes: bytes):
        """Convert raw bytes to a PIL Image, raising ValueError on failure."""
        try:
            from PIL import Image  # type: ignore[import]

            img = Image.open(io.BytesIO(image_bytes))
            img.verify()  # detects truncated / corrupt files
            # Re-open after verify (verify() exhausts the stream)
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            return img
        except ImportError:
            raise RuntimeError("Pillow is required for image decoding. Run: pip install Pillow")
        except Exception as exc:
            raise ValueError(f"Cannot decode image: {exc}") from exc

    # ------------------------------------------------------------------
    # Core inference
    # ------------------------------------------------------------------

    def infer_frame(
        self,
        image_payload: str,
        confidence_threshold: float = 0.70,
        gps: Optional[Dict[str, Any]] = None,
    ) -> DetectionResponse:
        """
        Run YOLOv8 inference on a single video frame.

        Args:
            image_payload: Base64-encoded image (data URL or raw b64).
            confidence_threshold: Minimum confidence to accept a detection.
            gps: Optional GPS metadata (not used in inference, passed through).

        Returns:
            DetectionResponse — real detections when the model is loaded,
            model_not_configured when weights are absent.
        """
        start_time = time.perf_counter()

        # Step 1 — Decode and validate image bytes (raises ValueError on bad base64)
        image_bytes = self.decode_image_bytes(image_payload)

        # Step 2 — Return early if model not configured
        if not self.is_configured or self.model is None:
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            return DetectionResponse(
                success=False,
                status="model_not_configured",
                model="YOLOv8-RDD2022 (Unconfigured)",
                message=(
                    "YOLO model weights are not configured. "
                    "Copy best.pt to backend/weights/ and set "
                    "YOLO_MODEL_PATH=backend/weights/best.pt in backend/.env."
                ),
                inference_time_ms=elapsed_ms,
                detections=[],
            )

        # Step 3 — Convert bytes → PIL image (raises ValueError on corrupt image)
        pil_image = self._bytes_to_pil(image_bytes)

        # Step 4 — Run YOLO inference
        try:
            results = self.model.predict(
                source=pil_image,
                conf=confidence_threshold,
                device="cpu",   # CPU-safe default; GPU used automatically if available
                verbose=False,
            )
        except Exception as exc:
            logger.exception("YOLO inference failed: %s", exc)
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            return DetectionResponse(
                success=False,
                status="inference_error",
                model=self._model_label,
                message=f"Inference failed: {exc}",
                inference_time_ms=elapsed_ms,
                detections=[],
            )

        # Step 5 — Parse results
        elapsed_ms = int((time.perf_counter() - start_time) * 1000)
        detections: List[DetectionItem] = []

        if results and len(results) > 0:
            result = results[0]
            boxes = result.boxes

            for box in boxes:
                cls_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())

                # Map YOLO class → RDD2022 code; skip class 3 (other corruption)
                rdd_code = YOLO_CLASS_MAP.get(cls_id)
                if rdd_code is None:
                    logger.debug(
                        "Skipping class %d (other corruption) at conf=%.3f",
                        cls_id,
                        confidence,
                    )
                    continue

                # xyxyn → normalised [0,1] → percentage [0,100] for frontend
                xyxyn = box.xyxyn[0].tolist()  # [x1, y1, x2, y2] normalised
                x1_pct = round(xyxyn[0] * 100, 2)
                y1_pct = round(xyxyn[1] * 100, 2)
                x2_pct = round(xyxyn[2] * 100, 2)
                y2_pct = round(xyxyn[3] * 100, 2)

                # Convert xyxy → xywh (x, y = top-left corner)
                w_pct = round(x2_pct - x1_pct, 2)
                h_pct = round(y2_pct - y1_pct, 2)

                detections.append(
                    DetectionItem(
                        class_id=cls_id,
                        class_name=YOLO_CLASS_NAMES.get(cls_id, f"Class_{cls_id}"),
                        damage_code=rdd_code,
                        confidence=round(confidence, 4),
                        box={
                            "x": x1_pct,
                            "y": y1_pct,
                            "w": w_pct,
                            "h": h_pct,
                        },
                        severity=_confidence_to_severity(confidence),
                    )
                )

        logger.info(
            "Inference complete: %d detection(s) in %d ms (threshold=%.2f)",
            len(detections),
            elapsed_ms,
            confidence_threshold,
        )

        return DetectionResponse(
            success=True,
            status="success",
            model=self._model_label,
            message=f"Inference completed. {len(detections)} damage(s) detected.",
            inference_time_ms=elapsed_ms,
            detections=detections,
        )


# ---------------------------------------------------------------------------
# Module-level singleton — created once at import time
# ---------------------------------------------------------------------------
inference_engine = InferenceEngine()
