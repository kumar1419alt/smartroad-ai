"""
test_complaints.py — Tests for complaint CRUD and admin endpoints.

Coverage:
  - POST /api/v1/complaints
  - GET  /api/v1/complaints
  - GET  /api/v1/complaints/{id}
  - GET  /api/v1/admin/complaints
  - PUT  /api/v1/admin/complaints/{id}/status
  - PUT  /api/v1/admin/complaints/{id}/assign
"""

import pytest

# Constants are defined here directly to avoid sys.path conflicts with
# any installed 'tests' package on the system Python.
VALID_COMPLAINT = {
    "damageType": "Pothole",
    "location": "Kothrud, Pune",
    "ward": "Kothrud Ward",
    "coordinates": [18.5074, 73.8077],
    "severity": "high",
    "priorityScore": 78,
    "description": "Large pothole near school entrance.",
    "reportingSource": "Citizen Portal",
}


# ── Helpers ─────────────────────────────────────────────────────────────────────

def create_complaint(client, overrides=None):
    """POST a valid complaint and return the response JSON."""
    payload = {**VALID_COMPLAINT, **(overrides or {})}
    response = client.post("/api/v1/complaints", json=payload)
    return response


# ── POST /api/v1/complaints ─────────────────────────────────────────────────────

class TestCreateComplaint:

    def test_valid_payload_returns_201(self, client):
        response = create_complaint(client)
        assert response.status_code == 201, response.text

    def test_response_has_camelcase_fields(self, client):
        data = create_complaint(client).json()
        assert "incidentId" in data
        assert "damageType" in data
        assert "priorityScore" in data
        assert "reportingSource" in data

    def test_response_coordinates_is_list(self, client):
        data = create_complaint(client).json()
        assert isinstance(data["coordinates"], list)
        assert len(data["coordinates"]) == 2

    def test_response_status_defaults_to_pending(self, client):
        data = create_complaint(client).json()
        assert data["status"] == "Pending"

    def test_response_id_is_set(self, client):
        data = create_complaint(client).json()
        assert data["id"]
        assert data["incidentId"]

    def test_priority_score_matches_input(self, client):
        data = create_complaint(client).json()
        assert data["priorityScore"] == VALID_COMPLAINT["priorityScore"]
        assert data["priority"] == VALID_COMPLAINT["priorityScore"]

    def test_missing_location_returns_422(self, client):
        payload = {**VALID_COMPLAINT}
        del payload["location"]
        response = client.post("/api/v1/complaints", json=payload)
        assert response.status_code == 422

    def test_missing_damage_type_returns_422(self, client):
        payload = {**VALID_COMPLAINT}
        del payload["damageType"]
        response = client.post("/api/v1/complaints", json=payload)
        assert response.status_code == 422

    def test_invalid_severity_returns_422(self, client):
        response = create_complaint(client, {"severity": "extreme"})
        assert response.status_code == 422

    def test_invalid_latitude_out_of_range(self, client):
        response = create_complaint(client, {"coordinates": [200.0, 73.8]})
        assert response.status_code == 422

    def test_invalid_longitude_out_of_range(self, client):
        response = create_complaint(client, {"coordinates": [18.5, 500.0]})
        assert response.status_code == 422

    def test_duplicate_incident_id_returns_409(self, client):
        # First creation
        first = create_complaint(client, {"incidentId": "INC-DUPE-00001"})
        assert first.status_code == 201
        # Second with same incidentId
        second = create_complaint(client, {"incidentId": "INC-DUPE-00001"})
        assert second.status_code == 409

    def test_all_valid_severities_accepted(self, client):
        for sev in ("critical", "high", "medium", "low"):
            response = create_complaint(client, {"severity": sev, "location": f"Test Location {sev}"})
            assert response.status_code == 201, f"Failed for severity={sev}: {response.text}"

    def test_snake_case_fields_also_accepted(self, client):
        """Backend must accept snake_case fields too (populate_by_name=True)."""
        payload = {
            "damage_type": "Crack",
            "location": "Shivajinagar, Pune",
            "coordinates": [18.53, 73.85],
            "severity": "low",
        }
        response = client.post("/api/v1/complaints", json=payload)
        assert response.status_code == 201


# ── GET /api/v1/complaints ──────────────────────────────────────────────────────

class TestListComplaints:

    def test_empty_list_returns_200(self, client):
        response = client.get("/api/v1/complaints")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_created_complaint_appears_in_list(self, client):
        create_complaint(client)
        data = client.get("/api/v1/complaints").json()
        assert len(data) >= 1

    def test_filter_by_severity(self, client):
        create_complaint(client, {"severity": "critical"})
        create_complaint(client, {"severity": "low", "location": "Other Area"})
        data = client.get("/api/v1/complaints?severity=critical").json()
        assert all(c["severity"] == "critical" for c in data)

    def test_pagination_limit(self, client):
        for i in range(5):
            create_complaint(client, {"location": f"Area {i}"})
        data = client.get("/api/v1/complaints?limit=2").json()
        assert len(data) <= 2

    def test_complaints_ordered_by_priority_desc(self, client):
        create_complaint(client, {"priorityScore": 10, "location": "Low Prio"})
        create_complaint(client, {"priorityScore": 90, "location": "High Prio"})
        data = client.get("/api/v1/complaints").json()
        scores = [c["priority"] for c in data]
        assert scores == sorted(scores, reverse=True)


