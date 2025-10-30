-- ============================================
-- FIX: Changer content_id de UUID vers TEXT
-- ============================================
-- Les services utilisent des IDs string ("couverture", "zinguerie", etc.)
-- qui ne sont pas des UUIDs valides

ALTER TABLE content_embeddings
ALTER COLUMN content_id TYPE TEXT;

-- Ajouter un commentaire
COMMENT ON COLUMN content_embeddings.content_id IS 'ID de l''élément source (peut être UUID ou string pour les services statiques)';
