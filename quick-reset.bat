@echo off
REM Quick Reset - Safe mode only (keeps products)
REM For complete reset, use: reset-app.bat /all

echo.
echo ========================================
echo   Sakr Store Manager - Quick Reset
echo ========================================
echo.
echo This will reset app settings but keep
echo your products and images safe.
echo.
pause

REM Close app
echo Closing app...
taskkill /F /IM "sakr-store-manager.exe" /T >nul 2>&1
taskkill /F /IM "Sakr Store Manager.exe" /T >nul 2>&1
taskkill /F /IM "electron.exe" /T >nul 2>&1
timeout /t 2 >nul

REM Delete app data
echo Deleting app data...
rd /s /q "%APPDATA%\SakrStoreManager" 2>nul
rd /s /q "%LOCALAPPDATA%\SakrStoreManager" 2>nul
rd /s /q "%TEMP%\SakrStoreManager" 2>nul

echo.
echo Done! Your products are safe.
echo Start the app to see the welcome screen.
echo.
pause
