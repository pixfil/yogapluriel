#!/usr/bin/env node
/**
 * Script pour définir l'image principale de chaque projet
 * Utilise la première image de la galerie (order_index = 0) comme main_image
 * Usage: node scripts/fix-main-images.mjs
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

async function fixMainImages() {
  console.log('🔧 Correction des images principales des projets...\n');

  try {
    // Récupérer tous les projets
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, slug, main_image');

    if (projectsError) {
      console.error('❌ Erreur lors de la récupération des projets:', projectsError);
      return;
    }

    if (!projects || projects.length === 0) {
      console.log('⚠️  Aucun projet trouvé.');
      return;
    }

    console.log(`📦 ${projects.length} projet(s) trouvé(s)\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const project of projects) {
      console.log(`📂 ${project.title}`);
      console.log(`   ID: ${project.id.substring(0, 8)}...`);

      // Vérifier si main_image est déjà définie
      if (project.main_image) {
        console.log(`   ✓ Image principale déjà définie`);
        console.log(`   URL: ${project.main_image.substring(0, 60)}...`);
        skippedCount++;
        console.log('');
        continue;
      }

      // Récupérer la première image de la galerie
      const { data: images, error: imagesError } = await supabase
        .from('project_images')
        .select('url')
        .eq('project_id', project.id)
        .order('order_index', { ascending: true })
        .limit(1);

      if (imagesError) {
        console.error(`   ❌ Erreur images: ${imagesError.message}\n`);
        errorCount++;
        continue;
      }

      if (!images || images.length === 0) {
        console.log(`   ⚠️  Aucune image dans la galerie\n`);
        skippedCount++;
        continue;
      }

      const mainImageUrl = images[0].url;

      // Mettre à jour le projet
      const { error: updateError } = await supabase
        .from('projects')
        .update({ main_image: mainImageUrl })
        .eq('id', project.id);

      if (updateError) {
        console.error(`   ❌ Erreur mise à jour: ${updateError.message}\n`);
        errorCount++;
        continue;
      }

      console.log(`   ✅ Image principale définie`);
      console.log(`   URL: ${mainImageUrl.substring(0, 60)}...`);
      updatedCount++;
      console.log('');
    }

    // Résumé
    console.log('📊 RÉSUMÉ DE LA CORRECTION:\n');
    console.log(`   ✅ ${updatedCount} projet(s) mis à jour`);
    console.log(`   ⏭️  ${skippedCount} projet(s) ignoré(s) (déjà OK ou sans images)`);
    console.log(`   ❌ ${errorCount} erreur(s)\n`);

    if (updatedCount > 0) {
      console.log('✨ Correction terminée avec succès !');
      console.log('   Rechargez votre navigateur pour voir les images.\n');
    } else {
      console.log('ℹ️  Aucune mise à jour nécessaire.\n');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter
fixMainImages();
