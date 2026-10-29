"""
schemas.py — Pydantic request and response schemas for SmartRoad AI.
Supports both camelCase and snake_case for seamless compatibility with React frontend.
"""

from datetime import datetime, timezone
from typing import List, Optional, Any, Dict, Union
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict


# ── Valid Enums ────────────────────────────────────────────────────────────────
VALID_SEVERITIES = {"critical", "high", "medium", "low"}
VALID_STATUSES = {
    "Pending",
    "In Progress",
    "Scheduled",
    "Resolved",
    "Completed",
    "Deferred",
}


# ── Complaint Schemas ──────────────────────────────────────────────────────────

class ComplaintCreate(BaseModel):
    """
    Schema for creating a new complaint.
    Accepts both array `coordinates: [lat, lng]` or separate `latitude` and `longitude`.
    """
    damage_type: str = Field(..., alias="damageType", min_length=2)
    location: str = Field(..., min_length=2)
    ward: Optional[str] = None

    # Flexible coordinates input
    coordinates: Optional[List[float]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    severity: str = "medium"
    priority: Optional[int] = Field(None, alias="priorityScore")
    description: Optional[str] = None
    image_url: Optional[str] = Field(None, alias="imageUrl")
    ai_confidence: Optional[str] = Field(None, alias="aiConfidence")
    incident_id: Optional[str] = Field(None, alias="incidentId")
    reporting_source: Optional[str] = Field("Citizen Portal", alias="reportingSource")
    citizen_name: Optional[str] = Field(None, alias="citizenName")
    citizen_phone: Optional[str] = Field(None, alias="citizenPhone")
    srps_breakdown: Optional[Union[Dict[str, Any], str]] = Field(None, alias="srpsBreakdown")

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    @model_validator(mode="before")
    @classmethod
    def resolve_coordinates(cls, values: Any) -> Any:
        if isinstance(values, dict):
            coords = values.get("coordinates")
            if coords and isinstance(coords, (list, tuple)) and len(coords) >= 2:
                if values.get("latitude") is None:
                    values["latitude"] = float(coords[0])
                if values.get("longitude") is None:
                    values["longitude"] = float(coords[1])
            # If priorityScore is present but not priority
            if "priorityScore" in values and "priority" not in values:
                values["priority"] = values["priorityScore"]
        return values

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: Optional[float]) -> float:
        if v is None:
            raise ValueError("Latitude is required.")
        if not (-90.0 <= v <= 90.0):
            raise ValueError("Latitude must be between -90.0 and 90.0 degrees.")
        return round(v, 6)

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: Optional[float]) -> float:
        if v is None:
            raise ValueError("Longitude is required.")
        if not (-180.0 <= v <= 180.0):
            raise ValueError("Longitude must be between -180.0 and 180.0 degrees.")
        return round(v, 6)

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        clean = (v or "").strip().lower()
        if clean not in VALID_SEVERITIES:
            raise ValueError(f"Severity must be one of {sorted(VALID_SEVERITIES)} (got: '{v}')")
        return clean

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[int]) -> int:
        if v is None:
            return 50
        if not (0 <= v <= 100):
            raise ValueError("Priority score must be between 0 and 100.")
        return v


