@echo off
REM Script to create icon files for Sakr Store Manager
REM Requires: npm install -g electron-icon-maker

echo Creating application icons...
echo.

REM Check if electron-icon-maker is installed
where electron-icon-maker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo electron-icon-maker not found. Installing...
    call npm install -g electron-icon-maker
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install electron-icon-maker
        echo Please install manually: npm install -g electron-icon-maker
        pause
        exit /b 1
    )
)

REM Create icons from SVG
echo Generating icons from build/icon.svg...
call electron-icon-maker --input=build/icon.svg --output=build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Icons created successfully!
    echo ========================================
    echo Location: build/
    echo Files:
    echo   - icon.ico   (Windows)
    echo   - icon.icns  (macOS)
    echo   - icon.png   (Linux)
    echo ========================================
) else (
    echo.
    echo Failed to create icons!
    echo Please check the error messages above.
)

pause
