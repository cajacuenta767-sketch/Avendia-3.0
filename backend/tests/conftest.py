import os

import pytest_asyncio

os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "test-secret-with-at-least-thirty-two-characters"

from app.db.base import Base  # noqa: E402
from app.db.session import engine  # noqa: E402
from app.modules.admin import model as admin_model  # noqa: E402, F401
from app.modules.auth import model as auth_model  # noqa: E402, F401
from app.modules.calendar import model as calendar_model  # noqa: E402, F401
from app.modules.community import model as community_model  # noqa: E402, F401
from app.modules.documents import model as document_model  # noqa: E402, F401
from app.modules.evaluation_instruments import model as evaluation_model  # noqa: E402, F401
from app.modules.rosters import model as roster_model  # noqa: E402, F401
from app.modules.templates import model as template_model  # noqa: E402, F401
from app.modules.users import model as user_model  # noqa: E402, F401


@pytest_asyncio.fixture(autouse=True)
async def clean_database():
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
