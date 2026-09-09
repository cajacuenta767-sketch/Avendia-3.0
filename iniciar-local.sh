#!/usr/bin/env bash
# Instala, prepara y abre Avendia 3.0 en esta computadora con un solo comando.
#
#   bash iniciar-local.sh
#
# Requisitos: Node.js 20 o superior. uv se instala solo si falta.
# Sin PostgreSQL usa SQLite automáticamente (archivo backend/avendia3-dev.db).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
API_PORT="${API_PORT:-8001}"
WEB_PORT="${WEB_PORT:-5173}"
LOG_DIR="$ROOT/.runtime"

step() { printf '\n==> %s\n' "$1"; }
fail() { printf '\nERROR: %s\n' "$1" >&2; exit 1; }
port_open() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

step "Comprobando Node.js"
command -v node >/dev/null 2>&1 || fail "Node.js no está instalado. Instala la versión LTS desde https://nodejs.org y vuelve a ejecutar."
echo "Node.js $(node --version)"

step "Comprobando uv"
if ! command -v uv >/dev/null 2>&1; then
  echo "Instalando uv..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
  command -v uv >/dev/null 2>&1 || fail "uv se instaló pero no está en el PATH. Abre una terminal nueva y vuelve a ejecutar."
fi
echo "uv $(uv --version)"

step "Preparando archivo .env"
if [ ! -f "$ROOT/.env" ]; then
  secret="$(LC_ALL=C tr -dc 'a-z0-9' </dev/urandom | head -c 48 || true)"
  sed -e "s|^JWT_SECRET_KEY=.*|JWT_SECRET_KEY=$secret|" "$ROOT/.env.example" >"$ROOT/.env"
  if port_open 5432; then
    echo "PostgreSQL detectado en el puerto 5432: se usará la URL de .env.example."
  else
    echo "PostgreSQL no detectado: se usará SQLite (backend/avendia3-dev.db)."
    sed -i.bak -e "s|^DATABASE_URL=.*|DATABASE_URL=sqlite+aiosqlite:///./avendia3-dev.db|" "$ROOT/.env"
    rm -f "$ROOT/.env.bak"
  fi
  echo "Creado $ROOT/.env"
else
  echo "Ya existe $ROOT/.env, se conserva."
fi

step "Instalando dependencias del backend"
(cd "$BACKEND" && uv sync --dev)

step "Aplicando migraciones y creando administrador"
(cd "$BACKEND" && uv run python scripts/bootstrap_local.py)

step "Instalando dependencias del frontend"
(cd "$FRONTEND" && npm install)

step "Arrancando servidores"
mkdir -p "$LOG_DIR"
if port_open "$API_PORT"; then
  echo "El puerto $API_PORT ya está en uso: se asume que el backend ya corre."
else
  (cd "$BACKEND" && exec nohup uv run uvicorn app.main:app --reload --host 127.0.0.1 --port "$API_PORT") >"$LOG_DIR/backend.log" 2>&1 </dev/null &
  disown
  echo "Backend en segundo plano, log en $LOG_DIR/backend.log"
fi
if port_open "$WEB_PORT"; then
  echo "El puerto $WEB_PORT ya está en uso: se asume que el frontend ya corre."
else
  (cd "$FRONTEND" && exec nohup npm run dev -- --port "$WEB_PORT") >"$LOG_DIR/frontend.log" 2>&1 </dev/null &
  disown
  echo "Frontend en segundo plano, log en $LOG_DIR/frontend.log"
fi

step "Esperando a que la API responda"
ready=0
for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:$API_PORT/api/v1/health" >/dev/null 2>&1; then ready=1; break; fi
  sleep 2
done
[ "$ready" = 1 ] || fail "La API no respondió en 2 minutos. Revisa $LOG_DIR/backend.log"
for _ in $(seq 1 30); do port_open "$WEB_PORT" && break; sleep 2; done

cat <<MSG

Avendia 3.0 está lista.
  Abre:       http://127.0.0.1:$WEB_PORT
  Correo:     admin@avendia.com
  Contraseña: Avendia2026!

Para detener los servidores: pkill -f "uvicorn app.main"; pkill -f "vite"
MSG
if command -v xdg-open >/dev/null 2>&1; then xdg-open "http://127.0.0.1:$WEB_PORT" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then open "http://127.0.0.1:$WEB_PORT" || true; fi
