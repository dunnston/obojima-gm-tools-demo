@echo off
echo.
echo ===================================
echo  Creating Distribution Package
echo ===================================
echo.
echo This will create a distribution-ready folder...
echo.

set "DIST_FOLDER=Obojima-Potions-Beta-v1.0"

cd /d "%~dp0"

if exist "%DIST_FOLDER%" (
    echo Removing existing distribution folder...
    rmdir /s /q "%DIST_FOLDER%"
)

echo Creating distribution folder...
mkdir "%DIST_FOLDER%"

echo Copying essential files...
xcopy /E /I /H ".next" "%DIST_FOLDER%\.next"
xcopy /E /I /H "src" "%DIST_FOLDER%\src"
xcopy /E /I /H "public" "%DIST_FOLDER%\public"

copy "package.json" "%DIST_FOLDER%\"
copy "package-lock.json" "%DIST_FOLDER%\"
copy "next.config.ts" "%DIST_FOLDER%\"
copy "tailwind.config.js" "%DIST_FOLDER%\"
copy "tsconfig.json" "%DIST_FOLDER%\"
copy "next-env.d.ts" "%DIST_FOLDER%\"
copy "eslint.config.mjs" "%DIST_FOLDER%\"
copy "postcss.config.mjs" "%DIST_FOLDER%\"

echo Copying user files...
copy "README-BETA-USERS.md" "%DIST_FOLDER%\"
copy "START-OBOJIMA-POTIONS.bat" "%DIST_FOLDER%\"
copy "SETUP-FIRST-TIME.bat" "%DIST_FOLDER%\"
copy "LICENSE.md" "%DIST_FOLDER%\"

echo Copying optional documentation...
copy "CREATURE-MANAGEMENT.md" "%DIST_FOLDER%\"

echo.
echo ✅ Distribution package created in: %DIST_FOLDER%\
echo.
echo To share:
echo 1. Compress the "%DIST_FOLDER%" folder to ZIP
echo 2. Share the ZIP file with beta testers
echo 3. Include instructions from README-BETA-USERS.md
echo.
pause