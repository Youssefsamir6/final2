#!/usr/bin/env pwsh
# Smart Access System - AI Integration Startup Script (PowerShell)
# For Windows systems with PowerShell

param(
    [switch]$NoAI = $false,
    [switch]$Test = $false,
    [int]$BackendPort = 3000,
    [int]$AIPort = 5000
)

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $Message" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[✗] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "[i] $Message" -ForegroundColor Yellow
}

Write-Header "Smart Access AI Integration - System Startup"

# Check if in correct directory
if (-not (Test-Path "package.json")) {
    Write-Error "Please run this script from the smart-access-backend directory"
    exit 1
}

Write-Host "Checking prerequisites..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion found"
} catch {
    Write-Error "Node.js not found. Please install Node.js 18+: https://nodejs.org/"
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Success "$pythonVersion found"
} catch {
    Write-Error "Python not found. Please install Python 3.9+: https://python.org/"
    exit 1
}

# Check npm dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install Node.js dependencies"
        exit 1
    }
    Write-Success "Node.js dependencies installed"
} else {
    Write-Success "Node.js dependencies already installed"
}

# Setup Python environment if needed
if (-not $NoAI) {
    if (-not (Test-Path "ai-worker\venv\Scripts\activate.ps1")) {
        Write-Host ""
        Write-Host "Setting up Python environment..." -ForegroundColor Cyan
        
        Push-Location "ai-worker"
        try {
            python -m venv venv
            & ".\venv\Scripts\Activate.ps1"
            pip install -r requirements.txt
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to install Python dependencies"
                exit 1
            }
            Write-Success "Python environment set up"
        } finally {
            Pop-Location
        }
    } else {
        Write-Success "Python environment already exists"
    }
}

Write-Host ""
Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "All prerequisites ready. Starting services..." -ForegroundColor Green
Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

if (-not $NoAI) {
    Write-Host "Starting AI Worker on port $AIPort..." -ForegroundColor Cyan
    $aiProcess = Start-Process pwsh -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd ai-worker; `$env:PYTHONUNBUFFERED=1; . .\venv\Scripts\Activate.ps1; python app.py"
    ) -PassThru

    Write-Info "AI Worker started (PID: $($aiProcess.Id))"
    Start-Sleep -Seconds 3
}

Write-Host "Starting Backend on port $BackendPort..." -ForegroundColor Cyan
$backendProcess = Start-Process pwsh -ArgumentList @(
    "-NoExit",
    "-Command",
    "npm run dev"
) -PassThru

Write-Info "Backend started (PID: $($backendProcess.Id))"

Write-Host ""
Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "Services started:" -ForegroundColor Green
Write-Host "  • Backend:     http://localhost:$BackendPort" -ForegroundColor Yellow
if (-not $NoAI) {
    Write-Host "  • AI Worker:   http://localhost:$AIPort" -ForegroundColor Yellow
}
Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Info "Press Enter to open test dashboard in 3 seconds (Ctrl+C to skip)..."
Start-Sleep -Seconds 3

try {
    if ($Test) {
        Write-Host "Running integration tests..." -ForegroundColor Cyan
        Start-Sleep -Seconds 2
        node test-ai-integration.js
    } else {
        Write-Info "To test the integration, run in a new terminal:"
        Write-Host "  node test-ai-integration.js" -ForegroundColor Yellow
    }
} catch {
    Write-Info "Tests can be run manually with: node test-ai-integration.js"
}

Write-Host ""
Write-Info "System running. Press Ctrl+C to stop."
Write-Host ""

# Keep script running
while ($true) { Start-Sleep -Seconds 1 }
