@echo off
REM ============================================================
REM Smart Access & Monitoring System - Complete Demo Startup
REM ============================================================
REM This script starts all required services for the demo:
REM 1. AI Worker (Python FastAPI)
REM 2. Backend (Node.js Express)
REM 3. Frontend (Next.js)
REM ============================================================

echo.
echo ============================================================
echo   Smart Access System - Complete Demo Startup
echo ============================================================
echo.

REM Check if we're in the right directory
if not exist "smart-access-backend" (
    echo ERROR: Could not find smart-access-backend directory
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "smart-main" (
    echo ERROR: Could not find smart-main directory
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo Starting services...
echo.

REM Terminal 1: AI Worker
echo [1/4] Starting AI Worker...
start "AI Worker" cmd /k "cd smart-access-backend\ai-worker && if not exist venv (python -m venv venv) && .\venv\Scripts\activate && if not exist .\venv\Lib\site-packages\fastapi (pip install -r requirements.txt) && python app.py"
timeout /t 3 /nobreak > nul

REM Terminal 2: Backend
echo [2/4] Starting Backend Server...
start "Backend" cmd /k "cd smart-access-backend && if not exist node_modules (npm install) && npm start"
timeout /t 3 /nobreak > nul

REM Terminal 3: Seed Data
echo [3/4] Seeding test data...
cd smart-access-backend
call npm run seed
cd ..
echo.

REM Terminal 4: Frontend
echo [4/4] Starting Frontend...
start "Frontend" cmd /k "cd smart-main && if not exist node_modules (npm install) && npm run dev"

echo.
echo ============================================================
echo   All services started!
echo ============================================================
echo.
echo Services:
echo   - AI Worker:    http://localhost:5000
echo   - Backend:      http://localhost:3000
echo   - Frontend:     http://localhost:3001
echo.
echo Test Credentials:
echo   - Email:    admin@test.com
echo   - Password: admin123
echo.
echo Press any key to verify services...
pause > nul

echo.
echo Verifying services...
echo.

REM Verify Backend
curl -s http://localhost:3000/health | findstr "status" > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is running
) else (
    echo [WAITING] Backend is starting up...
)

REM Verify AI Worker (give it more time)
timeout /t 5 /nobreak > nul
curl -s http://localhost:5000/health | findstr "status" > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] AI Worker is running
) else (
    echo [WAITING] AI Worker is starting up (models loading)...
)

echo.
echo ============================================================
echo   Demo Ready!
echo ============================================================
echo.
echo Open your browser to: http://localhost:3001
echo.
echo For camera client demo, run:
echo   cd smart-access-backend\camera-client
echo   .\venv\Scripts\activate
echo   pip install -r requirements.txt
echo   python camera_client.py --preview
echo.
echo See DEMO_READY_GUIDE.md for complete demo instructions.
echo.
pause