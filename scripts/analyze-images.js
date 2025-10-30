const fs = require('fs');
const path = require('path');

/**
 * Script d'analyse des images du site
 * Scan récursif de /public/ et calcul des économies potentielles WebP
 */

const publicDir = path.join(__dirname, '../public');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
const images = [];

// Fonction récursive pour scanner les fichiers
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const sizeKB = Math.round(stat.size / 1024);
        const relativePath = path.relative(publicDir, fullPath);

        images.push({
          name: file,
          path: relativePath,
          fullPath: fullPath,
          ext: ext,
          sizeKB: sizeKB,
          sizeMB: (stat.size / (1024 * 1024)).toFixed(2),
          // Estimation économie WebP : ~65% pour JPEG, ~75% pour PNG
          estimatedWebPKB: ext === '.png'
            ? Math.round(sizeKB * 0.25)
            : Math.round(sizeKB * 0.35),
        });
      }
    }
  }
}

// Scanner le répertoire
console.log('🔍 Scan du répertoire /public/ en cours...\n');
scanDirectory(publicDir);

// Trier par taille décroissante
images.sort((a, b) => b.sizeKB - a.sizeKB);

// Statistiques globales
const totalSizeKB = images.reduce((acc, img) => acc + img.sizeKB, 0);
const totalEstimatedWebPKB = images.reduce((acc, img) => acc + img.estimatedWebPKB, 0);
const totalSavingsKB = totalSizeKB - totalEstimatedWebPKB;
const savingsPercent = ((totalSavingsKB / totalSizeKB) * 100).toFixed(1);

console.log('📊 STATISTIQUES GLOBALES');
console.log('═'.repeat(80));
console.log(`Total images trouvées : ${images.length}`);
console.log(`Poids actuel total : ${(totalSizeKB / 1024).toFixed(2)} MB (${totalSizeKB} KB)`);
console.log(`Poids estimé WebP : ${(totalEstimatedWebPKB / 1024).toFixed(2)} MB (${totalEstimatedWebPKB} KB)`);
console.log(`Économie potentielle : ${(totalSavingsKB / 1024).toFixed(2)} MB (${totalSavingsKB} KB) - ${savingsPercent}%`);
console.log('═'.repeat(80));
console.log('');

// Top 20 images les plus lourdes
console.log('🔥 TOP 20 - IMAGES LES PLUS LOURDES');
console.log('═'.repeat(80));
console.log('');

images.slice(0, 20).forEach((img, index) => {
  const savings = img.sizeKB - img.estimatedWebPKB;
  const savingsPercent = ((savings / img.sizeKB) * 100).toFixed(0);

  console.log(`${(index + 1).toString().padStart(2)}. ${img.name}`);
  console.log(`    Chemin: ${img.path}`);
  console.log(`    Poids actuel: ${img.sizeKB} KB (${img.sizeMB} MB)`);
  console.log(`    Poids estimé WebP: ${img.estimatedWebPKB} KB`);
  console.log(`    Économie: -${savings} KB (-${savingsPercent}%)`);
  console.log('');
});

// Analyse par dossier
console.log('📁 ANALYSE PAR DOSSIER');
console.log('═'.repeat(80));
console.log('');

const folderStats = {};
images.forEach(img => {
  const folder = path.dirname(img.path);
  if (!folderStats[folder]) {
    folderStats[folder] = {
      count: 0,
      totalKB: 0,
      estimatedWebPKB: 0,
    };
  }
  folderStats[folder].count++;
  folderStats[folder].totalKB += img.sizeKB;
  folderStats[folder].estimatedWebPKB += img.estimatedWebPKB;
});

Object.entries(folderStats)
  .sort((a, b) => b[1].totalKB - a[1].totalKB)
  .forEach(([folder, stats]) => {
    const savings = stats.totalKB - stats.estimatedWebPKB;
    const savingsPercent = ((savings / stats.totalKB) * 100).toFixed(0);

    console.log(`${folder || '(racine)'}`);
    console.log(`  ${stats.count} images - ${(stats.totalKB / 1024).toFixed(2)} MB → ${(stats.estimatedWebPKB / 1024).toFixed(2)} MB (-${savingsPercent}%)`);
  });

console.log('');
console.log('✅ Analyse terminée !');
console.log('');
console.log('💡 Prochaines étapes :');
console.log('   1. Valider les images à convertir');
console.log('   2. Installer sharp : npm install --save-dev sharp');
console.log('   3. Lancer le script de conversion');
