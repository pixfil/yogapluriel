#!/usr/bin/env node

/**
 * Script d'insertion des 7 certifications de production
 * Exécute la migration SQL pour recréer les certifications exactement comme en production
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../.env.local') });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function insertCertifications() {
  console.log('🚀 Insertion des 7 certifications de production...\n');

  try {
    // Lire le fichier SQL
    const sqlPath = join(__dirname, '../supabase/migrations/20251021_insert_certifications_production.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    // Extraire uniquement la partie INSERT (sans le SELECT de vérification)
    const insertQuery = sqlContent
      .split('-- Vérification')[0]
      .trim();

    // Les certifications à insérer
    const certifications = [
      {
        name: 'RGE Qualibat',
        category: 'quality',
        category_color: 'bg-blue-100 text-blue-800',
        description: 'Label de fiabilité pour les entreprises du bâtiment engagées dans la qualité',
        benefits: [
          'Garantie reconnue par l\'État',
          'Éligibilité MaPrimeRénov\'',
          'Contrôles réguliers',
          'Formation continue'
        ],
        published: true,
        display_order: 1
      },
      {
        name: 'Artisan',
        category: 'quality',
        category_color: 'bg-blue-100 text-blue-800',
        description: 'Titre officiel attestant de notre savoir-faire artisanal reconnu par la Chambre',
        benefits: [
          'Inscription au répertoire',
          'Savoir-faire préservé',
          'Maître d\'œuvre qualifié',
          'Assurance décennale'
        ],
        published: true,
        display_order: 2
      },
      {
        name: 'RGE QualiPV',
        category: 'expertise',
        category_color: 'bg-green-100 text-green-800',
        description: 'Certification dédiée aux installateurs de systèmes photovoltaïques',
        benefits: [
          'Expertise solaire',
          'Normes électriques respectées',
          'Qualification EDF OA',
          'Audit régulier'
        ],
        published: true,
        display_order: 3
      },
      {
        name: 'VELUX Expert',
        category: 'expertise',
        category_color: 'bg-green-100 text-green-800',
        description: 'Reconnaissance d\'expertise en pose de fenêtres de toit VELUX',
        benefits: [
          'Formation spécialisée',
          'Garantie étendue',
          'Conseil personnalisé',
          'Maîtrise complète gamme'
        ],
        published: true,
        display_order: 4
      },
      {
        name: 'Marque Alsace',
        category: 'territorial',
        category_color: 'bg-amber-100 text-amber-800',
        description: 'Label valorisant les entreprises ancrées localement et engagées régionalement',
        benefits: [
          'Entreprise 100% alsacienne',
          'Circuit court',
          'Emploi local',
          'Engagement territorial'
        ],
        published: true,
        display_order: 5
      },
      {
        name: 'Artisan d\'Alsace',
        category: 'territorial',
        category_color: 'bg-amber-100 text-amber-800',
        description: 'Marque distinguant artisans investis en qualité, proximité et identité régionale',
        benefits: [
          'Savoir-faire authentique',
          'Proximité',
          'Connaissance locale',
          'Traditions régionales'
        ],
        published: true,
        display_order: 6
      },
      {
        name: 'Lauréat Réseau Entreprendre Alsace',
        category: 'network',
        category_color: 'bg-purple-100 text-purple-800',
        description: 'Label pour entreprises ancrées localement avec accompagnement',
        benefits: [
          'Accompagnement d\'experts',
          'Réseau d\'entraide',
          'Création emploi local',
          'Développement responsable'
        ],
        published: true,
        display_order: 7
      }
    ];

    // Supprimer toutes les certifications existantes
    console.log('🗑️  Suppression des anciennes certifications...');
    const { error: deleteError } = await supabase
      .from('certifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('❌ Erreur de suppression:', deleteError.message);
    } else {
      console.log('✅ Anciennes certifications supprimées\n');
    }

    // Insérer chaque certification
    for (const cert of certifications) {
      const { data, error } = await supabase
        .from('certifications')
        .insert(cert)
        .select();

      if (error) {
        console.error(`❌ Erreur pour "${cert.name}":`, error.message);
      } else {
        console.log(`✅ ${cert.name} (${cert.category})`);
      }
    }

    // Vérification finale
    console.log('\n📊 Vérification...');
    const { data: allCerts, error: fetchError } = await supabase
      .from('certifications')
      .select('name, category, published, display_order')
      .order('display_order');

    if (fetchError) {
      console.error('❌ Erreur de vérification:', fetchError.message);
    } else {
      console.log(`\n✅ ${allCerts.length} certifications en base:\n`);
      allCerts.forEach(cert => {
        const emoji = cert.category === 'quality' ? '🔵' :
                      cert.category === 'expertise' ? '🟢' :
                      cert.category === 'territorial' ? '🟡' : '🟣';
        console.log(`   ${emoji} ${cert.display_order}. ${cert.name}`);
      });
    }

    console.log('\n✅ Migration terminée !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécution
insertCertifications();