# ── GET /api/v1/complaints/{id} ─────────────────────────────────────────────────

class TestGetComplaint:

    def test_get_existing_by_id(self, client):
        created = create_complaint(client).json()
        response = client.get(f"/api/v1/complaints/{created['id']}")
        assert response.status_code == 200
        assert response.json()["id"] == created["id"]

    def test_get_by_incident_id(self, client):
        created = create_complaint(client, {"incidentId": "INC-TEST-99999"}).json()
        response = client.get("/api/v1/complaints/INC-TEST-99999")
        assert response.status_code == 200
        assert response.json()["incidentId"] == "INC-TEST-99999"

    def test_nonexistent_id_returns_404(self, client):
        response = client.get("/api/v1/complaints/PMC-9999-9999")
        assert response.status_code == 404


# ── GET /api/v1/admin/complaints ───────────────────────────────────────────────

class TestAdminListComplaints:

    def test_admin_list_returns_200(self, client):
        response = client.get("/api/v1/admin/complaints")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_admin_list_includes_created_complaints(self, client):
        create_complaint(client)
        data = client.get("/api/v1/admin/complaints").json()
        assert len(data) >= 1

    def test_admin_search_by_location(self, client):
        create_complaint(client, {"location": "Unique Location XYZ"})
        data = client.get("/api/v1/admin/complaints?search=Unique+Location+XYZ").json()
        assert len(data) >= 1
        assert any("Unique Location XYZ" in c["location"] for c in data)


# ── PUT /api/v1/admin/complaints/{id}/status ──────────────────────────────────

class TestUpdateStatus:

    def test_update_status_to_in_progress(self, client):
        created = create_complaint(client).json()
        response = client.put(
            f"/api/v1/admin/complaints/{created['id']}/status",
            json={"status": "In Progress"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "In Progress"

    def test_update_status_to_resolved(self, client):
        created = create_complaint(client).json()
        response = client.put(
            f"/api/v1/admin/complaints/{created['id']}/status",
            json={"status": "Resolved", "note": "Repair completed."},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "Resolved"

    def test_status_note_is_persisted(self, client):
        created = create_complaint(client).json()
        client.put(
            f"/api/v1/admin/complaints/{created['id']}/status",
            json={"status": "Deferred", "note": "Budget constraints."},
        )
        data = client.get(f"/api/v1/complaints/{created['id']}").json()
        assert data["statusNote"] == "Budget constraints."

    def test_invalid_status_returns_422(self, client):
        created = create_complaint(client).json()
        response = client.put(
            f"/api/v1/admin/complaints/{created['id']}/status",
            json={"status": "Destroyed"},
        )
        assert response.status_code == 422

    def test_update_status_nonexistent_returns_404(self, client):
        response = client.put(
            "/api/v1/admin/complaints/PMC-XXXX-0000/status",
            json={"status": "Resolved"},
        )
        assert response.status_code == 404

    def test_all_valid_statuses_accepted(self, client):
        for st in ("Pending", "In Progress", "Scheduled", "Resolved", "Completed", "Deferred"):
            created = create_complaint(client).json()
            response = client.put(
                f"/api/v1/admin/complaints/{created['id']}/status",
                json={"status": st},
            )
            assert response.status_code == 200, f"Failed for status={st}: {response.text}"


# ── PUT /api/v1/admin/complaints/{id}/assign ──────────────────────────────────

class TestAssignEngineer:

    def test_assign_squad_and_engineer(self, client):
        created = create_complaint(client).json()
        response = client.put(
            f"/api/v1/admin/complaints/{created['id']}/assign",
            json={
                "assignedSquad": "Squad Alpha",
                "assignedEngineer": "Eng. Sharma",
                "targetDate": "2024-02-15",
                "note": "Dispatched for immediate repair.",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["assignedSquad"] == "Squad Alpha"
        assert data["assignedEngineer"] == "Eng. Sharma"

    def test_assigning_pending_complaint_sets_in_progress(self, client):
        """Assigning a Pending complaint should auto-transition to In Progress."""
        created = create_complaint(client).json()
        assert created["status"] == "Pending"
        response = client.put(
            f"/api/v1/admin/complaints/{created['id']}/assign",
            json={"assignedSquad": "Squad Beta"},
        )
        assert response.json()["status"] == "In Progress"

    def test_dispatch_note_persisted(self, client):
        created = create_complaint(client).json()
        client.put(
            f"/api/v1/admin/complaints/{created['id']}/assign",
            json={"assignedSquad": "Squad Gamma", "note": "Rush job."},
        )
        data = client.get(f"/api/v1/complaints/{created['id']}").json()
        assert data["dispatchNote"] == "Rush job."

    def test_assign_nonexistent_complaint_returns_404(self, client):
        response = client.put(
            "/api/v1/admin/complaints/PMC-XXXX-0000/assign",
            json={"assignedSquad": "Squad Delta"},
        )
        assert response.status_code == 404
