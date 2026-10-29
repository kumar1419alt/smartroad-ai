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


def init_db() -> None:
    """Create all tables if they do not exist."""
    Base.metadata.create_all(bind=engine)
