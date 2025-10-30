const fs = require('fs');
const path = require('path');

/**
 * Script de mise à jour des références d'images dans le code
 * Remplace .jpg/.jpeg/.png → .webp dans les fichiers TSX/TS/CSS
 */

const srcDir = path.join(__dirname, '../src');
const extensions = ['.tsx', '.ts', '.css', '.scss'];
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];

// Charger le rapport de conversion
const reportPath = path.join(__dirname, '../CONVERSION_REPORT.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Créer un mapping des conversions
const conversions = new Map();
report.conversions.forEach(conv => {
  const originalName = path.basename(conv.original);
  const webpName = path.basename(conv.webp);
  conversions.set(originalName, webpName);
});

const stats = {
  filesScanned: 0,
  filesModified: 0,
  replacements: 0,
};

const modifications = [];

/**
 * Met à jour un fichier avec les nouvelles références
 */
function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let modified = false;
  const fileReplacements = [];

  // Pour chaque conversion, chercher et remplacer
  conversions.forEach((webpName, originalName) => {
    // Échapper les caractères spéciaux pour regex
    const escapedOriginal = originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedOriginal, 'g');

    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      content = content.replace(regex, webpName);
      modified = true;
      fileReplacements.push({
        from: originalName,
        to: webpName,
        count: matches.length,
      });
      stats.replacements += matches.length;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    stats.filesModified++;

    const relativePath = path.relative(srcDir, filePath);
    modifications.push({
      file: relativePath,
      replacements: fileReplacements,
    });

    console.log(`✅ ${relativePath}`);
    fileReplacements.forEach(repl => {
      console.log(`   ${repl.from} → ${repl.to} (${repl.count}x)`);
    });
  }

  return modified;
}

/**
 * Scan récursif des fichiers
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!['node_modules', '.next', 'dist', 'build'].includes(file)) {
        scanDirectory(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        stats.filesScanned++;
        updateFile(fullPath);
      }
    }
  }
}

/**
 * Génère un rapport
 */
function generateReport() {
  console.log('\n');
  console.log('='.repeat(80));
  console.log('RAPPORT DE MISE A JOUR');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Fichiers scannes : ${stats.filesScanned}`);
  console.log(`Fichiers modifies : ${stats.filesModified}`);
  console.log(`Remplacements effectues : ${stats.replacements}`);
  console.log('');
  console.log('='.repeat(80));
  console.log('');

  if (modifications.length > 0) {
    console.log('DETAIL DES MODIFICATIONS');
    console.log('='.repeat(80));
    console.log('');

    modifications.forEach(mod => {
      console.log(`${mod.file}`);
      mod.replacements.forEach(repl => {
        console.log(`   ${repl.from} -> ${repl.to} (${repl.count}x)`);
      });
      console.log('');
    });
  }

  console.log('Mise a jour terminee !');
  console.log('');
  console.log('PROCHAINES ETAPES :');
  console.log('   1. Tester le build : npm run build');
  console.log('   2. Verifier visuellement quelques pages');
  console.log('   3. Commit les changements');
  console.log('');
}

/**
 * Main
 */
function main() {
  console.log('Mise a jour des references d\'images\n');
  console.log(`Repertoire : ${srcDir}`);
  console.log(`Conversions chargees : ${conversions.size}`);
  console.log('');
  console.log('='.repeat(80));
  console.log('');

  scanDirectory(srcDir);
  generateReport();
}

// Exécution
main();
