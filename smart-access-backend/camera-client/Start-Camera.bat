@echo off
REM Smart Access Camera Client Startup Script for Windows

echo ========================================
echo Smart Access Camera Client
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo WARNING: .env file not found
    echo Copying .env.example to .env...
    copy .env.example .env
    echo Please edit .env file with your settings before continuing
    pause
)

REM Check if dependencies are installed
echo Checking dependencies...
pip show opencv-python >nul 2>&1
if errorlevel 1 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting Camera Client...
echo Press Ctrl+C to stop
echo.

REM Start the camera client
python camera_client.py --preview

pause