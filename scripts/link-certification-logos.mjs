#!/usr/bin/env node

/**
 * Script d'association des logos aux certifications
 * Mappe les logos du bucket avec les certifications en base
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function linkLogos() {
  console.log('🖼️  Association des logos aux certifications...\n');

  try {
    // Récupérer toutes les certifications
    const { data: certifications, error: certsError } = await supabase
      .from('certifications')
      .select('id, name')
      .order('display_order');

    if (certsError) throw certsError;

    console.log(`📋 ${certifications.length} certifications trouvées\n`);

    // Lister tous les fichiers dans le bucket
    const { data: files, error: filesError } = await supabase
      .storage
      .from('certification-logos')
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (filesError) throw filesError;

    console.log(`📁 ${files.length} logos trouvés dans le bucket\n`);

    // Mapping nom certification -> nom fichier
    const mapping = {
      'RGE Qualibat': ['qualibat', 'rge-qualibat', 'rge_qualibat'],
      'Artisan': ['artisan', 'artisan-alsace'],
      'RGE QualiPV': ['qualipv', 'rge-qualipv', 'rge_qualipv'],
      'VELUX Expert': ['velux', 'velux-expert', 'velux_expert'],
      'Marque Alsace': ['marque-alsace', 'marque_alsace', 'alsace'],
      'Artisan d\'Alsace': ['artisan-alsace', 'artisan_alsace'],
      'Lauréat Réseau Entreprendre Alsace': ['reseau-entreprendre', 'laureat', 'entreprendre']
    };

    let updatedCount = 0;

    // Pour chaque certification, trouver son logo
    for (const cert of certifications) {
      console.log(`🔍 ${cert.name}`);

      const possibleNames = mapping[cert.name] || [];
      let logoFile = null;

      // Chercher un fichier qui matche
      for (const file of files) {
        const fileName = file.name.toLowerCase().replace(/\.(png|jpg|jpeg|webp|svg)$/i, '');

        if (possibleNames.some(name => fileName.includes(name.toLowerCase()))) {
          logoFile = file;
          break;
        }
      }

      if (logoFile) {
        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('certification-logos')
          .getPublicUrl(logoFile.name);

        // Mettre à jour la certification
        const { error: updateError } = await supabase
          .from('certifications')
          .update({ logo_url: urlData.publicUrl })
          .eq('id', cert.id);

        if (updateError) {
          console.log(`   ❌ Erreur mise à jour: ${updateError.message}`);
        } else {
          console.log(`   ✅ Logo associé: ${logoFile.name}`);
          updatedCount++;
        }
      } else {
        console.log(`   ⚠️  Aucun logo trouvé`);
      }
    }

    console.log(`\n✅ ${updatedCount}/${certifications.length} logos associés`);

    // Afficher les fichiers non utilisés
    console.log('\n📦 Fichiers disponibles dans le bucket:');
    files.forEach(file => {
      console.log(`   - ${file.name}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

linkLogos();
