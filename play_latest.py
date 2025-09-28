#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Play Latest Story - Run the newest story file
Usage: python play_latest.py
"""

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

    # Return the most recently modified story (newest)
    return max(story_files, key=lambda x: x.stat().st_mtime)


def main():
    print("🎮 LATEST STORY PLAYER")
    print("=" * 40)

    # Check if Node.js is available
    try:
        # Hide subprocess window on Windows
        startup_info = None
        if sys.platform.startswith('win'):
            startup_info = subprocess.STARTUPINFO()
            startup_info.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            startup_info.wShowWindow = subprocess.SW_HIDE

        subprocess.run(["node", "--version"], check=True,
                      capture_output=True, text=True, startupinfo=startup_info)
        print("✅ Node.js is ready")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: Node.js is required but not found")
        print("Please install Node.js: https://nodejs.org/")
        input("Press Enter to exit...")
        sys.exit(1)

    # Check for required files
    required_files = ["run_story.js", "StorySystem.js"]
    missing_files = [f for f in required_files if not os.path.exists(f)]

    if missing_files:
        print(f"❌ Error: Missing required files: {', '.join(missing_files)}")
        input("Press Enter to exit...")
        sys.exit(1)

    # Find latest story
    story_file = find_latest_story()
    if not story_file:
        print("❌ No story files found in stories/ directory")
        print("Generate a story first using generate_story.bat or run.py --generate")
        input("Press Enter to exit...")
        sys.exit(1)

    print(f"🎮 Playing latest story: {story_file.name}")
    print("=" * 40)
    print()

    # Run the Node.js story interactively
    try:
        cmd = ["node", "run_story.js", str(story_file)]
        print(f"🚀 Running: {' '.join(cmd)}")
        print("=" * 50)
        print()

        # Run in current console window (no new window)
        result = subprocess.call(cmd, cwd=".")

        print("\n" + "=" * 50)
        print("🎮 Game session ended.")

        if sys.platform.startswith('win') and sys.stdin.isatty():
            try:
                input("Press Enter to close...")
            except (EOFError, KeyboardInterrupt):
                pass

    except KeyboardInterrupt:
        print("\n\n👋 Story interrupted by user. Goodbye!")
    except Exception as e:
        print(f"❌ Error running story: {e}")
        if sys.platform.startswith('win') and sys.stdin.isatty():
            try:
                input("\nPress Enter to close...")
            except (EOFError, KeyboardInterrupt):
                pass


if __name__ == "__main__":
    main()