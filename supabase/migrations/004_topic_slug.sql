-- Add topic_slug column to group files by topic
ALTER TABLE research_documents ADD COLUMN IF NOT EXISTS topic_slug TEXT;
CREATE INDEX IF NOT EXISTS idx_research_topic ON research_documents(topic_slug);

-- Extend status to allow 'practice' and other file types
ALTER TABLE research_documents DROP CONSTRAINT IF EXISTS research_documents_status_check;
ALTER TABLE research_documents ADD CONSTRAINT research_documents_status_check
  CHECK (status IN ('research', 'prep', 'session', 'practice', 'complete'));
