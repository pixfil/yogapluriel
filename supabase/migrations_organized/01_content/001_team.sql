-- =============================================================================
-- TEAM & JOB OPENINGS
-- =============================================================================
-- Dépendances : 00_core/003_site_settings.sql
-- Gestion des membres de l'équipe et des offres d'emploi
-- =============================================================================

-- =============================================================================
-- 1. TABLE: TEAM
-- =============================================================================
-- Présentation des membres de l'équipe sur le site

CREATE TABLE IF NOT EXISTS team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations principales
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- Poste/Fonction (ex: "CEO", "Lead Developer", "Designer")
  bio TEXT, -- Biographie courte (200-500 caractères recommandé)
  email TEXT, -- Email professionnel (optionnel)

  -- Photo
  photo_url TEXT, -- URL vers Supabase Storage bucket 'team-photos' ou URL externe

  -- Réseaux sociaux (optionnel)
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,

  -- Ordre d'affichage
  display_order INTEGER DEFAULT 0,

  -- Publication
  is_active BOOLEAN DEFAULT true,

  -- Soft delete pattern
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour performances
CREATE INDEX idx_team_display_order ON team(display_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_is_active ON team(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_deleted_at ON team(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON TABLE team IS 'Team members displayed on the website';
COMMENT ON COLUMN team.display_order IS 'Display order (lower = first)';
COMMENT ON COLUMN team.is_active IS 'Show on public pages';

-- =============================================================================
-- 2. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_team_updated_at
  BEFORE UPDATE ON team
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. TABLE: JOB_OPENINGS
-- =============================================================================
-- Offres d'emploi / recrutement

CREATE TABLE IF NOT EXISTS job_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations de l'offre
  title TEXT NOT NULL, -- Titre du poste (ex: "Senior Frontend Developer")
  description TEXT NOT NULL, -- Description détaillée (markdown supporté)
  contract_type TEXT, -- Type: CDI, CDD, Freelance, Internship, etc.
  location TEXT, -- Lieu: "Remote", "Paris, France", "Hybrid", etc.
  salary_range TEXT, -- Fourchette salariale (optionnel, ex: "50k-70k EUR")
  requirements TEXT, -- Prérequis et qualifications

  -- Contact
  apply_url TEXT, -- URL externe pour postuler (optionnel)
  apply_email TEXT, -- Email pour candidatures (optionnel)

  -- Publication
  is_active BOOLEAN DEFAULT true,

  -- Dates de publication
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Date d'expiration (optionnel)

  -- Soft delete pattern
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX idx_job_openings_is_active ON job_openings(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_job_openings_published_at ON job_openings(published_at DESC) WHERE is_active = true;
CREATE INDEX idx_job_openings_expires_at ON job_openings(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_job_openings_deleted_at ON job_openings(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON TABLE job_openings IS 'Job openings / career opportunities';
COMMENT ON COLUMN job_openings.expires_at IS 'Auto-hide job after this date';

-- =============================================================================
-- 4. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_job_openings_updated_at
  BEFORE UPDATE ON job_openings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. TABLE: JOB_APPLICATIONS
-- =============================================================================
-- Candidatures reçues (optionnel - peut être géré par email)

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lien vers l'offre
  job_opening_id UUID REFERENCES job_openings(id) ON DELETE SET NULL,

  -- Informations du candidat
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT, -- URL vers CV (Supabase Storage)
  cover_letter TEXT, -- Lettre de motivation

  -- Métadata
  source TEXT DEFAULT 'website', -- Source: website, linkedin, indeed, etc.

  -- Workflow / Status
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new',
    'reviewed',
    'shortlisted',
    'interview_scheduled',
    'interviewed',
    'offer_sent',
    'hired',
    'rejected',
    'withdrawn'
  )),

  -- Notes internes
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,

  -- Contact tracking
  contacted_at TIMESTAMP WITH TIME ZONE,
  last_interaction_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete pattern
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX idx_job_applications_job_id ON job_applications(job_opening_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_job_applications_status ON job_applications(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);
CREATE INDEX idx_job_applications_deleted_at ON job_applications(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON TABLE job_applications IS 'Job applications received from candidates';
COMMENT ON COLUMN job_applications.status IS 'Application workflow status';

-- =============================================================================
-- 6. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS: team
-- -----------------------------------------------------------------------------

-- Public peut voir les membres actifs
CREATE POLICY "Public can view active team members"
  ON team FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all team members"
  ON team FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Admins et editors peuvent créer/modifier
CREATE POLICY "Admins and editors can manage team"
  ON team FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin' OR roles ? 'editor')
    )
  );

-- -----------------------------------------------------------------------------
-- RLS: job_openings
-- -----------------------------------------------------------------------------

-- Public peut voir les offres actives et non expirées
CREATE POLICY "Public can view active job openings"
  ON job_openings FOR SELECT
  USING (
    is_active = true
    AND deleted_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all job openings"
  ON job_openings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Admins et editors peuvent créer/modifier
CREATE POLICY "Admins and editors can manage job openings"
  ON job_openings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin' OR roles ? 'editor')
    )
  );

-- -----------------------------------------------------------------------------
-- RLS: job_applications
-- -----------------------------------------------------------------------------

-- Personne ne peut lire publiquement (données sensibles)
-- Seuls les admins peuvent voir les candidatures

CREATE POLICY "Admins can view all job applications"
  ON job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Public peut insérer (soumettre une candidature)
-- INSERT sera géré via API/Server Action avec validation

-- Admins peuvent modifier (changer status, ajouter notes)
CREATE POLICY "Admins can manage job applications"
  ON job_applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- =============================================================================
-- ✅ TEAM & JOB OPENINGS CRÉÉ
-- =============================================================================
-- Tables créées:
--   - team (membres de l'équipe)
--   - job_openings (offres d'emploi)
--   - job_applications (candidatures reçues)
--
-- RLS activé sur toutes les tables
-- Triggers auto-update updated_at
--
-- Note: Pour les photos d'équipe et CVs, configurez les buckets Storage
--       dans supabase/storage/buckets.sql
--
-- Prochaine étape : 002_faq.sql
-- =============================================================================
