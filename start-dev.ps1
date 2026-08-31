# ============================================================
#  AUTOMATED RECOGNITION ATTENDANCE SYSTEM — Dev Startup Script
#  รัน: .\start-dev.ps1
#  หยุด: .\start-dev.ps1 -Stop
# ============================================================

param(
    [switch]$Stop
)

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$CCTV_DIR    = Join-Path $ROOT "cctv"
$BACKEND_DIR = Join-Path $ROOT "backend-node"
$FRONTEND_DIR= Join-Path $ROOT "frontend-vue"
$VENV_PYTHON = Join-Path $CCTV_DIR ".venv310\Scripts\python.exe"

# ── สี ──────────────────────────────────────────────────────
function Write-Step  { param($msg) Write-Host "  → $msg" -ForegroundColor Cyan }
function Write-OK    { param($msg) Write-Host "  ✔ $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Write-Fail  { param($msg) Write-Host "  ✖ $msg" -ForegroundColor Red }
function Write-Title { param($msg) Write-Host "`n$msg" -ForegroundColor Magenta }

# ── หยุดทุก service ─────────────────────────────────────────
if ($Stop) {
    Write-Title "═══ หยุด Dev Services ═══"
    Get-Process -Name python  -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq '' } | Stop-Process -Force
    Get-Process -Name node    -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-OK "หยุดทุก process แล้ว"
    exit 0
}

# ════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   AUTOMATED RECOGNITION ATTENDANCE SYSTEM            ║" -ForegroundColor Magenta
Write-Host "║   Dev Startup Script                                 ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# ── 1. ตรวจสอบ Port ที่จำเป็น ───────────────────────────────
Write-Title "[ 1/4 ] ตรวจสอบ Port"

function Test-PortFree {
    param([int]$port)
    $result = netstat -ano | Select-String ":$port\s" | Where-Object { $_ -match "LISTENING" }
    return ($null -eq $result -or $result.Count -eq 0)
}

$ports = @{ 5000 = "Python CCTV"; 8212 = "Node Backend"; 8081 = "Vue Frontend" }
$blocked = $false
foreach ($p in $ports.Keys) {
    if (Test-PortFree $p) {
        Write-OK "Port $p ($($ports[$p])) — ว่างอยู่"
    } else {
        Write-Warn "Port $p ($($ports[$p])) — ถูกใช้งานอยู่แล้ว (จะ skip)"
    }
}

# ── 2. ตรวจสอบ Python venv ──────────────────────────────────
Write-Title "[ 2/4 ] ตรวจสอบ Python CCTV Environment"

if (-not (Test-Path $VENV_PYTHON)) {
    Write-Warn ".venv310 ยังไม่มี — กำลัง setup..."
    Write-Step "กำลัง create venv..."
    & python -m venv (Join-Path $CCTV_DIR ".venv310")
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "สร้าง venv ไม่สำเร็จ — ตรวจสอบว่าติดตั้ง Python 3.11 แล้ว"
        exit 1
    }
    Write-Step "กำลัง install packages (อาจใช้เวลา 5-10 นาที)..."
    & $VENV_PYTHON -m pip install --upgrade pip setuptools wheel -q
    & $VENV_PYTHON -m pip install -r (Join-Path $CCTV_DIR "requirements.txt") -q
    Write-OK "ติดตั้ง packages สำเร็จ"
} else {
    Write-OK ".venv310 พร้อมใช้งาน"
}

# ── 3. ตรวจสอบ Node Modules ─────────────────────────────────
Write-Title "[ 3/4 ] ตรวจสอบ Node Modules"

if (-not (Test-Path (Join-Path $BACKEND_DIR "node_modules"))) {
    Write-Step "Backend node_modules ไม่มี — npm install..."
    npm install --prefix $BACKEND_DIR --silent
    Write-OK "Backend npm install สำเร็จ"
} else {
    Write-OK "Backend node_modules พร้อมแล้ว"
}

if (-not (Test-Path (Join-Path $FRONTEND_DIR "node_modules"))) {
    Write-Step "Frontend node_modules ไม่มี — npm install..."
    npm install --prefix $FRONTEND_DIR --silent
    Write-OK "Frontend npm install สำเร็จ"
} else {
    Write-OK "Frontend node_modules พร้อมแล้ว"
}

# ── 4. รัน Services ─────────────────────────────────────────
Write-Title "[ 4/4 ] รัน Services"

# Python CCTV Service → port 5000
if (Test-PortFree 5000) {
    Write-Step "เปิด Python CCTV Service (port 5000)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command",
        "Write-Host '🐍 Python CCTV Service' -ForegroundColor Cyan; Set-Location '$CCTV_DIR'; & '$VENV_PYTHON' app.py" `
        -WindowStyle Normal
    Write-OK "Python CCTV Service เปิดแล้ว"
} else {
    Write-Warn "Python CCTV Service ข้ามเพราะ port 5000 ถูกใช้งานอยู่"
}

Start-Sleep -Seconds 2

# Node.js Backend → port 8212
if (Test-PortFree 8212) {
    Write-Step "เปิด Node.js Backend (port 8212)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command",
        "Write-Host '⚙️  Node.js Backend' -ForegroundColor Yellow; Set-Location '$BACKEND_DIR'; npm run start:local" `
        -WindowStyle Normal
    Write-OK "Node.js Backend เปิดแล้ว"
} else {
    Write-Warn "Node.js Backend ข้ามเพราะ port 8212 ถูกใช้งานอยู่"
}

Start-Sleep -Seconds 2

# Vue Frontend → port 8081
if (Test-PortFree 8081) {
    Write-Step "เปิด Vue Frontend (port 8081)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command",
        "Write-Host '🌐 Vue Frontend' -ForegroundColor Green; Set-Location '$FRONTEND_DIR'; npm run serve" `
        -WindowStyle Normal
    Write-OK "Vue Frontend เปิดแล้ว"
} else {
    Write-Warn "Vue Frontend ข้ามเพราะ port 8081 ถูกใช้งานอยู่"
}

# ── สรุป ────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✔  ทุก Service กำลังเริ่มต้น                        ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  🐍 CCTV Python  →  http://localhost:5000            ║" -ForegroundColor Green
Write-Host "║  ⚙️  Node Backend →  http://localhost:8212            ║" -ForegroundColor Green
Write-Host "║  🌐 Vue Frontend →  http://localhost:8081            ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  หยุดทุก service: .\start-dev.ps1 -Stop              ║" -ForegroundColor DarkGray
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
