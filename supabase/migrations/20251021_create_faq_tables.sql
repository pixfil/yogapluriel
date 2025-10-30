-- =============================================
-- Phase 2.3 - FAQ System
-- Tables: faq_categories + faq_questions
-- Date: 2025-10-21
-- =============================================

-- =============================================
-- 1. CREATE TABLES
-- =============================================

-- Table FAQ Categories
CREATE TABLE IF NOT EXISTS faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon TEXT NOT NULL, -- Lucide icon name (e.g., "BadgeDollarSign", "Home", "Clock", "Shield")
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id)
);

-- Table FAQ Questions
CREATE TABLE IF NOT EXISTS faq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- 2. INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_faq_categories_display_order ON faq_categories(display_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faq_categories_published ON faq_categories(published) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_faq_questions_category_id ON faq_questions(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faq_questions_display_order ON faq_questions(display_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faq_questions_published ON faq_questions(published) WHERE deleted_at IS NULL;

-- Full-text search sur questions
CREATE INDEX IF NOT EXISTS idx_faq_questions_search
  ON faq_questions
  USING gin(to_tsvector('french', question || ' ' || answer))
  WHERE deleted_at IS NULL;

-- =============================================
-- 3. RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_questions ENABLE ROW LEVEL SECURITY;

-- Public can view published categories (not deleted)
CREATE POLICY "Public can view published categories"
  ON faq_categories FOR SELECT
  USING (published = true AND deleted_at IS NULL);

-- Public can view published questions (not deleted)
CREATE POLICY "Public can view published questions"
  ON faq_questions FOR SELECT
  USING (published = true AND deleted_at IS NULL);

-- Authenticated users can do everything
CREATE POLICY "Authenticated users can manage categories"
  ON faq_categories FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage questions"
  ON faq_questions FOR ALL
  USING (auth.role() = 'authenticated');

-- =============================================
-- 4. INSERT INITIAL DATA
-- =============================================

-- Insert categories with current data from FAQ page
INSERT INTO faq_categories (title, icon, display_order, published) VALUES
  ('Devis et Tarifs', 'BadgeDollarSign', 1, true),
  ('Matériaux et Durabilité', 'Home', 2, true),
  ('Travaux et Délais', 'Clock', 3, true),
  ('Garanties et Assurances', 'Shield', 4, true)
ON CONFLICT DO NOTHING;

-- Get category IDs for inserting questions
DO $$
DECLARE
  cat_devis UUID;
  cat_materiaux UUID;
  cat_travaux UUID;
  cat_garanties UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_devis FROM faq_categories WHERE title = 'Devis et Tarifs' LIMIT 1;
  SELECT id INTO cat_materiaux FROM faq_categories WHERE title = 'Matériaux et Durabilité' LIMIT 1;
  SELECT id INTO cat_travaux FROM faq_categories WHERE title = 'Travaux et Délais' LIMIT 1;
  SELECT id INTO cat_garanties FROM faq_categories WHERE title = 'Garanties et Assurances' LIMIT 1;

  -- Insert questions for "Devis et Tarifs"
  INSERT INTO faq_questions (category_id, question, answer, display_order, published) VALUES
    (cat_devis, 'Le devis est-il vraiment gratuit ?', 'Oui, nous proposons des devis entièrement gratuits et sans engagement. Nous nous déplaçons chez vous pour évaluer précisément vos besoins et vous fournir un devis détaillé.', 1, true),
    (cat_devis, 'Quel est le délai pour recevoir un devis ?', 'Nous nous engageons à vous fournir un devis sous 48h maximum après notre visite. Pour les demandes urgentes, nous pouvons souvent proposer un devis le jour même.', 2, true),
    (cat_devis, 'Comment est calculé le prix d''une toiture ?', 'Le prix dépend de plusieurs facteurs : la superficie, le type de matériau choisi, la complexité de la charpente, l''accessibilité, et les travaux annexes (isolation, zinguerie, etc.).', 3, true);

  -- Insert questions for "Matériaux et Durabilité"
  INSERT INTO faq_questions (category_id, question, answer, display_order, published) VALUES
    (cat_materiaux, 'Quelle est la durée de vie de l''ardoise ?', 'L''ardoise naturelle peut durer plus de 100 ans avec un entretien minimal. C''est l''un des matériaux de couverture les plus durables du marché.', 1, true),
    (cat_materiaux, 'Quel matériau choisir pour ma toiture ?', 'Le choix dépend de votre budget, du style architectural, des contraintes locales et de vos préférences esthétiques. Nous vous conseillons le matériau le plus adapté à votre projet.', 2, true),
    (cat_materiaux, 'Les tuiles mécaniques sont-elles résistantes ?', 'Oui, les tuiles mécaniques modernes offrent une excellente résistance aux intempéries et ont une durée de vie de 30 à 50 ans selon la qualité choisie.', 3, true);

  -- Insert questions for "Travaux et Délais"
  INSERT INTO faq_questions (category_id, question, answer, display_order, published) VALUES
    (cat_travaux, 'Combien de temps durent les travaux ?', 'Cela dépend de la superficie et de la complexité : 2-3 jours pour une réparation, 1-2 semaines pour une rénovation complète d''une maison standard.', 1, true),
    (cat_travaux, 'Travaillez-vous par tous les temps ?', 'Pour votre sécurité et la qualité des travaux, nous ne travaillons pas en cas de pluie, neige ou vents forts. Nous reprogrammons alors l''intervention.', 2, true),
    (cat_travaux, 'Puis-je rester chez moi pendant les travaux ?', 'Oui, dans la plupart des cas. Nous travaillons par l''extérieur et minimisons les nuisances. Nous vous prévenons des éventuelles gênes temporaires.', 3, true);

  -- Insert questions for "Garanties et Assurances"
  INSERT INTO faq_questions (category_id, question, answer, display_order, published) VALUES
    (cat_garanties, 'Quelle garantie sur les travaux ?', 'Nous offrons une garantie décennale sur tous nos travaux de couverture, plus une garantie de parfait achèvement d''un an pour les finitions.', 1, true),
    (cat_garanties, 'Êtes-vous assurés ?', 'Oui, nous disposons de toutes les assurances obligatoires : responsabilité civile professionnelle et assurance décennale. Nous vous fournissons les attestations.', 2, true),
    (cat_garanties, 'Que couvre l''assurance décennale ?', 'Elle couvre tous les dommages qui compromettent la solidité de l''ouvrage ou le rendent impropre à sa destination pendant 10 ans après réception des travaux.', 3, true);

END $$;

-- =============================================
-- 5. VERIFICATION QUERY
-- =============================================

-- Verify data inserted
SELECT
  'Categories' as type,
  COUNT(*) as count
FROM faq_categories
WHERE deleted_at IS NULL
UNION ALL
SELECT
  'Questions' as type,
  COUNT(*) as count
FROM faq_questions
WHERE deleted_at IS NULL
ORDER BY type;

-- Show all FAQ data
SELECT
  c.title as category,
  c.icon,
  COUNT(q.id) as question_count
FROM faq_categories c
LEFT JOIN faq_questions q ON q.category_id = c.id AND q.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.title, c.icon, c.display_order
ORDER BY c.display_order;
