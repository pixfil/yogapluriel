-- =============================================================================
-- YOGA PLURIEL - DONNÉES D'EXEMPLE
-- =============================================================================
-- Seed data pour démarrer rapidement avec des exemples réalistes
-- ⚠️ À adapter selon vos besoins réels
-- =============================================================================

-- =============================================================================
-- 1. TYPES DE COURS
-- =============================================================================

INSERT INTO class_types (name, slug, description, duration_minutes, level, max_participants, color, icon, benefits, equipment_needed, is_active, display_order)
VALUES
  (
    'Hatha Yoga',
    'hatha-yoga',
    'Pratique traditionnelle douce axée sur les postures (asanas) et la respiration (pranayama). Idéal pour débuter et approfondir les fondamentaux du yoga.',
    75,
    'Tous niveaux',
    15,
    '#8B5CF6',
    'Moon',
    ARRAY['Améliore la souplesse', 'Renforce les muscles', 'Réduit le stress', 'Améliore la posture'],
    ARRAY['Tapis de yoga', 'Tenue confortable'],
    true,
    1
  ),
  (
    'Vinyasa Flow',
    'vinyasa-flow',
    'Yoga dynamique où les postures s''enchaînent de manière fluide, synchronisées avec la respiration. Un flow créatif et énergisant.',
    60,
    'Intermédiaire',
    12,
    '#EC4899',
    'Flame',
    ARRAY['Cardio doux', 'Améliore l''endurance', 'Renforce tout le corps', 'Développe la concentration'],
    ARRAY['Tapis de yoga', 'Bouteille d''eau'],
    true,
    2
  ),
  (
    'Yin Yoga',
    'yin-yoga',
    'Pratique méditative et restauratrice où les postures sont tenues longuement (3-5 min) pour étirer les tissus profonds. Parfait pour la détente et la souplesse.',
    90,
    'Tous niveaux',
    15,
    '#06B6D4',
    'Heart',
    ARRAY['Améliore la mobilité articulaire', 'Relaxation profonde', 'Réduit les tensions', 'Méditation guidée'],
    ARRAY['Tapis de yoga', 'Coussin/bolster', 'Couverture'],
    true,
    3
  ),
  (
    'Yoga Prénatal',
    'yoga-prenatal',
    'Cours spécialement conçu pour les futures mamans. Postures adaptées, respiration et relaxation pour vivre une grossesse sereine.',
    60,
    'Débutant',
    8,
    '#F59E0B',
    'Baby',
    ARRAY['Soulage les maux de grossesse', 'Prépare à l''accouchement', 'Renforce le périnée', 'Crée du lien avec bébé'],
    ARRAY['Tapis de yoga', 'Coussin de soutien'],
    true,
    4
  ),
  (
    'Yoga Restaurateur',
    'yoga-restaurateur',
    'Pratique ultra-douce utilisant de nombreux supports (coussins, couvertures). Idéal pour récupérer, se ressourcer et gérer le stress.',
    75,
    'Tous niveaux',
    12,
    '#10B981',
    'Sparkles',
    ARRAY['Récupération profonde', 'Réduit l''anxiété', 'Améliore le sommeil', 'Équilibre le système nerveux'],
    ARRAY['Fourni sur place (coussins, couvertures, bolsters)'],
    true,
    5
  ),
  (
    'Ashtanga Yoga',
    'ashtanga-yoga',
    'Yoga traditionnel rigoureux suivant une séquence précise de postures. Pratique exigeante qui développe force, souplesse et discipline.',
    90,
    'Avancé',
    10,
    '#EF4444',
    'Zap',
    ARRAY['Renforcement musculaire intense', 'Discipline mentale', 'Purification du corps', 'Concentration'],
    ARRAY['Tapis de yoga', 'Serviette'],
    true,
    6
  ),
  (
    'Méditation & Pranayama',
    'meditation-pranayama',
    'Atelier dédié aux techniques de respiration (pranayama) et à la méditation guidée. Pour calmer l''esprit et cultiver la pleine conscience.',
    45,
    'Tous niveaux',
    20,
    '#8B5CF6',
    'Brain',
    ARRAY['Réduit le stress', 'Améliore la concentration', 'Gestion des émotions', 'Qualité du sommeil'],
    ARRAY['Coussin de méditation (ou chaise)', 'Tenue confortable'],
    true,
    7
  )
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 2. SALLES
-- =============================================================================

