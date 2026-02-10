-- Add 'parsha' to the category check constraint on research_documents
-- Run this in Supabase SQL Editor

-- Drop old constraint
ALTER TABLE research_documents DROP CONSTRAINT IF EXISTS research_documents_category_check;

-- Add new constraint with 'parsha' included
ALTER TABLE research_documents ADD CONSTRAINT research_documents_category_check
  CHECK (category IN ('mitzvah', 'course', 'draft', 'speech', 'parsha'));

-- Move all parsha-related documents to category 'parsha'
UPDATE research_documents SET category = 'parsha' WHERE topic_slug LIKE 'mishpatim%';
UPDATE research_documents SET category = 'parsha' WHERE topic_slug LIKE 'beshalach%';
UPDATE research_documents SET category = 'parsha' WHERE topic_slug LIKE 'yisro%';
