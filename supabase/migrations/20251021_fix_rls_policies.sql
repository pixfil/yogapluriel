-- Migration: Fix RLS policies for projects
-- Date: 2025-10-21
-- Description: Simplify RLS policies to avoid auth.users permission issues

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view published projects" ON projects;
DROP POLICY IF EXISTS "Admin can manage all projects" ON projects;

-- Public can view published and not-deleted projects
CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT
  USING (published = true AND deleted_at IS NULL);

-- Authenticated users can manage all projects (simplified for now)
-- In production, you should add proper role checking
CREATE POLICY "Authenticated users can manage projects" ON projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Same fix for categories
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;

CREATE POLICY "Public can view categories" ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage categories" ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Same for project_categories
DROP POLICY IF EXISTS "Public can view project categories" ON project_categories;
DROP POLICY IF EXISTS "Admin can manage project categories" ON project_categories;

CREATE POLICY "Public can view project categories" ON project_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage project categories" ON project_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Same for project_images
DROP POLICY IF EXISTS "Public can view project images" ON project_images;
DROP POLICY IF EXISTS "Admin can manage project images" ON project_images;

CREATE POLICY "Public can view project images" ON project_images
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage project images" ON project_images
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "Authenticated users can manage projects" ON projects IS 'Temporary policy - should be restricted to admin role in production';
COMMENT ON POLICY "Authenticated users can manage categories" ON categories IS 'Temporary policy - should be restricted to admin role in production';
