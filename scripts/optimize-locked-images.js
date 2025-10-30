const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Optimisation avec stratégie différente pour fichiers verrouillés
 * Génère un nouveau fichier au lieu de remplacer
 */

const publicDir = path.join(__dirname, '../public/background');

const lockedImages = [
  'bg-nos-prestations.webp',
  'bg-equipe.webp',
  'bg-aluprefa.webp'
];

const MAX_WIDTH = 2000;
const QUALITY = 78;

async function optimizeLockedImage(filename) {
  const imagePath = path.join(publicDir, filename);
  const optimizedPath = path.join(publicDir, filename.replace('.webp', '-optimized.webp'));

  if (!fs.existsSync(imagePath)) {
    console.log(`⏭️  Skip : ${filename}`);
    return;
  }

  try {
    const beforeStat = fs.statSync(imagePath);
    const beforeKB = Math.round(beforeStat.size / 1024);

    const image = sharp(imagePath);
    const metadata = await image.metadata();

    console.log(`\n🔄 ${filename}`);
    console.log(`   Avant : ${metadata.width}x${metadata.height} - ${beforeKB} KB`);

    // Créer version optimisée avec nouveau nom
    await sharp(imagePath)
      .resize(MAX_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: QUALITY })
      .toFile(optimizedPath);

    const afterStat = fs.statSync(optimizedPath);
    const afterKB = Math.round(afterStat.size / 1024);
    const savings = beforeKB - afterKB;
    const savingsPercent = ((savings / beforeKB) * 100).toFixed(0);

    console.log(`   Après : 2000x auto - ${afterKB} KB`);
    console.log(`✅ Créé : ${filename.replace('.webp', '-optimized.webp')}`);
    console.log(`   Économie potentielle : -${savings} KB (-${savingsPercent}%)`);
    console.log(`   ⚠️  MANUEL : Remplacez ${filename} par ${filename.replace('.webp', '-optimized.webp')}`);

  } catch (error) {
    console.error(`❌ Erreur ${filename} :`, error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('OPTIMISATION FICHIERS VERROUILLES (METHODE ALTERNATIVE)');
  console.log('='.repeat(60));
  console.log('\nCréation de versions optimisées avec nouveau nom\n');

  for (const filename of lockedImages) {
    await optimizeLockedImage(filename);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Fichiers optimisés créés !');
  console.log('\n⚠️  ACTION REQUISE :');
  console.log('1. Fermez navigateur/éditeur');
  console.log('2. Supprimez les anciens fichiers');
  console.log('3. Renommez les -optimized.webp');
  console.log('='.repeat(60));
}

main().catch(console.error);
