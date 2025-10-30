-- Migration: Create pages table for SEO management
-- Date: 2025-10-21
-- Description: Table for managing all site pages SEO metadata

-- ============================================
-- 1. CREATE PAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page identification
  path TEXT NOT NULL UNIQUE,
  parent_path TEXT,
  is_dynamic BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Basic SEO
  title TEXT,
  description TEXT,
  keywords TEXT,

  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',

  -- Advanced SEO
  canonical_url TEXT,
  robots TEXT DEFAULT 'index, follow',
  structured_data JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX idx_pages_path ON pages(path);
CREATE INDEX idx_pages_parent_path ON pages(parent_path) WHERE parent_path IS NOT NULL;
CREATE INDEX idx_pages_deleted_at ON pages(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_pages_display_order ON pages(parent_path, display_order);

-- ============================================
-- 3. ENABLE RLS
-- ============================================

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Public: can view all non-deleted pages
CREATE POLICY "pages_select_public" ON pages
  FOR SELECT
  USING (deleted_at IS NULL);

-- Authenticated: can do everything
CREATE POLICY "pages_all_authenticated" ON pages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. INSERT INITIAL DATA (23 pages from codebase)
-- ============================================

INSERT INTO pages (path, parent_path, is_dynamic, title, description, og_title, og_description, display_order) VALUES

-- Root
('/', NULL, false,
 'FormDeToit - Artisan Couvreur Bas-Rhin | Strasbourg Toiture Ardoise Zinc',
 'FormDeToit : artisan couvreur RGE à Strasbourg et dans le Bas-Rhin. Expert toiture ardoise, tuile, zinc, isolation, VELUX. Devis gratuit sous 24h.',
 'FormDeToit - Expert Couvreur Strasbourg Bas-Rhin',
 'Artisan couvreur certifié RGE pour tous vos travaux de toiture dans le Bas-Rhin',
 0),

-- Prestations - Page principale
('/nos-prestations', NULL, false,
 'Nos Prestations - FormDeToit | Couverture Toiture Bas-Rhin',
 'Découvrez toutes nos prestations de couverture : ardoise, tuile, zinc, isolation, zinguerie, VELUX. Artisan RGE Qualibat Bas-Rhin.',
 'Nos Prestations de Couverture',
 'Services complets de couverture et toiture par artisan certifié',
 1),

-- Prestations - Sous-pages
('/nos-prestations/ardoise', '/nos-prestations', false,
 'Couverture Ardoise - FormDeToit | Artisan Couvreur Bas-Rhin',
 'Pose et rénovation de toiture en ardoise naturelle. Matériau noble et durable. Artisan couvreur spécialisé ardoise Bas-Rhin.',
 'Couverture Ardoise - Expert Bas-Rhin',
 'Spécialiste de la pose et rénovation de toiture en ardoise naturelle',
 1),

('/nos-prestations/tuile-mecanique', '/nos-prestations', false,
 'Tuile Mécanique - FormDeToit | Couvreur Tuile Bas-Rhin',
 'Pose de toiture en tuile mécanique. Large choix de coloris et modèles. Artisan couvreur RGE Bas-Rhin.',
 'Couverture Tuile Mécanique',
 'Installation de toiture en tuile mécanique par couvreur certifié',
 2),

('/nos-prestations/tuile-plate', '/nos-prestations', false,
 'Tuile Plate - FormDeToit | Couverture Traditionnelle Bas-Rhin',
 'Pose de toiture en tuile plate traditionnelle. Respect du patrimoine alsacien. Artisan couvreur Bas-Rhin.',
 'Couverture Tuile Plate Traditionnelle',
 'Spécialiste de la tuile plate pour toitures traditionnelles alsaciennes',
 3),

('/nos-prestations/zinc', '/nos-prestations', false,
 'Couverture Zinc - FormDeToit | Zingueur Bas-Rhin Strasbourg',
 'Couverture zinc à joint debout. Matériau moderne et durable. Zingueur professionnel Bas-Rhin.',
 'Couverture Zinc à Joint Debout',
 'Expert en couverture zinc et travaux de zinguerie',
 4),

('/nos-prestations/cuivre', '/nos-prestations', false,
 'Couverture Cuivre - FormDeToit | Artisan Cuivre Bas-Rhin',
 'Couverture en cuivre. Matériau noble et pérenne. Artisan spécialisé cuivre Bas-Rhin.',
 'Couverture Cuivre - Artisan Expert',
 'Spécialiste de la couverture en cuivre pour toitures haut de gamme',
 5),

('/nos-prestations/alu-prefa', '/nos-prestations', false,
 'Couverture Alu Prefa - FormDeToit | Toiture Aluminium Bas-Rhin',
 'Couverture aluminium Prefa. Solution moderne et légère. Artisan agréé Prefa Bas-Rhin.',
 'Couverture Aluminium Prefa',
 'Installation de toiture aluminium Prefa par artisan agréé',
 6),

('/nos-prestations/zinguerie', '/nos-prestations', false,
 'Zinguerie - FormDeToit | Gouttières Chéneaux Bas-Rhin',
 'Travaux de zinguerie : gouttières, descentes EP, chéneaux, solins. Zingueur professionnel Bas-Rhin.',
 'Zinguerie et Évacuation des Eaux',
 'Travaux de zinguerie complets : gouttières, chéneaux, solins',
 7),

('/nos-prestations/isolation', '/nos-prestations', false,
 'Isolation Toiture - FormDeToit | Isolation Combles Bas-Rhin RGE',
 'Isolation de toiture et combles. Artisan RGE pour aides financières. Économies d''énergie garanties.',
 'Isolation Toiture et Combles RGE',
 'Isolation thermique de toiture par artisan RGE certifié',
 8),

('/nos-prestations/velux', '/nos-prestations', false,
 'VELUX - FormDeToit | Fenêtres de Toit Installateur Expert Bas-Rhin',
 'Pose de fenêtres de toit VELUX. Installateur Conseil Expert VELUX. Apport de lumière naturelle.',
 'Installation VELUX - Expert Agréé',
 'Installateur Conseil Expert VELUX pour fenêtres de toit',
 9),

('/nos-prestations/epdm-etancheite', '/nos-prestations', false,
 'EPDM Étanchéité - FormDeToit | Toiture Plate Bas-Rhin',
 'Étanchéité EPDM pour toitures plates et terrasses. Solution durable et écologique.',
 'Étanchéité EPDM Toiture Plate',
 'Spécialiste étanchéité EPDM pour toitures plates et terrasses',
 10),

-- Réalisations
('/nos-realisations', NULL, false,
 'Nos Réalisations - FormDeToit | Portfolio Chantiers Couverture Bas-Rhin',
 'Découvrez nos réalisations de couverture et toiture dans le Bas-Rhin. Photos de chantiers, avis clients. Portfolio artisan couvreur.',
 'Portfolio Réalisations Couverture',
 'Découvrez nos chantiers de couverture réalisés dans le Bas-Rhin',
 2),

('/nos-realisations/[slug]', '/nos-realisations', true,
 'Réalisation - FormDeToit',
 'Découvrez cette réalisation de couverture par FormDeToit',
 'Réalisation de Couverture',
 'Projet de couverture réalisé par FormDeToit',
 1),

-- Informations
('/contact', NULL, false,
 'Contact - Formdetoit | Devis Gratuit Couvreur Bas-Rhin Strasbourg',
 'Contactez Formdetoit pour votre projet toiture. Devis gratuit sous 24h. Téléphone, email, formulaire de contact. Artisan couvreur Bas-Rhin.',
 'Contact - Devis Gratuit Couverture',
 'Contactez-nous pour un devis gratuit de couverture sous 24h',
 3),

('/faq', NULL, false,
 'FAQ - FormDeToit | Questions Fréquentes Toiture Couverture',
 'Réponses aux questions fréquentes sur la couverture, toiture, isolation. Guide pratique par couvreur professionnel.',
 'FAQ Couverture et Toiture',
 'Questions fréquentes sur la couverture et la toiture',
 4),

('/lexique', NULL, false,
 'Lexique - Formdetoit | Termes Techniques Couverture Toiture Bas-Rhin',
 'Découvrez le vocabulaire technique de la couverture et de la toiture. Lexique complet des termes utilisés par les couvreurs professionnels.',
 'Lexique Technique Couverture',
 'Vocabulaire technique de la couverture expliqué par des professionnels',
 5),

('/nos-labels-certifications', NULL, false,
 'Nos Labels et Certifications - Formdetoit | Artisan RGE Qualibat Bas-Rhin',
 'Découvrez tous nos labels et certifications : RGE Qualibat, QualiPV, VELUX Expert, Artisan d''Alsace. Garantie de qualité et expertise reconnue dans le Bas-Rhin.',
 'Labels et Certifications',
 'Nos certifications RGE Qualibat et labels de qualité',
 6),

('/artisan-couvreur', NULL, false,
 'Artisan Couvreur - FormDeToit | Métier Passion Savoir-faire Bas-Rhin',
 'Découvrez le métier d''artisan couvreur, notre savoir-faire, nos valeurs. FormDeToit : passion et expertise de la couverture.',
 'Artisan Couvreur - Notre Métier',
 'Découvrez le métier et le savoir-faire de l''artisan couvreur',
 7),

('/notre-equipe', NULL, false,
 'Notre Équipe - FormDeToit | Couvreurs Professionnels Bas-Rhin',
 'Rencontrez l''équipe FormDeToit : couvreurs qualifiés, charpentiers, zingueurs. Savoir-faire et passion du métier.',
 'Notre Équipe de Couvreurs',
 'Découvrez l''équipe de couvreurs professionnels FormDeToit',
 8),

-- Outils
('/calculateur-aides', NULL, false,
 'Calculateur Aides 2025 - FormDeToit | MaPrimeRénov CEE Toiture',
 'Calculez vos aides financières 2025 pour travaux de toiture : MaPrimeRénov'', CEE, TVA réduite. Simulateur gratuit.',
 'Calculateur Aides Rénovation 2025',
 'Estimez vos aides financières pour travaux de toiture et isolation',
 9),

-- Pages légales
('/mentions-legales', NULL, false,
 'Mentions Légales - FormDeToit',
 'Mentions légales du site FormDeToit. Informations légales et éditoriales.',
 'Mentions Légales',
 'Informations légales et éditoriales de FormDeToit',
 100),

('/politique-confidentialite', NULL, false,
 'Politique de Confidentialité - FormDeToit',
 'Politique de confidentialité et protection des données personnelles FormDeToit. RGPD.',
 'Politique de Confidentialité',
 'Politique de protection des données personnelles',
 101);

-- ============================================
-- 6. VERIFY
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'pages'
ORDER BY policyname;

-- Expected: 2 policies

SELECT parent_path, COUNT(*) as page_count
FROM pages
GROUP BY parent_path
ORDER BY parent_path NULLS FIRST;

-- Expected: Root pages + /nos-prestations children + /nos-realisations children
