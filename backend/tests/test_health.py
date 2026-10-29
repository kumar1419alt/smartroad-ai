"""
test_health.py — Tests for GET /api/v1/health
"""


def test_health_endpoint_returns_200(client):
    """Health endpoint must respond with HTTP 200."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200, response.text


def test_health_status_is_healthy(client):
    """Health response must report status: healthy."""
    data = client.get("/api/v1/health").json()
    assert data["status"] == "healthy"


def test_health_database_connected(client):
    """Health response must confirm database connectivity."""
    data = client.get("/api/v1/health").json()
    assert data["database"] == "connected"


def test_health_response_has_required_fields(client):
    """Health response must include version, environment, and timestamp."""
    data = client.get("/api/v1/health").json()
    assert "version" in data
    assert "environment" in data
    assert "timestamp" in data
    assert data["version"]  # non-empty


def test_root_endpoint(client):
    """Root GET / should return API info with docs link."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "docs" in data
    assert data["docs"] == "/docs"

