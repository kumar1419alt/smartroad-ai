"""
config.py — Centralized environment settings for SmartRoad AI FastAPI backend.
"""

from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartRoad AI API"
    PROJECT_VERSION: str = "1.0.0"
    PROJECT_DESCRIPTION: str = (
        "Municipal AI and GIS-based road damage detection and repair prioritization system backend."
    )
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"

    # SQLite for development; supports PostgreSQL/PostGIS connection string for production
    DATABASE_URL: str = "sqlite:///./smartroad.db"

    # CORS configuration
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Pluggable YOLO Model Configuration
    YOLO_MODEL_PATH: str = ""
    YOLO_CONFIDENCE_THRESHOLD: float = 0.70

    # Administrative action protection for development
    ADMIN_API_KEY: str = "dev_admin_secret_key_change_in_production"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
