-- ==============================================
-- MIGRATION: Système de Popups
-- Description: Table popups avec gestion contenu, apparence, règles d'affichage
-- Date: 2025-10-22
-- ==============================================

-- Table principale: popups
CREATE TABLE IF NOT EXISTS popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Métadonnées
  title VARCHAR(255) NOT NULL,
  internal_name VARCHAR(255) NOT NULL UNIQUE, -- Nom interne pour identification
  is_active BOOLEAN DEFAULT false,

  -- Onglet Content
  heading TEXT, -- Titre du popup
  description TEXT, -- Description/contenu
  cta_text VARCHAR(100), -- Texte du bouton call-to-action
  cta_link VARCHAR(500), -- Lien du bouton
  image_url TEXT, -- URL de l'image (optionnel)

  -- Onglet Appearance
  position VARCHAR(50) DEFAULT 'center', -- center, top-left, top-right, bottom-left, bottom-right
  overlay_color VARCHAR(20) DEFAULT 'rgba(0,0,0,0.5)', -- Couleur overlay
  background_color VARCHAR(20) DEFAULT '#ffffff',
  text_color VARCHAR(20) DEFAULT '#000000',
  button_color VARCHAR(20) DEFAULT '#FFC803', -- Jaune FormDeToit
  button_text_color VARCHAR(20) DEFAULT '#000000',
  width_px INTEGER DEFAULT 600, -- Largeur en pixels
  border_radius INTEGER DEFAULT 12, -- Arrondi des coins

  -- Onglet Rules
  trigger_type VARCHAR(50) DEFAULT 'on_load', -- on_load, on_exit, on_scroll, timed
  trigger_delay INTEGER DEFAULT 0, -- Délai en secondes (pour on_load et timed)
  scroll_percentage INTEGER DEFAULT 50, -- % de scroll (pour on_scroll)

  -- Règles d'affichage avancées
  show_once_per_session BOOLEAN DEFAULT false, -- Afficher 1 fois par session
  show_once_per_user BOOLEAN DEFAULT false, -- Afficher 1 fois définitivement (cookie 30j)
  excluded_paths TEXT[], -- Pages où ne PAS afficher (ex: ['/admin', '/contact'])
  included_paths TEXT[], -- Pages où afficher uniquement (ex: ['/', '/prestations'])

  -- Dates de publication
  start_date TIMESTAMPTZ, -- Date de début (optionnel)
  end_date TIMESTAMPTZ, -- Date de fin (optionnel)

  -- Statistiques
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  close_count INTEGER DEFAULT 0,

  -- Gestion
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_popups_active ON popups(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_popups_dates ON popups(start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_popups_deleted ON popups(deleted_at);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_popups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_popups_updated_at
  BEFORE UPDATE ON popups
  FOR EACH ROW
  EXECUTE FUNCTION update_popups_updated_at();

-- ==============================================
-- RLS (Row Level Security)
-- ==============================================

ALTER TABLE popups ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique des popups actifs (pour le front)
CREATE POLICY "Public can view active popups"
  ON popups
  FOR SELECT
  USING (
    is_active = true
    AND deleted_at IS NULL
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Policy: Super admin peut tout voir
CREATE POLICY "Super admin can view all popups"
  ON popups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.roles ? 'super_admin'
      AND user_profiles.deleted_at IS NULL
    )
  );

-- Policy: Admin et Auteur peuvent voir (non supprimés)
CREATE POLICY "Admin and Auteur can view popups"
  ON popups
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (
        user_profiles.roles ? 'admin'
        OR user_profiles.roles ? 'auteur'
      )
      AND user_profiles.deleted_at IS NULL
    )
  );

-- Policy: Admin et Auteur peuvent créer
CREATE POLICY "Admin and Auteur can create popups"
  ON popups
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (
        user_profiles.roles ? 'super_admin'
        OR user_profiles.roles ? 'admin'
        OR user_profiles.roles ? 'auteur'
      )
      AND user_profiles.status = 'active'
      AND user_profiles.deleted_at IS NULL
    )
  );

-- Policy: Admin et Auteur peuvent modifier (non supprimés)
CREATE POLICY "Admin and Auteur can update popups"
  ON popups
  FOR UPDATE
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (
        user_profiles.roles ? 'super_admin'
        OR user_profiles.roles ? 'admin'
        OR user_profiles.roles ? 'auteur'
      )
      AND user_profiles.status = 'active'
      AND user_profiles.deleted_at IS NULL
    )
  );

-- Policy: Seul Super Admin peut vraiment supprimer
CREATE POLICY "Only super admin can delete popups"
  ON popups
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.roles ? 'super_admin'
      AND user_profiles.deleted_at IS NULL
    )
  );

-- ==============================================
-- Fonctions helper
-- ==============================================

-- Fonction pour incrémenter les vues
CREATE OR REPLACE FUNCTION increment_popup_view(popup_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE popups
  SET view_count = view_count + 1
  WHERE id = popup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter les clics
CREATE OR REPLACE FUNCTION increment_popup_click(popup_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE popups
  SET click_count = click_count + 1
  WHERE id = popup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter les fermetures
CREATE OR REPLACE FUNCTION increment_popup_close(popup_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE popups
  SET close_count = close_count + 1
  WHERE id = popup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- Bucket Supabase Storage pour images de popups
-- ==============================================

-- Note: À créer manuellement dans Supabase Dashboard → Storage
-- Nom du bucket: popup-images
-- Public: Oui
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

COMMENT ON TABLE popups IS 'Système de popups pour le site FormDeToit - Gestion complète avec règles d''affichage et statistiques';
