"""
conftest.py — Shared pytest fixtures for SmartRoad AI backend tests.

Strategy
--------
* Environment variables MUST be set before *any* backend module is imported,
  because config.py and database.py run module-level code that reads them.
* We set DATABASE_URL here, then import backend modules.
* We also monkey-patch `backend.database.engine` and `SessionLocal` so the
  global singletons in database.py point at our isolated test database.
* The `get_db` FastAPI dependency is overridden on the app so every test
  request uses the test engine.
* All rows are deleted between tests; tables are dropped at session end.
"""

import os
import sys
from pathlib import Path
import pytest

# Ensure project root is in sys.path
_current_dir = Path(__file__).resolve().parent
_project_root = _current_dir.parent.parent
for _p in (str(_project_root), str(_current_dir.parent)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

# ── 1. Set env vars FIRST, before any backend import ──────────────────────────
TEST_DB_PATH = "./test_smartroad_pytest.db"
TEST_DB_URL = f"sqlite:///{TEST_DB_PATH}"

os.environ["DATABASE_URL"] = TEST_DB_URL
# Explicitly unset YOLO_MODEL_PATH so the inference engine starts unconfigured.
# Tests in TestInferNoModel assert model_not_configured behaviour; a real model
# must not be loaded even when backend/.env happens to contain a valid path.
os.environ["YOLO_MODEL_PATH"] = ""
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DEBUG", "True")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")

# ── 2. Import backend after env is set ────────────────────────────────────────
from sqlalchemy import create_engine                         # noqa: E402
from sqlalchemy.orm import sessionmaker                      # noqa: E402
from fastapi.testclient import TestClient                    # noqa: E402

import backend.database as _db_module                       # noqa: E402
from backend.main import app                                 # noqa: E402
from backend.models import ComplaintModel                    # noqa: F401, E402


# ── 3. Create isolated test engine and session factory ────────────────────────
_test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
_TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=_test_engine)

# Monkey-patch the module globals so `init_db()` and all routers use our engine
_db_module.engine = _test_engine
_db_module.SessionLocal = _TestingSession


# ── 4. Override get_db dependency ─────────────────────────────────────────────
def _override_get_db():
    db = _TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[_db_module.get_db] = _override_get_db


# ── 5. Session-scoped: create tables once ─────────────────────────────────────
@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    _db_module.Base.metadata.create_all(bind=_test_engine)
    yield
    _db_module.Base.metadata.drop_all(bind=_test_engine)
    _test_engine.dispose()
    try:
        os.remove(TEST_DB_PATH)
    except OSError:
        pass


# ── 6. Per-test cleanup: wipe rows so each test is isolated ───────────────────
@pytest.fixture(autouse=True)
def _clean_rows():
    yield
    db = _TestingSession()
    try:
        db.query(ComplaintModel).delete()
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


# ── 7. TestClient fixture ──────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def client(_create_tables):
    """Synchronous TestClient for the FastAPI app, using the test database."""
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
