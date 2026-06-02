@echo off
REM Smart Access System - Full Integration Startup Script
REM This script starts both the Node.js backend and Python AI worker

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     Smart Access AI Integration - System Startup       ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if running in the smart-access-backend directory
if not exist "package.json" (
    echo Error: Please run this script from the smart-access-backend directory
    pause
    exit /b 1
)

REM Colors
for /f %%A in ('copy /Z "%~f0" nul') do set "BS=%%A"

echo [1/3] Checking prerequisites...
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo %BS%[91mError: Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found

REM Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo %BS%[91mError: Python not found. Please install Python 3.9+
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo [OK] %PYTHON_VERSION% found

REM Check npm dependencies
if not exist "node_modules" (
    echo.
    echo [2/3] Installing Node.js dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo %BS%[91mError: Failed to install Node.js dependencies
        pause
        exit /b 1
    )
) else (
    echo [2/3] Node.js dependencies already installed
)

REM Check Python dependencies
if not exist "ai-worker\venv" (
    echo.
    echo [3/3] Setting up Python environment...
    cd ai-worker
    
    REM Create virtual environment
    python -m venv venv
    call venv\Scripts\activate.bat
    
    REM Install requirements
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo %BS%[91mError: Failed to install Python dependencies
        pause
        exit /b 1
    )
    cd ..
) else (
    echo [3/3] Python environment already exists
)

echo.
echo ═════════════════════════════════════════════════════════
echo All prerequisites ready. Starting services...
echo ═════════════════════════════════════════════════════════
echo.

REM Create two terminal windows - one for backend, one for AI worker
echo Starting AI Worker on port 5000...
start cmd /k "cd ai-worker && venv\Scripts\activate.bat && python app.py"

timeout /t 3

echo Starting Backend on port 3000...
start cmd /k "npm run dev"

echo.
echo ═════════════════════════════════════════════════════════
echo Services started:
echo   - Backend:     http://localhost:3000
echo   - AI Worker:   http://localhost:5000
echo ═════════════════════════════════════════════════════════
echo.
echo To test the integration, run in a new terminal:
echo   node test-ai-integration.js
echo.
pause
