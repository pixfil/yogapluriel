-- ============================================
-- FIX: Mettre à jour la fonction search_content_embeddings
-- ============================================
-- La colonne content_id est maintenant TEXT (pas UUID)
-- Il faut mettre à jour le type de retour de la fonction

DROP FUNCTION IF EXISTS search_content_embeddings(vector(1536), float, int, text);

CREATE OR REPLACE FUNCTION search_content_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_content_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content_type text,
  content_id text,        -- ← Changé de uuid vers text
  content_text text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    content_embeddings.id,
    content_embeddings.content_type,
    content_embeddings.content_id,
    content_embeddings.content_text,
    content_embeddings.metadata,
    1 - (content_embeddings.embedding <=> query_embedding) AS similarity
  FROM content_embeddings
  WHERE
    (filter_content_type IS NULL OR content_embeddings.content_type = filter_content_type)
    AND (1 - (content_embeddings.embedding <=> query_embedding)) > match_threshold
  ORDER BY content_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

COMMENT ON FUNCTION search_content_embeddings IS 'Recherche sémantique dans les embeddings avec support des content_id TEXT ou UUID';
