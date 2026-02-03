// ===== Database Types =====

export interface ResearchDocument {
  id: string;
  title: string;
  slug: string;
  category: 'mitzvah' | 'course' | 'draft' | 'speech';
  content: string;
  sections: Section[];
  status: 'research' | 'prep' | 'session' | 'practice' | 'complete';
  topic_slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  title: string;
  level: number;
  start_line: number;
  end_line: number;
}

export interface Comment {
  id: string;
  document_id: string;
  section_id: string;
  content: string;
  comment_type: 'note' | 'needs-research' | 'simplify' | 'add-story' | 'great' | 'question';
  resolved: boolean;
  created_at: string;
}

export interface PipelineItem {
  id: string;
  title: string;
  description: string | null;
  stage: 'idea' | 'research' | 'draft' | 'practice' | 'ready' | 'delivered';
  content_type: string | null;
  document_id: string | null;
  audience: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  event_type: string | null;
  recurring: string | null;
  pipeline_id: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'done';
  category: string | null;
  pipeline_id: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ScheduleBlock {
  id: string;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  activity: string;
  category: string | null;
  notes: string | null;
}

export interface Ritual {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  frequency: 'daily' | 'weekday' | 'shabbos' | 'weekly';
  content: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface RitualCompletion {
  id: string;
  ritual_id: string;
  completed_date: string;
  notes: string | null;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  source_type: string | null;
  total_segments: number;
  created_at: string;
}

export interface CourseSegment {
  id: string;
  course_id: string;
  segment_number: number;
  title: string | null;
  content: string;
  completed: boolean;
  completed_date: string | null;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: string | null;
  topics: string[];
  used_in: string[];
  created_at: string;
}

export interface Question {
  id: string;
  question: string;
  context: string | null;
  tags: string[];
  topics: string[];
  used_in: string[];
  created_at: string;
}

export interface PracticeLog {
  id: string;
  pipeline_id: string | null;
  date: string;
  duration_minutes: number | null;
  practice_type: string | null;
  vocal_rating: number | null;
  vitality_rating: number | null;
  visual_rating: number | null;
  notes: string | null;
  created_at: string;
}

export interface DeliveryJournal {
  id: string;
  pipeline_id: string | null;
  date: string;
  audience_description: string | null;
  what_landed: string | null;
  what_didnt: string | null;
  audience_reactions: string | null;
  overall_rating: number | null;
  lessons_learned: string | null;
  created_at: string;
}

// ===== Shas Tracker =====

export type Seder = 'zeraim' | 'moed' | 'nashim' | 'nezikin' | 'kodshim' | 'taharos';

export type CompletionType = 'gemara' | 'mishnayos';

export interface ShasMasechta {
  id: string;
  seder: Seder;
  name: string;
  perakim: number;
  daf_count: number | null;
  has_bavli: boolean;
  sort_order: number;
  created_at: string;
}

export interface ShasCompletion {
  id: string;
  masechta_id: string;
  completion_type: CompletionType;
  completed_at: string;
  notes: string | null;
}

export const SEDER_CONFIG: { key: Seder; label: string; color: string }[] = [
  { key: 'zeraim', label: 'Zeraim', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { key: 'moed', label: 'Moed', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { key: 'nashim', label: 'Nashim', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { key: 'nezikin', label: 'Nezikin', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { key: 'kodshim', label: 'Kodshim', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { key: 'taharos', label: 'Taharos', color: 'bg-teal-100 text-teal-800 border-teal-300' },
];

// ===== Quizzes =====

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  document_id: string;
  questions: QuizQuestion[];
  created_at: string;
}

// ===== File type labels (for tab bar) =====
export const FILE_TYPE_LABELS: Record<ResearchDocument['status'], string> = {
  research: 'Research',
  prep: 'Prep',
  session: 'Session',
  practice: 'Practice',
  complete: 'Complete',
};

// ===== Comment type colors =====
export const COMMENT_TYPE_COLORS: Record<Comment['comment_type'], string> = {
  'note': 'bg-blue-100 text-blue-800',
  'needs-research': 'bg-orange-100 text-orange-800',
  'simplify': 'bg-yellow-100 text-yellow-800',
  'add-story': 'bg-purple-100 text-purple-800',
  'great': 'bg-green-100 text-green-800',
  'question': 'bg-red-100 text-red-800',
};

// ===== Pipeline stage config =====
export const PIPELINE_STAGES: { key: PipelineItem['stage']; label: string; color: string }[] = [
  { key: 'idea', label: 'Idea', color: 'bg-gray-100' },
  { key: 'research', label: 'Research', color: 'bg-blue-100' },
  { key: 'draft', label: 'Draft', color: 'bg-yellow-100' },
  { key: 'practice', label: 'Practice', color: 'bg-orange-100' },
  { key: 'ready', label: 'Ready', color: 'bg-green-100' },
  { key: 'delivered', label: 'Delivered', color: 'bg-emerald-100' },
];

// ===== Schedule category colors =====
export const SCHEDULE_COLORS: Record<string, string> = {
  learning: 'bg-blue-200 border-blue-400',
  prep: 'bg-purple-200 border-purple-400',
  practice: 'bg-orange-200 border-orange-400',
  personal: 'bg-green-200 border-green-400',
  work: 'bg-gray-200 border-gray-400',
};
