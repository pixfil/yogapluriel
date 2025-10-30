#!/usr/bin/env node

/**
 * Script de mise à jour des textes des certifications
 * Applique les textes exacts de production
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

async function updateTexts() {
  console.log('📝 Mise à jour des textes des certifications...\n');

  try {
    const updates = [
      {
        name: 'RGE Qualibat',
        description: 'Label de fiabilité pour les entreprises du bâtiment engagées dans la qualité, mais aussi dans la performance énergétique.',
        benefits: [
          'Garantie de compétence reconnue par l\'État',
          'Éligibilité aux aides publiques (MaPrimeRénov\')',
          'Contrôles réguliers de nos chantiers',
          'Formation continue obligatoire'
        ]
      },
      {
        name: 'RGE QualiPV',
        description: 'Certification dédiée aux installateurs de systèmes photovoltaïques, garantissant compétence et savoir-faire.',
        benefits: [
          'Expertise installations solaires photovoltaïques',
          'Respect des normes électriques en vigueur',
          'Qualification reconnue par EDF OA',
          'Audit technique régulier'
        ]
      },
      {
        name: 'VELUX Expert',
        new_name: 'Installateur Conseil Expert VELUX®',
        description: 'Reconnaissance de notre expertise dans la pose de fenêtres de toit VELUX et solutions associées.',
        benefits: [
          'Formation spécialisée VELUX',
          'Garantie fabricant étendue',
          'Conseil personnalisé sur mesure',
          'Maîtrise de toute la gamme VELUX'
        ]
      },
      {
        name: 'Artisan',
        description: 'Titre officiel attestant de notre savoir-faire artisanal reconnu par la Chambre des Métiers.',
        benefits: [
          'Inscription au répertoire des métiers',
          'Savoir-faire traditionnel préservé',
          'Maître d\'œuvre qualifié',
          'Assurance décennale obligatoire'
        ]
      },
      {
        name: 'Marque Alsace',
        description: 'Label territorial qui valorise les entreprises ancrées localement et engagées pour leur région.',
        benefits: [
          'Entreprise 100% alsacienne',
          'Circuit court privilégié',
          'Emploi local favorisé',
          'Engagement pour le territoire'
        ]
      },
      {
        name: 'Artisan d\'Alsace',
        description: 'Marque régionale qui distingue les artisans investis dans la qualité, la proximité et l\'identité alsacienne.',
        benefits: [
          'Savoir-faire alsacien authentique',
          'Proximité et disponibilité',
          'Connaissance architecture locale',
          'Ambassadeur des traditions régionales'
        ]
      },
      {
        name: 'Lauréat Réseau Entreprendre Alsace',
        description: 'Ce label distingue les entreprises solidement ancrées localement, tout en étant accompagnées dans leur développement, et engagées activement dans la création d\'emplois sur leur territoire.',
        benefits: [
          'Accompagnement par des chefs d\'entreprise',
          'Réseau d\'entraide et de conseil',
          'Engagement création d\'emploi local',
          'Développement durable et responsable'
        ]
      }
    ];

    for (const update of updates) {
      const searchName = update.name;
      const updateData = {
        description: update.description,
        benefits: update.benefits,
        updated_at: new Date().toISOString()
      };

      // Si on doit renommer
      if (update.new_name) {
        updateData.name = update.new_name;
      }

      const { error } = await supabase
        .from('certifications')
        .update(updateData)
        .eq('name', searchName);

      if (error) {
        console.log(`❌ ${searchName}: ${error.message}`);
      } else {
        const displayName = update.new_name || searchName;
        console.log(`✅ ${displayName}`);
      }
    }

    console.log('\n📊 Vérification...');
    const { data: certs } = await supabase
      .from('certifications')
      .select('name, category')
      .order('display_order');

    if (certs) {
      console.log('\n✅ Certifications mises à jour:\n');
      certs.forEach((cert, i) => {
        const emoji = cert.category === 'quality' ? '🔵' :
                      cert.category === 'expertise' ? '🟢' :
                      cert.category === 'territorial' ? '🟡' : '🟣';
        console.log(`   ${emoji} ${i + 1}. ${cert.name}`);
      });
    }

    console.log('\n✅ Mise à jour terminée !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

updateTexts();
