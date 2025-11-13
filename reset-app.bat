@echo off
REM ============================================================================
REM Sakr Store Manager - Complete App Reset Tool
REM ============================================================================
REM This batch file safely resets the application to a fresh state
REM 
REM What it does:
REM - Finds and deletes AppData\Roaming\SakrStoreManager
REM - Clears app temp files
REM - Optionally deletes project data (products.json, images)
REM - Restarts the application
REM
REM Usage:
REM   reset-app.bat          - Safe reset (keeps products)
REM   reset-app.bat /all     - Complete reset (deletes EVERYTHING)
REM ============================================================================

setlocal EnableDelayedExpansion

REM Check if running with /all parameter
set "DELETE_ALL=0"
if /i "%1"=="/all" set "DELETE_ALL=1"
if /i "%1"=="-all" set "DELETE_ALL=1"
if /i "%1"=="--all" set "DELETE_ALL=1"

cls
echo.
echo ============================================================================
echo              Sakr Store Manager - App Reset Tool
echo ============================================================================
echo.

REM ============================================================================
REM Detect all app-related paths
REM ============================================================================

echo [*] Detecting app data locations...
echo.

REM Get AppData paths
set "APPDATA_PATH=%APPDATA%\SakrStoreManager"
set "LOCALAPPDATA_PATH=%LOCALAPPDATA%\SakrStoreManager"
set "TEMP_PATH=%TEMP%\SakrStoreManager"

REM Try to find project path from existing config
set "PROJECT_PATH="
if exist "%APPDATA_PATH%\config.json" (
    echo [i] Found config.json, extracting project path...
    
    REM Use PowerShell to parse JSON (more reliable)
    for /f "delims=" %%i in ('powershell -Command "try { $json = Get-Content '%APPDATA_PATH%\config.json' -Raw | ConvertFrom-Json; Write-Output $json.projectPath } catch { Write-Output '' }"') do (
        set "PROJECT_PATH=%%i"
    )
    
    if not "!PROJECT_PATH!"=="" (
        echo [+] Project path found: !PROJECT_PATH!
    ) else (
        echo [!] Could not extract project path from config
    )
)

REM Display what was found
echo.
echo Detected locations:
echo   App Data:    %APPDATA_PATH%
echo   Local Data:  %LOCALAPPDATA_PATH%
echo   Temp Files:  %TEMP_PATH%
if not "!PROJECT_PATH!"=="" (
    echo   Project:     !PROJECT_PATH!
)
echo.

REM ============================================================================
REM Show what will be deleted
REM ============================================================================

if "%DELETE_ALL%"=="0" (
    echo ============================================================================
    echo                        SAFE RESET MODE
    echo ============================================================================
    echo.
    echo The following will be DELETED:
    echo   [X] All app settings and configurations
    echo   [X] GitHub credentials
    echo   [X] AppData folder: %APPDATA_PATH%
    echo   [X] Local AppData folder: %LOCALAPPDATA_PATH%
    echo   [X] Temp files: %TEMP_PATH%
    echo   [X] All cached data
    echo.
    echo The following will be SAFE:
    if not "!PROJECT_PATH!"=="" (
        echo   [OK] Project folder: !PROJECT_PATH!
        echo   [OK] products.json
        echo   [OK] All product images
    ) else (
        echo   [OK] All project data ^(location unknown^)
    )
    echo.
) else (
    echo ============================================================================
    echo              !!! COMPLETE RESET MODE - DANGER !!!
    echo ============================================================================
    echo.
    echo                 *** WARNING: This will DELETE EVERYTHING! ***
    echo.
    echo The following will be DELETED:
    echo   [X] All app settings and configurations
    echo   [X] GitHub credentials
    echo   [X] AppData folder: %APPDATA_PATH%
    echo   [X] Local AppData folder: %LOCALAPPDATA_PATH%
    echo   [X] Temp files: %TEMP_PATH%
    echo   [X] All cached data
    if not "!PROJECT_PATH!"=="" (
        echo   [X] Project folder: !PROJECT_PATH!
        echo   [X] products.json
        echo   [X] ALL product images
        echo   [X] EVERYTHING in the project folder!
    ) else (
        echo   [X] ALL project data ^(if found^)
    )
    echo.
    echo                 *** THIS CANNOT BE UNDONE! ***
    echo.
)

REM ============================================================================
REM Confirmation
REM ============================================================================

if "%DELETE_ALL%"=="0" (
    echo ----------------------------------------------------------------------------
    set /p "CONFIRM=Type 'RESET' to continue with safe reset: "
    if /i not "!CONFIRM!"=="RESET" (
        echo.
        echo [!] Reset cancelled.
        timeout /t 2 >nul
        exit /b 0
    )
) else (
    echo ----------------------------------------------------------------------------
    set /p "CONFIRM=Type 'DELETE EVERYTHING' to continue with complete reset: "
    if /i not "!CONFIRM!"=="DELETE EVERYTHING" (
        echo.
        echo [!] Reset cancelled.
        timeout /t 2 >nul
        exit /b 0
    )
)

