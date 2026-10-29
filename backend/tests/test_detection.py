"""
test_detection.py — Tests for POST /api/v1/detection/infer
"""

# Inline VALID_INFER constant to avoid sys.path collisions with
# any installed 'tests' package on the system Python.
VALID_INFER = {
    "session_id": "test-session-001",
    "timestamp": "2024-01-01T10:00:00Z",
    # Minimal 1×1 white JPEG as base64
    "image": (
        "data:image/jpeg;base64,"
        "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoH"
        "BwYIDAoMCwsKCwsNCxAQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCAAB"
        "AAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD"
        "/2gAIAQEAAT8AVAD/2Q=="
    ),
    "gps": {"lat": 18.5074, "lng": 73.8077, "accuracy": 10.0},
    "confidence_threshold": 0.70,
}


# ── Valid inference request with no model configured ────────────────────────────

class TestInferNoModel:

    def test_infer_returns_200(self, client):
        response = client.post("/api/v1/detection/infer", json=VALID_INFER)
        assert response.status_code == 200, response.text

    def test_infer_status_model_not_configured(self, client):
        data = client.post("/api/v1/detection/infer", json=VALID_INFER).json()
        assert data["status"] == "model_not_configured"

    def test_infer_detections_empty(self, client):
        """Must never return fabricated detections."""
        data = client.post("/api/v1/detection/infer", json=VALID_INFER).json()
        assert data["detections"] == []

    def test_infer_success_is_false_without_model(self, client):
        data = client.post("/api/v1/detection/infer", json=VALID_INFER).json()
        assert data["success"] is False

    def test_infer_response_has_required_fields(self, client):
        data = client.post("/api/v1/detection/infer", json=VALID_INFER).json()
        assert "status" in data
        assert "model" in data
        assert "message" in data
        assert "inference_time_ms" in data
        assert "detections" in data

    def test_infer_message_explains_no_model(self, client):
        data = client.post("/api/v1/detection/infer", json=VALID_INFER).json()
        assert "YOLO" in data["message"] or "model" in data["message"].lower()


# ── Invalid / missing request fields ────────────────────────────────────────────

class TestInferValidation:

    def test_missing_session_id_returns_422(self, client):
        payload = {**VALID_INFER}
        del payload["session_id"]
        response = client.post("/api/v1/detection/infer", json=payload)
        assert response.status_code == 422

    def test_missing_image_returns_422(self, client):
        payload = {**VALID_INFER}
        del payload["image"]
        response = client.post("/api/v1/detection/infer", json=payload)
        assert response.status_code == 422

    def test_empty_image_string_returns_422(self, client):
        payload = {**VALID_INFER, "image": ""}
        response = client.post("/api/v1/detection/infer", json=payload)
        assert response.status_code == 422

    def test_too_short_image_returns_422(self, client):
        payload = {**VALID_INFER, "image": "abc"}
        response = client.post("/api/v1/detection/infer", json=payload)
        assert response.status_code == 422

    def test_invalid_base64_returns_400(self, client):
        """Malformed base64 that passes length check but fails decoding."""
        payload = {**VALID_INFER, "image": "not-valid-base64!!!!!!!!!!!!!!!!!!!!!!"}
        response = client.post("/api/v1/detection/infer", json=payload)
        # Either 400 (ValueError from decode) or 422 (pydantic) is acceptable
        assert response.status_code in (400, 422)

    def test_data_url_without_base64_marker_returns_422(self, client):
        payload = {**VALID_INFER, "image": "data:image/jpeg;url,something_not_base64"}
        response = client.post("/api/v1/detection/infer", json=payload)
        assert response.status_code == 422

    def test_confidence_threshold_out_of_range_returns_422(self, client):
        payload = {**VALID_INFER, "confidence_threshold": 1.5}
        response = client.post("/api/v1/detection/infer", json=payload)
        assert response.status_code == 422

    def test_raw_base64_without_data_url_prefix_accepted(self, client):
        """Raw base64 (no data: prefix) should also be accepted by the validator."""
        import base64
        # Minimal valid base64 of sufficient length
        raw_b64 = base64.b64encode(b"\xff\xd8\xff" + b"\x00" * 50).decode()
        payload = {**VALID_INFER, "image": raw_b64}
        response = client.post("/api/v1/detection/infer", json=payload)
        assert response.status_code == 200
