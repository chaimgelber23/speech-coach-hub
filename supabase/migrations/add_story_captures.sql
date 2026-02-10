-- Story Captures table for daily story mining
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS story_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_day INTEGER NOT NULL CHECK (prompt_day >= 1 AND prompt_day <= 30),
  prompt_text TEXT NOT NULL,
  response TEXT NOT NULL,
  emotion TEXT,
  captured_date DATE NOT NULL DEFAULT CURRENT_DATE,
  promoted_to_story_id UUID REFERENCES stories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_story_captures_date ON story_captures(captured_date);

-- Enable RLS
ALTER TABLE story_captures ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (adjust based on your auth setup)
CREATE POLICY "Allow all operations on story_captures" ON story_captures
  FOR ALL USING (true) WITH CHECK (true);
