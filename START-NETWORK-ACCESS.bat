@echo off
echo.
echo ===================================
echo  Obojima Potions - Network Access
echo ===================================
echo.
echo Starting server accessible from other devices...
echo.
echo Your computer's IP address: 192.168.1.224
echo.
echo To access from other devices on your network:
echo Open a browser and go to: http://192.168.1.224:3000
echo.
echo To stop the server, close this window or press Ctrl+C
echo.

cd /d "%~dp0"
npm run dev-network

pause