-- Growth System: Goals, Reflections, Usage Tracking, User Profile
-- Run this in Supabase SQL Editor

-- Personal growth goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('spiritual', 'personal', 'professional', 'learning')),
  description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily reflections (Cheshbon HaNefesh)
CREATE TABLE IF NOT EXISTS daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  wins TEXT,
  struggles TEXT,
  goal_notes JSONB DEFAULT '[]'::jsonb,
  gratitude TEXT,
  tomorrow_focus TEXT,
  growth_prompt TEXT,
  themes JSONB DEFAULT '[]'::jsonb,
  streak_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usage tracking (silent, powers nudges and insights)
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'page_view',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User profile (key-value store for personality, traits, preferences)
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_reflections_date ON daily_reflections(date);
CREATE INDEX IF NOT EXISTS idx_usage_page ON usage_events(page);
CREATE INDEX IF NOT EXISTS idx_usage_created ON usage_events(created_at);

-- Enable RLS (permissive for single-user app)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on goals" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_reflections" ON daily_reflections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on usage_events" ON usage_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_profile" ON user_profile FOR ALL USING (true) WITH CHECK (true);

-- Grant access
GRANT ALL ON goals TO anon, authenticated;
GRANT ALL ON daily_reflections TO anon, authenticated;
GRANT ALL ON usage_events TO anon, authenticated;
GRANT ALL ON user_profile TO anon, authenticated;
