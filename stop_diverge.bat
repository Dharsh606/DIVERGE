@echo off
title Stop DIVERGE
color 0C
echo ============================================================
echo           Stopping DIVERGE Music Platform
echo ============================================================
echo.

echo Stopping Go Backend...
taskkill /F /IM diverge_backend.exe 2>nul

echo Stopping PostgreSQL Database...
"j:\DIVERGE\pgsql\pgsql\bin\pg_ctl.exe" stop -D "j:\DIVERGE\pgsql\data" 2>nul
taskkill /F /IM postgres.exe 2>nul

echo Stopping Frontend Server...
taskkill /F /IM node.exe 2>nul

echo.
echo All DIVERGE processes have been stopped.
timeout /t 2 /nobreak >nul
