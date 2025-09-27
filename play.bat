@echo off
REM Play the JavaScript Story Game
REM Usage: play.bat [story_file | --generate N]

python run.py %*

REM Keep window open if script fails
if %ERRORLEVEL% NEQ 0 (
    echo.
    pause
)