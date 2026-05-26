@echo off
SETLOCAL EnableDelayedExpansion

title AtomicMedia - Vercel Diagnostics

cd /d "%~dp0"

echo ===================================================
echo   AtomicMedia - Vercel Diagnostics
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

echo [1] Checking Vercel login status...
call npx vercel whoami
echo.
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] You are not logged in to Vercel!
    echo Please follow the prompts to log in now:
    echo.
    call npx vercel login
    echo.
) else (
    echo [OK] Logged in successfully.
)

echo [2] Checking Vercel project link...
if not exist ".vercel" (
    echo [WARNING] Project is not linked to Vercel.
    echo Linking project now...
    call npx vercel link --yes
    echo.
) else (
    echo [OK] Project is linked to Vercel.
)

echo [3] Testing environment variable addition...
echo.
echo TestValue| npx vercel env add DEPLOY_TEST_VAR production --yes
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to set environment variables on Vercel.
    echo Please read the error message above carefully.
    echo.
) else (
    echo [OK] Successfully set test variable.
    echo Removing test variable...
    echo.| npx vercel env rm DEPLOY_TEST_VAR production --yes >nul 2>nul
)

echo.
echo ===================================================
echo   DIAGNOSTICS COMPLETE
echo ===================================================
echo.
pause
