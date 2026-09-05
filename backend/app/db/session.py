from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()
connect_args = {}
if settings.database_url.startswith("postgresql+asyncpg://"):
    if settings.database_schema:
        connect_args["server_settings"] = {
            "search_path": f"{settings.database_schema},public"
        }
    if settings.database_ssl_required:
        connect_args["ssl"] = "require"
engine = create_async_engine(settings.database_url, pool_pre_ping=True, connect_args=connect_args)
session_factory = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with session_factory() as session:
        yield session
