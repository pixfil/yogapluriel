const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Script d'optimisation supplémentaire des images hero
 * Reduit la résolution (pas besoin de 4000px) + qualité 78%
 */

const publicDir = path.join(__dirname, '../public/background');

// Images hero les plus lourdes à optimiser davantage
const heroImages = [
  'bg-nos-prestations.webp',      // 1421 KB
  'bg-nos-prestations-2.webp',    // 1337 KB
  'bg-tuile-mecanique.webp',      // 1337 KB
  'bg-contact.webp',              // 1390 KB
  'bg-equipe.webp',               // 1329 KB
  'img-equipe.webp',              // 1103 KB
  'bg-ardoise.webp',
  'bg-isolation.webp',
  'bg-realisations.webp',
  'bg-aluprefa.webp',
  'bg-calculateur.webp'
];

const MAX_WIDTH = 2000;   // Largeur max (suffisant pour hero 1920px screens)
const QUALITY = 78;       // Qualité WebP (un peu plus agressive)

async function optimizeHeroImage(filename) {
  const imagePath = path.join(publicDir, filename);

  if (!fs.existsSync(imagePath)) {
    console.log(`⏭️  Skip (introuvable) : ${filename}`);
    return;
  }

  try {
    const beforeStat = fs.statSync(imagePath);
    const beforeKB = Math.round(beforeStat.size / 1024);

    // Lire métadonnées
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    console.log(`\n🔄 ${filename}`);
    console.log(`   Avant : ${metadata.width}x${metadata.height} - ${beforeKB} KB`);

    // Si déjà petit ou largeur correcte, skip
    if (beforeKB < 400 || metadata.width <= MAX_WIDTH) {
      console.log(`✅ Déjà optimisé`);
      return;
    }

    // Créer backup
    const backupPath = imagePath + '.bak';
    fs.copyFileSync(imagePath, backupPath);

    // Re-optimiser avec resize + qualité réduite
    await sharp(imagePath)
      .resize(MAX_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: QUALITY })
      .toFile(imagePath + '.tmp');

    // Remplacer
    fs.unlinkSync(imagePath);
    fs.renameSync(imagePath + '.tmp', imagePath);

    const afterStat = fs.statSync(imagePath);
    const afterKB = Math.round(afterStat.size / 1024);
    const savings = beforeKB - afterKB;
    const savingsPercent = ((savings / beforeKB) * 100).toFixed(0);

    console.log(`   Après : 2000x auto - ${afterKB} KB`);
    console.log(`✅ Économie : -${savings} KB (-${savingsPercent}%)`);

  } catch (error) {
    console.error(`❌ Erreur ${filename} :`, error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('OPTIMISATION SUPPLEMENTAIRE IMAGES HERO');
  console.log('='.repeat(60));
  console.log(`\nImages à optimiser : ${heroImages.length}`);
  console.log(`Largeur max : ${MAX_WIDTH}px`);
  console.log(`Qualité WebP : ${QUALITY}%\n`);

  for (const filename of heroImages) {
    await optimizeHeroImage(filename);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Optimisation terminée !');
  console.log('='.repeat(60));
}

main().catch(console.error);
