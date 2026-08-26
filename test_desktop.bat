@echo off
echo ===================================================
echo      AstroVanta - Tauri Desktop Testing Script
echo ===================================================

cd apps\desktop

echo.
echo Installing dependencies (if missing)...
call npm install

echo.
echo Starting Tauri development server...
call npm run tauri dev

pause
