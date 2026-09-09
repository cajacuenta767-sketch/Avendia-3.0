# Etapa de dependencias: resuelve el entorno con uv sin herramientas de build en runtime.
FROM python:3.12-slim AS deps
WORKDIR /app
ENV UV_LINK_MODE=copy UV_PROJECT_ENVIRONMENT=/opt/venv
RUN pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev --frozen --no-install-project

# Etapa final: solo runtime, LibreOffice para la vista previa PDF y usuario sin privilegios.
FROM python:3.12-slim
WORKDIR /app
ENV ENVIRONMENT=production \
    EXPOSE_PASSWORD_RESET_CODE=false \
    DATABASE_SCHEMA=avendia3 \
    DATABASE_SSL_REQUIRED=true \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"
RUN apt-get update \
    && apt-get install -y --no-install-recommends libreoffice-writer curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system avendia && useradd --system --gid avendia --create-home avendia
COPY --from=deps /opt/venv /opt/venv
COPY alembic.ini ./
COPY migrations ./migrations
COPY app ./app
COPY scripts ./scripts
RUN mkdir -p /app/data && chown -R avendia:avendia /app
USER avendia
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:${PORT:-8000}/api/v1/ready" || exit 1
CMD ["sh", "-c", "python scripts/prepare_production.py && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
