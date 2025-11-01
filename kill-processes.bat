@echo off
echo ========================================
echo Kill Stuck Sakr Store Manager Processes
echo ========================================
echo.

echo Searching for running processes...
tasklist | findstr /I "Sakr"

echo.
echo Killing all Sakr Store Manager processes...

taskkill /F /IM "Sakr Store Manager*.exe" 2>nul
taskkill /F /IM "Sakr Store Manager 1.0.0 Portable.exe" 2>nul
taskkill /F /IM "Sakr Store Manager.exe" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo [OK] Processes terminated successfully
) else (
    echo [INFO] No processes found or already terminated
)

echo.
echo Verifying all processes are closed...
timeout /t 2 /nobreak >nul

tasklist | findstr /I "Sakr" >nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Some processes are still running!
    echo Trying force kill again...
    taskkill /F /IM "*.exe" /FI "WINDOWTITLE eq Sakr Store Manager*" 2>nul
    timeout /t 1 /nobreak >nul
) else (
    echo [OK] All processes terminated successfully
)

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo You can now safely rebuild and test the application.
echo.
pause
