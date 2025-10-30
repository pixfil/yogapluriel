-- =============================================================================
-- FAQ SYSTEM (Frequently Asked Questions)
-- =============================================================================
-- Dépendances : 00_core/003_site_settings.sql
-- Système de FAQ avec catégories et recherche full-text
-- =============================================================================

-- =============================================================================
-- 1. TABLE: FAQ_CATEGORIES
-- =============================================================================
-- Catégories pour organiser les questions FAQ

CREATE TABLE IF NOT EXISTS faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations
  title TEXT NOT NULL, -- Ex: "Pricing", "Getting Started", "Technical"
  icon TEXT NOT NULL, -- Lucide icon name (ex: "DollarSign", "Rocket", "Code")
  description TEXT, -- Description courte de la catégorie (optionnel)

  -- Ordre d'affichage
  display_order INTEGER DEFAULT 0,

  -- Publication
  published BOOLEAN DEFAULT true,

  -- Soft delete pattern
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX idx_faq_categories_display_order ON faq_categories(display_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_faq_categories_published ON faq_categories(published) WHERE deleted_at IS NULL;

COMMENT ON TABLE faq_categories IS 'FAQ categories for organizing questions';
COMMENT ON COLUMN faq_categories.icon IS 'Lucide icon name (e.g., "HelpCircle", "Settings", "Shield")';

-- =============================================================================
-- 2. TRIGGER: Auto-update updated_at (categories)
-- =============================================================================

CREATE TRIGGER trigger_faq_categories_updated_at
  BEFORE UPDATE ON faq_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. TABLE: FAQ
-- =============================================================================
-- Questions et réponses FAQ

CREATE TABLE IF NOT EXISTS faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lien vers catégorie
  category_id UUID NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,

  -- Question & Réponse
  question TEXT NOT NULL,
  answer TEXT NOT NULL, -- Markdown supporté

  -- Métadata
  helpful_count INTEGER DEFAULT 0, -- Compteur "Was this helpful?"
  view_count INTEGER DEFAULT 0, -- Compteur de vues (optionnel)

  -- Ordre d'affichage
  display_order INTEGER DEFAULT 0,

  -- Publication
  published BOOLEAN DEFAULT true,

  -- Soft delete pattern
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour performances
CREATE INDEX idx_faq_category_id ON faq(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_faq_display_order ON faq(display_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_faq_published ON faq(published) WHERE deleted_at IS NULL;

-- Index full-text search (pour barre de recherche FAQ)
-- Permet de chercher dans question + answer
CREATE INDEX idx_faq_search
  ON faq
  USING gin(to_tsvector('english', question || ' ' || answer))
  WHERE deleted_at IS NULL;

COMMENT ON TABLE faq IS 'FAQ questions and answers';
COMMENT ON COLUMN faq.helpful_count IS 'Number of "helpful" votes from users';
COMMENT ON INDEX idx_faq_search IS 'Full-text search index for FAQ search bar';

-- =============================================================================
-- 4. TRIGGER: Auto-update updated_at (faq)
-- =============================================================================

CREATE TRIGGER trigger_faq_updated_at
  BEFORE UPDATE ON faq
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. FUNCTION: Search FAQ
-- =============================================================================
-- Recherche full-text dans les questions et réponses
-- Usage: SELECT * FROM search_faq('payment methods');

CREATE OR REPLACE FUNCTION search_faq(search_query TEXT)
RETURNS TABLE (
  id UUID,
  category_id UUID,
  question TEXT,
  answer TEXT,
  category_title TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.category_id,
    f.question,
    f.answer,
    c.title as category_title,
    ts_rank(
      to_tsvector('english', f.question || ' ' || f.answer),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM faq f
  INNER JOIN faq_categories c ON c.id = f.category_id
  WHERE
    f.published = true
    AND f.deleted_at IS NULL
    AND c.published = true
    AND c.deleted_at IS NULL
    AND (
      to_tsvector('english', f.question || ' ' || f.answer) @@
      plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC, f.helpful_count DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION search_faq IS 'Full-text search in FAQ questions and answers';

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS: faq_categories
-- -----------------------------------------------------------------------------

-- Public peut voir les catégories publiées
CREATE POLICY "Public can view published categories"
  ON faq_categories FOR SELECT
  USING (published = true AND deleted_at IS NULL);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all categories"
  ON faq_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Admins et editors peuvent créer/modifier
CREATE POLICY "Admins and editors can manage categories"
  ON faq_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin' OR roles ? 'editor')
    )
  );

-- -----------------------------------------------------------------------------
-- RLS: faq
-- -----------------------------------------------------------------------------

-- Public peut voir les questions publiées
CREATE POLICY "Public can view published questions"
  ON faq FOR SELECT
  USING (published = true AND deleted_at IS NULL);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all questions"
  ON faq FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Admins et editors peuvent créer/modifier
CREATE POLICY "Admins and editors can manage questions"
  ON faq FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin' OR roles ? 'editor')
    )
  );

-- =============================================================================
-- 7. DONNÉES D'EXEMPLE (OPTIONNEL)
-- =============================================================================
-- Décommentez pour insérer des exemples de FAQ génériques

/*
-- Insert sample categories
INSERT INTO faq_categories (title, icon, display_order, published) VALUES
  ('Getting Started', 'Rocket', 1, true),
  ('Billing & Pricing', 'DollarSign', 2, true),
  ('Technical Support', 'Settings', 3, true),
  ('Security & Privacy', 'Shield', 4, true)
ON CONFLICT DO NOTHING;

-- Insert sample questions
DO $$
DECLARE
  cat_getting_started UUID;
  cat_billing UUID;
  cat_technical UUID;
  cat_security UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_getting_started FROM faq_categories WHERE title = 'Getting Started' LIMIT 1;
  SELECT id INTO cat_billing FROM faq_categories WHERE title = 'Billing & Pricing' LIMIT 1;
  SELECT id INTO cat_technical FROM faq_categories WHERE title = 'Technical Support' LIMIT 1;
  SELECT id INTO cat_security FROM faq_categories WHERE title = 'Security & Privacy' LIMIT 1;

  -- Getting Started questions
  INSERT INTO faq (category_id, question, answer, display_order, published) VALUES
    (cat_getting_started, 'How do I create an account?', 'Click the "Sign Up" button in the top right corner. Fill in your email and password, then verify your email address.', 1, true),
    (cat_getting_started, 'What features are included?', 'Our platform includes user management, authentication, file storage, real-time updates, and more. Check our documentation for details.', 2, true);

  -- Billing questions
  INSERT INTO faq (category_id, question, answer, display_order, published) VALUES
    (cat_billing, 'How much does it cost?', 'We offer flexible pricing plans starting at $9/month. Visit our pricing page for detailed information.', 1, true),
    (cat_billing, 'Can I cancel anytime?', 'Yes, you can cancel your subscription at any time. No questions asked.', 2, true);

  -- Technical questions
  INSERT INTO faq (category_id, question, answer, display_order, published) VALUES
    (cat_technical, 'How do I reset my password?', 'Click "Forgot Password" on the login page and follow the instructions sent to your email.', 1, true),
    (cat_technical, 'Is there an API available?', 'Yes, we provide a comprehensive REST API. Documentation is available in your dashboard.', 2, true);

  -- Security questions
  INSERT INTO faq (category_id, question, answer, display_order, published) VALUES
    (cat_security, 'Is my data secure?', 'Yes, we use industry-standard encryption (AES-256) and follow security best practices.', 1, true),
    (cat_security, 'Do you comply with GDPR?', 'Yes, we are fully GDPR compliant. We respect your privacy and data rights.', 2, true);

END $$;
*/

-- =============================================================================
-- ✅ FAQ SYSTEM CRÉÉ
-- =============================================================================
-- Tables créées:
--   - faq_categories (catégories FAQ)
--   - faq (questions et réponses)
--
-- Fonctionnalités:
--   - Full-text search avec fonction search_faq()
--   - Compteurs helpful/view (analytics)
--   - Soft delete + publication
--   - RLS sécurisé
--
-- Prochaine étape : 003_lexique.sql (glossaire de termes)
-- =============================================================================
