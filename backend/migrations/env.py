import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import get_settings
from app.db.base import Base
from app.modules.admin import model as admin_model  # noqa: F401
from app.modules.auth import model as auth_model  # noqa: F401
from app.modules.calendar import model as calendar_model  # noqa: F401
from app.modules.community import model as community_model  # noqa: F401
from app.modules.documents import model as document_model  # noqa: F401
from app.modules.evaluation_instruments import model as evaluation_model  # noqa: F401
from app.modules.rosters import model as roster_model  # noqa: F401
from app.modules.templates import model as template_model  # noqa: F401
from app.modules.users import model as user_model  # noqa: F401
from app.modules.utilities import community as community_utilities_model  # noqa: F401
from app.modules.utilities import model as utility_model  # noqa: F401
from app.modules.utilities import referrals as referral_model  # noqa: F401
from app.modules.utilities import templates as template_utilities_model  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.database_url)
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_sync_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connect_args = {}
    if settings.database_schema:
        connect_args["server_settings"] = {
            "search_path": f"{settings.database_schema},public"
        }
    if settings.database_ssl_required:
        connect_args["ssl"] = "require"
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args=connect_args,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(run_sync_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
