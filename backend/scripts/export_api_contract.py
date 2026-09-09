"""Imprime docs/api-contract.md a partir del esquema OpenAPI de la aplicación.

cd backend && uv run python scripts/export_api_contract.py > ../docs/api-contract.md
"""

from __future__ import annotations

import os
import sys
from collections import defaultdict
from pathlib import Path

os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("JWT_SECRET_KEY", "contract-export-secret-with-32-characters")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402


def main() -> None:
    spec = app.openapi()
    groups: dict[str, list[tuple[str, str, str]]] = defaultdict(list)
    for path, operations in spec["paths"].items():
        for method, operation in operations.items():
            tag = (operation.get("tags") or ["system"])[0]
            summary = operation.get("summary") or operation.get("operationId", "").replace("_", " ")
            groups[tag].append((method.upper(), path, summary))

    print("# Contrato de API\n")
    print("Generado desde el esquema OpenAPI de la aplicación. Para regenerarlo:\n")
    print("```powershell")
    print("cd backend")
    print("uv run python scripts/export_api_contract.py > ../docs/api-contract.md")
    print("```\n")
    print(
        "Todas las rutas cuelgan de `/api/v1`. Salvo `health`, `ready`, `auth/*` y las imágenes "
        "de presentación, requieren `Authorization: Bearer <token>`. Las rutas bajo `/admin` "
        "exigen además el rol `admin`.\n"
    )
    print(
        "Errores: cuerpo `{ detail, error: { code, message, field, retryable, request_id } }`. "
        "Códigos: `authentication_required` (401), `permission_denied` (403), `not_found` (404), "
        "`revision_conflict` (409), `validation_failed` (422), `rate_limited` (429, con cabecera "
        "`Retry-After`), `service_unavailable` (5xx).\n"
    )
    print(f"Total: {sum(len(items) for items in groups.values())} operaciones.\n")
    for tag in sorted(groups):
        print(f"## {tag}\n")
        print("| Método | Ruta | Operación |\n|---|---|---|")
        for method, path, summary in sorted(groups[tag], key=lambda item: (item[1], item[0])):
            print(f"| `{method}` | `{path}` | {summary} |")
        print()


if __name__ == "__main__":
    main()
