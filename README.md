# Avendia 3.0

Reconstrucción limpia de Avendia. Este repositorio no comparte código con la versión anterior: conserva únicamente el dominio, los contratos funcionales y los datos que se migren de manera explícita.

## Estructura

```text
backend/        API FastAPI, dominio, persistencia y migraciones
frontend/       Aplicación React + Vite
docs/           Arquitectura, contrato funcional y plan de migración
assets/design/  Especificación visual aprobada
```

## Principios

- Una sola API oficial bajo `/api/v1`.
- El navegador nunca accede directamente a PostgreSQL ni a proveedores de IA.
- Los errores usan códigos HTTP correctos; no se simulan éxitos.
- PostgreSQL es obligatorio en producción. SQLite solo puede usarse explícitamente en pruebas.
- Las migraciones son versionadas y nunca se ejecutan destructivamente al arrancar.
- Cada recurso se autoriza en el servidor según usuario y rol.

## Inicio local

1. Copia `.env.example` como `.env` y reemplaza los secretos.
2. Levanta PostgreSQL con `docker compose up -d db`.
3. Backend:

   ```powershell
   cd backend
   uv sync --dev
   uv run alembic upgrade head
   uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
   ```

4. Frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

La interfaz queda en `http://127.0.0.1:5173` y la API en `http://127.0.0.1:8001/api/v1`.

## Verificación

```powershell
cd backend
uv run pytest
uv run ruff check .

cd ../frontend
npm run lint
npm run test
npm run build
```

Antes de incorporar datos o rutas de Avendia anterior, sigue [el plan de migración](docs/migration-playbook.md).
