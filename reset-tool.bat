@echo off
REM ============================================================================
REM Sakr Store Manager - Unified Reset Tool
REM ============================================================================
REM Complete reset toolkit with multiple options
REM ============================================================================

setlocal EnableDelayedExpansion

:MENU
cls
echo.
echo ============================================================================
echo              Sakr Store Manager - Reset Tool
echo ============================================================================
echo.
echo Please choose a reset option:
echo.
echo   [1] Quick Safe Reset
echo       - Fast and simple
echo       - Deletes app settings only
echo       - KEEPS your products and images safe
echo       - Recommended for fixing app issues
echo.
echo   [2] Smart Reset (Safe Mode)
echo       - Shows detailed information
echo       - Detects all locations automatically
echo       - Deletes app settings only
echo       - KEEPS your products and images safe
echo       - Includes confirmation
echo.
echo   [3] Complete Reset (DANGER!)
echo       - Deletes EVERYTHING
echo       - App settings + Project folder + Products + Images
echo       - Use only if starting fresh
echo       - Multiple confirmations required
echo.
echo   [4] Nuclear Reset (DEVELOPERS ONLY)
echo       - Most thorough cleanup
echo       - Searches entire system for traces
echo       - Deletes cache, prefetch, recent items
echo       - For testing/debugging only
echo.
echo   [0] Exit
echo.
echo ============================================================================
echo.

set /p "CHOICE=Enter your choice [0-4]: "

if "%CHOICE%"=="0" goto EXIT
if "%CHOICE%"=="1" goto QUICK_RESET
if "%CHOICE%"=="2" goto SMART_RESET
if "%CHOICE%"=="3" goto COMPLETE_RESET
if "%CHOICE%"=="4" goto NUCLEAR_RESET

echo.
echo Invalid choice. Please try again.
timeout /t 2 >nul
goto MENU

REM ============================================================================
REM QUICK RESET - Fast and Simple
REM ============================================================================
:QUICK_RESET

cls
echo.
echo ============================================================================
echo                     QUICK SAFE RESET
echo ============================================================================
echo.
echo This will reset the app to default settings.
echo Your products and images will be SAFE.
echo.
echo What will be deleted:
echo   - App settings
echo   - GitHub credentials
echo   - Cache files
echo.
echo What will be safe:
echo   - Your products (products.json)
echo   - Product images
echo   - Project folder
echo.
echo ============================================================================
echo.
pause

cls
echo.
echo [*] Resetting app...
echo.

REM Close the app
echo [*] Checking for running app...
taskkill /F /IM "sakr-store-manager.exe" /T >nul 2>&1
taskkill /F /IM "Sakr Store Manager.exe" /T >nul 2>&1
timeout /t 2 >nul

REM Delete AppData folders - check all possible names
set "DELETED=0"

if exist "%APPDATA%\SakrStoreManager" (
    echo [*] Deleting: %APPDATA%\SakrStoreManager
    rd /s /q "%APPDATA%\SakrStoreManager" 2>nul
    set "DELETED=1"
)

if exist "%APPDATA%\sakr-store-manager" (
    echo [*] Deleting: %APPDATA%\sakr-store-manager
    rd /s /q "%APPDATA%\sakr-store-manager" 2>nul
    set "DELETED=1"
)

if exist "%LOCALAPPDATA%\SakrStoreManager" (
    echo [*] Deleting: %LOCALAPPDATA%\SakrStoreManager
    rd /s /q "%LOCALAPPDATA%\SakrStoreManager" 2>nul
    set "DELETED=1"
)

if exist "%LOCALAPPDATA%\sakr-store-manager" (
    echo [*] Deleting: %LOCALAPPDATA%\sakr-store-manager
    rd /s /q "%LOCALAPPDATA%\sakr-store-manager" 2>nul
    set "DELETED=1"
)

if exist "%TEMP%\SakrStoreManager" (
    echo [*] Deleting: %TEMP%\SakrStoreManager
    rd /s /q "%TEMP%\SakrStoreManager" 2>nul
    set "DELETED=1"
)

if exist "%TEMP%\sakr-store-manager" (
    echo [*] Deleting: %TEMP%\sakr-store-manager
    rd /s /q "%TEMP%\sakr-store-manager" 2>nul
    set "DELETED=1"
)

