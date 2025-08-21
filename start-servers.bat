@echo off
echo Starting Clinic Onboarding Platform...
echo.

echo Starting Backend Server...
start cmd /k "cd server && npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo Dashboard: http://localhost:3000/dashboard
echo.
pause
