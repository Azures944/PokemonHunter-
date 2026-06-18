@echo off
echo ========================================
echo   WildBound - Starting Expo Go Server
echo ========================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download it from: https://nodejs.org
    echo Choose the LTS version, install it, then run this file again.
    pause
    exit /b 1
)

echo [OK] Node.js found
echo.

:: Install dependencies if missing
if not exist "node_modules\" (
    echo Installing dependencies... this takes ~1 minute the first time.
    echo.
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ERROR: npm install failed.
        pause
        exit /b 1
    )
)

echo [OK] Dependencies ready
echo.
echo ========================================
echo  Scan the QR code below with Expo Go!
echo  (Download Expo Go from App/Play Store)
echo ========================================
echo.

npx expo start

pause
