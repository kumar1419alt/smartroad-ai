"""
models.py — SQLAlchemy ORM models for SmartRoad AI database.
Designed to be compatible with SQLite in local development and PostgreSQL/PostGIS in production.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime
from sqlalchemy.sql import func
from backend.database import Base


class ComplaintModel(Base):
    """
    Municipal Road Defect Complaint Model.
    Stores citizen and AI-dashcam reported road hazards, geo-coordinates,
    SRPS prioritization metrics, and municipal repair dispatch lifecycle.
    """
    __tablename__ = "complaints"

    # Primary identification
    id = Column(String(64), primary_key=True, index=True)
    incident_id = Column(String(64), unique=True, index=True, nullable=False)

    # Defect classification
    damage_type = Column(String(64), nullable=False)
    severity = Column(String(32), nullable=False, default="medium")  # critical, high, medium, low
    priority = Column(Integer, nullable=False, default=50)            # SRPS score 0–100

    # Geospatial location
    location = Column(String(255), nullable=False)
    ward = Column(String(128), nullable=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)

    # Lifecycle status
    status = Column(String(32), nullable=False, default="Pending")  # Pending, In Progress, Scheduled, Resolved, Deferred

    # Media and AI inference details
    image_url = Column(Text, nullable=True)
    ai_confidence = Column(String(32), nullable=True)
    srps_breakdown = Column(Text, nullable=True)  # JSON-encoded component breakdown

    # Reporting metadata
    description = Column(Text, nullable=True)
    reporting_source = Column(String(64), nullable=False, default="Citizen Portal")
    citizen_name = Column(String(128), nullable=True)
    citizen_phone = Column(String(32), nullable=True)
    upvotes = Column(Integer, default=0)

    # Municipal engineering & repair dispatch
    assigned_engineer = Column(String(128), nullable=True)
    assigned_squad = Column(String(128), nullable=True)
    repair_progress = Column(Integer, default=0)
    estimated_fix = Column(String(64), nullable=True)
    status_note = Column(Text, nullable=True)
    dispatch_note = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<Complaint {self.id} ({self.damage_type} at {self.location}) [{self.status}]>"
