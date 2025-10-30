-- =============================================
-- Migration: Team Members & Job Openings
-- Description: Gestion de l'équipe et du recrutement
-- Date: 2025-10-21
-- =============================================

-- =============================================
-- 1. TABLE: TEAM MEMBERS
-- =============================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations principales
  name TEXT NOT NULL,
  position TEXT NOT NULL, -- Poste/Fonction
  bio TEXT, -- Biographie courte (max 200 caractères)
  photo_url TEXT, -- URL de la photo depuis le bucket

  -- Ordre d'affichage
  display_order INTEGER DEFAULT 0,

  -- Publication
  is_published BOOLEAN DEFAULT true,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_team_members_display_order ON team_members(display_order);
CREATE INDEX idx_team_members_is_published ON team_members(is_published);
CREATE INDEX idx_team_members_deleted_at ON team_members(deleted_at);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_members_updated_at();

-- =============================================
-- 2. TABLE: JOB OPENINGS
-- =============================================

CREATE TABLE IF NOT EXISTS job_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations de l'offre
  title TEXT NOT NULL, -- Titre du poste
  description TEXT NOT NULL, -- Description détaillée
  contract_type TEXT, -- CDI, CDD, Alternance, etc.
  location TEXT DEFAULT 'Bas-Rhin, Alsace',
  requirements TEXT, -- Prérequis et qualifications

  -- Publication
  is_active BOOLEAN DEFAULT true,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_job_openings_is_active ON job_openings(is_active);
CREATE INDEX idx_job_openings_deleted_at ON job_openings(deleted_at);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_job_openings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_job_openings_updated_at
  BEFORE UPDATE ON job_openings
  FOR EACH ROW
  EXECUTE FUNCTION update_job_openings_updated_at();

-- =============================================
-- 3. STORAGE BUCKET: TEAM PHOTOS
-- =============================================

-- Créer le bucket pour les photos d'équipe
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-photos', 'team-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies pour le bucket
CREATE POLICY "Public can view team photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team-photos');

CREATE POLICY "Authenticated users can upload team photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-photos');

CREATE POLICY "Authenticated users can update team photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'team-photos');

CREATE POLICY "Authenticated users can delete team photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'team-photos');

-- =============================================
-- 4. RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;

-- Policies pour team_members
CREATE POLICY "Public can view published team members"
ON team_members FOR SELECT
TO public
USING (is_published = true AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can view all team members"
ON team_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert team members"
ON team_members FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update team members"
ON team_members FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete team members"
ON team_members FOR DELETE
TO authenticated
USING (true);

-- Policies pour job_openings
CREATE POLICY "Public can view active job openings"
ON job_openings FOR SELECT
TO public
USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can view all job openings"
ON job_openings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert job openings"
ON job_openings FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update job openings"
ON job_openings FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete job openings"
ON job_openings FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- 5. DONNÉES INITIALES: TEAM MEMBERS
-- =============================================

INSERT INTO team_members (name, position, bio, display_order, is_published) VALUES
(
  'Maryan LHUILLIER',
  'Fondateur & Artisan Couvreur',
  'Formé aux Compagnons du Devoir, plus de 20 ans d''expérience en couverture et zinguerie. Passionné par la transmission des savoir-faire traditionnels.',
  1,
  true
),
(
  'Sophie',
  'Assistante Administrative',
  'Gère l''organisation administrative et la relation clients avec professionnalisme et bienveillance.',
  2,
  true
),
(
  'Guillaume',
  'Couvreur Compagnon',
  'Expert en rénovation de toitures anciennes et techniques traditionnelles de couverture.',
  3,
  true
),
(
  'Albert',
  'Zingueur',
  'Spécialiste de la zinguerie ornementale et des travaux d''étanchéité complexes.',
  4,
  true
),
(
  'Gaspard',
  'Couvreur',
  'Maîtrise des techniques modernes d''isolation et de pose de matériaux biosourcés.',
  5,
  true
),
(
  'Isabel',
  'Chargée de Communication',
  'Anime la présence digitale de Formdetoit et gère la communication avec les clients.',
  6,
  true
),
(
  'Quentin',
  'Couvreur',
  'Jeune artisan passionné, spécialisé dans les travaux de couverture résidentielle.',
  7,
  true
);

-- =============================================
-- 6. DONNÉES INITIALES: JOB OPENINGS
-- =============================================

INSERT INTO job_openings (title, description, contract_type, location, requirements, is_active) VALUES
(
  'Second d''Équipe Couvreur',
  'Nous recherchons un second d''équipe couvreur expérimenté pour encadrer notre équipe de couvreurs-zingueurs. Vous serez responsable de l''organisation des chantiers, de la formation des apprentis et de la qualité des travaux réalisés.

Missions principales :
• Encadrer une équipe de 3 à 5 couvreurs
• Organiser et planifier les chantiers
• Assurer la qualité et la sécurité sur les chantiers
• Former les apprentis et transmettre les savoir-faire
• Participer aux travaux de couverture et zinguerie

Profil recherché :
• Minimum 5 ans d''expérience en couverture
• Expérience en encadrement d''équipe appréciée
• Maîtrise des techniques de couverture traditionnelle et moderne
• Autonome, rigoureux et pédagogue
• Permis B requis

Nous proposons :
• CDI avec rémunération selon expérience
• Véhicule de service
• Formations continues
• Environnement de travail convivial
• Équipe passionnée et solidaire',
  'CDI',
  'Bas-Rhin, Alsace',
  'CAP/BEP Couvreur minimum, 5+ ans d''expérience, permis B',
  true
),
(
  'Alternant Couvreur (CAP/BP)',
  'Formdetoit propose un contrat d''alternance pour préparer un CAP ou BP Couvreur. Vous serez formé aux techniques traditionnelles et modernes de la couverture et de la zinguerie, encadré par des artisans passionnés.

Ce que nous vous offrons :
• Formation complète aux métiers de la couverture
• Encadrement par des Compagnons du Devoir
• Participation à des chantiers variés (rénovation, neuf, patrimoine)
• Apprentissage des techniques de zinguerie
• Formation aux normes de sécurité en hauteur

Profil recherché :
• Motivé(e) et passionné(e) par les métiers manuels
• Sens du travail en équipe
• Pas de vertige
• Rigueur et sérieux

Rythme d''alternance :
• 2 semaines en entreprise / 1 semaine en CFA
• Début : septembre 2025

Avantages :
• Rémunération selon grille apprentissage
• Équipements de sécurité fournis
• Possibilité d''évolution en CDI après formation',
  'Alternance (CAP/BP)',
  'Bas-Rhin, Alsace',
  'Niveau 3ème minimum, motivation, pas de vertige',
  true
);

-- =============================================
-- MIGRATION TERMINÉE
-- =============================================
