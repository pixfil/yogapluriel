-- Migration: Insertion des 7 certifications de production
-- Date: 2025-10-21
-- Description: Recrée les certifications exactement comme sur formdetoit-website.vercel.app

-- Nettoyage (optionnel - décommentez si vous voulez repartir de zéro)
-- TRUNCATE TABLE certifications RESTART IDENTITY CASCADE;

-- Insertion des 7 certifications avec leurs données complètes
INSERT INTO certifications (
  name,
  category,
  category_color,
  description,
  benefits,
  published,
  display_order,
  created_at,
  updated_at
) VALUES
-- 1. RGE Qualibat (Qualité)
(
  'RGE Qualibat',
  'quality',
  'bg-blue-100 text-blue-800',
  'Label de fiabilité pour les entreprises du bâtiment engagées dans la qualité',
  ARRAY[
    'Garantie reconnue par l''État',
    'Éligibilité MaPrimeRénov''',
    'Contrôles réguliers',
    'Formation continue'
  ],
  true,
  1,
  NOW(),
  NOW()
),

-- 2. Artisan (Qualité)
(
  'Artisan',
  'quality',
  'bg-blue-100 text-blue-800',
  'Titre officiel attestant de notre savoir-faire artisanal reconnu par la Chambre',
  ARRAY[
    'Inscription au répertoire',
    'Savoir-faire préservé',
    'Maître d''œuvre qualifié',
    'Assurance décennale'
  ],
  true,
  2,
  NOW(),
  NOW()
),

-- 3. RGE QualiPV (Expertise)
(
  'RGE QualiPV',
  'expertise',
  'bg-green-100 text-green-800',
  'Certification dédiée aux installateurs de systèmes photovoltaïques',
  ARRAY[
    'Expertise solaire',
    'Normes électriques respectées',
    'Qualification EDF OA',
    'Audit régulier'
  ],
  true,
  3,
  NOW(),
  NOW()
),

-- 4. VELUX Expert (Expertise)
(
  'VELUX Expert',
  'expertise',
  'bg-green-100 text-green-800',
  'Reconnaissance d''expertise en pose de fenêtres de toit VELUX',
  ARRAY[
    'Formation spécialisée',
    'Garantie étendue',
    'Conseil personnalisé',
    'Maîtrise complète gamme'
  ],
  true,
  4,
  NOW(),
  NOW()
),

-- 5. Marque Alsace (Territorial)
(
  'Marque Alsace',
  'territorial',
  'bg-amber-100 text-amber-800',
  'Label valorisant les entreprises ancrées localement et engagées régionalement',
  ARRAY[
    'Entreprise 100% alsacienne',
    'Circuit court',
    'Emploi local',
    'Engagement territorial'
  ],
  true,
  5,
  NOW(),
  NOW()
),

-- 6. Artisan d'Alsace (Territorial)
(
  'Artisan d''Alsace',
  'territorial',
  'bg-amber-100 text-amber-800',
  'Marque distinguant artisans investis en qualité, proximité et identité régionale',
  ARRAY[
    'Savoir-faire authentique',
    'Proximité',
    'Connaissance locale',
    'Traditions régionales'
  ],
  true,
  6,
  NOW(),
  NOW()
),

-- 7. Lauréat Réseau Entreprendre Alsace (Réseau)
(
  'Lauréat Réseau Entreprendre Alsace',
  'network',
  'bg-purple-100 text-purple-800',
  'Label pour entreprises ancrées localement avec accompagnement',
  ARRAY[
    'Accompagnement d''experts',
    'Réseau d''entraide',
    'Création emploi local',
    'Développement responsable'
  ],
  true,
  7,
  NOW(),
  NOW()
)

ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  category_color = EXCLUDED.category_color,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  published = EXCLUDED.published,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Vérification
SELECT
  id,
  name,
  category,
  category_color,
  array_length(benefits, 1) as nb_benefits,
  published,
  display_order
FROM certifications
ORDER BY display_order;
