#!/bin/bash

# Directory containing photos
PHOTOS_DIR="photos"
OUTPUT_FILE="photos_data.js"

# Check if photos directory exists
if [ ! -d "$PHOTOS_DIR" ]; then
  echo "Creating photos directory..."
  mkdir "$PHOTOS_DIR"
fi

echo "window.galleryPhotos = [" > "$OUTPUT_FILE"

# Find images and add them to the JS array
first=true
for file in "$PHOTOS_DIR"/*; do
  if [[ "$file" == *.jpg || "$file" == *.jpeg || "$file" == *.png || "$file" == *.webp || "$file" == *.gif ]]; then
    if [ "$first" = true ]; then
      first=false
    else
      echo "," >> "$OUTPUT_FILE"
    fi
    # Escape quotes if necessary (basic implementation)
    echo "  \"$file\"" >> "$OUTPUT_FILE"
  fi
done

echo "];" >> "$OUTPUT_FILE"

echo "✅ Gallery updated! Saved to $OUTPUT_FILE"
