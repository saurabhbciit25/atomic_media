@echo off
SETLOCAL EnableDelayedExpansion

title AtomicMedia - Deploy Utility

echo ===================================================
echo         AtomicMedia Deploy Utility
echo ===================================================
echo.

cd /d "%~dp0"

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

:: Check for Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Git not found in PATH. Checking common locations...
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "PATH=C:\Program Files\Git\cmd;!PATH!"
        echo [OK] Found Git at C:\Program Files\Git\cmd
    ) else if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
        set "PATH=C:\Program Files (x86)\Git\cmd;!PATH!"
        echo [OK] Found Git at C:\Program Files (x86)\Git\cmd
    ) else (
        echo [ERROR] Git is not installed. Please install from: https://git-scm.com/download/win
        pause
        exit /b 1
    )
)

echo.
echo [STEP 1/4] Seeding database with initial data...
echo.
node backend/seed.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Database seeding failed. Check your MongoDB connection string in .env
    echo.
    pause
    exit /b 1
)

echo.
echo [STEP 2/4] Setting Vercel environment variables...
echo.

:: Read .env file and set each variable on Vercel
for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    set "KEY=%%A"
    set "VAL=%%B"
    if not "!KEY!"=="" (
        if not "!KEY:~0,1!"=="#" (
            echo   Setting !KEY!...
            echo !VAL!| npx vercel env add !KEY! production --yes >nul 2>nul
        )
    )
)

echo [OK] Environment variables configured.

echo.
echo [STEP 3/4] Deploying to Vercel (production)...
echo.
npx vercel --prod --yes
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Vercel deployment failed.
    pause
    exit /b 1
)

echo.
echo [STEP 4/4] Pushing to GitHub...
echo.
git config core.longpaths true
git add -A
git commit -m "Deploy: production-ready with MongoDB Atlas and Cloudinary"
git push origin main

echo.
echo ===================================================
echo    DEPLOYMENT COMPLETE!
echo ===================================================
echo.
echo Your site should be live on Vercel shortly.
echo Admin login:
echo   Email:    admin@atomic.media
echo   Password: ChangeMe123!
echo.
pause