INSERT INTO rooms (name, capacity, location, floor, amenities, is_active, color_code)
VALUES
  (
    'Salle Lotus',
    20,
    '10 rue du Rhin, 67100 Strasbourg',
    'Rez-de-chaussée',
    ARRAY['Tapis fournis', 'Vestiaire', 'Casiers', 'Eau fraîche', 'Chauffage au sol'],
    true,
    '#8B5CF6'
  ),
  (
    'Salle Mandala',
    15,
    '10 rue du Rhin, 67100 Strasbourg',
    '1er étage',
    ARRAY['Tapis fournis', 'Coussins de méditation', 'Blocs et sangles', 'Lumière tamisée'],
    true,
    '#EC4899'
  ),
  (
    'Espace Zen',
    10,
    '10 rue du Rhin, 67100 Strasbourg',
    '2e étage',
    ARRAY['Espace cosy', 'Bolsters', 'Couvertures', 'Diffuseur d''huiles essentielles'],
    true,
    '#06B6D4'
  )
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 3. INSTRUCTEURS (exemples fictifs)
-- =============================================================================

INSERT INTO instructors (first_name, last_name, email, phone, bio, specialties, certifications, years_experience, is_active, display_order, color_code)
VALUES
  (
    'Sophie',
    'Martin',
    'sophie.martin@yogapluriel.com',
    '06 12 34 56 78',
    'Professeure certifiée depuis 10 ans, Sophie a découvert le yoga lors d''un voyage en Inde. Elle enseigne un Hatha doux et accessible, avec une attention particulière portée à l''alignement et à la respiration.',
    ARRAY['Hatha', 'Yoga Restaurateur', 'Méditation'],
    ARRAY['Yoga Alliance RYT 500', 'Formation Yoga Prénatal', 'Certification Yin Yoga'],
    10,
    true,
    1,
    '#8B5CF6'
  ),
  (
    'Thomas',
    'Dubois',
    'thomas.dubois@yogapluriel.com',
    '06 23 45 67 89',
    'Ancien sportif de haut niveau, Thomas a trouvé dans le yoga un équilibre parfait entre défi physique et paix intérieure. Ses cours Vinyasa sont dynamiques et créatifs.',
    ARRAY['Vinyasa', 'Ashtanga', 'Power Yoga'],
    ARRAY['Yoga Alliance RYT 200', 'Formation Ashtanga (Mysore)'],
    6,
    true,
    2,
    '#EC4899'
  ),
  (
    'Claire',
    'Lefebvre',
    'claire.lefebvre@yogapluriel.com',
    '06 34 56 78 90',
    'Sage-femme et professeure de yoga, Claire accompagne les femmes à chaque étape de leur vie. Ses cours prénatals et postnatals sont empreints de douceur et de bienveillance.',
    ARRAY['Yoga Prénatal', 'Yoga Postnatal', 'Yin Yoga'],
    ARRAY['Yoga Alliance RYT 200', 'Formation Yoga Prénatal & Postnatal', 'Diploma de sage-femme'],
    8,
    true,
    3,
    '#F59E0B'
  ),
  (
    'Marc',
    'Rousseau',
    'marc.rousseau@yogapluriel.com',
    '06 45 67 89 01',
    'Formé en Inde dans la tradition du Yin Yoga, Marc propose une pratique méditative profonde. Ses cours invitent au lâcher-prise et à l''introspection.',
    ARRAY['Yin Yoga', 'Méditation', 'Pranayama'],
    ARRAY['Certification Yin Yoga (Paul Grilley)', 'Formation Méditation Vipassana'],
    12,
    true,
    4,
    '#06B6D4'
  )
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 4. FORMULES D'ABONNEMENT
-- =============================================================================

