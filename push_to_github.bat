@echo off
title Push YoPharmaAppMobile to GitHub
echo ========================================================
echo  Uploading YoPharmaAppMobile to GitHub
echo  Target Branch: YoPharmaAppMobile
echo ========================================================
set PATH=C:\Program Files\Git\cmd;C:\Program Files\nodejs;%PATH%
cd /d "C:\Users\Hendy\.gemini\antigravity\scratch\YoPharmaAppMobile"
git push -u origin YoPharmaAppMobile
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS! Uploaded to GitHub successfully!
    echo ========================================================
) else (
    echo [ERROR] Push failed. Please check your GitHub login.
)
pause
