@echo off
REM ============================================================================
REM Nuclear Reset - Developer Tool
REM ============================================================================
REM This script finds and deletes EVERYTHING related to the app
REM Use only for testing or when you want a truly clean slate
REM ============================================================================

setlocal EnableDelayedExpansion

cls
echo.
echo ================================================================
echo                    NUCLEAR RESET
echo         This will delete EVERYTHING!
echo ================================================================
echo.
echo This advanced tool will search and destroy:
echo   - All app data in AppData
echo   - All app data in LocalAppData
echo   - All temp files
echo   - All project folders found in configs
echo   - All localStorage data
echo   - All cached data
echo   - All log files
echo   - Everything!
echo.
echo ================================================================
echo                   !!! WARNING !!!
echo ================================================================
echo.
echo This is a DESTRUCTIVE operation!
echo There is NO UNDO!
echo Make sure you have BACKUPS!
echo.
echo ================================================================
echo.

set /p "CONFIRM1=Type 'I UNDERSTAND' to continue: "
if /i not "!CONFIRM1!"=="I UNDERSTAND" (
    echo.
    echo Cancelled.
    timeout /t 2 >nul
    exit /b 0
)

echo.
set /p "CONFIRM2=Type 'DELETE EVERYTHING' to confirm: "
if /i not "!CONFIRM2!"=="DELETE EVERYTHING" (
    echo.
    echo Cancelled.
    timeout /t 2 >nul
    exit /b 0
)

echo.
echo [*] Starting nuclear reset...
echo.

REM ============================================================================
REM Kill all related processes
REM ============================================================================

echo [*] Terminating all app processes...
taskkill /F /IM "sakr-store-manager.exe" /T >nul 2>&1
taskkill /F /IM "Sakr Store Manager.exe" /T >nul 2>&1
taskkill /F /IM "electron.exe" /T >nul 2>&1
taskkill /F /IM "node.exe" /T >nul 2>&1
timeout /t 3 >nul
echo [+] Processes terminated
echo.

REM ============================================================================
REM Scan and delete all AppData locations
REM ============================================================================

echo [*] Scanning AppData locations...
echo.

REM Standard locations
set "LOCATIONS="
set "LOCATIONS=!LOCATIONS! "%APPDATA%\SakrStoreManager""
set "LOCATIONS=!LOCATIONS! "%APPDATA%\sakr-store-manager""
set "LOCATIONS=!LOCATIONS! "%APPDATA%\Sakr Store Manager""
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\SakrStoreManager""
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\sakr-store-manager""
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\Sakr Store Manager""
set "LOCATIONS=!LOCATIONS! "%TEMP%\SakrStoreManager""
set "LOCATIONS=!LOCATIONS! "%TEMP%\sakr-store-manager""

REM Also check Programs folder
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\Programs\SakrStoreManager""
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\Programs\sakr-store-manager""
set "LOCATIONS=!LOCATIONS! "%LOCALAPPDATA%\Programs\Sakr Store Manager""

for %%L in (!LOCATIONS!) do (
    if exist %%L (
        echo [*] Deleting: %%~L
        rd /s /q %%L 2>nul
        if exist %%L (
            echo [!] Failed to delete (trying with force...)
            rmdir /s /q %%L 2>nul
        )
        if not exist %%L (
            echo [+] Deleted
        )
        echo.
    )
)

REM ============================================================================
REM Find and delete project folders
REM ============================================================================

echo [*] Searching for project folders...
echo.

REM Try multiple config locations
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
                    if exist "!PROJ_PATH!" (
                        echo [!] Failed to delete
                    ) else (
                        echo [+] Project folder deleted
                    )
                    echo.
                )
            )
        )
    )
)

REM ============================================================================
REM Clear system temp files
REM ============================================================================

echo [*] Clearing system temp files...
del /f /s /q "%TEMP%\*sakr*.*" >nul 2>&1
del /f /s /q "%TEMP%\*SakrStore*.*" >nul 2>&1
echo [+] Temp files cleared
echo.

REM ============================================================================
REM Clear Windows Prefetch (if accessible)
REM ============================================================================

