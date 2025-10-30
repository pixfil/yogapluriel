-- =============================================================================
-- REDIRECTS & 404 TRACKING
-- =============================================================================
-- Dépendances : 00_core/003_site_settings.sql
-- Système de redirections SEO (301/302) et tracking des erreurs 404
-- =============================================================================

-- =============================================================================
-- 1. TABLE: REDIRECTS
-- =============================================================================
-- Gestion des redirections pour préserver le SEO et corriger les liens cassés

CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Chemins
  from_path TEXT NOT NULL UNIQUE, -- URL source (ancienne) - peut contenir * pour wildcard
  to_path TEXT NOT NULL, -- URL destination (nouvelle)

  -- Configuration
  status_code INTEGER DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308)),
  is_active BOOLEAN DEFAULT true,
  is_wildcard BOOLEAN DEFAULT false, -- true si from_path contient * (ex: /blog/* → /articles)

  -- Statistiques d'utilisation
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMP WITH TIME ZONE,

  -- Métadonnées
  notes TEXT, -- Raison de la redirection, commentaires admin
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft delete pattern
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour performances (critiques pour middleware)
CREATE INDEX idx_redirects_from_path ON redirects(from_path) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_redirects_wildcard ON redirects(is_wildcard) WHERE is_wildcard = true AND is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_redirects_is_active ON redirects(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_redirects_hit_count ON redirects(hit_count DESC);

COMMENT ON TABLE redirects IS 'URL redirections (301/302/307/308) for SEO preservation and broken link fixes';
COMMENT ON COLUMN redirects.status_code IS '301=permanent, 302=temporary, 307=temp (preserve method), 308=perm (preserve method)';
COMMENT ON COLUMN redirects.is_wildcard IS 'If true, from_path can contain * to match multiple URLs (ex: /blog/* → /articles)';
COMMENT ON COLUMN redirects.hit_count IS 'Number of times this redirect was used';

-- =============================================================================
-- 2. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_redirects_updated_at
  BEFORE UPDATE ON redirects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. TABLE: 404_LOGS
-- =============================================================================
-- Tracking des erreurs 404 pour identifier les liens cassés

CREATE TABLE IF NOT EXISTS "404_logs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- URL demandée (introuvable)
  path TEXT NOT NULL UNIQUE,

  -- Informations de la requête
  referrer TEXT, -- D'où vient la requête (lien cassé externe/interne)
  user_agent TEXT,
  ip_address TEXT,

  -- Statistiques
  hit_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Résolution
  is_resolved BOOLEAN DEFAULT false, -- true si une redirection a été créée
  redirect_id UUID REFERENCES redirects(id) ON DELETE SET NULL, -- Lien vers la redirection créée

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour performances
CREATE INDEX idx_404_logs_path ON "404_logs"(path);
CREATE INDEX idx_404_logs_is_resolved ON "404_logs"(is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_404_logs_hit_count ON "404_logs"(hit_count DESC);
CREATE INDEX idx_404_logs_last_seen_at ON "404_logs"(last_seen_at DESC);

COMMENT ON TABLE "404_logs" IS '404 error logs to identify broken links and create redirects';
COMMENT ON COLUMN "404_logs".hit_count IS 'Number of times this 404 was encountered';
COMMENT ON COLUMN "404_logs".is_resolved IS 'true if a redirect was created to fix this 404';

-- =============================================================================
-- 4. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_404_logs_updated_at
  BEFORE UPDATE ON "404_logs"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. FUNCTION: Get redirect for path
-- =============================================================================
-- Trouve la redirection appropriée pour un chemin (exact ou wildcard)
-- Usage: SELECT * FROM get_redirect_for_path('/old-blog/post-123');

CREATE OR REPLACE FUNCTION get_redirect_for_path(target_path TEXT)
RETURNS TABLE (
  id UUID,
  to_path TEXT,
  status_code INTEGER,
  is_wildcard BOOLEAN
) AS $$
BEGIN
  -- D'abord chercher un match exact
  RETURN QUERY
  SELECT
    r.id,
    r.to_path,
    r.status_code,
    r.is_wildcard
  FROM redirects r
  WHERE
    r.from_path = target_path
    AND r.is_active = true
    AND r.deleted_at IS NULL
    AND r.is_wildcard = false
  LIMIT 1;

  -- Si aucun match exact, chercher dans les wildcards
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      r.id,
      -- Remplacer * dans to_path par le slug capturé
      CASE
        WHEN r.to_path LIKE '%*%' THEN
          REPLACE(r.to_path, '*', SPLIT_PART(target_path, '/', ARRAY_LENGTH(STRING_TO_ARRAY(r.from_path, '/'), 1)))
        ELSE
          r.to_path
      END as to_path,
      r.status_code,
      r.is_wildcard
    FROM redirects r
    WHERE
      r.is_wildcard = true
      AND r.is_active = true
      AND r.deleted_at IS NULL
      AND target_path LIKE REPLACE(r.from_path, '*', '%')
    ORDER BY LENGTH(r.from_path) DESC -- Préférer les patterns les plus spécifiques
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_redirect_for_path IS 'Find redirect for a path (exact match or wildcard)';

-- =============================================================================
-- 6. FUNCTION: Increment redirect hit counter
-- =============================================================================
-- Incrémente le compteur de hits d'une redirection
-- Usage: SELECT increment_redirect_hit('uuid-here');

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

COMMENT ON FUNCTION increment_redirect_hit IS 'Increment hit counter and update last_hit_at for a redirect';

-- =============================================================================
-- 7. FUNCTION: Log 404 error
-- =============================================================================
-- Enregistre ou met à jour un log 404 (upsert)
-- Usage: SELECT log_404('/broken-link', 'https://google.com', 'Mozilla/5.0...', '1.2.3.4');

CREATE OR REPLACE FUNCTION log_404(
  p_path TEXT,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO "404_logs" (
    path,
    referrer,
    user_agent,
    ip_address,
    hit_count,
    first_seen_at,
    last_seen_at
  )
  VALUES (
    p_path,
    p_referrer,
    p_user_agent,
    p_ip_address,
    1,
    NOW(),
    NOW()
  )
  ON CONFLICT (path) DO UPDATE SET
    hit_count = "404_logs".hit_count + 1,
    last_seen_at = NOW(),
    referrer = COALESCE(EXCLUDED.referrer, "404_logs".referrer),
    user_agent = COALESCE(EXCLUDED.user_agent, "404_logs".user_agent),
    ip_address = COALESCE(EXCLUDED.ip_address, "404_logs".ip_address);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_404 IS 'Log or update a 404 error (upsert based on path)';

-- =============================================================================
-- 8. FUNCTION: Mark 404 as resolved
-- =============================================================================
-- Marque un 404 comme résolu en associant une redirection
-- Usage: SELECT resolve_404('/broken-link', 'redirect-uuid');

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

COMMENT ON FUNCTION resolve_404 IS 'Mark a 404 as resolved by associating a redirect';

-- =============================================================================
-- 9. FUNCTION: Cleanup old 404 logs
-- =============================================================================
-- Nettoie les vieux logs 404 peu utilisés (maintenance)
-- Usage: SELECT cleanup_old_404_logs(); (peut être appelé via cron job)

CREATE OR REPLACE FUNCTION cleanup_old_404_logs(days_old INTEGER DEFAULT 90, min_hits INTEGER DEFAULT 3)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les logs > X jours ET < Y hits ET non résolus
  DELETE FROM "404_logs"
  WHERE
    last_seen_at < NOW() - (days_old || ' days')::INTERVAL
    AND hit_count < min_hits
    AND is_resolved = false;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_404_logs IS 'Delete old 404 logs with few hits and unresolved';

-- =============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE "404_logs" ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS: redirects
-- -----------------------------------------------------------------------------

-- Public peut lire les redirections actives (nécessaire pour middleware)
CREATE POLICY "Public can view active redirects"
  ON redirects FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Admins peuvent tout voir et gérer
CREATE POLICY "Admins can view all redirects"
  ON redirects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

CREATE POLICY "Admins can manage redirects"
  ON redirects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- -----------------------------------------------------------------------------
-- RLS: 404_logs
-- -----------------------------------------------------------------------------

-- Seuls les admins peuvent voir les logs 404
CREATE POLICY "Admins can view 404 logs"
  ON "404_logs" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

CREATE POLICY "Admins can manage 404 logs"
  ON "404_logs" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Seul le système (service role) peut insérer/modifier via les fonctions

-- =============================================================================
-- ✅ REDIRECTS & 404 TRACKING CRÉÉ
-- =============================================================================
-- Tables créées:
--   - redirects (redirections SEO 301/302/307/308)
--   - 404_logs (tracking erreurs 404)
--
-- Fonctions:
--   - get_redirect_for_path(path) → trouve redirection (exact ou wildcard)
--   - increment_redirect_hit(id) → incrémente compteur hits
--   - log_404(path, ...) → enregistre erreur 404
--   - resolve_404(path, redirect_id) → marque 404 comme résolu
--   - cleanup_old_404_logs() → nettoie vieux logs
--
-- Fonctionnalités:
--   - Redirections exactes: /old-page → /new-page
--   - Wildcards: /blog/* → /articles (ou /articles/*)
--   - Statistiques d'utilisation (hit_count, last_hit_at)
--   - Tracking 404 avec referrer/user-agent/IP
--   - Workflow de résolution (créer redirect depuis 404)
--   - Multiple status codes (301, 302, 307, 308)
--   - RLS sécurisé
--
-- Usage Next.js Middleware:
--   1. Fetch active redirects with get_redirect_for_path()
--   2. If match found, redirect with NextResponse.redirect()
--   3. Increment hit counter with increment_redirect_hit()
--   4. If 404, log with log_404()
--
-- Prochaine étape : 003_popups.sql (système de notifications/popups)
-- =============================================================================
