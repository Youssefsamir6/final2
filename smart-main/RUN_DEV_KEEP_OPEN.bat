@echo off
setlocal

REM Keeps window open + logs output (live) to dev.log.
cd /d "%~dp0"

echo ================================
echo Smart Secure Campus - DEV
echo Project: %CD%
echo ================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found in PATH.
  echo Install Node.js (LTS) then reopen this terminal.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting dev server...
echo Logging to: dev.log
echo.

REM Use PowerShell for reliable live logging + console output.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "npm run dev 2^>^&1 ^| Tee-Object -FilePath 'dev.log' -Append"

echo.
echo Dev server stopped.
pause

