@echo off
echo.
echo =====================================
echo   GitHub Repository Setup
echo =====================================
echo.
echo This will add a GitHub remote to your repository.
echo.
echo Please enter your GitHub repository URL
echo Example: https://github.com/yourusername/obojima-potions-demo.git
echo.
set /p REPO_URL="GitHub Repository URL: "

echo.
echo Adding GitHub as remote 'origin'...
git remote add origin %REPO_URL%

echo.
echo Checking remote configuration...
git remote -v

echo.
echo Current branch status:
git branch

echo.
echo =====================================
echo Setup complete! 
echo.
echo To push your current branch to GitHub:
echo   git push -u origin demo-mode-implementation
echo.
echo To push master branch:
echo   git checkout master
echo   git push -u origin master
echo =====================================
echo.
pause