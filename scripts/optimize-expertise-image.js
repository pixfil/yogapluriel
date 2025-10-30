const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Optimise l'image expertise pour correspondre aux dimensions reelles d'affichage
 * Affichee en 348x348px (mobile) donc 500x500px suffit largement
 */

const inputPath = path.join(__dirname, '../public/imgi_103_1-1-768x768-1.webp');
const backupPath = inputPath + '.bak';
const TARGET_SIZE = 500; // 500x500px (suffisant pour 450px max affiche)
const QUALITY = 80;

async function optimize() {
  console.log('='.repeat(60));
  console.log('OPTIMISATION IMAGE EXPERTISE TOITURE');
  console.log('='.repeat(60));

  try {
    const beforeStat = fs.statSync(inputPath);
    const beforeKB = Math.round(beforeStat.size / 1024);

    console.log(`\nAvant : ${beforeKB} KB`);

    // Backup
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
      console.log('Backup cree');
    }

    // Optimiser
    await sharp(inputPath)
      .resize(TARGET_SIZE, TARGET_SIZE, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: QUALITY })
      .toFile(inputPath + '.tmp');

    fs.unlinkSync(inputPath);
    fs.renameSync(inputPath + '.tmp', inputPath);

    const afterStat = fs.statSync(inputPath);
    const afterKB = Math.round(afterStat.size / 1024);
    const savings = beforeKB - afterKB;
    const savingsPercent = ((savings / beforeKB) * 100).toFixed(0);

    console.log(`\nApres : ${afterKB} KB (${TARGET_SIZE}x${TARGET_SIZE}px)`);
    console.log(`Economie : -${savings} KB (-${savingsPercent}%)`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Optimisation terminee !');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erreur :', error.message);
  }
}

optimize();