echo.
if "%DELETED%"=="1" (
    echo [+] Reset complete!
    echo [+] Your products and images are safe
) else (
    echo [!] No app data found to delete
)

echo.
echo Press any key to return to menu...
pause >nul
goto MENU

REM ============================================================================
REM SMART RESET - Detailed with Auto-Detection
REM ============================================================================
:SMART_RESET

cls
echo.
echo ============================================================================
echo                    SMART RESET - SAFE MODE
echo ============================================================================
echo.

echo [*] Detecting app data locations...
echo.

REM Detect all possible AppData locations
set "FOUND_APPDATA="
set "FOUND_LOCALAPPDATA="
set "FOUND_TEMP="
set "PROJECT_PATH="

REM Check AppData variations
if exist "%APPDATA%\SakrStoreManager" (
    set "FOUND_APPDATA=%APPDATA%\SakrStoreManager"
    echo [+] Found: %APPDATA%\SakrStoreManager
)

if exist "%APPDATA%\sakr-store-manager" (
    set "FOUND_APPDATA=%APPDATA%\sakr-store-manager"
    echo [+] Found: %APPDATA%\sakr-store-manager
)

if exist "%APPDATA%\Sakr Store Manager" (
    set "FOUND_APPDATA=%APPDATA%\Sakr Store Manager"
    echo [+] Found: %APPDATA%\Sakr Store Manager
)

REM Check LocalAppData variations
if exist "%LOCALAPPDATA%\SakrStoreManager" (
    set "FOUND_LOCALAPPDATA=%LOCALAPPDATA%\SakrStoreManager"
    echo [+] Found: %LOCALAPPDATA%\SakrStoreManager
)

if exist "%LOCALAPPDATA%\sakr-store-manager" (
    set "FOUND_LOCALAPPDATA=%LOCALAPPDATA%\sakr-store-manager"
    echo [+] Found: %LOCALAPPDATA%\sakr-store-manager
)

if exist "%LOCALAPPDATA%\Sakr Store Manager" (
    set "FOUND_LOCALAPPDATA=%LOCALAPPDATA%\Sakr Store Manager"
    echo [+] Found: %LOCALAPPDATA%\Sakr Store Manager
)

REM Check Temp variations
if exist "%TEMP%\SakrStoreManager" (
    set "FOUND_TEMP=%TEMP%\SakrStoreManager"
    echo [+] Found: %TEMP%\SakrStoreManager
)

if exist "%TEMP%\sakr-store-manager" (
    set "FOUND_TEMP=%TEMP%\sakr-store-manager"
    echo [+] Found: %TEMP%\sakr-store-manager
)

REM Try to extract project path from config
if not "!FOUND_APPDATA!"=="" (
    if exist "!FOUND_APPDATA!\config.json" (
        echo.
        echo [i] Found config.json, extracting project path...
        
        for /f "delims=" %%i in ('powershell -Command "try { $json = Get-Content '!FOUND_APPDATA!\config.json' -Raw | ConvertFrom-Json; Write-Output $json.projectPath } catch { Write-Output '' }"') do (
            set "PROJECT_PATH=%%i"
        )
        
        if not "!PROJECT_PATH!"=="" (
            echo [+] Project path: !PROJECT_PATH!
            
            REM Check if .git folder exists
            if exist "!PROJECT_PATH!\.git" (
                echo [i] Git repository detected
            )
        )
    )
)

echo.
echo ============================================================================
echo.

REM Show what will be deleted
echo What will be DELETED:
echo   [X] All app settings and configurations
echo   [X] GitHub credentials and cache

if not "!FOUND_APPDATA!"=="" (
    echo   [X] !FOUND_APPDATA!
)

if not "!FOUND_LOCALAPPDATA!"=="" (
    echo   [X] !FOUND_LOCALAPPDATA!
)

if not "!FOUND_TEMP!"=="" (
    echo   [X] !FOUND_TEMP!
)

echo.
echo What will be SAFE:
if not "!PROJECT_PATH!"=="" (
    echo   [OK] Project folder: !PROJECT_PATH!
    echo   [OK] products.json
    echo   [OK] All images
    echo   [OK] .git repository
) else (
    echo   [OK] All project data
)

echo.
echo ============================================================================
echo.

