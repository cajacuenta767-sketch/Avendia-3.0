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

## Documentos Word generados

- CI tiene un tercer trabajo, `documentos`, que genera el Word de muestra de las
  58 herramientas (`npx vitest run src/features/tools/qaExport`), lo convierte
  a PDF con LibreOffice y compara el número de páginas con
  `frontend/e2e/docx/pages-baseline.json`. Los PDF y la primera página en PNG
  quedan como artefacto del trabajo para revisarlos.
- Si cambias un exportador a propósito, actualiza la línea base con
  LibreOffice instalado:
  `node e2e/docx/check-docx-pdf.cjs <dir-docx> <dir-pdf> --update-baseline`.

## Banco de referencia con Gemini real

Sirve para comparar lo que la IA produce antes y después de cambiar un prompt.

```powershell
cd frontend
npx vite-node scripts/exportReferencePayloads.ts   # docs/reference-bank/payloads.json
cd ../backend
uv run python scripts/reference_bank.py generate --out data/reference-bank/AAAA-MM-DD
uv run python scripts/reference_bank.py compare data/reference-bank/antes data/reference-bank/despues
```

`generate` necesita `GEMINI_API_KEY` y guarda un JSON por herramienta más
`summary.json`. Las corridas van en `data/`, que no se versiona.
