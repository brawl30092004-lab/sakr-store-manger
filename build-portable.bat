@echo off
echo ========================================
echo Sakr Store Manager - Portable Builder
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [ERROR] node_modules not found!
    echo Please run: npm install
    echo.
    pause
    exit /b 1
)

REM Check if build/icon.ico exists
if not exist "build\icon.ico" (
    echo [WARNING] Icon not found! Generating...
    node generate-icon.js
    if errorlevel 1 (
        echo [ERROR] Failed to generate icon
        pause
        exit /b 1
    )
    echo [OK] Icon generated
    echo.
)

echo [Step 1/3] Cleaning old builds...
if exist "release\" (
    rmdir /s /q "release\"
    echo [OK] Old builds removed
) else (
    echo [OK] No old builds to clean
)
echo.

echo [Step 2/3] Building Vite project...
call npm run build
if errorlevel 1 (
    echo [ERROR] Vite build failed!
    pause
    exit /b 1
)
echo [OK] Vite build complete
echo.

echo [Step 3/3] Creating portable executable...
echo This may take 2-5 minutes...
echo.
call npm run electron:build:portable
if errorlevel 1 (
    echo [ERROR] Portable build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo BUILD SUCCESSFUL!
echo ========================================
echo.
echo Your portable app is ready:
echo release\Sakr Store Manager v1.0.0 Portable.exe
echo.
echo File size: ~180-220 MB
echo.
echo [NEXT STEPS]
echo 1. Test: Run the .exe file
echo 2. Verify: Check all features work
echo 3. Distribute: Share the .exe file
echo.
echo Press any key to view the release folder...
pause > nul
explorer release