set /p "CONFIRM=Type 'RESET' to continue: "
if /i not "!CONFIRM!"=="RESET" (
    echo.
    echo [!] Reset cancelled.
    timeout /t 2 >nul
    goto MENU
)

echo.
echo [*] Starting reset...
echo.

REM Close app
echo [*] Closing app...
taskkill /F /IM "sakr-store-manager.exe" /T >nul 2>&1
taskkill /F /IM "Sakr Store Manager.exe" /T >nul 2>&1
timeout /t 2 >nul

REM Delete folders
if not "!FOUND_APPDATA!"=="" (
    echo [*] Deleting: !FOUND_APPDATA!
    rd /s /q "!FOUND_APPDATA!" 2>nul
    if not exist "!FOUND_APPDATA!" (
        echo [+] Deleted
    )
)

if not "!FOUND_LOCALAPPDATA!"=="" (
    echo [*] Deleting: !FOUND_LOCALAPPDATA!
    rd /s /q "!FOUND_LOCALAPPDATA!" 2>nul
    if not exist "!FOUND_LOCALAPPDATA!" (
        echo [+] Deleted
    )
)

if not "!FOUND_TEMP!"=="" (
    echo [*] Deleting: !FOUND_TEMP!
    rd /s /q "!FOUND_TEMP!" 2>nul
    if not exist "!FOUND_TEMP!" (
        echo [+] Deleted
    )
)

echo.
echo [+] Reset complete!
echo [+] Your project data is safe
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

REM ============================================================================
REM COMPLETE RESET - Delete EVERYTHING
REM ============================================================================
:COMPLETE_RESET

cls
echo.
echo ============================================================================
echo              !!! COMPLETE RESET - DANGER !!!
echo ============================================================================
echo.
echo                 *** WARNING: This will DELETE EVERYTHING! ***
echo.

echo [*] Detecting all locations...
echo.

REM Detect everything
set "FOUND_APPDATA="
set "FOUND_LOCALAPPDATA="
set "FOUND_TEMP="
set "PROJECT_PATH="

REM Check all AppData variations
if exist "%APPDATA%\SakrStoreManager" set "FOUND_APPDATA=%APPDATA%\SakrStoreManager" & echo [+] Found: %APPDATA%\SakrStoreManager
if exist "%APPDATA%\sakr-store-manager" set "FOUND_APPDATA=%APPDATA%\sakr-store-manager" & echo [+] Found: %APPDATA%\sakr-store-manager
if exist "%APPDATA%\Sakr Store Manager" set "FOUND_APPDATA=%APPDATA%\Sakr Store Manager" & echo [+] Found: %APPDATA%\Sakr Store Manager

if exist "%LOCALAPPDATA%\SakrStoreManager" set "FOUND_LOCALAPPDATA=%LOCALAPPDATA%\SakrStoreManager" & echo [+] Found: %LOCALAPPDATA%\SakrStoreManager
if exist "%LOCALAPPDATA%\sakr-store-manager" set "FOUND_LOCALAPPDATA=%LOCALAPPDATA%\sakr-store-manager" & echo [+] Found: %LOCALAPPDATA%\sakr-store-manager
if exist "%LOCALAPPDATA%\Sakr Store Manager" set "FOUND_LOCALAPPDATA=%LOCALAPPDATA%\Sakr Store Manager" & echo [+] Found: %LOCALAPPDATA%\Sakr Store Manager

if exist "%TEMP%\SakrStoreManager" set "FOUND_TEMP=%TEMP%\SakrStoreManager" & echo [+] Found: %TEMP%\SakrStoreManager
if exist "%TEMP%\sakr-store-manager" set "FOUND_TEMP=%TEMP%\sakr-store-manager" & echo [+] Found: %TEMP%\sakr-store-manager

REM Get project path
if not "!FOUND_APPDATA!"=="" (
    if exist "!FOUND_APPDATA!\config.json" (
        for /f "delims=" %%i in ('powershell -Command "try { $json = Get-Content '!FOUND_APPDATA!\config.json' -Raw | ConvertFrom-Json; Write-Output $json.projectPath } catch { Write-Output '' }"') do (
            set "PROJECT_PATH=%%i"
        )
        if not "!PROJECT_PATH!"=="" (
            echo [+] Project: !PROJECT_PATH!
        )
    )
)

