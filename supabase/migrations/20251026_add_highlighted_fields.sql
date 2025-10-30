-- =============================================
-- Migration: Ajout champs "is_highlighted" pour mise en avant
-- Date: 2025-10-26
-- Description:
--   - Ajoute is_highlighted à projects (notification "Nouveau projet !")
--   - Ajoute is_highlighted à job_openings (notification "On recrute !")
-- =============================================

-- =============================================
-- 1. AJOUTER COLONNES is_highlighted
-- =============================================

-- Projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT false;

-- Job Openings
ALTER TABLE job_openings
ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT false;

-- =============================================
-- 2. INDEX POUR PERFORMANCES
-- =============================================

-- Index pour projects.is_highlighted (filtre les projets en avant + non supprimés)
CREATE INDEX IF NOT EXISTS idx_projects_is_highlighted
ON projects(is_highlighted)
WHERE is_highlighted = true AND deleted_at IS NULL;

-- Index pour job_openings.is_highlighted (filtre les offres en avant + non supprimées)
CREATE INDEX IF NOT EXISTS idx_job_openings_is_highlighted
ON job_openings(is_highlighted)
WHERE is_highlighted = true AND deleted_at IS NULL;

-- =============================================
-- 3. COMMENTAIRES
-- =============================================

COMMENT ON COLUMN projects.is_highlighted IS 'Mise en avant du projet avec notification "Nouveau projet !" sur le site';
COMMENT ON COLUMN job_openings.is_highlighted IS 'Mise en avant de l''offre avec notification "On recrute !" sur le site';

-- =============================================
-- 4. VÉRIFICATIONS
-- =============================================

-- Vérifier les colonnes
DO $$
BEGIN
  -- Projects
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'is_highlighted'
  ) THEN
    RAISE EXCEPTION 'Colonne projects.is_highlighted n''a pas été créée';
  END IF;

  -- Job Openings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_openings' AND column_name = 'is_highlighted'
  ) THEN
    RAISE EXCEPTION 'Colonne job_openings.is_highlighted n''a pas été créée';
  END IF;

  RAISE NOTICE '✅ Migration réussie : is_highlighted ajouté aux tables projects et job_openings';
END $$;
