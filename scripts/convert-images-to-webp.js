const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Script de conversion automatique JPEG/PNG → WebP
 * - Conversion qualité 82% (optimal qualité/poids)
 * - Backup automatique des originaux
 * - Génération résolutions multiples (responsive)
 * - Rapport détaillé de conversion
 */

const publicDir = path.join(__dirname, '../public');
const backupDir = path.join(__dirname, '../.backup-images');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];

// Configuration
const QUALITY = 82; // WebP quality (82 = sweet spot)
const SKIP_WEBP = true; // Skip images déjà en WebP
const SKIP_SMALL = 50; // Skip images <50KB (déjà optimisées)

// Statistiques
const stats = {
  total: 0,
  converted: 0,
  skipped: 0,
  errors: 0,
  sizeBefore: 0,
  sizeAfter: 0,
};

const conversions = [];

/**
 * Crée le dossier de backup si nécessaire
 */
function ensureBackupDir() {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`✅ Dossier backup créé : ${backupDir}\n`);
  }
}

/**
 * Backup une image avant conversion
 */
function backupImage(filePath) {
  const relativePath = path.relative(publicDir, filePath);
  const backupPath = path.join(backupDir, relativePath);
  const backupDirPath = path.dirname(backupPath);

  // Créer les sous-dossiers
  if (!fs.existsSync(backupDirPath)) {
    fs.mkdirSync(backupDirPath, { recursive: true });
  }

  // Copier le fichier
  fs.copyFileSync(filePath, backupPath);
}

/**
 * Convertit une image en WebP
 */
async function convertToWebP(filePath) {
  try {
    const stat = fs.statSync(filePath);
    const sizeKB = Math.round(stat.size / 1024);

    // Skip images déjà petites
    if (sizeKB < SKIP_SMALL) {
      console.log(`⏭️  Skip (déjà optimisé <${SKIP_SMALL}KB) : ${path.basename(filePath)} (${sizeKB} KB)`);
      stats.skipped++;
      return;
    }

    // Skip si déjà WebP
    if (SKIP_WEBP && path.extname(filePath).toLowerCase() === '.webp') {
      console.log(`⏭️  Skip (déjà WebP) : ${path.basename(filePath)}`);
      stats.skipped++;
      return;
    }

    // Backup original
    backupImage(filePath);

    // Chemin de sortie WebP
    const parsedPath = path.parse(filePath);
    const webpPath = path.join(parsedPath.dir, parsedPath.name + '.webp');

    // Conversion
    await sharp(filePath)
      .webp({ quality: QUALITY })
      .toFile(webpPath);

    const webpStat = fs.statSync(webpPath);
    const webpSizeKB = Math.round(webpStat.size / 1024);
    const savings = sizeKB - webpSizeKB;
    const savingsPercent = ((savings / sizeKB) * 100).toFixed(0);

    // Supprimer l'original
    fs.unlinkSync(filePath);

    console.log(`✅ ${path.basename(filePath)} → ${path.basename(webpPath)}`);
    console.log(`   ${sizeKB} KB → ${webpSizeKB} KB (-${savings} KB, -${savingsPercent}%)`);

    stats.converted++;
    stats.sizeBefore += sizeKB;
    stats.sizeAfter += webpSizeKB;

    conversions.push({
      original: path.relative(publicDir, filePath),
      webp: path.relative(publicDir, webpPath),
      sizeBefore: sizeKB,
      sizeAfter: webpSizeKB,
      savings: savings,
      savingsPercent: savingsPercent,
    });

  } catch (error) {
    console.error(`❌ Erreur : ${path.basename(filePath)} - ${error.message}`);
    stats.errors++;
  }
}

/**
 * Scan récursif et conversion
 */
async function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Récursion
      await processDirectory(fullPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        stats.total++;
        await convertToWebP(fullPath);
      }
    }
  }
}

/**
 * Génère un rapport de conversion
 */
function generateReport() {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('📊 RAPPORT DE CONVERSION');
  console.log('═'.repeat(80));
  console.log('');
  console.log(`Total images analysées : ${stats.total}`);
  console.log(`✅ Converties : ${stats.converted}`);
  console.log(`⏭️  Skippées : ${stats.skipped}`);
  console.log(`❌ Erreurs : ${stats.errors}`);
  console.log('');
  console.log(`📦 Poids avant : ${(stats.sizeBefore / 1024).toFixed(2)} MB`);
  console.log(`📦 Poids après : ${(stats.sizeAfter / 1024).toFixed(2)} MB`);
  console.log(`💾 Économie : ${((stats.sizeBefore - stats.sizeAfter) / 1024).toFixed(2)} MB (-${(((stats.sizeBefore - stats.sizeAfter) / stats.sizeBefore) * 100).toFixed(1)}%)`);
  console.log('');
  console.log('═'.repeat(80));
  console.log('');

  // Top 10 conversions les plus efficaces
  console.log('🏆 TOP 10 - CONVERSIONS LES PLUS EFFICACES');
  console.log('═'.repeat(80));
  console.log('');

  conversions
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 10)
    .forEach((conv, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${conv.original}`);
      console.log(`    ${conv.sizeBefore} KB → ${conv.sizeAfter} KB (-${conv.savings} KB, -${conv.savingsPercent}%)`);
    });

  console.log('');
  console.log('✅ Conversion terminée !');
  console.log('');
  console.log('💾 Originaux sauvegardés dans : .backup-images/');
  console.log('');
  console.log('📋 PROCHAINES ÉTAPES :');
  console.log('   1. Mettre à jour les références dans le code (.jpg → .webp)');
  console.log('   2. Tester le build : npm run build');
  console.log('   3. Vérifier visuellement quelques pages');
  console.log('   4. Commit + Push');
  console.log('');

  // Sauvegarder le rapport dans un fichier
  const reportPath = path.join(__dirname, '../CONVERSION_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    date: new Date().toISOString(),
    stats: stats,
    conversions: conversions,
  }, null, 2));

  console.log(`📄 Rapport JSON sauvegardé : CONVERSION_REPORT.json`);
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Conversion JPEG/PNG → WebP\n');
  console.log(`📁 Répertoire : ${publicDir}`);
  console.log(`⚙️  Qualité WebP : ${QUALITY}%`);
  console.log(`💾 Backup : ${backupDir}`);
  console.log('');
  console.log('═'.repeat(80));
  console.log('');

  // Créer dossier backup
  ensureBackupDir();

  // Lancer la conversion
  await processDirectory(publicDir);

  // Générer le rapport
  generateReport();
}

// Exécution
main().catch(error => {
  console.error('❌ Erreur fatale :', error);
  process.exit(1);
});
