@echo off
setlocal

:: Set window title
title Story Generator

echo.
echo ╔═══════════════════════════════════════════════╗
echo ║              🎮 STORY GENERATOR                ║
echo ╚═══════════════════════════════════════════════╝
echo.

:: Change to script directory
pushd "%~dp0"

:: Check Node.js
echo 🔍 Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Install from https://nodejs.org/
    pause
    goto :end
)
echo ✅ Node.js ready

:: Get number of pages
set /p pages="📝 How many pages? (default 50): "
if "%pages%"=="" set pages=50

echo.
echo 🚀 Generating %pages%-page story...
echo.

:: Create temp generator script
echo const { ClaudeStoryGenerator } = require('./StoryGenerator.js');> temp_gen.js
echo const { StorySystem } = require('./StorySystem.js');>> temp_gen.js
echo.>> temp_gen.js
echo async function generateStory() {>> temp_gen.js
echo     const storySystem = new StorySystem();>> temp_gen.js
echo     const generator = new ClaudeStoryGenerator(storySystem);>> temp_gen.js
echo.>> temp_gen.js
echo     const themes = [>> temp_gen.js
echo         "Epic fantasy quest with dragons and ancient magic",>> temp_gen.js
echo         "Cyberpunk detective mystery in a neon city",>> temp_gen.js
echo         "Space exploration adventure with alien encounters",>> temp_gen.js
echo         "Medieval kingdom under siege by dark forces",>> temp_gen.js
echo         "Post-apocalyptic survival with mutant creatures",>> temp_gen.js
echo         "Pirate treasure hunt on mysterious islands",>> temp_gen.js
echo         "Steampunk adventure with mechanical contraptions",>> temp_gen.js
echo         "Horror mystery in a haunted mansion",>> temp_gen.js
echo         "Wild west gunslinger adventure",>> temp_gen.js
echo         "Underwater exploration with sea monsters">> temp_gen.js
echo     ];>> temp_gen.js
echo.>> temp_gen.js
echo     const theme = themes[Math.floor(Math.random() * themes.length)];>> temp_gen.js
echo     console.log(`🎨 Theme: ${theme}`);>> temp_gen.js
echo.>> temp_gen.js
echo     try {>> temp_gen.js
echo         const story = await generator.generateLongStory(theme, %pages%);>> temp_gen.js
echo         if (story) {>> temp_gen.js
echo             console.log(`✅ Story generated: "${story.title}"`);>> temp_gen.js
echo             console.log(`📄 Pages: ${Object.keys(story.pages).length}`);>> temp_gen.js
echo             console.log(`🏆 New story ready to play!`);>> temp_gen.js
echo             return story;>> temp_gen.js
echo         } else {>> temp_gen.js
echo             console.log("❌ Story generation failed");>> temp_gen.js
echo             return null;>> temp_gen.js
echo         }>> temp_gen.js
echo     } catch (error) {>> temp_gen.js
echo         console.error("❌ Generation error:", error.message);>> temp_gen.js
echo         return null;>> temp_gen.js
echo     }>> temp_gen.js
echo }>> temp_gen.js
echo.>> temp_gen.js
echo generateStory().then(story =^> {>> temp_gen.js
echo     if (story) {>> temp_gen.js
echo         process.exit(0);>> temp_gen.js
echo     } else {>> temp_gen.js
echo         process.exit(1);>> temp_gen.js
echo     }>> temp_gen.js
echo });>> temp_gen.js

:: Run the generator
node temp_gen.js

:: Clean up
if exist temp_gen.js del temp_gen.js

if errorlevel 1 (
    echo.
    echo ❌ Story generation failed
    pause
    goto :end
)

echo.
echo ╔═══════════════════════════════════════════════╗
echo ║              ✅ GENERATION COMPLETE!          ║
echo ╚═══════════════════════════════════════════════╝
echo.
echo 🎮 To play your story:
echo    • Double-click: play_story.cmd
echo    • Command line: node run_story.js
echo.

:end
pause
popd