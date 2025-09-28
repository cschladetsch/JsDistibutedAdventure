@echo off
setlocal EnableDelayedExpansion

:: Set window title
title Interactive Story System

:: Clear screen for clean start
cls

echo.
echo ╔════════════════════════════════════════╗
echo ║        🎮 INTERACTIVE STORY SYSTEM     ║
echo ╚════════════════════════════════════════╝
echo.

:: Change to script directory
pushd "%~dp0"

:: Check Node.js
echo 🔍 Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install from https://nodejs.org/
    echo.
    pause
    goto :end
)
echo ✅ Node.js is ready
echo.

:: Check for story files
if not exist "stories\" (
    echo ❌ No stories directory found!
    echo 📝 Please generate a story first
    echo.
    pause
    goto :end
)

:: Count story files
set /a story_count=0
for %%f in (stories\*.json) do set /a story_count+=1

if !story_count! equ 0 (
    echo ❌ No story files found in stories directory!
    echo 📝 Run story generation first
    echo.
    pause
    goto :end
)

echo ✅ Found !story_count! story file(s)
echo.
echo 🚀 Starting interactive story system...
echo 💡 Use Ctrl+C to exit anytime
echo.

:: Run the story with proper console handling
node run_story.js

:: Always pause at end
echo.
echo ╔════════════════════════════════════════╗
echo ║             🎮 SESSION ENDED           ║
echo ╚════════════════════════════════════════╝
echo.

:end
pause
popd