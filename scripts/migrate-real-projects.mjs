#!/usr/bin/env node
/**
 * Script pour migrer les 35 projets réels depuis public/realisations/ vers Supabase
 * Usage: node scripts/migrate-real-projects.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const REALISATIONS_DIR = join(__dirname, '..', 'public', 'realisations');
const BUCKET_NAME = 'project-images';

// Catégorie par défaut (à ajuster manuellement après)
const DEFAULT_CATEGORY_ID = '00000000-0000-0000-0000-000000000001'; // Placeholder

// Fonction pour générer un slug depuis le titre
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Fonction pour détecter le type d'image depuis le nom de fichier
function detectImageType(filename) {
  const lowerName = filename.toLowerCase();

  if (lowerName.includes('avant')) return 'avant';
  if (lowerName.includes('apres') || lowerName.includes('après')) return 'apres';
  if (lowerName.includes('pendant')) return 'pendant';

  return 'detail';
}

// Fonction pour détecter le layout de la galerie
function detectGalleryLayout(imageFiles) {
  const hasAvant = imageFiles.some(f => detectImageType(f) === 'avant');
  const hasApres = imageFiles.some(f => detectImageType(f) === 'apres');

  // Si on a au moins une photo avant ET après, c'est du before-after
  if (hasAvant && hasApres) {
    return 'before-after';
  }

  return 'grid';
}

async function migrateProjects() {
  console.log('🚀 Début de la migration des projets réels...\n');

  try {
    // Vérifier que le bucket existe
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.error('❌ Erreur lors de la vérification du bucket:', bucketError);
      return;
    }

    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      console.log(`📦 Création du bucket "${BUCKET_NAME}"...`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      });

      if (createError) {
        console.error('❌ Erreur lors de la création du bucket:', createError);
        return;
      }
      console.log('✅ Bucket créé avec succès\n');
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" existe déjà\n`);
    }

    // Récupérer une catégorie par défaut existante
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    const defaultCategoryId = categories && categories.length > 0 ? categories[0].id : null;

    if (!defaultCategoryId) {
      console.error('❌ Aucune catégorie trouvée dans la BDD. Créez au moins une catégorie avant de migrer les projets.');
      return;
    }

    console.log(`📋 Utilisation de la catégorie par défaut: ${defaultCategoryId}\n`);

    // Lire les dossiers de projets
    const projectFolders = readdirSync(REALISATIONS_DIR).filter(name => {
      const fullPath = join(REALISATIONS_DIR, name);
      return statSync(fullPath).isDirectory();
    });

    console.log(`📁 ${projectFolders.length} projet(s) trouvé(s):\n`);

    let totalProjects = 0;
    let totalImages = 0;
    const results = [];

    for (const folderName of projectFolders) {
      const folderPath = join(REALISATIONS_DIR, folderName);
      const title = folderName;
      const slug = generateSlug(title);

      console.log(`📂 Projet: ${title}`);
      console.log(`   Slug: ${slug}`);

      // Lire les fichiers images du dossier
      const imageFiles = readdirSync(folderPath).filter(f =>
        f.match(/\.(jpg|jpeg|png|webp|gif)$/i)
      );

      if (imageFiles.length === 0) {
        console.log(`   ⚠️  Aucune image trouvée, projet ignoré\n`);
        continue;
      }

      console.log(`   📸 ${imageFiles.length} image(s) trouvée(s)`);

      // Détecter le layout de galerie
      const galleryLayout = detectGalleryLayout(imageFiles);
      console.log(`   🎨 Layout: ${galleryLayout}`);

      // Créer le projet dans la BDD
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title,
          slug,
          location: 'Strasbourg, Bas-Rhin', // Par défaut
          date: new Date().getFullYear().toString(),
          description: `Projet de rénovation de toiture : ${title}`,
          published: true,
          featured: false,
          gallery_layout: galleryLayout,
        })
        .select()
        .single();

      if (projectError) {
        console.error(`   ❌ Erreur BDD: ${projectError.message}\n`);
        continue;
      }

      console.log(`   ✅ Projet créé (ID: ${project.id.substring(0, 8)}...)`);

      // Assigner la catégorie par défaut
      const { error: categoryError } = await supabase
        .from('project_categories')
        .insert({
          project_id: project.id,
          category_id: defaultCategoryId
        });

      if (categoryError) {
        console.error(`   ⚠️  Erreur catégorie: ${categoryError.message}`);
      }

      // Upload des images
      let uploadedCount = 0;

      for (let i = 0; i < imageFiles.length; i++) {
        const filename = imageFiles[i];
        const filePath = join(folderPath, filename);
        const imageType = detectImageType(filename);
        const alt = filename.replace(/\.\w+$/, '').replace(/-|_/g, ' ');

        try {
          // Lire le fichier
          const fileBuffer = readFileSync(filePath);

          // Vérifier que le fichier n'est pas vide
          if (fileBuffer.length === 0) {
            console.log(`      ⚠️  ${filename}: fichier vide, ignoré`);
            continue;
          }

          // Nom du fichier dans le bucket : slug/filename
          const storagePath = `${slug}/${filename}`;

          // Upload vers Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, fileBuffer, {
              contentType: `image/${filename.split('.').pop()}`,
              upsert: true
            });

          if (uploadError) {
            console.error(`      ❌ ${filename}: ${uploadError.message}`);
            continue;
          }

          // Obtenir l'URL publique
          const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(storagePath);

          // Créer l'entrée dans project_images
          const { error: insertError } = await supabase
            .from('project_images')
            .insert({
              project_id: project.id,
              url: publicUrl,
              alt: alt,
              type: imageType,
              order_index: i
            });

          if (insertError) {
            console.error(`      ❌ BDD ${filename}: ${insertError.message}`);
          } else {
            uploadedCount++;
            totalImages++;
          }

        } catch (err) {
          console.error(`      ❌ Erreur ${filename}: ${err.message}`);
        }
      }

      console.log(`   ✅ ${uploadedCount}/${imageFiles.length} image(s) uploadée(s)\n`);

      totalProjects++;
      results.push({
        title,
        slug,
        uploaded: uploadedCount,
        total: imageFiles.length,
        layout: galleryLayout
      });
    }

    // Résumé
    console.log('📊 RÉSUMÉ DE LA MIGRATION:\n');
    console.log(`   ✅ ${totalProjects} projet(s) créé(s)`);
    console.log(`   📸 ${totalImages} image(s) uploadée(s)`);
    console.log(`   📂 ${projectFolders.length} dossier(s) traité(s)\n`);

    if (results.length > 0) {
      console.log('📋 Détails par projet:\n');
      results.forEach(({ title, slug, uploaded, total, layout }) => {
        const layoutIcon = layout === 'before-after' ? '🔄' : '🔲';
        console.log(`   ${layoutIcon} ${title}`);
        console.log(`      Slug: ${slug}`);
        console.log(`      Images: ${uploaded}/${total}`);
        console.log(`      Layout: ${layout}\n`);
      });
    }

    console.log('✨ Migration terminée !');
    console.log('\n⚠️  PROCHAINES ÉTAPES:');
    console.log('   1. Vérifiez les projets dans l\'admin');
    console.log('   2. Ajustez les catégories de chaque projet');
    console.log('   3. Complétez les descriptions et autres métadonnées');
    console.log('   4. Vérifiez l\'affichage sur le site public\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter
migrateProjects();
