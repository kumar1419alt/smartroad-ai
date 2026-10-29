"""
main.py — FastAPI Application Entrypoint for SmartRoad AI.
"""

import sys
from pathlib import Path

# Add project root and backend directory to sys.path so the app can be run
# both from the workspace root (`uvicorn backend.main:app`) and from within backend/ (`uvicorn main:app`).
_current_dir = Path(__file__).resolve().parent
_project_root = _current_dir.parent
for _p in (str(_project_root), str(_current_dir)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.config import settings
from backend.database import init_db
from backend.routers.health import router as health_router
from backend.routers.complaints import router as complaints_router
from backend.routers.detection import router as detection_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Context Manager.
    Handles startup database table initialization and shutdown resource cleanup.
    """
    # Startup: Initialize database tables
    init_db()
    yield
    # Shutdown logic (if any cleanup is needed in future)


# Initialize FastAPI instance with comprehensive metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description=settings.PROJECT_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS Configuration ─────────────────────────────────────────────────────────
# Permits local Vite frontend to communicate without browser origin blocking
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ── Global Error Handlers ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure all unhandled server errors produce consistent JSON responses."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error occurred.",
            "error_type": exc.__class__.__name__,
            "message": str(exc) if settings.DEBUG else "Please contact system administrator.",
        },
    )


# ── Mount Routers under API Prefix (/api/v1) ──────────────────────────────────
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(complaints_router, prefix=settings.API_PREFIX)
app.include_router(detection_router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Root"])
def root_index():
    """Root redirect or API info."""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