echo.
echo ============================================================================
echo.
echo The following will be PERMANENTLY DELETED:
echo   [X] All app settings
echo   [X] All configurations

if not "!FOUND_APPDATA!"=="" echo   [X] !FOUND_APPDATA!
if not "!FOUND_LOCALAPPDATA!"=="" echo   [X] !FOUND_LOCALAPPDATA!
if not "!FOUND_TEMP!"=="" echo   [X] !FOUND_TEMP!

if not "!PROJECT_PATH!"=="" (
    echo   [X] PROJECT FOLDER: !PROJECT_PATH!
    echo   [X] products.json
    echo   [X] ALL images
    echo   [X] .git repository
    echo   [X] EVERYTHING in project folder!
) else (
    echo   [X] All project data (if found)
)

echo.
echo                 *** THIS CANNOT BE UNDONE! ***
echo.
echo ============================================================================
echo.

set /p "CONFIRM1=Type 'DELETE EVERYTHING' to continue: "
if /i not "!CONFIRM1!"=="DELETE EVERYTHING" (
    echo.
    echo [!] Reset cancelled.
    timeout /t 2 >nul
    goto MENU
)

echo.
set /p "CONFIRM2=Are you absolutely sure? Type 'YES' to confirm: "
if /i not "!CONFIRM2!"=="YES" (
    echo.
    echo [!] Reset cancelled.
    timeout /t 2 >nul
    goto MENU
)

echo.
echo [*] Starting complete reset...
echo.

REM Close app
echo [*] Terminating all processes...
taskkill /F /IM "sakr-store-manager.exe" /T >nul 2>&1
taskkill /F /IM "Sakr Store Manager.exe" /T >nul 2>&1
timeout /t 3 >nul

REM Delete AppData
if not "!FOUND_APPDATA!"=="" (
    echo [*] Deleting: !FOUND_APPDATA!
    rd /s /q "!FOUND_APPDATA!" 2>nul
    if not exist "!FOUND_APPDATA!" echo [+] Deleted
)

if not "!FOUND_LOCALAPPDATA!"=="" (
    echo [*] Deleting: !FOUND_LOCALAPPDATA!
    rd /s /q "!FOUND_LOCALAPPDATA!" 2>nul
    if not exist "!FOUND_LOCALAPPDATA!" echo [+] Deleted
)

if not "!FOUND_TEMP!"=="" (
    echo [*] Deleting: !FOUND_TEMP!
    rd /s /q "!FOUND_TEMP!" 2>nul
    if not exist "!FOUND_TEMP!" echo [+] Deleted
)

REM Delete project folder
if not "!PROJECT_PATH!"=="" (
    if exist "!PROJECT_PATH!" (
        echo.
        echo [*] Deleting project folder: !PROJECT_PATH!
        echo     This includes products.json, images, .git, everything...
        
        rd /s /q "!PROJECT_PATH!" 2>nul
        
        if not exist "!PROJECT_PATH!" (
            echo [+] Project folder completely deleted
        ) else (
            echo [!] Warning: Some files could not be deleted
        )
    )
)

echo.
echo ============================================================================
echo [+] Complete reset finished!
echo [+] Everything has been deleted
echo.
echo The app will start from scratch when you run it next.
echo ============================================================================
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

REM ============================================================================
REM NUCLEAR RESET - Deep System Cleanup
REM ============================================================================
:NUCLEAR_RESET

cls
echo.
echo ============================================================================
echo                    NUCLEAR RESET
echo         This will delete EVERYTHING EVERYWHERE!
echo ============================================================================
echo.
echo This advanced tool will search and destroy:
echo   - All app data in AppData (all variations)
echo   - All app data in LocalAppData
echo   - All temp files
echo   - All project folders found in configs
echo   - All localStorage data
echo   - All cached data (Cache, GPUCache, etc.)
echo   - All log files
echo   - System prefetch data
echo   - Recent items
echo   - Everything!
echo.
echo ============================================================================
echo                   !!! WARNING !!!
echo ============================================================================
echo.
echo This is a DESTRUCTIVE operation!
echo There is NO UNDO!
echo Use only for testing or complete removal!
echo.
echo ============================================================================
echo.

