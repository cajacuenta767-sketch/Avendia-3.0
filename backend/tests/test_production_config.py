import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_production_requires_a_server_side_gemini_key() -> None:
    with pytest.raises(ValidationError, match="GEMINI_API_KEY"):
        Settings(
            environment="production",
            database_url="postgresql+asyncpg://avendia:secret@db/avendia",
            jwt_secret_key="a-production-secret-that-is-longer-than-thirty-two-characters",
            smtp_host="smtp.example.edu",
            smtp_from_email="no-reply@example.edu",
            gemini_api_key=None,
            _env_file=None,
        )
