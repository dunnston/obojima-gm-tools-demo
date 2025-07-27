@echo off
echo.
echo ===================================
echo  Obojima Potions - First Time Setup
echo ===================================
echo.
echo This will install the necessary dependencies.
echo This only needs to be run once!
echo.
echo Please wait while we set everything up...
echo.

cd /d "%~dp0"

echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ Installation failed!
    echo.
    echo Please make sure you have Node.js installed from:
    echo https://nodejs.org/
    echo.
    echo Then try running this setup again.
    pause
    exit /b 1
)

echo.
echo ✅ Setup completed successfully!
echo.
echo You can now run "START-OBOJIMA-POTIONS.bat" to start the application.
echo.
pause