"""Application configuration, loaded from environment variables (.env)."""
from functools import lru_cache
from typing import List, Optional

from pydantic import AnyHttpUrl, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    PROJECT_NAME: str = "Event Vendor Budgeting & Booking Platform"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database — either set DATABASE_URL directly (e.g. docker-compose does this,
    # pointing at the "db" service host), or set the discrete POSTGRES_* fields
    # below and let assemble_database_url() build the connection string from them
    # (the usual path for a local Postgres install managed via pgAdmin).
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "event_vendor_platform"
    DATABASE_URL: Optional[str] = None

    @model_validator(mode="after")
    def assemble_database_url(self) -> "Settings":
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        return self

    # Security / JWT
    SECRET_KEY: str = "change-this-to-a-long-random-string-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",")]
        return v

    # Media uploads (vendor package photos, etc.)
    MEDIA_ROOT: str = "media"
    MEDIA_URL_PREFIX: str = "/media"
    MEDIA_BASE_URL: str = "http://localhost:8000"
    MAX_UPLOAD_MB: float = 5.0


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
