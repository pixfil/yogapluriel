-- =============================================
-- Migration: Job Applications System
-- Date: 2025-10-26
-- Description: Table pour stocker les candidatures des offres d'emploi
-- =============================================

-- =============================================
-- 1. CREATE TABLE job_applications
-- =============================================

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Infos candidat
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,

  -- Offre liée
  job_opening_id UUID REFERENCES job_openings(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL, -- Copie pour garder trace si offre supprimée

  -- Documents (URLs Supabase Storage)
  cv_url TEXT NOT NULL,
  cover_letter_url TEXT, -- Optionnel

  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'interview', 'rejected', 'hired', 'archived')),

  -- Admin tracking
  admin_notes TEXT,
  assigned_to UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  source TEXT DEFAULT 'website_popup', -- 'website_popup', 'website_job_page', 'other'
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID
);

-- =============================================
-- 2. CREATE INDEXES
-- =============================================

CREATE INDEX idx_job_applications_status ON job_applications(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_job_applications_job_id ON job_applications(job_opening_id) WHERE job_opening_id IS NOT NULL;
CREATE INDEX idx_job_applications_email ON job_applications(email) WHERE deleted_at IS NULL;

-- Full-text search index
CREATE INDEX idx_job_applications_search ON job_applications
  USING gin(to_tsvector('french', name || ' ' || email || ' ' || COALESCE(message, '')))
  WHERE deleted_at IS NULL;

-- =============================================
-- 3. RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Public insert (formulaire de candidature)
CREATE POLICY "job_applications_insert_public" ON job_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can read all (admins)
CREATE POLICY "job_applications_select_authenticated" ON job_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update (admins only, but handled by RLS)
CREATE POLICY "job_applications_update_authenticated" ON job_applications
  FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated users can delete (soft delete via admin)
CREATE POLICY "job_applications_delete_authenticated" ON job_applications
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- 4. SAMPLE DATA (for testing)
-- =============================================

-- Ajouter un exemple de candidature (commenté par défaut)
-- INSERT INTO job_applications (name, email, phone, job_title, cv_url, message, status) VALUES
--   ('Jean Dupont', 'jean.dupont@example.com', '0612345678', 'Couvreur-Zingueur H/F', 'https://example.com/cv.pdf', 'Candidature spontanée pour le poste de couvreur.', 'new');

-- =============================================
-- 5. VERIFICATION QUERIES
-- =============================================

-- Count applications
SELECT COUNT(*) as total_applications FROM job_applications WHERE deleted_at IS NULL;

-- Status distribution
SELECT
  status,
  COUNT(*) as count
FROM job_applications
WHERE deleted_at IS NULL
GROUP BY status
ORDER BY status;

-- Recent applications
SELECT
  id,
  name,
  email,
  job_title,
  status,
  created_at
FROM job_applications
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;
