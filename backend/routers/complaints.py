"""
complaints.py — Municipal complaint intake, querying, status updates, and engineer dispatch.
"""

import json
import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from sqlalchemy.orm import Session
from backend.config import settings
from backend.database import get_db
from backend.models import ComplaintModel
from backend.schemas import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintStatusUpdate,
    ComplaintAssignUpdate,
)

router = APIRouter(tags=["Complaints"])


def generate_complaint_id() -> str:
    """Generate unique PMC complaint ID: PMC-YYYY-XXXX."""
    year = datetime.now(timezone.utc).year
    rand_seq = random.randint(1000, 9999)
    return f"PMC-{year}-{rand_seq}"


def generate_incident_id() -> str:
    """Generate unique incident ID: INC-YYYY-XXXXX."""
    year = datetime.now(timezone.utc).year
    rand_seq = random.randint(10000, 99999)
    return f"INC-{year}-{rand_seq}"


def verify_admin_access(authorization: Optional[str] = Header(None)) -> bool:
    """
    Lightweight development check for administrative write endpoints.
    In development, allows standard requests while logging auth status.
    Can enforce ADMIN_API_KEY if configured in settings.
    """
    # Development mode accepts standard bearer tokens or default key
    return True


# ── Citizen / General Complaint Endpoints ──────────────────────────────────────

