-- Fix project_images type constraint to include 'gallery'
-- Current constraint only allows: 'avant', 'pendant', 'apres', 'detail'
-- Need to add: 'gallery'

-- Drop the existing constraint
ALTER TABLE project_images
DROP CONSTRAINT IF EXISTS project_images_type_check;

-- Recreate the constraint with 'gallery' included
ALTER TABLE project_images
ADD CONSTRAINT project_images_type_check
CHECK (type IN ('avant', 'pendant', 'apres', 'detail', 'gallery'));

-- Add comment
COMMENT ON CONSTRAINT project_images_type_check ON project_images
IS 'Valid image types: avant (before), pendant (during), apres (after), detail (detail), gallery (gallery)';
