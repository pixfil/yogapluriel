-- =============================================================================
-- SUPABASE STORAGE BUCKETS CONFIGURATION
-- =============================================================================
-- Configuration des buckets de stockage et leurs politiques RLS
-- À appliquer APRÈS toutes les migrations (dépend de user_profiles)
-- =============================================================================

-- =============================================================================
-- 1. BUCKET: TEAM-PHOTOS (Photos d'équipe)
-- =============================================================================

-- Créer le bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-photos',
  'team-photos',
  true, -- Public (les photos sont visibles par tous)
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Tout le monde peut voir les photos d'équipe
CREATE POLICY "Public can view team photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team-photos');

-- RLS: Admins/editors peuvent uploader
CREATE POLICY "Admins can upload team photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-photos'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND (roles ? 'super_admin' OR roles ? 'admin' OR roles ? 'editor')
  )
);

-- RLS: Admins/editors peuvent modifier
CREATE POLICY "Admins can update team photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'team-photos'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND (roles ? 'super_admin' OR roles ? 'admin' OR roles ? 'editor')
  )
);

-- RLS: Admins peuvent supprimer
CREATE POLICY "Admins can delete team photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'team-photos'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND (roles ? 'super_admin' OR roles ? 'admin')
  )
);

-- =============================================================================
-- 2. BUCKET: USER-AVATARS (Avatars utilisateurs)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  2097152, -- 2MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Tout le monde peut voir les avatars
CREATE POLICY "Public can view user avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- RLS: Users peuvent uploader leur propre avatar
CREATE POLICY "Users can upload their avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- RLS: Users peuvent modifier leur propre avatar
CREATE POLICY "Users can update their avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- RLS: Users peuvent supprimer leur propre avatar
CREATE POLICY "Users can delete their avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- =============================================================================
-- 3. BUCKET: POPUP-IMAGES (Images des popups)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'popup-images',
  'popup-images',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Public peut voir
CREATE POLICY "Public can view popup images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'popup-images');

-- RLS: Admins/editors peuvent gérer
CREATE POLICY "Admins can manage popup images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'popup-images'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND (roles ? 'super_admin' OR roles ? 'admin' OR roles ? 'editor')
  )
);

-- =============================================================================
-- 4. BUCKET: JOB-APPLICATIONS (CVs des candidatures)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-applications',
  'job-applications',
  false, -- PRIVÉ (CVs sensibles)
  10485760, -- 10MB max
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Seuls les admins peuvent voir les CVs
CREATE POLICY "Admins can view job applications"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-applications'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND (roles ? 'super_admin' OR roles ? 'admin')
  )
);

-- RLS: Public peut uploader (soumission CV)
CREATE POLICY "Public can upload job applications"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'job-applications');

-- RLS: Admins peuvent supprimer
CREATE POLICY "Admins can delete job applications"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'job-applications'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND (roles ? 'super_admin' OR roles ? 'admin')
  )
);

-- =============================================================================
-- 5. BUCKET: GENERAL-UPLOADS (Uploads généraux)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'general-uploads',
  'general-uploads',
  true,
  10485760, -- 10MB max
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
    'application/pdf',
    'video/mp4', 'video/webm'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Public peut voir
CREATE POLICY "Public can view general uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'general-uploads');

-- RLS: Authenticated users peuvent uploader
CREATE POLICY "Authenticated can upload general files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'general-uploads');

-- RLS: Users peuvent modifier leurs propres fichiers
CREATE POLICY "Users can update their uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'general-uploads'
  AND owner_id::TEXT = auth.uid()::TEXT
);

-- RLS: Users peuvent supprimer leurs propres fichiers
CREATE POLICY "Users can delete their uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'general-uploads'
  AND owner_id::TEXT = auth.uid()::TEXT
);

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

-- Lister tous les buckets créés
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id IN (
  'team-photos',
  'user-avatars',
  'popup-images',
  'job-applications',
  'general-uploads'
)
ORDER BY id;

-- Lister toutes les policies Storage
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- =============================================================================
-- ✅ STORAGE BUCKETS CONFIGURÉS
-- =============================================================================
-- Buckets créés:
--   1. team-photos (public, 5MB, images)
--   2. user-avatars (public, 2MB, images, per-user folders)
--   3. popup-images (public, 5MB, images+SVG)
--   4. job-applications (private, 10MB, PDFs/Word)
--   5. general-uploads (public, 10MB, images+videos+PDFs)
--
-- Sécurité:
--   - RLS activé sur tous les buckets
--   - Policies adaptées selon bucket (public/private)
--   - Limite de taille de fichier
--   - Types MIME restreints
--
-- Usage Next.js:
--   1. Import supabase client
--   2. Upload: supabase.storage.from('bucket-name').upload(path, file)
--   3. Get URL: supabase.storage.from('bucket-name').getPublicUrl(path)
--   4. Delete: supabase.storage.from('bucket-name').remove([path])
--
-- Personnalisation:
--   - Ajouter d'autres buckets selon besoins
--   - Modifier les limites de taille
--   - Ajuster les types MIME autorisés
--   - Créer des policies custom
--
-- IMPORTANT: Les buckets peuvent aussi être créés via Supabase Dashboard:
--   Dashboard > Storage > New Bucket
--   (mais les policies RLS doivent être ajoutées manuellement)
-- =============================================================================
