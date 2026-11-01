"""
smoke_inference.py — Standalone smoke test for the YOLO inference engine.

Run from the project root (road-damage-system/):
    python backend/scripts/smoke_inference.py

Does NOT require the FastAPI server or database. Tests the InferenceEngine
directly against a real road damage image from the SmartRoadAI model_test dir.

Exit code 0 = pass, 1 = fail.
"""
import base64
import os
import sys
from pathlib import Path

# Resolve project root and add to path
project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

# Point at the real weights
os.environ.setdefault("YOLO_MODEL_PATH", "backend/weights/best.pt")
os.environ.setdefault("DATABASE_URL", "sqlite:///./smartroad.db")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")

from backend.services.inference import InferenceEngine, YOLO_CLASS_MAP, YOLO_CLASS_NAMES

BRIGHT_GREEN = "\033[92m"
BRIGHT_RED = "\033[91m"
RESET = "\033[0m"
YELLOW = "\033[93m"

def ok(msg: str) -> None:
    print(f"  [PASS] {msg}")

def fail(msg: str) -> None:
    print(f"  [FAIL] {msg}")
    sys.exit(1)

def info(msg: str) -> None:
    print(f"  [INFO] {msg}")


def main():
    print("=" * 60)
    print("SmartRoad AI — YOLO Inference Smoke Test")
    print("=" * 60)

    # 1. Load engine
    info("Initialising InferenceEngine …")
    engine = InferenceEngine()

    if not engine.is_configured:
        fail(
            "Model is NOT configured. "
            "Check that backend/weights/best.pt exists and YOLO_MODEL_PATH is set correctly."
        )

    ok(f"Model loaded: {engine._model_label}")

    # 2. Print class map
    print("\nClass mapping:")
    for cls_id, rdd_code in YOLO_CLASS_MAP.items():
        action = rdd_code if rdd_code else "IGNORED"
        print(f"    {cls_id}: {YOLO_CLASS_NAMES.get(cls_id, '?'):<22} → {action}")

    # 3. Load a test image (use SmartRoadAI test image if available, else synthetic)
    test_img_candidates = [
        r"C:\Users\Ankush kumar\Downloads\SmartRoadAI\model_test\test_road.jpg",
        r"C:\Users\Ankush kumar\Downloads\SmartRoadAI\model_test\p0h6xdy6.jpg",
    ]

    image_b64 = None
    used_path = None
    for candidate in test_img_candidates:
        if os.path.exists(candidate):
            with open(candidate, "rb") as f:
                raw = f.read()
            image_b64 = f"data:image/jpeg;base64,{base64.b64encode(raw).decode()}"
            used_path = candidate
            break

    if image_b64 is None:
        # Fallback: minimal synthetic 1×1 white JPEG
        info("No test image found — using minimal synthetic JPEG (expect 0 detections).")
        image_b64 = (
            "data:image/jpeg;base64,"
            "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoH"
            "BwYIDAoMCwsKCwsNCxAQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCAAB"
            "AAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD"
            "/2gAIAQEAAT8AVAD/2Q=="
        )
    else:
        info(f"Using test image: {used_path}")

    # 4. Run inference at two thresholds
    for conf in (0.25, 0.50, 0.70):
        print(f"\n--- Inference at conf={conf:.2f} ---")
        result = engine.infer_frame(image_b64, confidence_threshold=conf)
        print(f"  status           : {result.status}")
        print(f"  success          : {result.success}")
        print(f"  inference_time   : {result.inference_time_ms} ms")
        print(f"  detections found : {len(result.detections)}")
        for det in result.detections:
            print(
                f"    [{det.damage_code}] {det.class_name:<22} "
                f"conf={det.confidence:.3f}  severity={det.severity}  "
                f"box=(x={det.box.x:.1f}%, y={det.box.y:.1f}%, "
                f"w={det.box.w:.1f}%, h={det.box.h:.1f}%)"
            )
        if result.status != "success":
            fail(f"Expected status='success', got '{result.status}': {result.message}")
        ok(f"conf={conf:.2f}: {len(result.detections)} detection(s)")

    # 5. Verify class-3 filtering
    print("\n--- Verify class-3 (other corruption) is never returned ---")
    result_all = engine.infer_frame(image_b64, confidence_threshold=0.01)
    class_ids_returned = [d.class_id for d in result_all.detections]
    if 3 in class_ids_returned:
        fail("Class 3 (other corruption) appeared in detections — must be filtered!")
    ok("Class 3 correctly suppressed in all detections")

    # 6. Invalid image rejection
    print("\n--- Invalid image rejection ---")
    try:
        engine.infer_frame("not-valid-base64!!!!", confidence_threshold=0.70)
        fail("Expected ValueError on invalid base64")
    except ValueError:
        ok("Invalid base64 correctly raised ValueError (HTTP 400 contract)")

    print("\n" + "=" * 60)
    print(f"{BRIGHT_GREEN}All smoke tests passed!{RESET}")
    print("=" * 60)


if __name__ == "__main__":
    main()

