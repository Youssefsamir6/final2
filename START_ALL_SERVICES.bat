@echo off
REM ============================================
REM Smart Access System - Complete Startup
REM ============================================
REM This script starts all services:
REM - AI Worker (Python, Port 5000)
REM - Backend (Node.js, Port 3000)
REM - Frontend (Next.js, Port 3001)
REM - Database (SQL Server)
REM ============================================

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ============================================
echo  SMART ACCESS SYSTEM - STARTUP
echo ============================================
echo.
echo This will open 3 new terminal windows:
echo  1. AI Worker (Python) - Port 5000
echo  2. Backend Server (Node.js) - Port 3000
echo  3. Frontend (Next.js) - Port 3001
echo.
echo Prerequisites:
echo  ✓ SQL Server running
echo  ✓ Node.js installed
echo  ✓ Python installed
echo.

REM Start AI Worker
echo.
echo [1/3] Starting AI Worker (Python)...
start "AI Worker - Port 5000" cmd /k ^
  cd /d "%CD%\smart-access-backend\ai-worker" ^& ^
  .\venv\Scripts\python.exe app.py

timeout /t 3 /nobreak

REM Start Backend
echo [2/3] Starting Backend Server (Node.js)...
start "Backend - Port 3000" cmd /k ^
  cd /d "%CD%\smart-access-backend" ^& ^
  npm run dev

timeout /t 3 /nobreak

REM Start Frontend
echo [3/3] Starting Frontend (Next.js)...
start "Frontend - Port 3001" cmd /k ^
  cd /d "%CD%\smart-main" ^& ^
  npm run dev

echo.
echo ============================================
echo  ✅ All services starting!
echo ============================================
echo.
echo Access the system at:
echo   Frontend:  http://localhost:3001
echo   Backend:   http://localhost:3000
echo   AI Worker: http://localhost:5000
echo.
echo Close any terminal window to stop that service.
echo.
pause
