# ============================================
# Smart Access System - Complete Startup (PowerShell)
# ============================================
# Usage: .\START_ALL_SERVICES.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SMART ACCESS SYSTEM - STARTUP" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get the directory where this script is located
$scriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

# Change to project root
Set-Location $scriptDir

Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting all services..." -ForegroundColor Green
Write-Host ""

# Start AI Worker in new window
Write-Host "[1/3] Starting AI Worker (Python) on port 5000..." -ForegroundColor Cyan
$aiWorkerCmd = @"
cd '$($scriptDir)\smart-access-backend\ai-worker'
Write-Host '🤖 AI Worker starting...' -ForegroundColor Green
.\venv\Scripts\python.exe app.py
"@

Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $aiWorkerCmd -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Backend in new window
Write-Host "[2/3] Starting Backend Server (Node.js) on port 3000..." -ForegroundColor Cyan
$backendCmd = @"
cd '$($scriptDir)\smart-access-backend'
Write-Host '🔧 Backend starting...' -ForegroundColor Green
npm run dev
"@

Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Frontend in new window
Write-Host "[3/3] Starting Frontend (Next.js) on port 3001..." -ForegroundColor Cyan
$frontendCmd = @"
cd '$($scriptDir)\smart-main'
Write-Host '🎨 Frontend starting...' -ForegroundColor Green
npm run dev
"@

Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ✅ All services started!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access the system at:" -ForegroundColor Yellow
Write-Host "   🎨 Frontend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "   🔧 Backend:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "   🤖 AI Worker: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Check the startup guide:" -ForegroundColor Yellow
Write-Host "   SYSTEM_STARTUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
