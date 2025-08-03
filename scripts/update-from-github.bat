@echo off
echo.
echo =====================================
echo   Update from GitHub
echo =====================================
echo.
echo This will pull the latest changes from GitHub.
echo.

echo Current branch:
git branch --show-current
echo.

echo Checking for updates...
git fetch

echo.
echo Status:
git status
echo.

set /p CONTINUE="Pull latest changes? (y/n): "
if /i not "%CONTINUE%"=="y" (
    echo Update cancelled.
    pause
    exit /b
)

echo.
echo Pulling from GitHub...
git pull

echo.
echo Installing any new dependencies...
call npm install

echo.
echo =====================================
echo Update complete!
echo You can now run the app with:
echo   npm run dev:demo
echo =====================================
echo.
pause