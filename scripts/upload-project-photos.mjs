#!/usr/bin/env node
/**
 * Script pour uploader les photos de projets vers Supabase Storage
 * Usage: node scripts/upload-project-photos.mjs
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

const PHOTOS_DIR = join(__dirname, '..', 'public', 'realisations');
const BUCKET_NAME = 'project-images';

async function uploadProjectPhotos() {
  console.log('🚀 Début de l\'upload des photos de projets...\n');

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

    // Lire les dossiers de projets
    const projectFolders = readdirSync(PHOTOS_DIR).filter(name => {
      const fullPath = join(PHOTOS_DIR, name);
      return statSync(fullPath).isDirectory();
    });

    console.log(`📁 ${projectFolders.length} dossier(s) de projet trouvé(s):\n`);

    let totalUploaded = 0;
    let totalProjects = 0;
    const results = [];

    for (const folderName of projectFolders) {
      const slug = folderName;
      const folderPath = join(PHOTOS_DIR, folderName);

      console.log(`📂 Projet: ${slug}`);

      // Récupérer le projet depuis la BDD
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, title')
        .eq('slug', slug)
        .maybeSingle();

      if (projectError) {
        console.error(`   ❌ Erreur BDD: ${projectError.message}`);
        continue;
      }

      if (!project) {
        console.log(`   ⚠️  Projet non trouvé en BDD (slug: ${slug}), skip...`);
        continue;
      }

      console.log(`   ✅ Projet trouvé: "${project.title}" (ID: ${project.id.substring(0, 8)}...)`);

      // Lire les fichiers images du dossier
      const imageFiles = readdirSync(folderPath).filter(f =>
        f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
      );

      if (imageFiles.length === 0) {
        console.log(`   ⚠️  Aucune image trouvée`);
        continue;
      }

      console.log(`   📸 ${imageFiles.length} image(s) à uploader`);

      let uploadedCount = 0;
      const projectResults = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const filename = imageFiles[i];
        const filePath = join(folderPath, filename);
        const filenameLower = filename.toLowerCase();

        // Déterminer le type basé sur le nom du fichier
        let imageType = 'detail';
        if (filenameLower.includes('avant')) imageType = 'avant';
        else if (filenameLower.includes('apres')) imageType = 'apres';
        else if (filenameLower.includes('pendant')) imageType = 'pendant';
        else if (filenameLower.includes('main')) imageType = 'detail'; // main.jpg is a detail image

        const alt = filename.replace(/\.\w+$/, '').replace(/-/g, ' ');

        try {
          // Lire le fichier
          const fileBuffer = readFileSync(filePath);

          // Nom du fichier dans le bucket : slug/filename
          const storagePath = `${slug}/${filename}`;

          // Upload vers Supabase Storage
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, fileBuffer, {
              contentType: `image/${filename.split('.').pop()}`,
              upsert: true
            });

          if (error) {
            console.error(`      ❌ ${filename}: ${error.message}`);
            continue;
          }

          // Obtenir l'URL publique
          const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(storagePath);

          // Vérifier si l'image existe déjà dans project_images
          const { data: existingImage } = await supabase
            .from('project_images')
            .select('id')
            .eq('project_id', project.id)
            .eq('url', publicUrl)
            .maybeSingle();

          if (!existingImage) {
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
              console.log(`      ✅ ${filename} (${imageType})`);
              uploadedCount++;
              totalUploaded++;
            }
          } else {
            console.log(`      ↷ ${filename} (déjà existant)`);
          }

          projectResults.push({
            filename,
            url: publicUrl,
            type: imageType
          });

        } catch (err) {
          console.error(`      ❌ Erreur ${filename}: ${err.message}`);
        }
      }

      if (uploadedCount > 0) {
        totalProjects++;
        results.push({
          slug,
          title: project.title,
          uploaded: uploadedCount,
          total: imageFiles.length
        });
      }

      console.log('');
    }

    // Résumé
    console.log('📊 RÉSUMÉ:\n');
    console.log(`   ✅ ${totalUploaded} image(s) uploadée(s)`);
    console.log(`   📁 ${totalProjects} projet(s) mis à jour`);
    console.log(`   📂 ${projectFolders.length} dossier(s) traité(s)\n`);

    if (results.length > 0) {
      console.log('📋 Détails par projet:\n');
      results.forEach(({ slug, title, uploaded, total }) => {
        console.log(`   ${title} (${slug}): ${uploaded}/${total} images`);
      });
    }

    console.log('\n✨ Upload terminé !');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter
uploadProjectPhotos();
