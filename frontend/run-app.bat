@echo off
echo.
echo ==============================================
echo Enterprise Insights Copilot v2.0 - Launch Tool
echo ==============================================
echo.

cd /d "%~dp0"

echo Verifying installation...
node verify.js

echo.
echo Starting application...
echo.
echo IMPORTANT: If the server fails to start, please try one of these steps:
echo 1. Run "npm run dev" manually in this directory
echo 2. Make sure port 3000 is not in use by another application
echo 3. Restart your computer if the issue persists
echo.
echo Application should be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server when done
echo.

npm run dev

pause
