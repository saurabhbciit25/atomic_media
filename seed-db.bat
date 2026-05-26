@echo off
SETLOCAL EnableDelayedExpansion

title AtomicMedia - Database Seed

cd /d "%~dp0"

echo ===================================================
echo   Seeding MongoDB Atlas Database
echo ===================================================
echo.

:: Automatically detect and add Node.js to PATH if it's not found
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 goto node_found

if exist "C:\Program Files\nodejs" goto add_path1
if exist "C:\Program Files (x86)\nodejs" goto add_path2

echo [ERROR] Node.js is not installed or not in system PATH.
echo Please download and install Node.js from: https://nodejs.org/
pause
exit /b 1

:add_path1
echo [INFO] Node.js found at C:\Program Files\nodejs. Adding to PATH...
set "PATH=%PATH%;C:\Program Files\nodejs"
goto node_found

:add_path2
echo [INFO] Node.js found at C:\Program Files (x86)\nodejs. Adding to PATH...
set "PATH=%PATH%;C:\Program Files (x86)\nodejs"
goto node_found

:node_found
echo This will populate your cloud database with:
echo   - Default admin user (admin@atomic.media / ChangeMe123!)
echo   - Default services (Branding, Performance Marketing, etc.)
echo   - Default portfolio projects
echo   - Site homepage content
echo.
echo Press any key to start seeding...
pause >nul

node backend/seed.js

echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo   DATABASE SEEDED SUCCESSFULLY!
    echo ===================================================
    echo.
    echo Admin Login Credentials:
    echo   Email:    admin@atomic.media
    echo   Password: ChangeMe123!
) else (
    echo ===================================================
    echo   SEEDING FAILED
    echo ===================================================
    echo   Check your MONGODB_URI in the .env file.
)
echo.
pause