INSERT INTO membership_plans (name, slug, description, plan_type, credits, credits_validity_days, duration_days, price, is_active, is_featured, display_order, benefits)
VALUES
  (
    'Cours à l''unité',
    'cours-unite',
    'Testez un cours sans engagement',
    'credit_based',
    1,
    30,
    NULL,
    18.00,
    true,
    false,
    1,
    ARRAY['Aucun engagement', 'Valable 30 jours']
  ),
  (
    'Carte 10 séances',
    'carte-10',
    'La formule idéale pour pratiquer régulièrement',
    'credit_based',
    10,
    90, -- 3 mois de validité
    NULL,
    150.00,
    true,
    true,
    2,
    ARRAY['Économie de 30€', 'Valable 3 mois', 'Tous les cours']
  ),
  (
    'Abonnement Mensuel',
    'abonnement-mensuel',
    'Accès illimité à tous les cours pendant 1 mois',
    'unlimited',
    NULL,
    NULL,
    30,
    75.00,
    true,
    true,
    3,
    ARRAY['Accès illimité', 'Tous les cours', 'Renouvelable chaque mois']
  ),
  (
    'Abonnement Annuel',
    'abonnement-annuel',
    'L''abonnement le plus avantageux : accès illimité pendant 1 an',
    'unlimited',
    NULL,
    NULL,
    365,
    720.00,
    true,
    true,
    4,
    ARRAY['Économie de 180€/an', 'Accès illimité', 'Tous les cours', 'Priorité inscription ateliers']
  ),
  (
    'Découverte - 3 cours',
    'decouverte-3',
    'Parfait pour découvrir le yoga',
    'credit_based',
    3,
    60,
    NULL,
    45.00,
    true,
    false,
    5,
    ARRAY['Tarif découverte', 'Valable 2 mois', 'Idéal pour débuter']
  )
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 5. PAGES SEO SPÉCIFIQUES YOGA
-- =============================================================================

INSERT INTO seo_pages (path, title, description, keywords, og_title, og_description, robots, include_in_sitemap, sitemap_priority, sitemap_changefreq)
VALUES
  (
    '/cours',
    'Nos Cours de Yoga - Yoga Pluriel Strasbourg',
    'Découvrez nos cours de yoga à Strasbourg Neudorf : Hatha, Vinyasa, Yin, Prénatal. Tous niveaux, professeurs certifiés.',
    'cours yoga strasbourg, hatha yoga, vinyasa, yin yoga, yoga prénatal',
    'Nos Cours de Yoga - Tous Niveaux',
    'Hatha, Vinyasa, Yin, Yoga Prénatal et plus. Cours adaptés à tous les niveaux dans notre studio de Strasbourg Neudorf.',
    'index, follow',
    true,
    0.9,
    'weekly'
  ),
  (
    '/planning',
    'Planning des Cours - Yoga Pluriel',
    'Consultez le planning de nos cours de yoga à Strasbourg. Réservez votre séance en ligne facilement.',
    'planning yoga strasbourg, horaires cours yoga, réservation yoga',
    'Planning des Cours de Yoga',
    'Découvrez nos horaires et réservez votre cours de yoga en quelques clics.',
    'index, follow',
    true,
    0.8,
    'daily'
  ),
  (
    '/tarifs',
    'Tarifs & Abonnements - Yoga Pluriel',
    'Découvrez nos formules : cours à l''unité, cartes 10 séances, abonnements mensuels et annuels. Tarifs avantageux.',
    'tarifs yoga strasbourg, prix cours yoga, abonnement yoga',
    'Nos Tarifs & Formules',
    'Cours à l''unité, cartes, abonnements : trouvez la formule qui vous convient.',
    'index, follow',
    true,
    0.7,
    'monthly'
  ),
  (
    '/professeurs',
    'Nos Professeurs - Yoga Pluriel',
    'Rencontrez notre équipe de professeurs de yoga certifiés et passionnés. Expérience, bienveillance et professionnalisme.',
    'professeurs yoga strasbourg, enseignants yoga certifiés',
    'Notre Équipe de Professeurs',
    'Des enseignants certifiés, passionnés et bienveillants pour vous accompagner dans votre pratique.',
    'index, follow',
    true,
    0.6,
    'monthly'
  )
ON CONFLICT (path) DO NOTHING;

-- =============================================================================
-- 6. FAQ SPÉCIFIQUE YOGA
-- =============================================================================

-- Catégorie FAQ Yoga
INSERT INTO faq_categories (title, icon, description, display_order, published)
VALUES
  (
    'Cours & Pratique',
    'Activity',
    'Questions sur nos cours et la pratique du yoga',
    1,
    true
  ),
  (
    'Réservations & Tarifs',
    'CreditCard',
    'Tout savoir sur les inscriptions et les tarifs',
    2,
    true
  )
ON CONFLICT DO NOTHING;

-- Questions FAQ
INSERT INTO faq (
  category_id,
  question,
  answer,
  display_order,
  published
)
SELECT
  cat.id,
  q.question,
  q.answer,
  q.display_order,
  true
