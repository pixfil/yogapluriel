#!/usr/bin/env node
/**
 * Script pour nettoyer les photos vides et les anciens projets de la BDD
 * Usage: node scripts/cleanup-empty-photos.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

const BUCKET_NAME = 'project-images';

async function cleanup() {
  console.log('🧹 Début du nettoyage...\n');

  try {
    // 1. Supprimer tous les fichiers du bucket project-images
    console.log('📂 Nettoyage du bucket "project-images"...');

    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list();

    if (listError) {
      console.error('❌ Erreur lors du listage des fichiers:', listError);
    } else if (files && files.length > 0) {
      console.log(`   Trouvé ${files.length} dossier(s) dans le bucket`);

      // Lister tous les fichiers dans tous les dossiers
      let totalFiles = 0;
      const filesToDelete = [];

      for (const folder of files) {
        if (folder.name) {
          const { data: folderFiles } = await supabase.storage
            .from(BUCKET_NAME)
            .list(folder.name);

          if (folderFiles) {
            for (const file of folderFiles) {
              filesToDelete.push(`${folder.name}/${file.name}`);
              totalFiles++;
            }
          }
        }
      }

      console.log(`   Trouvé ${totalFiles} fichier(s) à supprimer`);

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(filesToDelete);

        if (deleteError) {
          console.error('   ❌ Erreur lors de la suppression:', deleteError);
        } else {
          console.log(`   ✅ ${filesToDelete.length} fichier(s) supprimé(s) du bucket\n`);
        }
      }
    } else {
      console.log('   ✅ Bucket déjà vide\n');
    }

    // 2. Supprimer toutes les entrées de project_images
    console.log('🗑️  Suppression des entrées project_images...');
    const { error: imagesDeleteError, count: imagesCount } = await supabase
      .from('project_images')
      .delete()
      .gte('created_at', '1900-01-01'); // Delete all

    if (imagesDeleteError) {
      console.error('   ❌ Erreur:', imagesDeleteError);
    } else {
      console.log(`   ✅ Toutes les entrées project_images supprimées\n`);
    }

    // 3. Supprimer toutes les entrées de project_categories
    console.log('🗑️  Suppression des entrées project_categories...');
    const { error: categoriesDeleteError } = await supabase
      .from('project_categories')
      .delete()
      .gte('created_at', '1900-01-01'); // Delete all

    if (categoriesDeleteError) {
      console.error('   ❌ Erreur:', categoriesDeleteError);
    } else {
      console.log(`   ✅ Toutes les entrées project_categories supprimées\n`);
    }

    // 4. Supprimer tous les projets
    console.log('🗑️  Suppression de tous les projets...');
    const { error: projectsDeleteError, count: projectsCount } = await supabase
      .from('projects')
      .delete()
      .gte('created_at', '1900-01-01'); // Delete all

    if (projectsDeleteError) {
      console.error('   ❌ Erreur:', projectsDeleteError);
    } else {
      console.log(`   ✅ Tous les projets supprimés\n`);
    }

    // 5. Vérification finale
    console.log('📊 VÉRIFICATION FINALE:\n');

    const { count: remainingProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    const { count: remainingImages } = await supabase
      .from('project_images')
      .select('*', { count: 'exact', head: true });

    const { count: remainingCategories } = await supabase
      .from('project_categories')
      .select('*', { count: 'exact', head: true });

    console.log(`   Projets restants: ${remainingProjects || 0}`);
    console.log(`   Images restantes: ${remainingImages || 0}`);
    console.log(`   Catégories liées restantes: ${remainingCategories || 0}`);

    console.log('\n✨ Nettoyage terminé !');
    console.log('   Vous pouvez maintenant exécuter le script de migration des 35 projets réels.\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter
cleanup();
