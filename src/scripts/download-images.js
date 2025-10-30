// Script pour télécharger toutes les images des projets depuis formdetoit.fr
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');
const projectsData = require('../lib/projects-data.json');

// Créer les dossiers nécessaires
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Dossier créé: ${dirPath}`);
  }
}

// Télécharger une image
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    // Construire l'URL complète depuis formdetoit.fr
    const fullUrl = url.startsWith('http') ? url : `https://formdetoit.fr${url}`;
    
    console.log(`⬇️  Téléchargement: ${fullUrl} -> ${filePath}`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(fullUrl, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Image téléchargée: ${path.basename(filePath)}`);
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlink(filePath, () => {});
          console.error(`❌ Erreur écriture: ${err.message}`);
          reject(err);
        });
      } else if (response.statusCode === 404) {
        console.log(`⚠️  Image non trouvée (404): ${fullUrl}`);
        resolve(); // On continue même si l'image n'existe pas
      } else {
        console.error(`❌ Erreur HTTP ${response.statusCode}: ${fullUrl}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.error(`❌ Erreur téléchargement: ${err.message}`);
      reject(err);
    });
  });
}

// Attendre un délai pour éviter de surcharger le serveur
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadAllImages() {
  console.log('🚀 Début du téléchargement des images...');
  
  const publicDir = path.join(__dirname, '..', '..', 'public');
  const realisationsDir = path.join(publicDir, 'realisations');
  
  // Créer le dossier realisations s'il n'existe pas
  ensureDirectoryExists(realisationsDir);
  
  let totalImages = 0;
  let downloadedImages = 0;
  let errorCount = 0;
  
  for (const project of projectsData.projects) {
    console.log(`\n📂 Projet: ${project.title}`);
    
    // Créer le dossier pour ce projet
    const projectSlug = project.slug;
    const projectDir = path.join(realisationsDir, projectSlug);
    ensureDirectoryExists(projectDir);
    
    // Télécharger l'image principale
    if (project.mainImage) {
      totalImages++;
      try {
        const fileName = path.basename(project.mainImage);
        const filePath = path.join(projectDir, fileName);
        
        if (!fs.existsSync(filePath)) {
          await downloadImage(project.mainImage, filePath);
          await delay(500); // Attendre 500ms entre chaque téléchargement
        } else {
          console.log(`⏭️  Déjà existant: ${fileName}`);
        }
        
        downloadedImages++;
      } catch (error) {
        console.error(`❌ Erreur image principale ${project.mainImage}:`, error.message);
        errorCount++;
      }
    }
    
    // Télécharger les images de la galerie
    if (project.gallery && project.gallery.length > 0) {
      for (const image of project.gallery) {
        totalImages++;
        try {
          const fileName = path.basename(image.url);
          const filePath = path.join(projectDir, fileName);
          
          if (!fs.existsSync(filePath)) {
            await downloadImage(image.url, filePath);
            await delay(500); // Attendre 500ms entre chaque téléchargement
          } else {
            console.log(`⏭️  Déjà existant: ${fileName}`);
          }
          
          downloadedImages++;
        } catch (error) {
          console.error(`❌ Erreur image galerie ${image.url}:`, error.message);
          errorCount++;
        }
      }
    }
  }
  
  console.log(`\n🎉 Téléchargement terminé !`);
  console.log(`📊 Statistiques:`);
  console.log(`   - Images totales: ${totalImages}`);
  console.log(`   - Images téléchargées: ${downloadedImages}`);
  console.log(`   - Erreurs: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log(`✅ Toutes les images ont été téléchargées avec succès !`);
  } else {
    console.log(`⚠️  Quelques images n'ont pas pu être téléchargées (peuvent ne pas exister sur le site original)`);
  }
}

// Exécuter le script
if (require.main === module) {
  downloadAllImages().catch(console.error);
}

module.exports = { downloadAllImages };