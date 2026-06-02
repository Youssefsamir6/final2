@echo off
setlocal enabledelayedexpansion

REM Smart Secure Campus - Dev Runner
cd /d "%~dp0"

echo ============================================
echo Smart Secure Campus - Starting Dev Server...
echo Project: %CD%
echo ============================================

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERROR: npm was not found in PATH.
  echo Install Node.js (LTS) then reopen this terminal.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo.
  echo node_modules not found. Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Running: npm run dev
echo.
call npm run dev

echo.
echo Dev server stopped.
pause

