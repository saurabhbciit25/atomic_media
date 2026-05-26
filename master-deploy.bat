@echo off
SETLOCAL EnableDelayedExpansion

title AtomicMedia - Master Deploy

cd /d "%~dp0"

echo ===================================================
echo             ATOMICMEDIA MASTER DEPLOY
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

echo [Step 1] Clearing stale Vercel cache...
if exist ".vercel" (
    echo   Removing stale .vercel directory...
    rmdir /s /q .vercel
)
echo [OK] Cache cleared.
echo.

echo [Step 2] Freshly linking project to Vercel...
call npx vercel link --yes
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to link project. Make sure you are logged in.
    pause
    exit /b 1
)
echo [OK] Project linked successfully.
echo.

echo [Step 3] Populating MongoDB Atlas Database (Seeding)...
call node backend/seed.js
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database seeding failed. We will continue to deploy, but check your MongoDB URI.
) else (
    echo [OK] Database seeded successfully!
)
echo.

echo [Step 4] Setting Vercel environment variables...
echo.

echo   Setting MONGODB_URI...
echo mongodb://saurabhsharmasri_db_user:saurabh1234567890@ac-yk42meu-shard-00-00.kt9cezf.mongodb.net:27017,ac-yk42meu-shard-00-01.kt9cezf.mongodb.net:27017,ac-yk42meu-shard-00-02.kt9cezf.mongodb.net:27017/atomic_media?ssl=true^&replicaSet=atlas-81bfjj-shard-0^&authSource=admin^&retryWrites=true^&w=majority^&appName=Cluster0| npx vercel env add MONGODB_URI production --yes

echo   Setting JWT_SECRET...
echo atomic-media-local-dev-secret-change-before-production-7f6b1c2f4a8d| npx vercel env add JWT_SECRET production --yes

echo   Setting JWT_EXPIRES_IN...
echo 7d| npx vercel env add JWT_EXPIRES_IN production --yes

echo   Setting CLOUDINARY_CLOUD_NAME...
echo dhbn4yupp| npx vercel env add CLOUDINARY_CLOUD_NAME production --yes

echo   Setting CLOUDINARY_API_KEY...
echo 814918982911467| npx vercel env add CLOUDINARY_API_KEY production --yes

echo   Setting CLOUDINARY_API_SECRET...
echo akkwnjt1Cf7LK830UUgaUWeiWuY| npx vercel env add CLOUDINARY_API_SECRET production --yes

echo   Setting NODE_ENV...
echo production| npx vercel env add NODE_ENV production --yes

echo   Setting CLIENT_URL...
echo https://atomic-media-iota.vercel.app| npx vercel env add CLIENT_URL production --yes

echo.
echo [Step 5] Deploying live to Vercel production...
echo.

call npx vercel --prod --yes

echo.
echo ===================================================
echo   MASTER DEPLOY COMPLETE!
echo ===================================================
echo.
echo Your live site: https://atomic-media-iota.vercel.app
echo Admin panel:    https://atomic-media-iota.vercel.app/admin.html
echo.
echo Log in using:
echo   Email:    admin@atomic.media
echo   Password: ChangeMe123!
echo.
pause
