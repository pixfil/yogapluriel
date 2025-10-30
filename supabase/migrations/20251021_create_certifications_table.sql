-- Migration: Create certifications table and storage bucket
-- Date: 2025-10-21
-- Description: Table for managing certifications/labels displayed on /nos-labels-certifications

-- ============================================
-- 1. CREATE CERTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('environmental', 'safety', 'quality', 'professional')),
  category_color TEXT NOT NULL,
  description TEXT NOT NULL,
  benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX idx_certifications_category ON certifications(category);
CREATE INDEX idx_certifications_published ON certifications(published) WHERE published = true;
CREATE INDEX idx_certifications_display_order ON certifications(display_order);
CREATE INDEX idx_certifications_deleted_at ON certifications(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- 3. ENABLE RLS
-- ============================================

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Public: can view published and non-deleted certifications
CREATE POLICY "certifications_select_public" ON certifications
  FOR SELECT
  USING (published = true AND deleted_at IS NULL);

-- Authenticated: can do everything
CREATE POLICY "certifications_all_authenticated" ON certifications
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. CREATE STORAGE BUCKET (via SQL)
-- ============================================

-- Insert bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certification-logos',
  'certification-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. CREATE STORAGE POLICIES
-- ============================================

-- Public: can view all files
CREATE POLICY "certification_logos_select_public"
ON storage.objects FOR SELECT
USING (bucket_id = 'certification-logos');

-- Authenticated: can upload files
CREATE POLICY "certification_logos_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certification-logos');

-- Authenticated: can update files
CREATE POLICY "certification_logos_update_authenticated"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'certification-logos');

-- Authenticated: can delete files
CREATE POLICY "certification_logos_delete_authenticated"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'certification-logos');

-- ============================================
-- 7. INSERT INITIAL DATA (from current frontend)
-- ============================================

INSERT INTO certifications (name, category, category_color, description, benefits, display_order, published) VALUES
(
  'QualiPV',
  'professional',
  'bg-blue-100 text-blue-800',
  'Installation photovoltaïque certifiée par des professionnels qualifiés',
  ARRAY[
    'Installateurs formés et qualifiés',
    'Respect des normes électriques',
    'Garantie de performance',
    'Maintenance assurée'
  ],
  1,
  true
),
(
  'RGE QualiPV Module Bat',
  'environmental',
  'bg-green-100 text-green-800',
  'Reconnu Garant de l''Environnement pour le photovoltaïque en bâtiment',
  ARRAY[
    'Accès aux aides de l''État',
    'Expertise énergétique reconnue',
    'Formation continue obligatoire',
    'Audit régulier des chantiers'
  ],
  2,
  true
),
(
  'Qualibat',
  'quality',
  'bg-purple-100 text-purple-800',
  'Qualification professionnelle du bâtiment reconnue par l''État',
  ARRAY[
    'Contrôle qualité des travaux',
    'Capacité technique vérifiée',
    'Références contrôlées',
    'Assurances professionnelles conformes'
  ],
  3,
  true
),
(
  'CACES R486',
  'safety',
  'bg-orange-100 text-orange-800',
  'Certificat d''aptitude à la conduite d''engins en sécurité - Plateformes élévatrices',
  ARRAY[
    'Travail en hauteur sécurisé',
    'Personnel formé aux risques',
    'Utilisation d''équipements conformes',
    'Prévention des accidents'
  ],
  4,
  true
),
(
  'Mon Accompagnateur Rénov''',
  'environmental',
  'bg-green-100 text-green-800',
  'Accompagnement certifié pour les projets de rénovation énergétique',
  ARRAY[
    'Conseil personnalisé gratuit',
    'Aide au montage des dossiers',
    'Optimisation des aides financières',
    'Suivi de chantier'
  ],
  5,
  true
);

-- ============================================
-- 8. VERIFY
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'certifications'
ORDER BY policyname;

-- Expected: 2 policies (certifications_select_public, certifications_all_authenticated)

SELECT COUNT(*) as certification_count FROM certifications;
-- Expected: 5 rows