class ComplaintResponse(BaseModel):
    """
    Standard complaint representation matching the React frontend's data model.
    Exposes both camelCase and snake_case fields.
    """
    id: str
    incidentId: str
    damageType: str
    location: str
    ward: Optional[str] = None
    coordinates: List[float]
    latitude: float
    longitude: float
    severity: str
    priority: int
    priorityScore: int
    status: str
    date: str
    timestamp: str
    imageUrl: Optional[str] = None
    aiConfidence: Optional[str] = None
    description: Optional[str] = None
    reportingSource: str
    citizenName: Optional[str] = None
    citizenPhone: Optional[str] = None
    upvotes: int = 0
    assignedEngineer: Optional[str] = None
    assignedSquad: Optional[str] = None
    repairProgress: int = 0
    estimatedFix: Optional[str] = None
    statusNote: Optional[str] = None
    dispatchNote: Optional[str] = None
    srpsBreakdown: Optional[Any] = None
    createdAt: str
    updatedAt: str

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @classmethod
    def from_orm_model(cls, model: Any) -> "ComplaintResponse":
        """Convert SQLAlchemy ComplaintModel to ComplaintResponse."""
        import json

        created = model.created_at or datetime.now(timezone.utc)
        updated = model.updated_at or created

        # Parse srps_breakdown if stored as JSON string
        breakdown = None
        if model.srps_breakdown:
            try:
                breakdown = json.loads(model.srps_breakdown)
            except Exception:
                breakdown = model.srps_breakdown

        date_str = created.strftime("%d %b %Y")
        iso_str = created.isoformat()

        return cls(
            id=model.id,
            incidentId=model.incident_id,
            damageType=model.damage_type,
            location=model.location,
            ward=model.ward,
            coordinates=[model.latitude, model.longitude],
            latitude=model.latitude,
            longitude=model.longitude,
            severity=model.severity,
            priority=model.priority,
            priorityScore=model.priority,
            status=model.status,
            date=date_str,
            timestamp=iso_str,
            imageUrl=model.image_url,
            aiConfidence=model.ai_confidence,
            description=model.description,
            reportingSource=model.reporting_source,
            citizenName=model.citizen_name,
            citizenPhone=model.citizen_phone,
            upvotes=model.upvotes or 0,
            assignedEngineer=model.assigned_engineer,
            assignedSquad=model.assigned_squad,
            repairProgress=model.repair_progress or 0,
            estimatedFix=model.estimated_fix,
            statusNote=model.status_note,
            dispatchNote=model.dispatch_note,
            srpsBreakdown=breakdown,
            createdAt=created.isoformat(),
            updatedAt=updated.isoformat(),
        )


class ComplaintStatusUpdate(BaseModel):
    """Schema for updating complaint status."""
    status: str
    note: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        clean = v.strip()
        # Normalize casing
        matched = next((s for s in VALID_STATUSES if s.lower() == clean.lower()), None)
        if not matched:
            raise ValueError(f"Status must be one of {sorted(VALID_STATUSES)} (got: '{v}')")
        return matched


class ComplaintAssignUpdate(BaseModel):
    """Schema for assigning engineer / squad to a complaint."""
    assigned_squad: Optional[str] = Field(None, alias="assignedSquad")
    assigned_engineer: Optional[str] = Field(None, alias="assignedEngineer")
    target_date: Optional[str] = Field(None, alias="targetDate")
    note: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, extra="ignore")


# ── AI Detection Schemas ───────────────────────────────────────────────────────

class DetectionBox(BaseModel):
    x: float = Field(..., ge=0.0, le=100.0)
    y: float = Field(..., ge=0.0, le=100.0)
    w: float = Field(..., gt=0.0, le=100.0)
    h: float = Field(..., gt=0.0, le=100.0)


class DetectionItem(BaseModel):
    class_id: str
    class_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    box: DetectionBox
    severity: str


class DetectionRequest(BaseModel):
    """
    Payload sent by useDashcam / detectionService.js:
    { session_id, timestamp, image, gps, confidence_threshold }
    """
    session_id: str = Field(..., min_length=1)
    timestamp: Optional[str] = None
    image: str = Field(..., min_length=10)  # Base64 string or data URL
    gps: Optional[Dict[str, Any]] = None
    confidence_threshold: float = Field(0.70, ge=0.0, le=1.0)

    model_config = ConfigDict(extra="ignore")

    @field_validator("image")
    @classmethod
    def validate_image_payload(cls, v: str) -> str:
        # Validate that image is either a data URL or valid base64 payload
        v_clean = v.strip()
        if v_clean.startswith("data:image/"):
            if ";base64," not in v_clean:
                raise ValueError("Data URL image must be base64-encoded.")
        elif len(v_clean) < 16:
            raise ValueError("Image base64 data too short to be a valid frame.")
        return v_clean


class DetectionResponse(BaseModel):
    success: bool
    status: str
    model: str
    message: str
    inference_time_ms: int = 0
    detections: List[DetectionItem] = []


# ── Health Schema ──────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    database: str
    environment: str
    timestamp: str
