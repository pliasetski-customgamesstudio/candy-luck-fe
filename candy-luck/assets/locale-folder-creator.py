import os
import shutil

def create_locale_folders(source_dir, languages):
    # Ensure the source directory exists
    if not os.path.exists(source_dir):
        print(f"Error: Source directory '{source_dir}' does not exist.")
        return

    # Create and copy content for each language
    for lang in languages:
        target_dir = os.path.join(os.path.dirname(source_dir), lang)
        
        # Skip if it's the source directory
        if target_dir == source_dir:
            continue

        # Create the target directory if it doesn't exist
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            print(f"Created directory: {target_dir}")

        # Copy contents from source to target
        for item in os.listdir(source_dir):
            s = os.path.join(source_dir, item)
            d = os.path.join(target_dir, item)
            if os.path.isdir(s):
                shutil.copytree(s, d, dirs_exist_ok=True)
            else:
                shutil.copy2(s, d)
        print(f"Copied contents to: {target_dir}")

# List of languages to support
languages = [
    "en",  # English (source)
    "cs",  # Czech
    "nl",  # Dutch
    "fi",  # Finnish
    "fr",  # French
    "de",  # German
    "it",  # Italian
    "no",  # Norwegian
    "pt",  # Portuguese
    "sv",  # Swedish
    "es"   # Spanish
]

# Set the path to your original English directory
source_directory = "/Users/henadzi/work/cgs_ts/web/assets"

# Create locale folders
create_locale_folders(source_directory, languages)

print("Locale folders created and populated successfully.")
