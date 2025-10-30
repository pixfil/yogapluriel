-- =============================================
-- Migration: Fix RLS Policies for job_applications
-- Date: 2025-10-26
-- Description: Restreindre l'accès aux candidatures aux admins uniquement
-- =============================================

-- =============================================
-- 1. DROP EXISTING POLICIES
-- =============================================

DROP POLICY IF EXISTS "job_applications_select_authenticated" ON job_applications;
DROP POLICY IF EXISTS "job_applications_update_authenticated" ON job_applications;
DROP POLICY IF EXISTS "job_applications_delete_authenticated" ON job_applications;

-- =============================================
-- 2. CREATE ADMIN CHECK FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND (
      roles ? 'admin'
      OR roles ? 'super_admin'
    )
    AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. CREATE RESTRICTIVE POLICIES
-- =============================================

-- ✅ SELECT: Only admins can read applications
CREATE POLICY "job_applications_select_admin_only" ON job_applications
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- ✅ UPDATE: Only admins can update applications
CREATE POLICY "job_applications_update_admin_only" ON job_applications
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ✅ DELETE: Only admins can delete applications
CREATE POLICY "job_applications_delete_admin_only" ON job_applications
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Note: INSERT policy (job_applications_insert_public) reste inchangée
-- car elle permet aux utilisateurs publics de soumettre des candidatures

-- =============================================
-- 4. GRANT EXECUTE ON FUNCTION
-- =============================================

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =============================================
-- 5. VERIFICATION
-- =============================================

-- Pour vérifier que les policies sont correctes:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'job_applications';

-- Pour tester si un utilisateur est admin:
-- SELECT is_admin();

COMMENT ON FUNCTION is_admin() IS 'Vérifie si l''utilisateur authentifié a un rôle admin ou super_admin';
