from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.router import api_router
from app.core.config import get_settings
from app.db.session import engine

settings = get_settings()
production_frontend = "https://avendia-web.vercel.app"
allowed_origins = list(settings.allowed_origins)
if production_frontend not in allowed_origins:
    allowed_origins.append(production_frontend)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Schema changes are performed by Alembic before the process starts.
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="3.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.environment != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/api/v1/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "healthy", "service": "avendia-api"}


@app.get("/api/v1/ready", tags=["system"])
async def ready() -> dict[str, str]:
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        ) from exc
    return {"status": "ready"}


app.include_router(api_router, prefix="/api/v1")
