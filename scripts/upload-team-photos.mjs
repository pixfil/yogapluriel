#!/usr/bin/env node
/**
 * Script pour uploader les photos d'équipe vers Supabase Storage
 * Usage: node scripts/upload-team-photos.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
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

const PHOTOS_DIR = join(__dirname, '..', 'public', 'equipes');
const BUCKET_NAME = 'team-photos';

// Mapping des noms de fichiers vers les noms dans la BDD
const TEAM_MAPPING = {
  'Albert.jpg': 'Albert Schmitt',
  'Gaspard.jpg': 'Gaspard Muller',
  'Guillaume.jpg': 'Guillaume Weber',
  'Isabel.jpg': 'Isabel Laurent',
  'maryan.jpg': 'Maryan Hoffmann',
  'Quentin.jpg': 'Quentin Roth',
  'Sophie.jpg': 'Sophie Klein'
};

async function uploadTeamPhotos() {
  console.log('🚀 Début de l\'upload des photos d\'équipe...\n');

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
        fileSizeLimit: 5242880, // 5MB
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

    // Lire les fichiers du dossier
    const files = readdirSync(PHOTOS_DIR).filter(f =>
      f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
    );

    console.log(`📁 ${files.length} photo(s) trouvée(s):\n`);

    const results = [];

    for (const filename of files) {
      const filePath = join(PHOTOS_DIR, filename);
      const memberName = TEAM_MAPPING[filename] || filename.replace(/\.\w+$/, '');

      console.log(`📤 Upload: ${filename} → ${memberName}`);

      try {
        // Lire le fichier
        const fileBuffer = readFileSync(filePath);

        // Nom du fichier dans le bucket (slug du nom)
        const slug = memberName.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-');

        const storagePath = `${slug}.jpg`;

        // Upload vers Supabase Storage
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true // Remplacer si existe déjà
          });

        if (error) {
          console.error(`   ❌ Erreur: ${error.message}`);
          continue;
        }

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        console.log(`   ✅ URL: ${publicUrl}`);

        results.push({
          filename,
          memberName,
          slug,
          url: publicUrl,
          storagePath
        });

      } catch (err) {
        console.error(`   ❌ Erreur lors du traitement: ${err.message}`);
      }

      console.log('');
    }

    // Résumé
    console.log('\n📊 RÉSUMÉ:\n');
    console.log(`✅ ${results.length}/${files.length} photo(s) uploadée(s) avec succès\n`);

    if (results.length > 0) {
      console.log('📋 URLs générées:\n');
      results.forEach(({ memberName, url }) => {
        console.log(`   ${memberName}: ${url}`);
      });
    }

    console.log('\n✨ Upload terminé !');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter
uploadTeamPhotos();
