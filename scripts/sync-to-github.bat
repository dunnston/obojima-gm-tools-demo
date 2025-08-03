@echo off
echo.
echo =====================================
echo   Sync to GitHub
echo =====================================
echo.
echo This will push your current changes to GitHub.
echo.

echo Current branch:
git branch --show-current
echo.

echo Status:
git status --short
echo.

set /p CONTINUE="Continue with push? (y/n): "
if /i not "%CONTINUE%"=="y" (
    echo Push cancelled.
    pause
    exit /b
)

echo.
echo Pushing to GitHub...
git push

echo.
echo =====================================
echo Push complete!
echo.
echo To update on your server:
echo   git pull
echo =====================================
echo.
pause