-- Add document_slug column to pipeline_items for linking to research documents
ALTER TABLE pipeline_items ADD COLUMN IF NOT EXISTS document_slug TEXT;
