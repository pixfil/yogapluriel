#!/usr/bin/env node
/**
 * Script pour mettre à jour les URLs des photos d'équipe dans la base de données
 * Usage: node scripts/update-team-photos-db.mjs
 */

import { createClient } from '@supabase/supabase-js';
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
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// URLs des photos uploadées (par prénom pour matcher)
const PHOTO_URLS_BY_FIRSTNAME = {
  'Albert': 'https://ssavyibgujrvwvvhaahk.supabase.co/storage/v1/object/public/team-photos/albert-schmitt.jpg',
  'Gaspard': 'https://ssavyibgujrvwvvhaahk.supabase.co/storage/v1/object/public/team-photos/gaspard-muller.jpg',
  'Guillaume': 'https://ssavyibgujrvwvvhaahk.supabase.co/storage/v1/object/public/team-photos/guillaume-weber.jpg',
  'Isabel': 'https://ssavyibgujrvwvvhaahk.supabase.co/storage/v1/object/public/team-photos/isabel-laurent.jpg',
  'Maryan': 'https://ssavyibgujrvwvvhaahk.supabase.co/storage/v1/object/public/team-photos/maryan-hoffmann.jpg',
  'Quentin': 'https://ssavyibgujrvwvvhaahk.supabase.co/storage/v1/object/public/team-photos/quentin-roth.jpg',
  'Sophie': 'https://ssavyibgujrvwvvhaahk.supabase.co/storage/v1/object/public/team-photos/sophie-klein.jpg'
};

async function updateTeamPhotos() {
  console.log('🔄 Mise à jour des photos d\'équipe dans la base de données...\n');

  try {
    // Récupérer tous les membres de l'équipe
    const { data: members, error: fetchError } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true });

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des membres:', fetchError);
      return;
    }

    if (!members || members.length === 0) {
      console.log('⚠️  Aucun membre trouvé dans la table team_members');
      console.log('   Voulez-vous créer les membres ? (Tapez Ctrl+C pour annuler)\n');
      return;
    }

    console.log(`📋 ${members.length} membre(s) trouvé(s) dans la base:\n`);
    members.forEach(m => {
      console.log(`   - ${m.name} (${m.position}) ${m.photo_url ? '📷' : '❌'}`);
    });
    console.log('');

    let updated = 0;
    let skipped = 0;

    // Mettre à jour les membres existants en matchant par prénom
    for (const member of members) {
      // Extraire le prénom (premier mot du nom)
      const firstName = member.name.split(' ')[0];

      // Trouver l'URL de photo correspondante
      const photoUrl = PHOTO_URLS_BY_FIRSTNAME[firstName];

      if (photoUrl) {
        console.log(`🔄 Mise à jour: ${member.name} (prénom: ${firstName})`);

        const { error: updateError } = await supabase
          .from('team_members')
          .update({
            photo_url: photoUrl
          })
          .eq('id', member.id);

        if (updateError) {
          console.error(`   ❌ Erreur: ${updateError.message}`);
          skipped++;
        } else {
          console.log(`   ✅ Photo mise à jour: ${photoUrl.split('/').pop()}`);
          updated++;
        }
      } else {
        console.log(`⚠️  Aucune photo trouvée pour: ${member.name} (prénom: ${firstName})`);
        skipped++;
      }
      console.log('');
    }

    // Résumé
    console.log('📊 RÉSUMÉ:\n');
    console.log(`   ✅ ${updated} photo(s) mise(s) à jour`);
    if (skipped > 0) {
      console.log(`   ⚠️  ${skipped} membre(s) sans photo`);
    }
    console.log('\n✨ Mise à jour terminée !');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter
updateTeamPhotos();
