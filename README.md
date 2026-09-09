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

### Opción rápida (un solo archivo)

Solo necesitas tener instalado [Node.js LTS](https://nodejs.org). El lanzador
instala `uv` si falta, crea el `.env`, instala dependencias, aplica las
migraciones, crea la cuenta de administrador, arranca la API y la interfaz, y
abre el navegador. Si no detecta PostgreSQL en el puerto 5432 usa SQLite.

- Windows: doble clic en `iniciar-local.cmd` (o `powershell -ExecutionPolicy Bypass -File .\iniciar-local.ps1`).
- Linux / macOS: `bash iniciar-local.sh`.

Al terminar entra en `http://127.0.0.1:5173` con `admin@avendia.com` y
`Avendia2026!`. Puedes volver a ejecutarlo cuantas veces quieras: conserva el
`.env` y la base existentes.

### Opción manual

1. Copia `.env.example` como `.env` y reemplaza los secretos.
2. Levanta PostgreSQL con `docker compose up -d db`.
3. Backend:

   ```powershell
   cd backend
   uv sync --dev
   uv run python scripts/bootstrap_local.py
   uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
   ```

   `bootstrap_local.py` aplica las migraciones y deja lista una cuenta de
   administrador para entrar. Sustituye a `alembic upgrade head` en local:
   además del esquema, corrige la tabla `alembic_version` de PostgreSQL, cuya
   columna por defecto (32 caracteres) no admite los nombres de revisión del
   proyecto y hace fallar la migración.

4. Frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

La interfaz queda en `http://127.0.0.1:5173` y la API en `http://127.0.0.1:8001/api/v1`.

## Entrar en local

Tras ejecutar `bootstrap_local.py`, entra en `http://127.0.0.1:5173` con:

- Correo: `admin@avendia.com`
- Contraseña: `Avendia2026!`

Para usar otras credenciales pasa `--email`, `--password` y `--name`, o define
`ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_FULL_NAME`. Si la cuenta ya existe, el
script la activa y la promueve a administrador; con `--reset-password` también
reemplaza su contraseña. Sin `.env` el backend usa SQLite (`avendia3-dev.db`) y
el mismo comando funciona igual.

Si el inicio de sesión falla, comprueba:

- Que el backend responde en `http://127.0.0.1:8001/api/v1/health`.
- Que `VITE_API_URL` del `.env` apunta a esa API y que reiniciaste `npm run dev`
  después de cambiarlo.
- Que el correo no usa dominios reservados como `.local` o `.test`: el
  registro los rechaza.

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
