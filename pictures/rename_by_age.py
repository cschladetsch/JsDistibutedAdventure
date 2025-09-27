import os
import glob
from pathlib import Path

def rename_images_by_age():
    # Get all jpg files in current directory
    jpg_files = glob.glob('*.jpg') + glob.glob('*.JPG') + glob.glob('*.jpeg') + glob.glob('*.JPEG')

    if not jpg_files:
        print("No JPG files found in current directory")
        return

    # Get file info with modification times
    file_info = []
    for file in jpg_files:
        if not file.startswith('0'):  # Skip already renamed files
            mtime = os.path.getmtime(file)
            file_info.append((file, mtime))

    if not file_info:
        print("No files to rename (all files already renamed or no valid files)")
        return

    # Sort by modification time (newest first)
    file_info.sort(key=lambda x: x[1], reverse=True)

    # Rename files
    for i, (old_name, _) in enumerate(file_info):
        new_name = f"{i:04d}.jpg"

        # Check if target name already exists
        if os.path.exists(new_name):
            print(f"Warning: {new_name} already exists, skipping {old_name}")
            continue

        try:
            os.rename(old_name, new_name)
            print(f"Renamed: {old_name} -> {new_name}")
        except Exception as e:
            print(f"Error renaming {old_name}: {e}")

    print(f"\nRenamed {len(file_info)} files successfully")

if __name__ == "__main__":
    rename_images_by_age()