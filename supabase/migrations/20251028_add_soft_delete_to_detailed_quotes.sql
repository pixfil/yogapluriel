-- =====================================================
-- Add soft-delete columns to detailed_quotes table
-- =====================================================

-- Add columns if they don't exist
ALTER TABLE detailed_quotes
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Create index for better performance when filtering deleted items
CREATE INDEX IF NOT EXISTS idx_detailed_quotes_deleted_at
ON detailed_quotes(deleted_at)
WHERE deleted_at IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN detailed_quotes.deleted_at IS 'Timestamp when the record was soft-deleted';
COMMENT ON COLUMN detailed_quotes.deleted_by IS 'User ID who soft-deleted the record';