FROM faq_categories cat
CROSS JOIN (
  VALUES
    (
      'Cours & Pratique',
      'Je débute le yoga, quel cours choisir ?',
      'Pour débuter, nous recommandons le **Hatha Yoga** ou le **Yoga Restaurateur**. Ces cours sont doux, accessibles à tous et permettent d''apprendre les fondamentaux en toute sérénité. Nos professeurs adaptent les postures à votre niveau.',
      1
    ),
    (
      'Cours & Pratique',
      'Dois-je apporter mon tapis ?',
      'Non, tous nos tapis sont fournis gratuitement ! Vous avez juste besoin d''une tenue confortable. Pour les cours de Yin ou méditation, nous fournissons aussi coussins, couvertures et bolsters.',
      2
    ),
    (
      'Cours & Pratique',
      'Je suis enceinte, puis-je pratiquer ?',
      'Oui ! Nous proposons des **cours de Yoga Prénatal** spécialement adaptés avec Claire, notre professeure certifiée et sage-femme. Ces cours sont possibles dès le 2e trimestre (avec accord médical).',
      3
    ),
    (
      'Réservations & Tarifs',
      'Comment réserver un cours ?',
      'Vous pouvez réserver directement en ligne via notre planning. Connectez-vous à votre compte, choisissez votre cours et confirmez. Vous recevrez une confirmation par email.',
      1
    ),
    (
      'Réservations & Tarifs',
      'Puis-je annuler une réservation ?',
      'Oui, vous pouvez annuler jusqu''à 6 heures avant le début du cours sans pénalité. Au-delà, le cours sera décompté de votre forfait.',
      2
    ),
    (
      'Réservations & Tarifs',
      'Quelle formule choisir ?',
      'Cela dépend de votre pratique ! **Cours à l''unité** pour essayer, **Carte 10** si vous venez 1-2 fois/semaine, **Abonnement mensuel** si vous pratiquez 3+ fois/semaine. L''annuel est le plus économique pour une pratique régulière.',
      3
    )
) q(cat_name, question, answer, display_order)
WHERE cat.title = q.cat_name
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

-- Compter les données insérées
SELECT
  'class_types' as table_name,
  COUNT(*) as count
FROM class_types
WHERE deleted_at IS NULL
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms WHERE deleted_at IS NULL
UNION ALL
SELECT 'instructors', COUNT(*) FROM instructors WHERE deleted_at IS NULL
UNION ALL
SELECT 'membership_plans', COUNT(*) FROM membership_plans WHERE deleted_at IS NULL
UNION ALL
SELECT 'faq_categories', COUNT(*) FROM faq_categories WHERE deleted_at IS NULL
UNION ALL
SELECT 'faq', COUNT(*) FROM faq WHERE deleted_at IS NULL
UNION ALL
SELECT 'seo_pages', COUNT(*) FROM seo_pages WHERE deleted_at IS NULL;

-- =============================================================================
-- ✅ DONNÉES YOGA INSÉRÉES
-- =============================================================================
-- Données créées:
--   ✓ 7 types de cours (Hatha, Vinyasa, Yin, Prénatal, etc.)
--   ✓ 3 salles de cours
--   ✓ 4 professeurs exemples
--   ✓ 5 formules d'abonnement
--   ✓ 2 catégories FAQ + 6 questions
--   ✓ 4 pages SEO
--
-- IMPORTANT - PROCHAINES ÉTAPES:
--
-- 1. Adapter les données:
--    - Modifier noms/emails des vrais professeurs
--    - Ajuster tarifs selon votre politique
--    - Personnaliser descriptions des cours
--
-- 2. Créer votre premier admin:
--    - Dashboard Supabase > Authentication > Add User
--    - Aller dans SQL Editor et exécuter:
--      UPDATE user_profiles
--      SET roles = '["super_admin"]'::jsonb
--      WHERE email = 'VOTRE_EMAIL';
--
-- 3. Créer des séances:
--    - Utiliser l'interface admin pour planifier les cours
--    - Ou créer via SQL (exemples dans migration 001_yoga_core.sql)
--
-- 4. Tester les réservations:
--    - Créer un compte utilisateur test
--    - Réserver un cours via l'interface
--    - Vérifier emails de confirmation
-- =============================================================================
