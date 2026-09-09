# Avendia 3.0

Plataforma para docentes peruanos: FastAPI + SQLAlchemy async + Alembic en
`backend/`, React 19 + Vite en `frontend/`. Español en interfaz, commits y docs.

## Comandos

- Backend: `cd backend && uv sync --dev && uv run pytest && uv run ruff check .`
- Frontend: `cd frontend && npm install && npm run lint && npm run test && npm run build`
- Local completo: `bash iniciar-local.sh` o `iniciar-local.cmd` (Windows).
- Migraciones: `uv run alembic upgrade head`; nuevas con `uv run alembic revision -m "NNNN_nombre"`.
- Contrato de API: `uv run python scripts/export_api_contract.py > ../docs/api-contract.md` (CI lo compara).

## Reglas

- Nunca consultar la base ni la IA desde el navegador; todo pasa por `/api/v1`.
- Autorización siempre en el servidor por `owner_id` y rol.
- Errores con el envelope de `app/core/errors.py`; no simular éxitos.
- Descargas de URLs externas solo con `app/core/safe_http.py`.
- Sin archivos de trabajo versionados (logs, scratch, capturas); docs de fases
  pasadas en `docs/archive/`.
- Las pruebas del backend usan SQLite en memoria; lo que dependa de PostgreSQL
  se verifica en CI con `scripts/prepare_production.py`.
