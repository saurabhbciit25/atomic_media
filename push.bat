@echo off
SETLOCAL EnableDelayedExpansion

:: Set console title
title AtomicMedia - Easy Git Push

echo ===================================================
echo             AtomicMedia Git Push Utility          
echo ===================================================
echo.

:: Check if git is installed in the current environment PATH
where git >nul 2>nul
if %ERRORLEVEL% equ 0 goto :git_ok

echo Git not found in standard PATH. Checking common directories...

:: Check 64-bit Program Files
if exist "C:\Program Files\Git\cmd\git.exe" (
    set "PATH=!PATH!;C:\Program Files\Git\cmd"
    echo Found Git in Program Files!
    goto :git_ok
)

:: Check 32-bit Program Files
if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
    set "PATH=!PATH!;C:\Program Files (x86)\Git\cmd"
    echo Found Git in Program Files (x86)^!
    goto :git_ok
)

:: Check User Local Programs
if exist "%LocalAppData%\Programs\Git\cmd\git.exe" (
    set "PATH=!PATH!;%LocalAppData%\Programs\Git\cmd"
    echo Found Git in Local AppData!
    goto :git_ok
)

echo.
echo [ERROR] Git is not installed on your system.
echo.
echo Please download and install Git from: 
echo https://git-scm.com/download/win
echo.
echo After installing, restart this script.
goto :end

:git_ok
echo Git is ready to use.
echo.

:: Enable support for long paths in Windows (fixes the "Filename too long" error)
echo Enabling long paths support in Git...
git config core.longpaths true
echo.

:: Check if directory is a git repository
if not exist ".git" (
    echo [ERROR] This directory is not a Git repository.
    echo Initializing Git repository...
    git init
    git remote add origin https://github.com/saurabhbciit25/atomic_media.git
)

:: Confirm remote URL
echo Current Git remote origin:
git remote get-url origin
echo.

:: Prompt for commit message
echo Enter commit message (press Enter for "Update project files"):
set /p commit_msg="> "

if "%commit_msg%"=="" (
    set commit_msg=Update project files
)

echo.
echo Adding files...
git add .

echo.
echo Committing changes...
git commit -m "!commit_msg!"

echo.
echo Pushing to remote repository (main branch)...
git push -u origin main

if %ERRORLEVEL% neq 0 (
    echo.
    echo [WARNING] Push failed. 
    echo If this is a new repository or has different branch structure,
    echo we will attempt to push to the current active branch.
    echo.
    echo Attempting to push to current branch...
    git push origin HEAD
)

:end
echo.
echo ===================================================
echo Done! Press any key to exit.
echo ===================================================
pause >nul
