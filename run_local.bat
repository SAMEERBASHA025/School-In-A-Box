@echo off
title School-In-A-Box Launcher
echo ===================================================
echo   School-In-A-Box: Starting Local Services
echo ===================================================
echo.

echo [1/2] Launching FastAPI Backend Server...
start "School-In-A-Box Backend" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo.
echo [2/2] Launching React Vite Frontend Server...
start "School-In-A-Box Frontend" cmd /k "cd frontend && npx vite"

echo.
echo ===================================================
echo   Servers are launching in separate windows!
echo   - Frontend UI: http://localhost:5173
echo   - Backend Docs: http://127.0.0.1:8000/docs
echo ===================================================
echo.
pause
