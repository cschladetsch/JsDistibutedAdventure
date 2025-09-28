#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Play Story Choice - Choose which story to run (not oldest)
Usage: python play_story_choice.py
"""

import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime

# Fix Windows console encoding for emojis
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'replace')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'replace')


def get_all_stories():
    """Get all story files sorted by modification time (newest first)"""
    stories_dir = Path("stories")
    if not stories_dir.exists():
        return []

    story_files = list(stories_dir.glob("*.json"))
    if not story_files:
        return []

    # Sort by modification time (newest first)
    return sorted(story_files, key=lambda x: x.stat().st_mtime, reverse=True)


def format_file_time(file_path):
    """Format file modification time as readable string"""
    mtime = file_path.stat().st_mtime
    dt = datetime.fromtimestamp(mtime)
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def main():
    print("🎮 STORY SELECTOR")
    print("=" * 50)

    # Check if Node.js is available
    try:
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
        input("Press Enter to exit...")
        sys.exit(1)

    # Get all stories
    stories = get_all_stories()
    if not stories:
        print("❌ No story files found in stories/ directory")
        input("Press Enter to exit...")
        sys.exit(1)

    print(f"\n📚 Found {len(stories)} stories:")
    print("-" * 50)

    # Show all stories except the oldest (skip last one)
    available_stories = stories[:-1] if len(stories) > 1 else stories

    if not available_stories:
        print("❌ Only one story found (the oldest). Generate more stories first.")
        input("Press Enter to exit...")
        sys.exit(1)

    # Display story options
    for i, story in enumerate(available_stories, 1):
        age_info = "Latest" if i == 1 else f"{i} newest"
        print(f"[{i}] {story.name}")
        print(f"    Created: {format_file_time(story)} ({age_info})")
        print()

    # Get user choice
    while True:
        try:
            choice = input(f"📝 Choose story (1-{len(available_stories)}): ").strip()
            choice_num = int(choice)
            if 1 <= choice_num <= len(available_stories):
                selected_story = available_stories[choice_num - 1]
                break
            else:
                print(f"❌ Please enter a number between 1 and {len(available_stories)}")
        except ValueError:
            print("❌ Please enter a valid number")
        except (EOFError, KeyboardInterrupt):
            print("\n👋 Goodbye!")
            sys.exit(0)

    print(f"\n🎮 Playing: {selected_story.name}")
    print("=" * 50)
    print()

    # Run the selected story
    try:
        cmd = ["node", "run_story.js", str(selected_story)]
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