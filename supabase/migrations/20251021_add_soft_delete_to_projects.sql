-- Migration: Add soft delete columns to projects table
-- Date: 2025-10-21
-- Description: Add deleted_at and deleted_by columns for soft delete functionality

-- Add soft delete columns to projects table
ALTER TABLE projects
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for performance on deleted_at queries
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at)
WHERE deleted_at IS NULL;

-- Create index for deleted_by
CREATE INDEX idx_projects_deleted_by ON projects(deleted_by);

-- Update RLS policies to exclude soft-deleted projects from public queries
DROP POLICY IF EXISTS "Public can view published projects" ON projects;

CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT
  USING (published = true AND deleted_at IS NULL);

-- Admin can view all projects including soft-deleted ones
DROP POLICY IF EXISTS "Admin can manage all projects" ON projects;

CREATE POLICY "Admin can manage all projects" ON projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'philippe@gclicke.com'
    )
  );

-- Comment on columns
COMMENT ON COLUMN projects.deleted_at IS 'Timestamp when project was soft deleted (NULL = active)';
COMMENT ON COLUMN projects.deleted_by IS 'User ID who deleted the project';
