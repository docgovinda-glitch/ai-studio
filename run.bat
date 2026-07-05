@echo off
title AI Studio Dev Server
cd /d "%~dp0"
echo Starting AI Studio Local Dev Server...
call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo Next.js failed to start. Press any key to exit.
    pause > nul
)
