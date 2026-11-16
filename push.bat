@echo off
REM Push to GitHub script
REM This script uses cmd.exe for better credential handling

cd /d "C:\Web VA ROVIENG CO\va-rovieng-website"

echo.
echo ============================================================
echo PUSHING TO GITHUB
echo ============================================================
echo.

REM Get git path
set GIT_PATH=C:\Users\MSI\AppData\Local\GitHubDesktop\app-3.6.11\resources\app\git\cmd\git.exe

REM Check status
echo [*] Current Status:
"%GIT_PATH%" status --short

echo.
echo [+] Pushing commits to origin/main...
echo.

REM Try push
"%GIT_PATH%" push origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo [SUCCESS] Push completed!
    echo ============================================================
) else (
    echo.
    echo [!] Push returned code: %errorlevel%
    echo [*] Verifying status...
    "%GIT_PATH%" status
)

pause
