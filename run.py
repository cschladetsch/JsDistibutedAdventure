#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple App Runner - Launch JavaScript story app with parameters
Usage:
  python run.py [story_file]          # Run specific story file
  python run.py                       # Run with latest story from stories/
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path

# Fix Windows console encoding for emojis
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'replace')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'replace')


def find_latest_story():
    """Find the most recent story file in stories/ directory"""
    stories_dir = Path("stories")
    if not stories_dir.exists():
        return None

    story_files = list(stories_dir.glob("*.json"))
    if not story_files:
        return None

    # Return the most recently modified story
    return max(story_files, key=lambda x: x.stat().st_mtime)


def generate_new_story(min_pages=50):
    """Generate a new RPG story using Node.js StoryGenerator"""
    import threading
    import time

    # Spinner animation
    class Spinner:
        def __init__(self, message="Processing"):
            self.spinner_chars = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
            self.message = message
            self.running = False
            self.thread = None

        def start(self):
            self.running = True
            self.thread = threading.Thread(target=self._spin)
            self.thread.start()

        def stop(self):
            if self.running:
                self.running = False
                if self.thread:
                    self.thread.join()
                print('\r' + ' ' * (len(self.message) + 10) + '\r', end='', flush=True)

        def _spin(self):
            i = 0
            while self.running:
                char = self.spinner_chars[i % len(self.spinner_chars)]
                print(f'\r{char} {self.message}...', end='', flush=True)
                i += 1
                time.sleep(0.1)

    spinner = Spinner(f"🎮 Generating new RPG story with minimum {min_pages} pages")
    spinner.start()

    try:
        # Create a temporary Node.js script to generate the story
        generator_script = f'''
import {{ ClaudeStoryGenerator }} from './StoryGenerator.js';
import {{ StorySystem }} from './StorySystem.js';

async function generateStory() {{
    const storySystem = new StorySystem();
    const generator = new ClaudeStoryGenerator(storySystem);

    const themes = [
        "Epic fantasy quest with dragons and ancient magic",
        "Cyberpunk detective mystery in a neon city",
        "Space exploration adventure with alien encounters",
        "Medieval kingdom under siege by dark forces",
        "Post-apocalyptic survival with mutant creatures",
        "Pirate treasure hunt on mysterious islands",
        "Steampunk adventure with mechanical contraptions",
        "Horror mystery in a haunted mansion",
        "Wild west gunslinger adventure",
        "Underwater exploration with sea monsters"
    ];

    const theme = themes[Math.floor(Math.random() * themes.length)];
    console.log(`🎨 Theme: ${{theme}}`);

    try {{
        const story = await generator.generateLongStory(theme, {min_pages});
        if (story) {{
            console.log(`✅ Story generated: "${{story.title}}"`);
            console.log(`📄 Pages: ${{Object.keys(story.pages).length}}`);
            return story;
        }} else {{
            console.log("❌ Story generation failed");
            return null;
        }}
    }} catch (error) {{
        console.error("❌ Generation error:", error.message);
        return null;
    }}
}}

generateStory().then(story => {{
    if (story) {{
        console.log(`🏆 New story ready to play!`);
        process.exit(0);
    }} else {{
        process.exit(1);
    }}
}});
'''

        # Write and execute the generator script
        with open("temp_generator.js", "w", encoding='utf-8') as f:
            f.write(generator_script)

        print("🚀 Running story generator...")

        # Run in same console window without capturing output
        result = subprocess.run(["node", "temp_generator.js"], cwd=".")

        # Clean up
        if os.path.exists("temp_generator.js"):
            os.remove("temp_generator.js")

        spinner.stop()

        if result.returncode == 0:
            print("✅ Story generation completed successfully!")
            return True
        else:
            print(f"❌ Story generation failed with exit code: {result.returncode}")
            return False

    except Exception as e:
        spinner.stop()
        print(f"❌ Error generating story: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="JavaScript Story App Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument('story_file', nargs='?',
                       help='Story file to run (optional)')
    parser.add_argument('--generate', '-g', type=int, nargs='?', const=50,
                       help='Generate new story with N pages (default: 50)')

    args = parser.parse_args()

    # Check if Node.js is available
    try:
        subprocess.run(["node", "--version"], check=True,
                      capture_output=True, text=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: Node.js is required but not found")
        print("Please install Node.js: https://nodejs.org/")
        sys.exit(1)

    # Check if required files exist
    required_files = ["run_story.js", "StoryGenerator.js", "StorySystem.js"]
    missing_files = [f for f in required_files if not os.path.exists(f)]
    if missing_files:
        print(f"❌ Error: Missing required files: {', '.join(missing_files)}")
        sys.exit(1)

    # Generate story if requested
    if args.generate is not None:
        min_pages = args.generate if args.generate > 0 else 50
        if not generate_new_story(min_pages):
            print("❌ Story generation failed. Exiting.")
            sys.exit(1)

        print("\n" + "="*50)
        print("✅ Story generation complete!")
        print("="*50)
        print("🎮 To play the story, run one of these:")
        print("   • Double-click: play_story.cmd")
        print("   • Command line: node run_story.js")
        print("   • Python: python run.py (without --generate)")
        print("="*50)

        if sys.platform.startswith('win') and sys.stdin.isatty():
            try:
                input("\nPress Enter to continue...")
            except (EOFError, KeyboardInterrupt):
                pass
        return

    # Determine story file to use
    story_file = None
    if args.story_file:
        story_file = args.story_file
        if not os.path.exists(story_file):
            print(f"❌ Error: Story file '{story_file}' not found")
            sys.exit(1)
    else:
        # Find latest story
        story_file = find_latest_story()
        if not story_file:
            print("❌ No story files found in stories/ directory")
            print("Generate a story first or provide a story file path")
            sys.exit(1)
        print(f"🎮 Using latest story: {story_file}")

    # Run the JavaScript app
    try:
        cmd = ["node", "run_story.js", str(story_file)]
        print(f"🚀 Running: {' '.join(cmd)}")
        print("="*50)
        print()

        # Run the Node.js story interactively with full terminal control
        if sys.platform.startswith('win'):
            # On Windows, run in current console window without creating new one
            result = subprocess.call(cmd, cwd=".")
        else:
            # On Unix-like systems, use normal call with inherited streams
            result = subprocess.call(cmd, cwd=".", stdin=sys.stdin, stdout=sys.stdout, stderr=sys.stderr)

        # Check if we're in an interactive console that will close immediately
        # This happens when double-clicking the .py file or running from some terminals
        if sys.platform.startswith('win') and sys.stdin.isatty():
            try:
                # Only pause if we can actually read input
                print("\n" + "="*50)
                print("🎮 Game session ended.")
                input("Press Enter to close...")
            except (EOFError, KeyboardInterrupt):
                # If we can't read input, just exit gracefully
                pass
    except KeyboardInterrupt:
        print("\n\n👋 Story interrupted by user. Goodbye!")
    except Exception as e:
        print(f"❌ Error running app: {e}")
        if sys.platform.startswith('win') and sys.stdin.isatty():
            try:
                input("\nPress Enter to close...")
            except (EOFError, KeyboardInterrupt):
                pass
        sys.exit(1)


if __name__ == "__main__":
    main()