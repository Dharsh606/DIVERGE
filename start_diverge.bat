@echo off
title DIVERGE Launcher
color 0B
echo ============================================================
echo           Starting DIVERGE Music Platform
echo ============================================================
echo.

cd /d "j:\DIVERGE"

echo [1/3] Starting Local PostgreSQL Database...
start "DIVERGE PostgreSQL" /min "j:\DIVERGE\pgsql\pgsql\bin\postgres.exe" -D "j:\DIVERGE\pgsql\data"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Go Backend Server (Port 8080)...
cd /d "j:\DIVERGE\backend"
start "DIVERGE Go Backend" /min .\diverge_backend.exe
timeout /t 2 /nobreak >nul

echo [3/3] Starting Svelte Frontend Server (Port 5173)...
cd /d "j:\DIVERGE\frontend"
start "DIVERGE Frontend" npm run dev -- --host 127.0.0.1 --port 5173
timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo   DIVERGE is running! Opening browser at:
echo   http://127.0.0.1:5173
echo ============================================================
echo.
start http://127.0.0.1:5173
pause
