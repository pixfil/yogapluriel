-- =============================================================================
-- POPUPS & NOTIFICATIONS SYSTEM
-- =============================================================================
-- Dépendances : 00_core/003_site_settings.sql
-- Système de popups/notifications programmables avec règles d'affichage avancées
-- =============================================================================

-- =============================================================================
-- 1. TABLE: POPUPS
-- =============================================================================
-- Gestion de popups/notifications avec contrôle complet sur apparence et comportement

CREATE TABLE IF NOT EXISTS popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  title TEXT NOT NULL, -- Titre admin (pour identifier le popup)
  internal_name TEXT NOT NULL UNIQUE, -- Slug/key unique (ex: "summer-promo-2025")

  -- État
  is_active BOOLEAN DEFAULT false,

  -- Contenu
  heading TEXT, -- Titre affiché dans le popup
  description TEXT, -- Contenu/message (markdown supporté)
  cta_text TEXT, -- Texte du bouton CTA (ex: "En savoir plus")
  cta_link TEXT, -- URL du bouton CTA
  image_url TEXT, -- URL image (optionnel)

  -- Apparence
  position TEXT DEFAULT 'center' CHECK (position IN ('center', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center')),
  overlay_color TEXT DEFAULT 'rgba(0,0,0,0.5)', -- Couleur overlay/backdrop
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  button_color TEXT DEFAULT '#3B82F6', -- Tailwind blue-500
  button_text_color TEXT DEFAULT '#ffffff',
  width_px INTEGER DEFAULT 600 CHECK (width_px >= 200 AND width_px <= 1200),
  border_radius INTEGER DEFAULT 12 CHECK (border_radius >= 0 AND border_radius <= 50),

  -- Déclenchement (Trigger)
  trigger_type TEXT DEFAULT 'on_load' CHECK (trigger_type IN ('on_load', 'on_exit', 'on_scroll', 'timed')),
  trigger_delay INTEGER DEFAULT 0 CHECK (trigger_delay >= 0), -- Secondes (pour on_load, timed)
  scroll_percentage INTEGER DEFAULT 50 CHECK (scroll_percentage >= 0 AND scroll_percentage <= 100), -- % scroll (pour on_scroll)

  -- Règles d'affichage avancées
  show_once_per_session BOOLEAN DEFAULT false, -- Une fois par session browser
  show_once_per_user BOOLEAN DEFAULT false, -- Une fois définitivement (cookie 30j)
  excluded_paths TEXT[], -- Pages où NE PAS afficher (ex: ['/admin', '/checkout'])
  included_paths TEXT[], -- Pages où afficher UNIQUEMENT (vide = toutes sauf excluded)

  -- Dates de programmation
  start_date TIMESTAMP WITH TIME ZONE, -- Début d'affichage (NULL = immédiat)
  end_date TIMESTAMP WITH TIME ZONE, -- Fin d'affichage (NULL = indéfini)

  -- Statistiques (analytics)
  view_count INTEGER DEFAULT 0, -- Nombre de fois affiché
  click_count INTEGER DEFAULT 0, -- Nombre de clics sur CTA
  close_count INTEGER DEFAULT 0, -- Nombre de fermetures

  -- Gestion
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Soft delete pattern
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour performances
CREATE INDEX idx_popups_active ON popups(is_active) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_popups_dates ON popups(start_date, end_date) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_popups_internal_name ON popups(internal_name) WHERE deleted_at IS NULL;

COMMENT ON TABLE popups IS 'Popups/notifications system with advanced display rules';
COMMENT ON COLUMN popups.internal_name IS 'Unique identifier for code reference';
COMMENT ON COLUMN popups.trigger_type IS 'on_load=immediate, on_exit=exit intent, on_scroll=scroll %, timed=after X seconds';
COMMENT ON COLUMN popups.show_once_per_session IS 'Show only once per browser session';
COMMENT ON COLUMN popups.show_once_per_user IS 'Show only once ever (30 days cookie)';

-- =============================================================================
-- 2. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_popups_updated_at
  BEFORE UPDATE ON popups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. FUNCTION: Get active popups for path
-- =============================================================================
-- Récupère les popups actifs pour un chemin donné
-- Usage: SELECT * FROM get_popups_for_path('/');

CREATE OR REPLACE FUNCTION get_popups_for_path(target_path TEXT)
RETURNS TABLE (
  id UUID,
  internal_name TEXT,
  heading TEXT,
  description TEXT,
  cta_text TEXT,
  cta_link TEXT,
  image_url TEXT,
  position TEXT,
  overlay_color TEXT,
  background_color TEXT,
  text_color TEXT,
  button_color TEXT,
  button_text_color TEXT,
  width_px INTEGER,
  border_radius INTEGER,
  trigger_type TEXT,
  trigger_delay INTEGER,
  scroll_percentage INTEGER,
  show_once_per_session BOOLEAN,
  show_once_per_user BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.internal_name,
    p.heading,
    p.description,
    p.cta_text,
    p.cta_link,
    p.image_url,
    p.position,
    p.overlay_color,
    p.background_color,
    p.text_color,
    p.button_color,
    p.button_text_color,
    p.width_px,
    p.border_radius,
    p.trigger_type,
    p.trigger_delay,
    p.scroll_percentage,
    p.show_once_per_session,
    p.show_once_per_user
  FROM popups p
  WHERE
    p.is_active = true
    AND p.deleted_at IS NULL
    AND (p.start_date IS NULL OR p.start_date <= NOW())
    AND (p.end_date IS NULL OR p.end_date >= NOW())
    -- Check included paths (if empty, show on all pages)
    AND (
      p.included_paths IS NULL
      OR ARRAY_LENGTH(p.included_paths, 1) IS NULL
      OR target_path = ANY(p.included_paths)
    )
    -- Check excluded paths
    AND (
      p.excluded_paths IS NULL
      OR ARRAY_LENGTH(p.excluded_paths, 1) IS NULL
      OR target_path != ALL(p.excluded_paths)
    )
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_popups_for_path IS 'Get active popups for a specific path with date and path filtering';

-- =============================================================================
-- 4. FUNCTION: Increment popup view
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_popup_view(popup_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE popups
  SET view_count = view_count + 1
  WHERE id = popup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_popup_view IS 'Increment view counter when popup is displayed';

-- =============================================================================
-- 5. FUNCTION: Increment popup click
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_popup_click(popup_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE popups
  SET click_count = click_count + 1
  WHERE id = popup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_popup_click IS 'Increment click counter when CTA button is clicked';

-- =============================================================================
-- 6. FUNCTION: Increment popup close
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_popup_close(popup_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE popups
  SET close_count = close_count + 1
  WHERE id = popup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_popup_close IS 'Increment close counter when popup is dismissed';

-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE popups ENABLE ROW LEVEL SECURITY;

-- Public peut voir les popups actifs (avec filtres dates)
CREATE POLICY "Public can view active popups"
  ON popups FOR SELECT
  USING (
    is_active = true
    AND deleted_at IS NULL
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all popups"
  ON popups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Admins et editors peuvent créer/modifier
CREATE POLICY "Admins and editors can manage popups"
  ON popups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin' OR roles ? 'editor')
    )
  );

-- =============================================================================
-- ✅ POPUPS & NOTIFICATIONS SYSTEM CRÉÉ
-- =============================================================================
-- Tables créées:
--   - popups (popups/notifications programmables)
--
-- Fonctions:
--   - get_popups_for_path(path) → popups actifs pour une page
--   - increment_popup_view(id) → compteur vues
--   - increment_popup_click(id) → compteur clics
--   - increment_popup_close(id) → compteur fermetures
--
-- Fonctionnalités:
--   - 4 types de déclenchement (on_load, on_exit, on_scroll, timed)
--   - Règles d'affichage par page (included/excluded paths)
--   - Programmation temporelle (start_date, end_date)
--   - Contrôle de fréquence (once per session/user)
--   - Personnalisation complète (couleurs, position, taille)
--   - Analytics intégrées (views, clicks, closes)
--   - Soft delete + RLS sécurisé
--
-- Usage Next.js:
--   1. Créer composant <PopupManager /> dans layout.tsx
--   2. Fetch popups avec get_popups_for_path(pathname)
--   3. Gérer cookies pour show_once_per_user
--   4. Appeler increment_* lors des événements
--
-- Note: Images des popups → configurer bucket Storage (popup-images)
--       Voir supabase/storage/buckets.sql
--
-- Prochaine étape : 03_communication/ (inbox, email_logs, newsletter)
-- =============================================================================
