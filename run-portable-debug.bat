@echo off
echo ========================================
echo Running Portable App in Debug Mode
echo ========================================
echo.
echo The app will run in this console window.
echo You will see all Electron main process logs here.
echo.
echo Starting app...
echo.

REM Set environment variable to show console
set ELECTRON_ENABLE_LOGGING=1

REM Run the portable exe
"release\Sakr Store Manager v1.0.0 Portable.exe"

echo.
echo App closed. Press any key to exit...
pause > nul
