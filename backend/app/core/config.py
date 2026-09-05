from functools import lru_cache
from typing import Literal

from pydantic import SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Avendia API"
    environment: Literal["development", "test", "production"] = "development"
    database_url: str = "sqlite+aiosqlite:///./avendia3-dev.db"
    database_schema: str | None = None
    database_ssl_required: bool = False
    jwt_secret_key: SecretStr = SecretStr("development-only-change-this-secret")
    access_token_expire_minutes: int = 60
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    gemini_api_key: SecretStr | None = None
    gemini_model: str = "gemini-3.6-flash"
    gemini_timeout_seconds: float = 45.0
    presentation_image_provider: Literal["auto", "google", "gemini", "wikimedia"] = "auto"
    google_custom_search_api_key: SecretStr | None = None
    google_custom_search_engine_id: str | None = None
    gemini_image_model: str = "gemini-3.1-flash-image"
    presentation_image_timeout_seconds: float = 55.0
    password_reset_expire_minutes: int = 15
    password_reset_max_attempts: int = 5
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: SecretStr | None = None
    smtp_from_email: str | None = None
    smtp_from_name: str = "Avendia"
    smtp_use_tls: bool = True

    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("database_schema")
    @classmethod
    def validate_database_schema(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        normalized = value.strip()
        if not normalized.replace("_", "").isalnum() or normalized[0].isdigit():
            raise ValueError("DATABASE_SCHEMA must be a valid PostgreSQL identifier")
        return normalized

    @model_validator(mode="after")
    def validate_production(self) -> "Settings":
        if self.environment == "production":
            if not self.database_url.startswith("postgresql+asyncpg://"):
                raise ValueError("Production requires PostgreSQL through asyncpg")
            if len(self.jwt_secret_key.get_secret_value()) < 32:
                raise ValueError("JWT_SECRET_KEY must contain at least 32 characters")
            if self.gemini_api_key is None or not self.gemini_api_key.get_secret_value().strip():
                raise ValueError("Production AI features require GEMINI_API_KEY")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
