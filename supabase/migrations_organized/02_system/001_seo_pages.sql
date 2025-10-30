-- =============================================================================
-- SEO PAGES - Dynamic Meta Tags Management
-- =============================================================================
-- Dépendances : 00_core/003_site_settings.sql
-- Gestion centralisée des meta tags SEO pour toutes les pages du site
-- =============================================================================

-- =============================================================================
-- 1. TABLE: SEO_PAGES
-- =============================================================================
-- Stocke les meta tags SEO pour chaque page du site (statique ou dynamique)

CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page identification
  path TEXT NOT NULL UNIQUE, -- Ex: "/", "/about", "/blog/[slug]"
  parent_path TEXT, -- Ex: "/blog" pour "/blog/[slug]"
  is_dynamic BOOLEAN DEFAULT false, -- true si [slug] ou [id] dans path

  -- Display order (pour navigation/sitemap)
  display_order INTEGER DEFAULT 0,

  -- Basic SEO
  title TEXT, -- Page title (50-60 caractères idéal)
  description TEXT, -- Meta description (150-160 caractères idéal)
  keywords TEXT, -- Meta keywords (optionnel, peu utilisé par Google)

  -- Open Graph (Facebook, LinkedIn, etc.)
  og_title TEXT, -- OG title (peut différer du title)
  og_description TEXT, -- OG description
  og_image TEXT, -- URL image OG (1200x630 recommandé)
  og_type TEXT DEFAULT 'website', -- article, product, website, etc.

  -- Twitter Card
  twitter_card TEXT DEFAULT 'summary_large_image', -- summary, summary_large_image, app, player
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,

  -- Advanced SEO
  canonical_url TEXT, -- URL canonique (éviter duplicate content)
  robots TEXT DEFAULT 'index, follow', -- index/noindex, follow/nofollow
  structured_data JSONB, -- JSON-LD schema.org markup

  -- Sitemap configuration
  include_in_sitemap BOOLEAN DEFAULT true,
  sitemap_priority DECIMAL(2,1) DEFAULT 0.5 CHECK (sitemap_priority >= 0 AND sitemap_priority <= 1),
  sitemap_changefreq TEXT DEFAULT 'monthly', -- always, hourly, daily, weekly, monthly, yearly, never

  -- Soft delete pattern
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index
CREATE UNIQUE INDEX idx_seo_pages_path ON seo_pages(path) WHERE deleted_at IS NULL;
CREATE INDEX idx_seo_pages_parent_path ON seo_pages(parent_path) WHERE parent_path IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_seo_pages_display_order ON seo_pages(parent_path, display_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_seo_pages_sitemap ON seo_pages(include_in_sitemap, sitemap_priority DESC) WHERE include_in_sitemap = true AND deleted_at IS NULL;

COMMENT ON TABLE seo_pages IS 'SEO metadata for all site pages (static and dynamic)';
COMMENT ON COLUMN seo_pages.path IS 'URL path - use [slug] or [id] for dynamic routes';
COMMENT ON COLUMN seo_pages.is_dynamic IS 'true if path contains [slug] or [id] placeholders';
COMMENT ON COLUMN seo_pages.structured_data IS 'JSON-LD structured data (schema.org)';
COMMENT ON COLUMN seo_pages.sitemap_priority IS 'Sitemap priority 0.0-1.0 (1.0 = highest)';

-- =============================================================================
-- 2. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_seo_pages_updated_at
  BEFORE UPDATE ON seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. FUNCTION: Get SEO for path
-- =============================================================================
-- Récupère les meta tags SEO pour un chemin donné
-- Usage: SELECT * FROM get_seo_for_path('/about');

CREATE OR REPLACE FUNCTION get_seo_for_path(target_path TEXT)
RETURNS TABLE (
  id UUID,
  path TEXT,
  title TEXT,
  description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT,
  canonical_url TEXT,
  robots TEXT,
  structured_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id,
    sp.path,
    sp.title,
    sp.description,
    sp.og_title,
    sp.og_description,
    sp.og_image,
    sp.og_type,
    sp.canonical_url,
    sp.robots,
    sp.structured_data
  FROM seo_pages sp
  WHERE
    sp.path = target_path
    AND sp.deleted_at IS NULL
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_seo_for_path IS 'Get SEO metadata for a specific path';

-- =============================================================================
-- 4. FUNCTION: Get sitemap entries
-- =============================================================================
-- Récupère toutes les pages pour le sitemap.xml
-- Usage: SELECT * FROM get_sitemap_entries();

CREATE OR REPLACE FUNCTION get_sitemap_entries()
RETURNS TABLE (
  path TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  priority DECIMAL,
  changefreq TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.path,
    sp.updated_at,
    sp.sitemap_priority as priority,
    sp.sitemap_changefreq as changefreq
  FROM seo_pages sp
  WHERE
    sp.include_in_sitemap = true
    AND sp.deleted_at IS NULL
    AND sp.robots NOT LIKE '%noindex%'
    AND sp.is_dynamic = false -- Exclure les routes dynamiques du sitemap
  ORDER BY sp.sitemap_priority DESC, sp.path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_sitemap_entries IS 'Get all pages for sitemap.xml generation';

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

-- Public peut voir toutes les pages (nécessaire pour récupérer les meta tags)
CREATE POLICY "Public can view seo pages"
  ON seo_pages FOR SELECT
  USING (deleted_at IS NULL);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all seo pages"
  ON seo_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Admins et editors peuvent créer/modifier
CREATE POLICY "Admins and editors can manage seo pages"
  ON seo_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin' OR roles ? 'editor')
    )
  );

-- =============================================================================
-- 6. DONNÉES D'EXEMPLE (OPTIONNEL)
-- =============================================================================
-- Pages SEO communes pour démarrer
-- Personnalisez selon votre projet

INSERT INTO seo_pages (path, title, description, og_title, og_description, sitemap_priority, sitemap_changefreq, display_order) VALUES

-- Homepage
('/',
 'Welcome to Our Platform | Your Tagline Here',
 'Description of your platform in 150-160 characters. Include primary keywords naturally.',
 'Your Platform Name - Tagline',
 'Engaging description for social media sharing',
 1.0,
 'weekly',
 0),

-- About
('/about',
 'About Us | Company Name',
 'Learn about our mission, vision, and the team behind our platform.',
 'About Our Company',
 'Discover our story and what drives us',
 0.8,
 'monthly',
 1),

-- Contact
('/contact',
 'Contact Us | Get in Touch',
 'Have questions? Reach out to our team. We''re here to help.',
 'Contact Our Team',
 'Get in touch with us today',
 0.7,
 'monthly',
 2),

-- Legal pages
('/privacy',
 'Privacy Policy | Company Name',
 'Our commitment to protecting your privacy and personal data.',
 'Privacy Policy',
 'How we protect your data',
 0.3,
 'yearly',
 100),

('/terms',
 'Terms of Service | Company Name',
 'Terms and conditions for using our platform.',
 'Terms of Service',
 'Terms and conditions of use',
 0.3,
 'yearly',
 101)

ON CONFLICT (path) DO NOTHING;

-- =============================================================================
-- ✅ SEO PAGES CRÉÉ
-- =============================================================================
-- Tables créées:
--   - seo_pages (meta tags SEO pour toutes les pages)
--
-- Fonctions:
--   - get_seo_for_path(path) → meta tags d'une page
--   - get_sitemap_entries() → toutes les pages pour sitemap.xml
--
-- Fonctionnalités:
--   - Meta tags dynamiques par page
--   - Open Graph & Twitter Cards
--   - Structured data (JSON-LD)
--   - Sitemap configuration
--   - Support routes dynamiques ([slug], [id])
--   - RLS sécurisé
--
-- Usage Next.js:
--   1. Créer app/lib/seo.ts avec fonction getSEO(path)
--   2. Dans layout.tsx ou page.tsx: export const metadata = await getSEO('/about')
--   3. Générer sitemap.xml avec get_sitemap_entries()
--
-- Prochaine étape : 002_redirects.sql (redirections SEO 301/302)
-- =============================================================================
