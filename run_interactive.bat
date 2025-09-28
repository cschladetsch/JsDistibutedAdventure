@echo off
title Interactive Story System
echo 🎮 INTERACTIVE STORY SYSTEM
echo ============================
echo.

REM Change to the script directory
cd /d "%~dp0"

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo 🚀 Starting story system...
echo.

REM Run the story system with proper input handling
node run_story.js
echo.

REM Always pause at the end
echo ============================
echo 🎮 Game session ended.
echo.
pause