set /p "CONFIRM1=Type 'I UNDERSTAND' to continue: "
if /i not "!CONFIRM1!"=="I UNDERSTAND" (
    echo.
    echo Cancelled.
    timeout /t 2 >nul
    goto MENU
)

echo.
set /p "CONFIRM2=Type 'DELETE EVERYTHING' to confirm: "
if /i not "!CONFIRM2!"=="DELETE EVERYTHING" (
    echo.
    echo Cancelled.
    timeout /t 2 >nul
    goto MENU
)

echo.
echo [*] Starting nuclear reset...
echo.

REM Kill all processes
echo [*] Terminating all app processes...
taskkill /F /IM "sakr-store-manager.exe" /T >nul 2>&1
taskkill /F /IM "Sakr Store Manager.exe" /T >nul 2>&1
taskkill /F /IM "electron.exe" /T >nul 2>&1
timeout /t 3 >nul
echo [+] Processes terminated
echo.

REM Scan and delete all AppData locations
echo [*] Scanning and deleting all locations...
echo.

set "LOCATIONS="
set "LOCATIONS=!LOCATIONS! "%APPDATA%\SakrStoreManager""
set "LOCATIONS=!LOCATIONS! "%APPDATA%\sakr-store-manager""
set "LOCATIONS=!LOCATIONS! "%APPDATA%\Sakr Store Manager""
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\SakrStoreManager""
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\sakr-store-manager""
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\Sakr Store Manager""
set "LOCATIONS=!LOCATIONS! "%TEMP%\SakrStoreManager""
set "LOCATIONS=!LOCATIONS! "%TEMP%\sakr-store-manager""
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\Programs\SakrStoreManager""
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\Programs\sakr-store-manager""
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\Programs\Sakr Store Manager""

for %%L in (!LOCATIONS!) do (
    if exist %%L (
        echo [*] Deleting: %%~L
        rd /s /q %%L 2>nul
        if not exist %%L (
            echo [+] Deleted
        )
        echo.
    )
)

REM Find and delete project folders from all config variations
echo [*] Searching for project folders in configs...
echo.

for %%C in (
    "%APPDATA%\SakrStoreManager\config.json"
    "%APPDATA%\sakr-store-manager\config.json"
    "%LOCALAPPDATA%\SakrStoreManager\config.json"
    "%LOCALAPPDATA%\sakr-store-manager\config.json"
) do (
    if exist %%C (
        echo [*] Found config: %%~C
        
        for /f "delims=" %%P in ('powershell -Command "try { $json = Get-Content '%%~C' -Raw | ConvertFrom-Json; Write-Output $json.projectPath } catch { }"') do (
            set "PROJ_PATH=%%P"
            if not "!PROJ_PATH!"=="" (
                if exist "!PROJ_PATH!" (
                    echo [*] Found project folder: !PROJ_PATH!
                    echo [*] Deleting project folder...
                    rd /s /q "!PROJ_PATH!" 2>nul
                    if not exist "!PROJ_PATH!" (
                        echo [+] Project folder deleted
                    )
                    echo.
                )
            )
        )
    )
)

REM Clear system temp
echo [*] Clearing system temp files...
del /f /s /q "%TEMP%\*sakr*.*" >nul 2>&1
del /f /s /q "%TEMP%\*SakrStore*.*" >nul 2>&1
echo [+] Temp files cleared
echo.

REM Clear prefetch
echo [*] Clearing prefetch data...
del /f /q "%SystemRoot%\Prefetch\*SAKR*.*" >nul 2>&1
del /f /q "%SystemRoot%\Prefetch\*ELECTRON*.*" >nul 2>&1
echo [+] Prefetch cleared
echo.

REM Clear recent items
echo [*] Clearing recent items...
del /f /q "%APPDATA%\Microsoft\Windows\Recent\*sakr*.*" >nul 2>&1
del /f /q "%APPDATA%\Microsoft\Windows\Recent\*SakrStore*.*" >nul 2>&1
echo [+] Recent items cleared
echo.

echo ============================================================================
echo [+] Nuclear reset complete!
echo [+] All traces of the app have been removed
echo ============================================================================
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

REM ============================================================================
REM EXIT
REM ============================================================================
:EXIT

cls
echo.
echo Thank you for using Sakr Store Manager Reset Tool.
echo.
timeout /t 1 >nul

endlocal
exit /b 0
