const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Optimisation finale - toutes images >300KB
 */

const publicDir = path.join(__dirname, '../public/background');
const MAX_WIDTH = 2000;
const QUALITY = 78;
const MIN_SIZE_KB = 300; // Optimiser si >300KB

async function optimizeImage(filename) {
  const imagePath = path.join(publicDir, filename);
  const stat = fs.statSync(imagePath);
  const sizeKB = Math.round(stat.size / 1024);

  // Skip si deja assez petit
  if (sizeKB <= MIN_SIZE_KB) {
    return null;
  }

  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    console.log(`\n🔄 ${filename}`);
    console.log(`   Avant : ${metadata.width}x${metadata.height} - ${sizeKB} KB`);

    // Backup
    const backupPath = imagePath + '.bak';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(imagePath, backupPath);
    }

    // Optimiser
    await sharp(imagePath)
      .resize(MAX_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: QUALITY })
      .toFile(imagePath + '.tmp');

    fs.unlinkSync(imagePath);
    fs.renameSync(imagePath + '.tmp', imagePath);

    const afterStat = fs.statSync(imagePath);
    const afterKB = Math.round(afterStat.size / 1024);
    const savings = sizeKB - afterKB;
    const savingsPercent = ((savings / sizeKB) * 100).toFixed(0);

    console.log(`   Après : max 2000px - ${afterKB} KB`);
    console.log(`✅ -${savings} KB (-${savingsPercent}%)`);

    return { filename, before: sizeKB, after: afterKB, savings };

  } catch (error) {
    console.error(`❌ ${filename} :`, error.message);
    return null;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('OPTIMISATION FINALE - Images >300KB');
  console.log('='.repeat(60));

  const files = fs.readdirSync(publicDir)
    .filter(f => f.endsWith('.webp') && !f.includes('.bak'));

  const results = [];
  for (const file of files) {
    const result = await optimizeImage(file);
    if (result) results.push(result);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ ${results.length} images optimisées`);

  if (results.length > 0) {
    const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);
    console.log(`📊 Économie totale : ${totalSavings} KB`);
  }

  console.log('='.repeat(60));
}

main().catch(console.error);
