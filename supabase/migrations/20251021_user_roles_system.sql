-- =============================================
-- Migration: User Roles & Permissions System
-- Description: Système de gestion des utilisateurs avec rôles multi-niveaux
-- Date: 2025-10-21
-- =============================================

-- =============================================
-- 1. TABLE: USER_PROFILES (extension de auth.users)
-- =============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informations de base
  name TEXT,
  avatar_url TEXT,

  -- Système de rôles (multi-rôles possibles)
  roles JSONB DEFAULT '["visiteur"]'::jsonb,
  -- Rôles possibles: super_admin, admin, auteur, visiteur

  -- Statut du compte
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Index pour performances
CREATE INDEX idx_user_profiles_roles ON user_profiles USING GIN (roles);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_deleted_at ON user_profiles(deleted_at);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- =============================================
-- 2. TABLE: USER_ACTIVITY_LOGS
-- =============================================

CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Utilisateur qui a effectué l'action
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,

  -- Détails de l'action
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
  resource TEXT NOT NULL, -- 'project', 'user', 'redirect', etc.
  resource_id TEXT, -- ID de la ressource affectée
  details JSONB, -- Détails supplémentaires de l'action

  -- Context
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherches rapides
CREATE INDEX idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON user_activity_logs(action);
CREATE INDEX idx_activity_logs_resource ON user_activity_logs(resource);
CREATE INDEX idx_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour user_profiles
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Les super_admin et admin peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Les utilisateurs peuvent modifier leur propre profil (sauf roles)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Empêcher l'auto-modification des rôles
    AND roles = (SELECT roles FROM user_profiles WHERE id = auth.uid())
  );

-- Seuls les super_admin peuvent modifier les rôles et créer/supprimer des utilisateurs
CREATE POLICY "Super admins can manage all profiles"
  ON user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND roles ? 'super_admin'
    )
  );

-- Politique pour user_activity_logs
-- Les admins peuvent voir tous les logs
CREATE POLICY "Admins can view all activity logs"
  ON user_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Les logs sont en lecture seule pour les admins
-- Seul le système peut insérer des logs (via service role)

-- =============================================
-- 4. FONCTION HELPER: Vérifier si un utilisateur a un rôle
-- =============================================

CREATE OR REPLACE FUNCTION has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id
    AND roles ? required_role
    AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. FONCTION HELPER: Obtenir les rôles d'un utilisateur
-- =============================================

CREATE OR REPLACE FUNCTION get_user_roles(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_roles JSONB;
BEGIN
  SELECT roles INTO user_roles
  FROM user_profiles
  WHERE id = user_id
  AND deleted_at IS NULL;

  RETURN COALESCE(user_roles, '["visiteur"]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. TRIGGER: Auto-créer un profil lors de l'inscription
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, roles, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    '["visiteur"]'::jsonb,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 7. FONCTION: Logger une activité
-- =============================================

CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Récupérer l'email de l'utilisateur
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;

  -- Insérer le log
  INSERT INTO user_activity_logs (
    user_id,
    user_email,
    action,
    resource,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    v_user_email,
    p_action,
    p_resource,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. DONNÉES INITIALES (optionnel)
-- =============================================

-- Créer un profil pour l'utilisateur admin actuel (si existe)
-- NOTE: Adapter l'email selon votre compte admin existant

-- Exemple: Si vous avez un compte admin existant, créez son profil
-- INSERT INTO user_profiles (id, name, roles, status)
-- SELECT id, COALESCE(raw_user_meta_data->>'name', email), '["super_admin"]'::jsonb, 'active'
-- FROM auth.users
-- WHERE email = 'votre-email@example.com'
-- ON CONFLICT (id) DO UPDATE SET
--   roles = '["super_admin"]'::jsonb,
--   updated_at = NOW();

-- =============================================
-- 9. COMMENTAIRES
-- =============================================

COMMENT ON TABLE user_profiles IS 'Profils utilisateurs étendant auth.users avec rôles et permissions';
COMMENT ON TABLE user_activity_logs IS 'Logs des activités utilisateurs pour audit et sécurité';
COMMENT ON FUNCTION has_role IS 'Vérifie si un utilisateur possède un rôle spécifique';
COMMENT ON FUNCTION get_user_roles IS 'Retourne tous les rôles d''un utilisateur';
COMMENT ON FUNCTION log_user_activity IS 'Enregistre une activité utilisateur dans les logs';
