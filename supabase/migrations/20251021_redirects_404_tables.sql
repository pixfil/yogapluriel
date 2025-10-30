-- =============================================
-- Migration: Redirections 301 & Suivi 404
-- Description: Système de gestion des redirections SEO et suivi des erreurs 404
-- Date: 2025-10-21
-- =============================================

-- =============================================
-- 1. TABLE: REDIRECTS
-- =============================================

CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Chemins
  from_path TEXT NOT NULL UNIQUE, -- URL source (ancienne)
  to_path TEXT NOT NULL, -- URL destination (nouvelle)

  -- Configuration
  status_code INTEGER DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308)),
  is_active BOOLEAN DEFAULT true,

  -- Statistiques
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMP WITH TIME ZONE,

  -- Métadonnées
  notes TEXT, -- Raison de la redirection, commentaires
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_redirects_from_path ON redirects(from_path) WHERE deleted_at IS NULL;
CREATE INDEX idx_redirects_is_active ON redirects(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_redirects_hit_count ON redirects(hit_count DESC);
CREATE INDEX idx_redirects_deleted_at ON redirects(deleted_at);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_redirects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_redirects_updated_at
  BEFORE UPDATE ON redirects
  FOR EACH ROW
  EXECUTE FUNCTION update_redirects_updated_at();

-- =============================================
-- 2. TABLE: 404_LOGS
-- =============================================

CREATE TABLE IF NOT EXISTS "404_logs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- URL demandée
  path TEXT NOT NULL,

  -- Informations de la requête
  referrer TEXT, -- D'où vient la requête
  user_agent TEXT,
  ip_address TEXT,

  -- Statistiques
  hit_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Résolution
  is_resolved BOOLEAN DEFAULT false, -- true si une redirection a été créée
  redirect_id UUID REFERENCES redirects(id), -- Lien vers la redirection créée

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint: Un seul enregistrement par path
  UNIQUE(path)
);

-- Index pour performances
CREATE INDEX idx_404_logs_path ON "404_logs"(path);
CREATE INDEX idx_404_logs_is_resolved ON "404_logs"(is_resolved);
CREATE INDEX idx_404_logs_hit_count ON "404_logs"(hit_count DESC);
CREATE INDEX idx_404_logs_last_seen_at ON "404_logs"(last_seen_at DESC);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_404_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_404_logs_updated_at
  BEFORE UPDATE ON "404_logs"
  FOR EACH ROW
  EXECUTE FUNCTION update_404_logs_updated_at();

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE "404_logs" ENABLE ROW LEVEL SECURITY;

-- Politique pour redirects
-- Lecture publique pour les redirections actives (pour le middleware)
CREATE POLICY "Public can view active redirects"
  ON redirects FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Les admins peuvent tout voir et gérer
CREATE POLICY "Admins can manage redirects"
  ON redirects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Politique pour 404_logs
-- Les admins peuvent voir tous les logs
CREATE POLICY "Admins can view 404 logs"
  ON "404_logs" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Seul le système peut insérer/modifier des 404 logs (via service role)

-- =============================================
-- 4. FONCTION: Incrémenter le compteur de hits d'une redirection
-- =============================================

CREATE OR REPLACE FUNCTION increment_redirect_hit(redirect_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE redirects
  SET
    hit_count = hit_count + 1,
    last_hit_at = NOW()
  WHERE id = redirect_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. FONCTION: Enregistrer ou mettre à jour un log 404
-- =============================================

CREATE OR REPLACE FUNCTION log_404(
  p_path TEXT,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO "404_logs" (path, referrer, user_agent, ip_address, hit_count, first_seen_at, last_seen_at)
  VALUES (p_path, p_referrer, p_user_agent, p_ip_address, 1, NOW(), NOW())
  ON CONFLICT (path) DO UPDATE SET
    hit_count = "404_logs".hit_count + 1,
    last_seen_at = NOW(),
    referrer = COALESCE(EXCLUDED.referrer, "404_logs".referrer),
    user_agent = COALESCE(EXCLUDED.user_agent, "404_logs".user_agent),
    ip_address = COALESCE(EXCLUDED.ip_address, "404_logs".ip_address);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. FONCTION: Marquer un 404 comme résolu
-- =============================================

CREATE OR REPLACE FUNCTION resolve_404(p_path TEXT, p_redirect_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE "404_logs"
  SET
    is_resolved = true,
    redirect_id = p_redirect_id,
    updated_at = NOW()
  WHERE path = p_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. FONCTION: Auto-nettoyage des vieux logs 404
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_old_404_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les logs > 90 jours ET < 3 hits ET non résolus
  DELETE FROM "404_logs"
  WHERE
    last_seen_at < NOW() - INTERVAL '90 days'
    AND hit_count < 3
    AND is_resolved = false;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. COMMENTAIRES
-- =============================================

COMMENT ON TABLE redirects IS 'Table des redirections 301/302/307/308 pour préserver le SEO';
COMMENT ON TABLE "404_logs" IS 'Logs des erreurs 404 pour identifier les liens cassés et créer des redirections';
COMMENT ON FUNCTION increment_redirect_hit IS 'Incrémente le compteur de hits et met à jour last_hit_at pour une redirection';
COMMENT ON FUNCTION log_404 IS 'Enregistre ou met à jour un log 404 (upsert basé sur le path)';
COMMENT ON FUNCTION resolve_404 IS 'Marque un 404 comme résolu en associant une redirection';
COMMENT ON FUNCTION cleanup_old_404_logs IS 'Nettoie les logs 404 anciens et peu utilisés';
