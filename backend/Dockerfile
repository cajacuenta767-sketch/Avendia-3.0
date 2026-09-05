FROM python:3.12-slim
WORKDIR /app
ENV ENVIRONMENT=production \
    DATABASE_SCHEMA=avendia3 \
    DATABASE_SSL_REQUIRED=true \
    PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir uv
RUN apt-get update \
    && apt-get install -y --no-install-recommends libreoffice-writer \
    && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml uv.lock* ./
RUN uv sync --no-dev
COPY alembic.ini ./
COPY migrations ./migrations
COPY app ./app
COPY scripts ./scripts
CMD ["sh", "-c", "uv run python scripts/prepare_production.py && exec uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
