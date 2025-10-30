-- =============================================================================
-- USER PROFILES & AUTHENTICATION SYSTEM
-- =============================================================================
-- Dépendances : 001_extensions_and_functions.sql
-- Étend auth.users avec profils utilisateurs, système de rôles et audit logs
-- =============================================================================

-- =============================================================================
-- 1. TABLE: USER_PROFILES
-- =============================================================================
-- Étend la table auth.users de Supabase avec des informations supplémentaires
-- et un système de rôles flexible (JSONB multi-rôles)

CREATE TABLE IF NOT EXISTS user_profiles (
  -- Lien avec auth.users (clé primaire = foreign key)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informations de base
  name TEXT,
  avatar_url TEXT,

  -- Système de rôles (multi-rôles possibles via JSONB)
  -- Valeurs possibles: super_admin, admin, editor, viewer
  roles JSONB DEFAULT '["viewer"]'::jsonb NOT NULL,

  -- Statut du compte
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

  -- Soft delete pattern
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Index pour recherches rapides
CREATE INDEX idx_user_profiles_roles ON user_profiles USING GIN (roles);
CREATE INDEX idx_user_profiles_status ON user_profiles(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_deleted_at ON user_profiles(deleted_at) WHERE deleted_at IS NOT NULL;

-- Commentaire explicatif
COMMENT ON TABLE user_profiles IS 'User profiles extending auth.users with roles, status, and metadata';
COMMENT ON COLUMN user_profiles.roles IS 'JSONB array of roles: ["super_admin"], ["admin", "editor"], etc.';
COMMENT ON COLUMN user_profiles.status IS 'Account status: active, inactive, or suspended';

-- =============================================================================
-- 2. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. TABLE: USER_ACTIVITY_LOGS (Audit Trail)
-- =============================================================================
-- Enregistre toutes les actions importantes des utilisateurs
-- Utile pour : sécurité, debugging, analytics, conformité légale

CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Utilisateur qui a effectué l'action
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT, -- Gardé même si l'user est supprimé

  -- Détails de l'action
  action TEXT NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', etc.
  resource TEXT NOT NULL, -- 'project', 'user', 'settings', 'redirect', etc.
  resource_id TEXT, -- ID de la ressource affectée
  details JSONB, -- Détails supplémentaires (ex: champs modifiés)

  -- Context de la requête
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour recherches et analytics
CREATE INDEX idx_activity_logs_user_id ON user_activity_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_activity_logs_action ON user_activity_logs(action);
CREATE INDEX idx_activity_logs_resource ON user_activity_logs(resource);
CREATE INDEX idx_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_email ON user_activity_logs(user_email);

COMMENT ON TABLE user_activity_logs IS 'Audit trail of all user actions for security and compliance';

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS: user_profiles
-- -----------------------------------------------------------------------------

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (
    auth.uid() = id
    AND deleted_at IS NULL
  );

-- Les super_admin et admin peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Les utilisateurs peuvent modifier leur propre profil (SAUF roles et status)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (
    auth.uid() = id
    AND deleted_at IS NULL
  )
  WITH CHECK (
    auth.uid() = id
    -- Empêcher l'auto-modification des rôles et status
    AND roles = (SELECT roles FROM user_profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM user_profiles WHERE id = auth.uid())
  );

-- Seuls les super_admin peuvent tout modifier (y compris roles et status)
CREATE POLICY "Super admins can manage all profiles"
  ON user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND roles ? 'super_admin'
    )
  );

-- -----------------------------------------------------------------------------
-- RLS: user_activity_logs
-- -----------------------------------------------------------------------------

-- Les admins peuvent voir tous les logs
CREATE POLICY "Admins can view all activity logs"
  ON user_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Les logs sont en lecture seule pour les admins
-- Seul le système (service role) peut insérer des logs via la fonction log_user_activity()

-- =============================================================================
-- 5. HELPER FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Fonction: has_role(user_id, role)
-- -----------------------------------------------------------------------------
-- Vérifie si un utilisateur possède un rôle spécifique
-- Usage: SELECT has_role(auth.uid(), 'admin');

CREATE OR REPLACE FUNCTION has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id
    AND deleted_at IS NULL
    AND roles ? required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION has_role IS 'Check if a user has a specific role';

-- -----------------------------------------------------------------------------
-- Fonction: get_user_roles(user_id)
-- -----------------------------------------------------------------------------
-- Retourne tous les rôles d'un utilisateur
-- Usage: SELECT get_user_roles(auth.uid());

CREATE OR REPLACE FUNCTION get_user_roles(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_roles JSONB;
BEGIN
  SELECT roles INTO user_roles
  FROM user_profiles
  WHERE id = user_id
  AND deleted_at IS NULL;

  RETURN COALESCE(user_roles, '["viewer"]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_roles IS 'Get all roles for a user';

-- -----------------------------------------------------------------------------
-- Fonction: log_user_activity()
-- -----------------------------------------------------------------------------
-- Enregistre une activité utilisateur dans user_activity_logs
-- Usage depuis Next.js:
--   await supabase.rpc('log_user_activity', {
--     p_user_id: user.id,
--     p_action: 'delete',
--     p_resource: 'project',
--     p_resource_id: projectId,
--     p_details: { project_name: 'Mon Projet' },
--     p_ip_address: req.headers['x-forwarded-for'],
--     p_user_agent: req.headers['user-agent']
--   })

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
    user_agent,
    created_at
  ) VALUES (
    p_user_id,
    v_user_email,
    p_action,
    p_resource,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_user_activity IS 'Log a user activity for audit trail';

-- =============================================================================
-- 6. TRIGGER: Auto-create profile on user signup
-- =============================================================================
-- Lorsqu'un utilisateur s'inscrit via Supabase Auth, son profil est créé
-- automatiquement dans user_profiles avec le rôle par défaut "viewer"

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, roles, status, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    '["viewer"]'::jsonb,
    'active',
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si le profil existe déjà, ne rien faire
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger existant si présent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user IS 'Auto-create user profile when new user signs up';

-- =============================================================================
-- ✅ USER PROFILES & AUTHENTICATION SYSTEM CRÉÉ
-- =============================================================================
-- Tables créées:
--   - user_profiles (étend auth.users avec rôles et métadata)
--   - user_activity_logs (audit trail)
--
-- Fonctions helper:
--   - has_role(user_id, role) → boolean
--   - get_user_roles(user_id) → jsonb
--   - log_user_activity(...) → void
--
-- RLS activé sur toutes les tables
-- Trigger auto-create profile sur signup
--
-- Prochaine étape : 003_site_settings.sql
-- =============================================================================
