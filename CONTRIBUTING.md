# Contribuir a Avendia 3.0

## Antes de abrir un pull request

```powershell
cd backend
uv run ruff check .
uv run ruff format .
uv run pytest

cd ../frontend
npm run lint
npm run test
npm run build
```

CI ejecuta lo mismo más las migraciones en un PostgreSQL limpio. Un PR con CI en
rojo no se revisa.

## Reglas del repositorio

- Un solo API bajo `/api/v1`; el navegador nunca habla con la base ni con la IA.
- Cada cambio de esquema es una migración de Alembic con nombre
  `NNNN_descripcion_corta.py`. Nunca edites una migración ya publicada.
- Si añades o cambias una ruta, regenera el contrato:
  `uv run python scripts/export_api_contract.py > ../docs/api-contract.md`.
- Toda ruta protegida se autoriza en el servidor por usuario y rol.
- Sin `console.log`, `any` ni archivos de trabajo (`scratch/`, logs,
  capturas) en el código versionado. Los documentos de fases anteriores van a
  `docs/archive/`.
- Texto de interfaz en español, con mensajes de error que digan qué pasó y qué
  hacer.

## Estructura de un cambio

1. Rama desde `main`.
2. Código con su prueba (backend en `backend/tests`, frontend junto al
   componente como `*.test.tsx`).
3. Commit con mensaje en español que explique el porqué.
4. Pull request con la lista de verificación anterior en verde.
