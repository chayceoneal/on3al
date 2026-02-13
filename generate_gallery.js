const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, 'photos');
const outputFile = path.join(__dirname, 'photos_data.js');

// Allowed image extensions
const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function generateGallery() {
    try {
        // Read directory
        if (!fs.existsSync(photosDir)) {
            console.error(`Error: Photos directory not found at ${photosDir}`);
            process.exit(1);
        }

        const files = fs.readdirSync(photosDir);

        // Filter and map files
        const photoFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return validExtensions.includes(ext);
        }).map(file => `photos/${file}`);

        // Sort for consistency
        photoFiles.sort();

        // Create JS content
        const jsContent = `window.galleryPhotos = ${JSON.stringify(photoFiles, null, 2)};\n`;

        // Write to photos_data.js
        fs.writeFileSync(outputFile, jsContent);

        console.log(`Successfully updated ${outputFile} with ${photoFiles.length} photos.`);

    } catch (error) {
        console.error('Error generating gallery:', error);
        process.exit(1);
    }
}

generateGallery();