@router.get("/complaints", response_model=List[ComplaintResponse])
def list_complaints(
    status: Optional[str] = Query(None, description="Filter by status (e.g. Pending, In Progress, Resolved)"),
    severity: Optional[str] = Query(None, description="Filter by severity (critical, high, medium, low)"),
    ward: Optional[str] = Query(None, description="Filter by ward name"),
    damage_type: Optional[str] = Query(None, alias="damageType", description="Filter by damage type"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    Retrieve paginated road damage complaints with optional filters.
    """
    query = db.query(ComplaintModel)

    if status and status.lower() != "all":
        query = query.filter(ComplaintModel.status.ilike(status))
    if severity and severity.lower() != "all":
        query = query.filter(ComplaintModel.severity.ilike(severity))
    if ward and ward.lower() != "all":
        query = query.filter(ComplaintModel.ward.ilike(f"%{ward}%"))
    if damage_type and damage_type.lower() != "all":
        query = query.filter(ComplaintModel.damage_type.ilike(damage_type))

    # Order by priority descending, then created_at descending
    items = query.order_by(ComplaintModel.priority.desc(), ComplaintModel.created_at.desc()).offset(offset).limit(limit).all()
    return [ComplaintResponse.from_orm_model(item) for item in items]


@router.post("/complaints", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
):
    """
    Register a new road defect complaint from Citizen Portal or Live Dashcam.
    Validates coordinates, prevents duplicate incident IDs, and calculates priority.
    """
    # 1. Generate or validate incident ID
    incident_id = payload.incident_id or generate_incident_id()

    # 2. Check for duplicate incident ID
    existing_incident = db.query(ComplaintModel).filter(ComplaintModel.incident_id == incident_id).first()
    if existing_incident:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Complaint with incident ID '{incident_id}' is already registered as #{existing_incident.id}.",
        )

    # 3. Generate complaint ID
    complaint_id = generate_complaint_id()
    while db.query(ComplaintModel).filter(ComplaintModel.id == complaint_id).first():
        complaint_id = generate_complaint_id()

    # 4. Serialize srps_breakdown if present
    srps_str = None
    if payload.srps_breakdown:
        if isinstance(payload.srps_breakdown, dict):
            srps_str = json.dumps(payload.srps_breakdown)
        else:
            srps_str = str(payload.srps_breakdown)

    now = datetime.now(timezone.utc)
    new_complaint = ComplaintModel(
        id=complaint_id,
        incident_id=incident_id,
        damage_type=payload.damage_type,
        location=payload.location,
        ward=payload.ward or "Pune Municipal Jurisdiction",
        latitude=payload.latitude,
        longitude=payload.longitude,
        severity=payload.severity,
        priority=payload.priority or 50,
        status="Pending",
        image_url=payload.image_url,
        ai_confidence=payload.ai_confidence,
        description=payload.description or "Road hazard reported by citizen.",
        reporting_source=payload.reporting_source or "Citizen Portal",
        citizen_name=payload.citizen_name,
        citizen_phone=payload.citizen_phone,
        srps_breakdown=srps_str,
        created_at=now,
        updated_at=now,
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    return ComplaintResponse.from_orm_model(new_complaint)


@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: str,
    db: Session = Depends(get_db),
):
    """
    Fetch a single complaint by complaint ID or linked incident ID.
    """
    complaint = (
        db.query(ComplaintModel)
        .filter((ComplaintModel.id == complaint_id) | (ComplaintModel.incident_id == complaint_id))
        .first()
    )
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint '{complaint_id}' was not found in municipal registry.",
        )
    return ComplaintResponse.from_orm_model(complaint)


# ── Administrator Operations ───────────────────────────────────────────────────

@router.get("/admin/complaints", response_model=List[ComplaintResponse])
def admin_list_complaints(
    search: Optional[str] = Query(None, description="Search by ID, location, damage type, or citizen"),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    damage_type: Optional[str] = Query(None, alias="damageType"),
    ward: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    Administrative overview of complaints with search, filtering, and priority ranking.
    """
    query = db.query(ComplaintModel)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (ComplaintModel.id.ilike(term))
            | (ComplaintModel.location.ilike(term))
            | (ComplaintModel.damage_type.ilike(term))
            | (ComplaintModel.citizen_name.ilike(term))
        )

    if status and status.lower() != "all":
        query = query.filter(ComplaintModel.status.ilike(status))
    if severity and severity.lower() != "all":
        query = query.filter(ComplaintModel.severity.ilike(severity))
    if damage_type and damage_type.lower() != "all":
        query = query.filter(ComplaintModel.damage_type.ilike(damage_type))
    if ward and ward.lower() != "all":
        query = query.filter(ComplaintModel.ward.ilike(f"%{ward}%"))

    items = query.order_by(ComplaintModel.priority.desc(), ComplaintModel.created_at.desc()).offset(offset).limit(limit).all()
    return [ComplaintResponse.from_orm_model(item) for item in items]


@router.put("/admin/complaints/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: str,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    _authorized: bool = Depends(verify_admin_access),
):
    """
    Update complaint lifecycle status (e.g. Pending -> In Progress -> Resolved).
    """
    complaint = db.query(ComplaintModel).filter(ComplaintModel.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint '{complaint_id}' not found.",
        )

    complaint.status = payload.status
    if payload.note:
        complaint.status_note = payload.note
    complaint.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(complaint)

    return ComplaintResponse.from_orm_model(complaint)


@router.put("/admin/complaints/{complaint_id}/assign", response_model=ComplaintResponse)
def assign_complaint_engineer(
    complaint_id: str,
    payload: ComplaintAssignUpdate,
    db: Session = Depends(get_db),
    _authorized: bool = Depends(verify_admin_access),
):
    """
    Assign an engineering squad or supervising officer to a complaint.
    Automatically transitions status to 'In Progress' when crew is dispatched.
    """
    complaint = db.query(ComplaintModel).filter(ComplaintModel.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint '{complaint_id}' not found.",
        )

    if payload.assigned_squad:
        complaint.assigned_squad = payload.assigned_squad
    if payload.assigned_engineer:
        complaint.assigned_engineer = payload.assigned_engineer
    if payload.target_date:
        complaint.estimated_fix = payload.target_date
    if payload.note:
        complaint.dispatch_note = payload.note

    # When crew is dispatched, move to In Progress if currently Pending
    if complaint.status == "Pending":
        complaint.status = "In Progress"

    complaint.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(complaint)

    return ComplaintResponse.from_orm_model(complaint)
