"""Banco de referencia: genera con Gemini real una muestra por herramienta y la compara.

Uso::

    # 1) Exportar las peticiones de ejemplo desde las definiciones del frontend
    cd frontend && npx vite-node scripts/exportReferencePayloads.ts

    # 2) Generar el banco (requiere GEMINI_API_KEY en el entorno o en .env)
    cd backend && uv run python scripts/reference_bank.py generate \
        --out data/reference-bank/2026-09-09

    # 3) Comparar dos corridas (por ejemplo antes y después de cambiar el prompt)
    uv run python scripts/reference_bank.py compare \
        data/reference-bank/2026-09-01 data/reference-bank/2026-09-09

``generate`` guarda un JSON por herramienta con el artefacto completo, sus
comprobaciones de calidad y el tiempo de respuesta, más ``summary.json``.
``compare`` imprime por herramienta el estado de calidad, las comprobaciones que
cambiaron y las diferencias de estructura (secciones, tablas, reactivos).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import time
from datetime import UTC, datetime
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))
os.chdir(BACKEND_DIR)

DEFAULT_PAYLOADS = BACKEND_DIR.parent / "docs" / "reference-bank" / "payloads.json"


def _load_payloads(path: Path, only: set[str]) -> list[dict]:
    if not path.exists():
        raise SystemExit(
            f"No existe {path}. Genera las peticiones con "
            "`cd frontend && npx vite-node scripts/exportReferencePayloads.ts`."
        )
    payloads = json.loads(path.read_text(encoding="utf-8"))
    if only:
        payloads = [payload for payload in payloads if payload["tool_id"] in only]
    return payloads


async def _generate(payloads: list[dict], out: Path, concurrency: int) -> None:
    from app.core.config import get_settings
    from app.modules.ai.schemas import WorkflowGenerationRequest
    from app.modules.ai.service import (
        AIConfigurationError,
        AIGenerationError,
        generate_workflow_artifact,
    )

    settings = get_settings()
    if settings.gemini_api_key is None or not settings.gemini_api_key.get_secret_value().strip():
        raise SystemExit("Define GEMINI_API_KEY para generar el banco de referencia.")
    await asyncio.to_thread(out.mkdir, parents=True, exist_ok=True)
    semaphore = asyncio.Semaphore(concurrency)
    summary: dict[str, dict] = {}

    async def run(payload: dict) -> None:
        tool_id = payload["tool_id"]
        request = WorkflowGenerationRequest.model_validate(payload)
        started = time.perf_counter()
        async with semaphore:
            try:
                result = await generate_workflow_artifact(request)
                record = {
                    "status": "ok",
                    "seconds": round(time.perf_counter() - started, 1),
                    "quality_status": result.quality_status,
                    "failed_checks": [
                        check.code for check in result.quality_checks if not check.passed
                    ],
                    "repair_attempted": result.repair_attempted,
                    "sections": len(result.sections),
                    "tables": len(result.tables),
                    "questions": len(result.questions),
                    "activity_items": len(result.activity.items) if result.activity else 0,
                }
                (out / f"{tool_id}.json").write_text(
                    json.dumps(
                        {"payload": payload, "result": result.model_dump(mode="json")},
                        ensure_ascii=False,
                        indent=2,
                    ),
                    encoding="utf-8",
                )
            except (AIGenerationError, AIConfigurationError, ValueError) as exc:
                record = {
                    "status": "error",
                    "seconds": round(time.perf_counter() - started, 1),
                    "error": str(exc)[:300],
                }
        summary[tool_id] = record
        state = record.get("quality_status", record["status"])
        failed = ", ".join(record.get("failed_checks", []))
        print(f"{tool_id:32} {state:8} {record['seconds']:6.1f}s {failed}")

    await asyncio.gather(*(run(payload) for payload in payloads))
    (out / "summary.json").write_text(
        json.dumps(
            {
                "generated_at": datetime.now(UTC).isoformat(),
                "model": settings.gemini_model,
                "tools": summary,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    ready = sum(1 for record in summary.values() if record.get("quality_status") == "ready")
    print(f"\n{ready}/{len(summary)} herramientas listas sin observaciones.")
    print(f"Resumen en {out / 'summary.json'}")


def _compare(before: Path, after: Path) -> int:
    old = json.loads((before / "summary.json").read_text(encoding="utf-8"))["tools"]
    new = json.loads((after / "summary.json").read_text(encoding="utf-8"))["tools"]
    regressions = 0
    for tool_id in sorted(set(old) | set(new)):
        previous, current = old.get(tool_id), new.get(tool_id)
        if previous is None or current is None:
            print(f"{tool_id:32} {'nuevo' if previous is None else 'eliminado'}")
            continue
        changes = []
        for key in ("quality_status", "sections", "tables", "questions", "activity_items"):
            if previous.get(key) != current.get(key):
                changes.append(f"{key}: {previous.get(key)} -> {current.get(key)}")
        lost = set(current.get("failed_checks", [])) - set(previous.get("failed_checks", []))
        fixed = set(previous.get("failed_checks", [])) - set(current.get("failed_checks", []))
        if lost:
            changes.append("nuevos fallos: " + ", ".join(sorted(lost)))
            regressions += 1
        if fixed:
            changes.append("corregidos: " + ", ".join(sorted(fixed)))
        if changes:
            print(f"{tool_id:32} " + " | ".join(changes))
    print(f"\n{regressions} herramientas con comprobaciones que empeoraron.")
    return 1 if regressions else 0


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    commands = parser.add_subparsers(dest="command", required=True)
    generate = commands.add_parser("generate", help="Genera el banco con Gemini")
    generate.add_argument("--payloads", type=Path, default=DEFAULT_PAYLOADS)
    generate.add_argument(
        "--out",
        type=Path,
        default=BACKEND_DIR / "data" / "reference-bank" / datetime.now(UTC).strftime("%Y-%m-%d"),
    )
    generate.add_argument(
        "--only", nargs="*", default=[], help="Identificadores de herramienta a incluir"
    )
    generate.add_argument("--concurrency", type=int, default=2)
    compare = commands.add_parser("compare", help="Compara dos corridas")
    compare.add_argument("before", type=Path)
    compare.add_argument("after", type=Path)
    args = parser.parse_args()

    if args.command == "generate":
        asyncio.run(
            _generate(_load_payloads(args.payloads, set(args.only)), args.out, args.concurrency)
        )
    else:
        raise SystemExit(_compare(args.before, args.after))


if __name__ == "__main__":
    main()
