const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const PUBLIC_DIR = path.join(__dirname, '../public');
const FAVICON_PATH = path.join(PUBLIC_DIR, 'favicon.ico');

const icons = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
];

async function generateIcons() {
    if (!fs.existsSync(FAVICON_PATH)) {
        console.error('Error: public/favicon.ico not found');
        process.exit(1);
    }

    console.log('Generating icons from favicon.ico...');

    for (const icon of icons) {
        const outputPath = path.join(PUBLIC_DIR, icon.name);
        try {
            await sharp(FAVICON_PATH)
                .resize(icon.size, icon.size)
                .toFile(outputPath);
            console.log(`Generated ${icon.name}`);
        } catch (error) {
            console.error(`Error generating ${icon.name}:`, error);
        }
    }

    console.log('Icon generation complete!');
}

generateIcons();