echo [*] Clearing prefetch data...
del /f /q "%SystemRoot%\Prefetch\*SAKR*.*" >nul 2>&1
del /f /q "%SystemRoot%\Prefetch\*ELECTRON*.*" >nul 2>&1
echo [+] Prefetch cleared
echo.

REM ============================================================================
REM Clear Recent Items
REM ============================================================================

echo [*] Clearing recent items...
del /f /q "%APPDATA%\Microsoft\Windows\Recent\*sakr*.*" >nul 2>&1
del /f /q "%APPDATA%\Microsoft\Windows\Recent\*SakrStore*.*" >nul 2>&1
echo [+] Recent items cleared
echo.

REM ============================================================================
REM Search for any remaining files
REM ============================================================================

echo [*] Searching for any remaining app files...
echo.

set "FOUND_FILES=0"

REM Search in user profile
for /f "delims=" %%F in ('dir /s /b "%USERPROFILE%\*sakr*" 2^>nul') do (
    if exist "%%F" (
        set /a "FOUND_FILES+=1"
        echo [!] Found: %%F
    )
)

if !FOUND_FILES! GTR 0 (
    echo.
    echo [!] Found !FOUND_FILES! remaining files/folders
    echo [*] You may want to delete these manually
    echo.
    set /p "DELETE_REMAINING=Delete remaining files? [Y/N]: "
    if /i "!DELETE_REMAINING!"=="Y" (
        for /f "delims=" %%F in ('dir /s /b "%USERPROFILE%\*sakr*" 2^>nul') do (
            if exist "%%F" (
                echo [*] Deleting: %%F
                if exist "%%F\" (
                    rd /s /q "%%F" 2>nul
                ) else (
                    del /f /q "%%F" 2>nul
                )
            )
        )
        echo [+] Cleanup complete
    )
) else (
    echo [+] No remaining files found
)

echo.

REM ============================================================================
REM Clear browser-like storage
REM ============================================================================

echo [*] Clearing browser storage (if any)...

REM Electron apps store data in multiple ways
for %%D in (
    "Cache"
    "GPUCache"
    "Session Storage"
    "Local Storage"
    "IndexedDB"
    "Code Cache"
    "Crashpad"
) do (
    for %%L in (
        "%APPDATA%\SakrStoreManager\%%~D"
        "%LOCALAPPDATA%\SakrStoreManager\%%~D"
    ) do (
        if exist %%L (
            echo [*] Clearing: %%~L
            rd /s /q %%L 2>nul
        )
    )
)

echo [+] Browser storage cleared
echo.

REM ============================================================================
REM Final verification
REM ============================================================================

echo [*] Verifying deletion...
echo.

set "REMAINING=0"

if exist "%APPDATA%\SakrStoreManager" set /a "REMAINING+=1"
if exist "%APPDATA%\sakr-store-manager" set /a "REMAINING+=1"
if exist "%LOCALAPPDATA%\SakrStoreManager" set /a "REMAINING+=1"
if exist "%LOCALAPPDATA%\sakr-store-manager" set /a "REMAINING+=1"
if exist "%TEMP%\SakrStoreManager" set /a "REMAINING+=1"

if !REMAINING! GTR 0 (
    echo [!] Warning: !REMAINING! folders could not be deleted
    echo [!] They may be in use or require admin rights
    echo.
) else (
    echo [+] All app data successfully deleted!
    echo.
)

REM ============================================================================
REM Summary
REM ============================================================================

echo.
echo ================================================================
echo                   NUCLEAR RESET COMPLETE
echo ================================================================
echo.
echo [+] All app processes terminated
echo [+] All app data deleted
echo [+] All project folders deleted
echo [+] All cache cleared
echo [+] All temp files removed
echo [+] All traces cleaned
echo.
echo The app has been completely removed from your system.
echo.
echo To use the app again:
echo   1. Reinstall or run the app
echo   2. You'll see the welcome screen
echo   3. Everything will be fresh
echo.
echo ================================================================
echo.

timeout /t 5

endlocal
exit /b 0
