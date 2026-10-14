@echo off
title Push to YoPharmaAppMobile New Repository
echo ========================================================
echo  Uploading code to new repository: YoPharmaAppMobile
echo ========================================================
set PATH=C:\Program Files\Git\cmd;C:\Program Files\nodejs;%PATH%
cd /d "C:\Users\Hendy\.gemini\antigravity\scratch\YoPharmaAppMobile"
git remote set-url origin https://github.com/JOOALHENDY22/YoPharmaAppMobile.git 2>nul || git remote add origin https://github.com/JOOALHENDY22/YoPharmaAppMobile.git
git branch -M main
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS! Code uploaded to YoPharmaAppMobile repository!
    echo ========================================================
) else (
    echo [ERROR] Push failed. Make sure you clicked Create repository on GitHub.
)
pause
