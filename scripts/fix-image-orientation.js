const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Script de correction d'orientation pour images WebP mal orientees
 * Restaure depuis backup et reconvertit avec rotation EXIF correcte
 */

const publicDir = path.join(__dirname, '../public');
const backupDir = path.join(__dirname, '../.backup-images');
const QUALITY = 82;

// Liste des images a corriger (sans extension)
const imagesToFix = [
  'background/bg-nos-prestations',
  'background/bg-nos-prestations-2',
  'background/img-equipe',
  'background/bg-tuile-mecanique'
];

async function fixImageOrientation(imagePath) {
  const webpPath = path.join(publicDir, imagePath + '.webp');

  // Chercher l'original dans backup (peut etre .jpg, .jpeg, .png)
  const extensions = ['.jpg', '.jpeg', '.png'];
  let originalPath = null;

  for (const ext of extensions) {
    const testPath = path.join(backupDir, imagePath + ext);
    if (fs.existsSync(testPath)) {
      originalPath = testPath;
      break;
    }
  }

  if (!originalPath) {
    console.log(`❌ Original non trouve pour : ${imagePath}`);
    return;
  }

  console.log(`\n🔄 Correction : ${path.basename(originalPath)}`);

  try {
    // Lire l'image avec Sharp et appliquer rotate() pour respecter EXIF
    const image = sharp(originalPath);
    const metadata = await image.metadata();

    console.log(`   Orientation EXIF : ${metadata.orientation || 'non definie'}`);

    // Conversion avec rotation automatique EXIF
    await image
      .rotate() // Auto-rotate selon EXIF
      .webp({ quality: QUALITY })
      .toFile(webpPath);

    const webpStat = fs.statSync(webpPath);
    const webpSizeKB = Math.round(webpStat.size / 1024);

    console.log(`✅ Reconverti avec orientation correcte : ${webpSizeKB} KB`);

  } catch (error) {
    console.error(`❌ Erreur conversion ${imagePath} :`, error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('CORRECTION ORIENTATION IMAGES WEBP');
  console.log('='.repeat(60));
  console.log(`\nImages a corriger : ${imagesToFix.length}\n`);

  for (const imagePath of imagesToFix) {
    await fixImageOrientation(imagePath);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Correction terminee !');
  console.log('='.repeat(60));
}

main().catch(console.error);
