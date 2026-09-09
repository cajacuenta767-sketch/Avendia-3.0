# Instala, prepara y abre Avendia 3.0 en esta computadora con un solo comando.
#
#   powershell -ExecutionPolicy Bypass -File .\iniciar-local.ps1
#
# Requisitos: Node.js 20 o superior. uv se instala solo si falta.
# Sin PostgreSQL usa SQLite automáticamente (archivo backend\avendia3-dev.db).

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"
$ApiPort = 8001
$WebPort = 5173

function Step($text) { Write-Host ""; Write-Host "==> $text" -ForegroundColor Cyan }
function Fail($text) { Write-Host ""; Write-Host "ERROR: $text" -ForegroundColor Red; exit 1 }

function Test-Port($port) {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $client.Connect("127.0.0.1", $port)
        $client.Close()
        return $true
    } catch { return $false }
}

Step "Comprobando Node.js"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Fail "Node.js no está instalado. Descárgalo de https://nodejs.org (versión LTS) y vuelve a ejecutar este archivo."
}
Write-Host "Node.js $(node --version)"

Step "Comprobando uv"
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando uv..."
    Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
    $env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
    if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
        Fail "uv se instaló pero no está en el PATH. Cierra esta ventana, ábrela de nuevo y vuelve a ejecutar."
    }
}
Write-Host "uv $(uv --version)"

Step "Preparando archivo .env"
$EnvFile = Join-Path $Root ".env"
if (-not (Test-Path $EnvFile)) {
    $content = Get-Content (Join-Path $Root ".env.example") -Raw
    $secret = -join ((1..48) | ForEach-Object { [char](Get-Random -InputObject ([int[]]([char]'a'..[char]'z') + [int[]]([char]'0'..[char]'9'))) })
    $content = $content -replace "JWT_SECRET_KEY=.*", "JWT_SECRET_KEY=$secret"
    if (Test-Port 5432) {
        Write-Host "PostgreSQL detectado en el puerto 5432: se usará la URL de .env.example."
    } else {
        Write-Host "PostgreSQL no detectado: se usará SQLite (backend\avendia3-dev.db)."
        $content = $content -replace "DATABASE_URL=.*", "DATABASE_URL=sqlite+aiosqlite:///./avendia3-dev.db"
    }
    Set-Content -Path $EnvFile -Value $content -Encoding UTF8
    Write-Host "Creado $EnvFile"
} else {
    Write-Host "Ya existe $EnvFile, se conserva."
}

Step "Instalando dependencias del backend"
Push-Location $Backend
uv sync --dev
if ($LASTEXITCODE -ne 0) { Pop-Location; Fail "uv sync falló." }

Step "Aplicando migraciones y creando administrador"
uv run python scripts/bootstrap_local.py
if ($LASTEXITCODE -ne 0) { Pop-Location; Fail "bootstrap_local.py falló. Revisa DATABASE_URL en .env." }
Pop-Location

Step "Instalando dependencias del frontend"
Push-Location $Frontend
npm install
if ($LASTEXITCODE -ne 0) { Pop-Location; Fail "npm install falló." }
Pop-Location

Step "Arrancando servidores"
if (Test-Port $ApiPort) {
    Write-Host "El puerto $ApiPort ya está en uso: se asume que el backend ya corre."
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Backend'; uv run uvicorn app.main:app --reload --host 127.0.0.1 --port $ApiPort"
}
if (Test-Port $WebPort) {
    Write-Host "El puerto $WebPort ya está en uso: se asume que el frontend ya corre."
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Frontend'; npm run dev"
}

Step "Esperando a que la API responda"
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
    try {
        $r = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$ApiPort/api/v1/health" -TimeoutSec 2
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch { Start-Sleep -Seconds 2 }
}
if (-not $ready) { Fail "La API no respondió en 2 minutos. Revisa la ventana del backend." }

for ($i = 0; $i -lt 30; $i++) { if (Test-Port $WebPort) { break }; Start-Sleep -Seconds 2 }

Write-Host ""
Write-Host "Avendia 3.0 está lista." -ForegroundColor Green
Write-Host "  Abre:       http://127.0.0.1:$WebPort"
Write-Host "  Correo:     admin@avendia.com"
Write-Host "  Contraseña: Avendia2026!"
Write-Host ""
Write-Host "Los servidores siguen corriendo en las dos ventanas abiertas. Ciérralas para detenerlos."
Start-Process "http://127.0.0.1:$WebPort"