echo.
echo [*] Starting reset process...
echo.

REM ============================================================================
REM Close the app if running
REM ============================================================================

echo [*] Checking if app is running...
tasklist /FI "IMAGENAME eq sakr-store-manager.exe" 2>NUL | find /I /N "sakr-store-manager.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [*] Closing Sakr Store Manager...
    taskkill /F /IM "sakr-store-manager.exe" /T >nul 2>&1
    timeout /t 2 >nul
    echo [+] App closed
) else (
    echo [i] App is not running
)

REM Also check for "Sakr Store Manager.exe" (with spaces)
tasklist /FI "IMAGENAME eq Sakr Store Manager.exe" 2>NUL | find /I /N "Sakr Store Manager.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [*] Closing Sakr Store Manager...
    taskkill /F /IM "Sakr Store Manager.exe" /T >nul 2>&1
    timeout /t 2 >nul
    echo [+] App closed
)

echo.

REM ============================================================================
REM Delete AppData
REM ============================================================================

echo [*] Deleting app data...

if exist "%APPDATA_PATH%" (
    echo [*] Removing: %APPDATA_PATH%
    rd /s /q "%APPDATA_PATH%" 2>nul
    if exist "%APPDATA_PATH%" (
        echo [!] Warning: Could not fully delete AppData folder
        echo [!] Some files may be in use
    ) else (
        echo [+] AppData folder deleted
    )
) else (
    echo [i] AppData folder does not exist
)

if exist "%LOCALAPPDATA_PATH%" (
    echo [*] Removing: %LOCALAPPDATA_PATH%
    rd /s /q "%LOCALAPPDATA_PATH%" 2>nul
    if exist "%LOCALAPPDATA_PATH%" (
        echo [!] Warning: Could not fully delete LocalAppData folder
    ) else (
        echo [+] LocalAppData folder deleted
    )
) else (
    echo [i] LocalAppData folder does not exist
)

if exist "%TEMP_PATH%" (
    echo [*] Removing: %TEMP_PATH%
    rd /s /q "%TEMP_PATH%" 2>nul
    if exist "%TEMP_PATH%" (
        echo [!] Warning: Could not fully delete Temp folder
    ) else (
        echo [+] Temp folder deleted
    )
) else (
    echo [i] Temp folder does not exist
)

echo.

REM ============================================================================
REM Delete project folder if requested
REM ============================================================================

if "%DELETE_ALL%"=="1" (
    if not "!PROJECT_PATH!"=="" (
        if exist "!PROJECT_PATH!" (
            echo [*] Deleting project folder: !PROJECT_PATH!
            echo.
            echo     This includes:
            echo     - products.json
            echo     - All images
            echo     - All project data
            echo.
            
            rd /s /q "!PROJECT_PATH!" 2>nul
            
            if exist "!PROJECT_PATH!" (
                echo [!] Warning: Could not fully delete project folder
                echo [!] Some files may be in use or protected
            ) else (
                echo [+] Project folder completely deleted
            )
        ) else (
            echo [i] Project folder does not exist
        )
    ) else (
        echo [i] Project path unknown, skipping
    )
    echo.
)

REM ============================================================================
REM Summary
REM ============================================================================

echo.
echo ============================================================================
echo                          Reset Complete!
echo ============================================================================
echo.

if "%DELETE_ALL%"=="0" (
    echo [+] App data has been reset
    echo [+] Your products and images are safe
    echo.
    echo The app will start fresh with default settings.
    echo You will need to:
    echo   - Set up GitHub sync again (if used)
    echo   - Reconfigure any custom settings
) else (
    echo [+] Complete reset finished
    echo [+] All app data deleted
    echo [+] All project data deleted
    echo.
    echo The app will start from scratch.
    echo You will need to:
    echo   - Create a new project folder
    echo   - Start fresh with products
)

echo.
echo ============================================================================
echo.

REM ============================================================================
REM Restart the app
REM ============================================================================

set /p "RESTART=Do you want to restart the app now? [Y/N]: "
if /i "!RESTART!"=="Y" (
    echo.
    echo [*] Attempting to restart the app...
    
    REM Try common locations
    if exist "%LOCALAPPDATA%\Programs\SakrStoreManager\sakr-store-manager.exe" (
        start "" "%LOCALAPPDATA%\Programs\SakrStoreManager\sakr-store-manager.exe"
        echo [+] App started
    ) else if exist "%PROGRAMFILES%\SakrStoreManager\sakr-store-manager.exe" (
        start "" "%PROGRAMFILES%\SakrStoreManager\sakr-store-manager.exe"
        echo [+] App started
    ) else (
        echo [!] Could not find app executable
        echo [!] Please start the app manually
    )
) else (
    echo.
    echo [i] You can start the app manually when ready
)

echo.
echo Press any key to exit...
pause >nul

endlocal
exit /b 0
