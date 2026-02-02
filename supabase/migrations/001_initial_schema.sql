-- Speech Coach Hub - Initial Database Schema
-- Run this in Supabase SQL Editor to set up all tables

-- Research documents (imported from markdown)
CREATE TABLE IF NOT EXISTS research_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mitzvah', 'course', 'draft', 'speech')),
  content TEXT NOT NULL,
  sections JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'research' CHECK (status IN ('research', 'prep', 'session', 'complete')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inline comments on research sections
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES research_documents(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'note' CHECK (comment_type IN ('note', 'needs-research', 'simplify', 'add-story', 'great', 'question')),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Content pipeline (idea -> delivered)
CREATE TABLE IF NOT EXISTS pipeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT DEFAULT 'idea' CHECK (stage IN ('idea', 'research', 'draft', 'practice', 'ready', 'delivered')),
  content_type TEXT,
  document_id UUID REFERENCES research_documents(id),
  audience TEXT,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Calendar events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  event_type TEXT,
  recurring TEXT,
  pipeline_id UUID REFERENCES pipeline_items(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  category TEXT,
  pipeline_id UUID REFERENCES pipeline_items(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Daily schedule template
CREATE TABLE IF NOT EXISTS schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  activity TEXT NOT NULL,
  category TEXT,
  notes TEXT
);

-- Daily rituals definitions
CREATE TABLE IF NOT EXISTS rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekday', 'shabbos', 'weekly')),
  content TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ritual completion tracking
CREATE TABLE IF NOT EXISTS ritual_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ritual_id UUID REFERENCES rituals(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  notes TEXT,
  UNIQUE(ritual_id, completed_date)
);

-- Imported courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  source_type TEXT,
  total_segments INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Course broken into daily segments
CREATE TABLE IF NOT EXISTS course_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  segment_number INT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_date DATE,
  UNIQUE(course_id, segment_number)
);

-- Story bank
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  topics TEXT[] DEFAULT '{}',
  used_in TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Question bank
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  context TEXT,
  tags TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  used_in TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Practice log
CREATE TABLE IF NOT EXISTS practice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES pipeline_items(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INT,
  practice_type TEXT,
  vocal_rating INT CHECK (vocal_rating BETWEEN 1 AND 5),
  vitality_rating INT CHECK (vitality_rating BETWEEN 1 AND 5),
  visual_rating INT CHECK (visual_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery journal
CREATE TABLE IF NOT EXISTS delivery_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES pipeline_items(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  audience_description TEXT,
  what_landed TEXT,
  what_didnt TEXT,
  audience_reactions TEXT,
  overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),
  lessons_learned TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_comments_document ON comments(document_id);
CREATE INDEX IF NOT EXISTS idx_comments_section ON comments(document_id, section_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON pipeline_items(stage);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_date ON ritual_completions(completed_date);
CREATE INDEX IF NOT EXISTS idx_research_slug ON research_documents(slug);
