-- =============================================
-- Add New Settings (General, Analytics, SEO)
-- Date: 2025-10-22
-- Description: Ajout des paramètres pour les onglets Général, Analytics et SEO
-- =============================================

-- =============================================
-- 1. INSERT NEW SETTINGS
-- =============================================

-- Onglet Général: Informations entreprise
INSERT INTO site_settings (key, value, description) VALUES
  (
    'general',
    '{
      "phone": "",
      "email": "",
      "address": "",
      "hours": "",
      "facebook": "",
      "instagram": "",
      "linkedin": ""
    }'::jsonb,
    'Informations générales de l''entreprise (coordonnées, réseaux sociaux, horaires)'
  )
ON CONFLICT (key) DO NOTHING;

-- Onglet Analytics: IDs de tracking
INSERT INTO site_settings (key, value, description) VALUES
  (
    'analytics',
    '{
      "google_analytics": "",
      "google_tag_manager": "",
      "meta_pixel": "",
      "clarity": ""
    }'::jsonb,
    'Identifiants des outils de tracking et analytics (GA, GTM, Meta Pixel, Clarity)'
  )
ON CONFLICT (key) DO NOTHING;

-- Onglet SEO: Paramètres de référencement global
INSERT INTO site_settings (key, value, description) VALUES
  (
    'seo',
    '{
      "default_title": "FormDeToit - Couverture, Zinguerie, Isolation à Strasbourg",
      "default_description": "Artisan couvreur à Strasbourg spécialisé en rénovation de toiture, zinguerie, isolation écologique. Devis gratuit.",
      "default_og_image": "/og-image.jpg",
      "company_name": "FormDeToit",
      "service_area": "Strasbourg et environs (Bas-Rhin, 67)",
      "keywords": "couvreur strasbourg, rénovation toiture, zinguerie, isolation biosourcée, velux"
    }'::jsonb,
    'Paramètres SEO globaux du site (meta tags par défaut, Schema.org)'
  )
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 2. HELPER FUNCTIONS
-- =============================================

-- Function to get general settings
CREATE OR REPLACE FUNCTION get_general_settings()
RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT value FROM site_settings WHERE key = 'general');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get analytics settings
CREATE OR REPLACE FUNCTION get_analytics_settings()
RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT value FROM site_settings WHERE key = 'analytics');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get SEO settings
CREATE OR REPLACE FUNCTION get_seo_settings()
RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT value FROM site_settings WHERE key = 'seo');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. VERIFICATION
-- =============================================

SELECT
  key,
  value,
  description
FROM site_settings
WHERE key IN ('general', 'analytics', 'seo', 'maintenance')
ORDER BY key;
