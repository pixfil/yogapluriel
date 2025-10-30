-- =============================================================================
-- LEXIQUE (GLOSSARY / DICTIONARY)
-- =============================================================================
-- Dépendances : 00_core/003_site_settings.sql
-- Glossaire de termes techniques organisé alphabétiquement
-- =============================================================================

-- =============================================================================
-- 1. TABLE: LEXIQUE
-- =============================================================================
-- Glossaire de termes avec définitions, organisé par lettre alphabétique

CREATE TABLE IF NOT EXISTS lexique (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Terme et définition
  term TEXT NOT NULL,
  definition TEXT NOT NULL,

  -- Informations supplémentaires (optionnel)
  category TEXT, -- Ex: "Technical", "Business", "Legal", etc.
  see_also TEXT[], -- Array de termes reliés (ex: ['API', 'REST', 'GraphQL'])

  -- Organisation alphabétique
  letter CHAR(1) NOT NULL CHECK (letter ~ '^[A-Z0-9]$'), -- A-Z ou 0-9

  -- Ordre d'affichage dans la lettre
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
CREATE INDEX idx_lexique_letter ON lexique(letter) WHERE deleted_at IS NULL;
CREATE INDEX idx_lexique_published ON lexique(published) WHERE published = true AND deleted_at IS NULL;
CREATE INDEX idx_lexique_display_order ON lexique(letter, display_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_lexique_category ON lexique(category) WHERE category IS NOT NULL AND deleted_at IS NULL;

-- Index full-text search (recherche dans terme et définition)
CREATE INDEX idx_lexique_search
  ON lexique
  USING gin(to_tsvector('english', term || ' ' || definition))
  WHERE deleted_at IS NULL;

COMMENT ON TABLE lexique IS 'Glossary / dictionary of technical terms';
COMMENT ON COLUMN lexique.letter IS 'First letter for alphabetical organization (A-Z, 0-9)';
COMMENT ON COLUMN lexique.see_also IS 'Array of related terms';
COMMENT ON INDEX idx_lexique_search IS 'Full-text search in term and definition';

-- =============================================================================
-- 2. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_lexique_updated_at
  BEFORE UPDATE ON lexique
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. FUNCTION: Search Lexique
-- =============================================================================
-- Recherche full-text dans les termes et définitions
-- Usage: SELECT * FROM search_lexique('authentication');

CREATE OR REPLACE FUNCTION search_lexique(search_query TEXT)
RETURNS TABLE (
  id UUID,
  term TEXT,
  definition TEXT,
  category TEXT,
  letter CHAR(1),
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.term,
    l.definition,
    l.category,
    l.letter,
    ts_rank(
      to_tsvector('english', l.term || ' ' || l.definition),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM lexique l
  WHERE
    l.published = true
    AND l.deleted_at IS NULL
    AND (
      to_tsvector('english', l.term || ' ' || l.definition) @@
      plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION search_lexique IS 'Full-text search in lexique terms and definitions';

-- =============================================================================
-- 4. FUNCTION: Get terms by letter
-- =============================================================================
-- Récupère tous les termes d'une lettre alphabétique
-- Usage: SELECT * FROM get_lexique_by_letter('A');

CREATE OR REPLACE FUNCTION get_lexique_by_letter(target_letter CHAR(1))
RETURNS TABLE (
  id UUID,
  term TEXT,
  definition TEXT,
  category TEXT,
  see_also TEXT[],
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.term,
    l.definition,
    l.category,
    l.see_also,
    l.display_order
  FROM lexique l
  WHERE
    UPPER(l.letter) = UPPER(target_letter)
    AND l.published = true
    AND l.deleted_at IS NULL
  ORDER BY l.display_order, l.term;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_lexique_by_letter IS 'Get all terms for a specific letter';

-- =============================================================================
-- 5. VIEW: Available letters
-- =============================================================================
-- Vue des lettres ayant au moins un terme publié
-- Utile pour afficher la navigation alphabétique

CREATE OR REPLACE VIEW lexique_available_letters AS
SELECT DISTINCT
  letter,
  COUNT(*) as term_count
FROM lexique
WHERE
  published = true
  AND deleted_at IS NULL
GROUP BY letter
ORDER BY letter;

COMMENT ON VIEW lexique_available_letters IS 'Letters that have at least one published term';

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE lexique ENABLE ROW LEVEL SECURITY;

-- Public peut voir les termes publiés
CREATE POLICY "Public can view published terms"
  ON lexique FOR SELECT
  USING (published = true AND deleted_at IS NULL);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all terms"
  ON lexique FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Admins et editors peuvent créer/modifier
CREATE POLICY "Admins and editors can manage terms"
  ON lexique FOR ALL
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
-- Exemples de termes techniques génériques pour un glossaire web/tech
-- Décommentez pour insérer des exemples

/*
INSERT INTO lexique (term, definition, letter, category, display_order, published) VALUES
-- A
('API', 'Application Programming Interface - Interface permettant à des applications de communiquer entre elles.', 'A', 'Technical', 1, true),
('Authentication', 'Process of verifying the identity of a user or system.', 'A', 'Security', 2, true),
('Authorization', 'Process of determining what actions an authenticated user is allowed to perform.', 'A', 'Security', 3, true),

-- B
('Backend', 'Server-side part of an application handling business logic, databases, and APIs.', 'B', 'Technical', 1, true),
('Browser', 'Software application for accessing websites and web applications.', 'B', 'Technical', 2, true),

-- C
('Cache', 'Temporary storage mechanism for frequently accessed data to improve performance.', 'C', 'Technical', 1, true),
('CDN', 'Content Delivery Network - Distributed network of servers delivering content based on geographic location.', 'C', 'Technical', 2, true),
('Cookie', 'Small piece of data stored in the user''s browser for session management and tracking.', 'C', 'Technical', 3, true),
('CRUD', 'Create, Read, Update, Delete - Basic operations for database management.', 'C', 'Technical', 4, true),

-- D
('Database', 'Organized collection of structured data stored electronically.', 'D', 'Technical', 1, true),
('Deployment', 'Process of releasing an application to a production environment.', 'D', 'Technical', 2, true),
('DNS', 'Domain Name System - System that translates domain names to IP addresses.', 'D', 'Technical', 3, true),

-- E
('Encryption', 'Process of encoding data to prevent unauthorized access.', 'E', 'Security', 1, true),
('Environment Variable', 'Dynamic value that can affect running processes on a computer.', 'E', 'Technical', 2, true),

-- F
('Frontend', 'Client-side part of an application that users interact with directly.', 'F', 'Technical', 1, true),
('Framework', 'Pre-built structure providing foundation for developing applications.', 'F', 'Technical', 2, true),

-- G
('GDPR', 'General Data Protection Regulation - EU law on data protection and privacy.', 'G', 'Legal', 1, true),
('Git', 'Version control system for tracking changes in source code.', 'G', 'Technical', 2, true),

-- H
('HTTPS', 'Hypertext Transfer Protocol Secure - Encrypted version of HTTP for secure communication.', 'H', 'Security', 1, true),
('Hosting', 'Service providing infrastructure to make websites accessible on the internet.', 'H', 'Technical', 2, true),

-- J
('JSON', 'JavaScript Object Notation - Lightweight data interchange format.', 'J', 'Technical', 1, true),
('JWT', 'JSON Web Token - Compact token format for securely transmitting information.', 'J', 'Security', 2, true),

-- M
('Middleware', 'Software layer between operating system and applications, providing common services.', 'M', 'Technical', 1, true),
('Migration', 'Process of moving data or applications from one environment to another.', 'M', 'Technical', 2, true),

-- O
('OAuth', 'Open standard for access delegation commonly used for token-based authentication.', 'O', 'Security', 1, true),

-- R
('REST', 'Representational State Transfer - Architectural style for designing networked applications.', 'R', 'Technical', 1, true),
('RLS', 'Row Level Security - Database security feature controlling access at row level.', 'R', 'Security', 2, true),

-- S
('SSL', 'Secure Sockets Layer - Protocol for establishing encrypted links between servers and clients.', 'S', 'Security', 1, true),
('SSR', 'Server-Side Rendering - Rendering web pages on the server instead of the browser.', 'S', 'Technical', 2, true),

-- T
('TypeScript', 'Typed superset of JavaScript adding static type definitions.', 'T', 'Technical', 1, true),

-- U
('UI', 'User Interface - Visual elements through which users interact with an application.', 'U', 'Design', 1, true),
('UX', 'User Experience - Overall experience of a person using a product or service.', 'U', 'Design', 2, true),

-- W
('Webhook', 'Automated message sent from apps when something happens, enabling real-time notifications.', 'W', 'Technical', 1, true);
*/

-- =============================================================================
-- ✅ LEXIQUE CRÉÉ
-- =============================================================================
-- Tables créées:
--   - lexique (glossaire alphabétique)
--
-- Vues:
--   - lexique_available_letters (lettres disponibles)
--
-- Fonctions:
--   - search_lexique(query) → recherche full-text
--   - get_lexique_by_letter(letter) → termes d'une lettre
--
-- Fonctionnalités:
--   - Organisation alphabétique
--   - Full-text search
--   - Catégories et termes reliés
--   - RLS sécurisé
--
-- Prochaine étape : 004_pages.sql (pages SEO dynamiques)
-- =============================================================================
