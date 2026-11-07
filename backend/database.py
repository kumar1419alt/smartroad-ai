"""
database.py — SQLAlchemy database setup for SQLite and future PostgreSQL/PostGIS.
"""

import sys
from pathlib import Path

_current_dir = Path(__file__).resolve().parent
_project_root = _current_dir.parent
for _p in (str(_project_root), str(_current_dir)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.config import settings

# Engine setup
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_initial_data() -> None:
    """Seed initial realistic Pune road damage complaints if database is empty."""
    import os
    if os.environ.get("ENVIRONMENT") == "test" or getattr(settings, "ENVIRONMENT", "") == "test":
        return

    from backend.models import ComplaintModel
    from datetime import datetime, timezone, timedelta

    db = SessionLocal()
    try:
        existing_ids = {r[0] for r in db.query(ComplaintModel.id).all()}
        now = datetime.now(timezone.utc)
        initial_complaints = [
            ComplaintModel(
                id="PMC-2026-0421",
                incident_id="INC-2026-00912",
                damage_type="Pothole",
                severity="critical",
                priority=94,
                location="FC Road, near Goodluck Chowk, Deccan Gymkhana",
                ward="Ward 14 (Shivajinagar - Deccan)",
                latitude=18.5186,
                longitude=73.8415,
                status="Pending",
                image_url="/sample-pothole.jpg",
                ai_confidence="96.4%",
                description="Deep road crater on southbound carriage near Goodluck Chowk. High risk of 2-wheeler skidding in evening traffic.",
                reporting_source="Citizen Portal",
                citizen_name="Aarav Sharma",
                citizen_phone="+91 98220 11234",
                upvotes=38,
                assigned_engineer=None,
                assigned_squad=None,
                repair_progress=0,
                estimated_fix="15 Oct 2026",
                status_note="Inspection scheduled by ward office.",
                created_at=now - timedelta(days=2),
                updated_at=now - timedelta(days=2),
            ),
            ComplaintModel(
                id="PMC-2026-0418",
                incident_id="INC-2026-00905",
                damage_type="Deep Subsidence",
                severity="critical",
                priority=91,
                location="Senapati Bapat Road, opposite ICC Trade Tower",
                ward="Ward 10 (Gokhale Nagar - SB Road)",
                latitude=18.5342,
                longitude=73.8296,
                status="In Progress",
                image_url="/sample-pothole.jpg",
                ai_confidence="93.8%",
                description="Surface sinking along utility trench line. Base course exposed, barricaded with cautionary cones.",
                reporting_source="Citizen Portal",
                citizen_name="Pooja Deshmukh",
                citizen_phone="+91 98221 22345",
                upvotes=42,
                assigned_engineer="Er. Rajesh Kulkarni",
                assigned_squad="Ward 10 Pavement Unit",
                repair_progress=65,
                estimated_fix="14 Oct 2026",
                status_note="Base compaction complete. Hot mix asphalt layer being laid.",
                created_at=now - timedelta(days=3),
                updated_at=now - timedelta(hours=4),
            ),
            ComplaintModel(
                id="PMC-2026-0409",
                incident_id="INC-2026-00898",
                damage_type="Pothole Cluster",
                severity="high",
                priority=86,
                location="Hinjewadi Phase 1, near Shivaji Chowk Flyover",
                ward="Wakad-Hinjewadi IT Corridor",
                latitude=18.5913,
                longitude=73.7389,
                status="In Progress",
                image_url="/sample-pothole.jpg",
                ai_confidence="91.2%",
                description="Repeated potholes spanning 25 meters across left lane. Causes severe peak-hour traffic bottleneck.",
                reporting_source="Citizen Portal",
                citizen_name="Kunal Verma",
                citizen_phone="+91 98222 33456",
                upvotes=56,
                assigned_engineer="Er. Rajesh Kulkarni",
                assigned_squad="MIDC / PMC Joint Repair Crew",
                repair_progress=40,
                estimated_fix="16 Oct 2026",
                status_note="Debris cleared. Cold patch temporary fill applied.",
                created_at=now - timedelta(days=5),
                updated_at=now - timedelta(hours=6),
            ),
            ComplaintModel(
                id="PMC-2026-0397",
                incident_id="INC-2026-00874",
                damage_type="Longitudinal Crack",
                severity="high",
                priority=78,
                location="Baner Road, near Balewadi High Street Junction",
                ward="Ward 8 (Aundh - Baner)",
                latitude=18.5590,
                longitude=73.7868,
                status="Scheduled",
                image_url="/sample-pothole.jpg",
                ai_confidence="89.5%",
                description="Extensive 40m asphalt fissure along median. Water seepage risk during post-monsoon showers.",
                reporting_source="Live Dashcam",
                citizen_name="PMC Patrol Car #3",
                citizen_phone=None,
                upvotes=24,
                assigned_engineer="Er. Amit Deshmukh",
                assigned_squad="Zone-3 Maintenance Wing",
                repair_progress=20,
                estimated_fix="17 Oct 2026",
                status_note="Scheduled for crack sealing with bitumen emulsion.",
                created_at=now - timedelta(days=7),
                updated_at=now - timedelta(days=1),
            ),
            ComplaintModel(
                id="PMC-2026-0382",
                incident_id="INC-2026-00861",
                damage_type="Manhole Subsidence",
                severity="medium",
                priority=64,
                location="Paud Road, near Karve Statue, Kothrud",
                ward="Ward 12 (Kothrud - Bavdhan)",
                latitude=18.5074,
                longitude=73.8077,
                status="Pending",
                image_url="/sample-pothole.jpg",
                ai_confidence="87.1%",
                description="Drainage chamber lid depressed 7cm below asphalt surface. Heavy thud when buses navigate over it.",
                reporting_source="Citizen Portal",
                citizen_name="Meera Joshi",
                citizen_phone="+91 98223 44567",
                upvotes=19,
                assigned_engineer=None,
                assigned_squad=None,
                repair_progress=0,
                estimated_fix="18 Oct 2026",
                status_note="Awaiting engineering team assignment.",
                created_at=now - timedelta(days=9),
                updated_at=now - timedelta(days=9),
            ),
            ComplaintModel(
                id="PMC-2026-0371",
                incident_id="INC-2026-00843",
                damage_type="Edge Erosion",
                severity="medium",
                priority=58,
                location="Viman Nagar, Central Avenue (opp. Phoenix Marketcity)",
                ward="Ward 3 (Viman Nagar - Wadgaon Sheri)",
                latitude=18.5679,
                longitude=73.9143,
                status="Resolved",
                image_url="/sample-pothole.jpg",
                ai_confidence="88.3%",
                description="Curb collapse and asphalt breakdown along stormwater drain outlet.",
                reporting_source="Citizen Portal",
                citizen_name="Vikram Rathi",
                citizen_phone="+91 98224 55678",
                upvotes=31,
                assigned_engineer="Er. Rajesh Kulkarni",
                assigned_squad="Eastern Zone Asphalt Crew",
                repair_progress=100,
                estimated_fix="10 Oct 2026",
                status_note="Concrete curbing rebuilt, edge asphalt resurfaced and compacted. Quality verified.",
                created_at=now - timedelta(days=12),
                updated_at=now - timedelta(days=1),
            ),
            ComplaintModel(
                id="PMC-2026-0364",
                incident_id="INC-2026-00827",
                damage_type="Alligator Crack",
                severity="medium",
                priority=52,
                location="Tilak Road, near SP College Chowk",
                ward="Ward 15 (Sadashiv Peth - Tilak Road)",
                latitude=18.5062,
                longitude=73.8507,
                status="In Progress",
                image_url="/sample-pothole.jpg",
                ai_confidence="85.4%",
                description="Fatigue cracking in high-stress braking zone approaching traffic signal.",
                reporting_source="Citizen Portal",
                citizen_name="Ananya Kulkarni",
                citizen_phone="+91 98225 66789",
                upvotes=15,
                assigned_engineer="Er. Sneha Patil",
                assigned_squad="Central Pothole Squad",
                repair_progress=50,
                estimated_fix="19 Oct 2026",
                status_note="Milling completed. Pre-patch surface treatment underway.",
                created_at=now - timedelta(days=14),
                updated_at=now - timedelta(hours=12),
            ),
            ComplaintModel(
                id="PMC-2026-0352",
                incident_id="INC-2026-00810",
                damage_type="Pothole",
                severity="critical",
                priority=88,
                location="Koregaon Park, North Main Road, Lane 5",
                ward="Ward 2 (Koregaon Park - Bund Garden)",
                latitude=18.5362,
                longitude=73.8940,
                status="Pending",
                image_url="/sample-pothole.jpg",
                ai_confidence="92.6%",
                description="Large pothole formed near tree root intrusion. Hazardous during evening darkness.",
                reporting_source="Citizen Portal",
                citizen_name="Rohan Mehta",
                citizen_phone="+91 98226 77890",
                upvotes=27,
                assigned_engineer=None,
                assigned_squad=None,
                repair_progress=0,
                estimated_fix="20 Oct 2026",
                status_note="Inspection request pending squad dispatch.",
                created_at=now - timedelta(days=1),
                updated_at=now - timedelta(days=1),
            ),
            ComplaintModel(
                id="PMC-2026-0341",
                incident_id="INC-2026-00795",
                damage_type="Surface Ravelling",
                severity="low",
                priority=42,
                location="Aundh, DP Road, near MediPoint Hospital",
                ward="Ward 9 (Aundh - Bopodi)",
                latitude=18.5580,
                longitude=73.8073,
                status="Resolved",
                image_url="/sample-pothole.jpg",
                ai_confidence="82.0%",
                description="Loose gravel and binder loss across 15m stretch.",
                reporting_source="Live Dashcam",
                citizen_name="Patrol Dashcam Unit #2",
                citizen_phone=None,
                upvotes=8,
                assigned_engineer="Er. Amit Deshmukh",
                assigned_squad="Zone-3 Maintenance Wing",
                repair_progress=100,
                estimated_fix="08 Oct 2026",
                status_note="Slurry seal application complete. Pavement opened to traffic.",
                created_at=now - timedelta(days=18),
                updated_at=now - timedelta(days=3),
            ),
            ComplaintModel(
                id="PMC-2026-0330",
                incident_id="INC-2026-00780",
                damage_type="Transverse Crack",
                severity="low",
                priority=38,
                location="Hadapsar, Magarpatta Road near Cybercity Gate",
                ward="Ward 6 (Hadapsar - Mundhwa)",
                latitude=18.5112,
                longitude=73.9298,
                status="Scheduled",
                image_url="/sample-pothole.jpg",
                ai_confidence="79.4%",
                description="Thermal contraction joint crack across both lanes.",
                reporting_source="Citizen Portal",
                citizen_name="Gaurav Shinde",
                citizen_phone="+91 98227 88901",
                upvotes=12,
                assigned_engineer=None,
                assigned_squad="Southeast Road Division",
                repair_progress=10,
                estimated_fix="22 Oct 2026",
                status_note="Slated for nocturnal sealant injection.",
                created_at=now - timedelta(days=20),
                updated_at=now - timedelta(days=4),
            ),
        ]
        to_add = [c for c in initial_complaints if c.id not in existing_ids]
        if to_add:
            db.add_all(to_add)
            db.commit()
    except Exception as exc:
        db.rollback()
    finally:
        db.close()


def init_db() -> None:
    """Create all tables if they do not exist and seed initial records."""
    Base.metadata.create_all(bind=engine)
    seed_initial_data()
