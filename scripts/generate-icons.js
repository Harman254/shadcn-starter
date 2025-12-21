const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const PUBLIC_DIR = path.join(__dirname, '../public');
const FAVICON_PATH = path.join(PUBLIC_DIR, 'favicon.ico');

// Icon configurations with safe zones for maskable icons
const icons = [
    // iOS - no safe zone needed
    { name: 'apple-touch-icon.png', size: 180, safeZone: 1.0 },
    // Android - maskable icons need 80% safe zone
    { name: 'android-chrome-192x192.png', size: 192, safeZone: 0.8 },
    { name: 'android-chrome-512x512.png', size: 512, safeZone: 0.8 },
    // Favicons - no safe zone needed
    { name: 'favicon-16x16.png', size: 16, safeZone: 1.0 },
    { name: 'favicon-32x32.png', size: 32, safeZone: 1.0 },
];

/**
 * Generate icon with proper safe zone for maskable icons
 * Safe zone ensures content is within 80% of icon area (10% padding on all sides)
 */
async function generateIconWithSafeZone(sourcePath, outputPath, size, safeZone) {
    if (safeZone === 1.0) {
        // No safe zone needed - resize directly
        await sharp(sourcePath)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .toFile(outputPath);
    } else {
        // Create icon with safe zone
        // Calculate safe zone dimensions (80% of size)
        // Round padding to ensure integer pixel positions
        const padding = Math.round((size * (1 - safeZone)) / 2);
        const safeZoneSize = size - (padding * 2);
        
        // Resize source to safe zone size
        const resized = await sharp(sourcePath)
            .resize(safeZoneSize, safeZoneSize, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .toBuffer();
        
        // Create canvas with padding and place resized icon in center
        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            }
        })
            .composite([{
                input: resized,
                left: padding,  // Now guaranteed to be an integer
                top: padding    // Now guaranteed to be an integer
            }])
            .toFile(outputPath);
    }
}

async function generateIcons() {
    if (!fs.existsSync(FAVICON_PATH)) {
        console.error('Error: public/favicon.ico not found');
        process.exit(1);
    }

    console.log('Generating PWA icons with proper safe zones...');
    console.log('Note: Maskable icons (Android) use 80% safe zone (10% padding on all sides)');

    for (const icon of icons) {
        const outputPath = path.join(PUBLIC_DIR, icon.name);
        try {
            await generateIconWithSafeZone(
                FAVICON_PATH,
                outputPath,
                icon.size,
                icon.safeZone
            );
            console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size}, safe zone: ${(icon.safeZone * 100).toFixed(0)}%)`);
        } catch (error) {
            console.error(`❌ Error generating ${icon.name}:`, error);
        }
    }

    console.log('\n✨ Icon generation complete!');
    console.log('\n📱 Next steps:');
    console.log('1. Test icons on your device after installing PWA');
    console.log('2. Icons should now be properly centered and proportionate');
    console.log('3. If issues persist, consider using a dedicated icon design tool');
}

generateIcons();
