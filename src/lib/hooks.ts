'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import type {
  ResearchDocument,
  Comment,
  PipelineItem,
  CalendarEvent,
  Task,
  ScheduleBlock,
  Ritual,
  RitualCompletion,
  Course,
  CourseSegment,
  Story,
  Question,
  PracticeLog,
  DeliveryJournal,
  ShasMasechta,
  ShasCompletion,
  CompletionType,
  Quiz,
  StoryCapture,
  Goal,
  DailyReflection,
  GoalNote,
  UsageEvent,
  UserProfileEntry,
} from '@/types';

// Generic hook for fetching data from Supabase
function useSupabaseQuery<T>(
  table: string,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    filter?: { column: string; value: string | boolean };
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select('*');

    if (options?.filter) {
      query = query.eq(options.filter.column, options.filter.value);
    }
    if (options?.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options?.ascending ?? false,
      });
    }

    const { data: result, error: err } = await query;
    if (err) {
      setError(err.message);
    } else {
      setData((result as T[]) || []);
    }
    setLoading(false);
  }, [table, options?.orderBy, options?.ascending, options?.filter?.column, options?.filter?.value]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch, setData };
}

// ===== Research Documents =====
export function useResearchDocuments() {
  return useSupabaseQuery<ResearchDocument>('research_documents', {
    orderBy: 'updated_at',
    ascending: false,
  });
}

export function useResearchDocument(slug: string) {
  const [doc, setDoc] = useState<ResearchDocument | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('research_documents')
      .select('*')
      .eq('slug', slug)
      .single();
    if (!error && data) setDoc(data as ResearchDocument);
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetch(); }, [fetch]);

  async function updateContent(content: string) {
    if (!doc) return;
    const { error } = await supabase
      .from('research_documents')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', doc.id);
    if (!error) setDoc({ ...doc, content });
  }

  return { doc, loading, updateContent, refetch: fetch };
}

export async function createResearchDocument(
  title: string,
  category: ResearchDocument['category'],
  content: string = ''
) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  const { data, error } = await supabase
    .from('research_documents')
    .insert({ title, slug, category, content: content || `# ${title}\n\n`, status: 'research' })
    .select()
    .single();
  return { data: data as ResearchDocument | null, error };
}

// ===== Comments =====
export function useComments(documentId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });
    setComments((data as Comment[]) || []);
    setLoading(false);
  }, [documentId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addComment(
    sectionId: string,
    content: string,
    commentType: Comment['comment_type']
  ) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ document_id: documentId, section_id: sectionId, content, comment_type: commentType })
      .select()
      .single();
    if (!error && data) setComments((prev) => [...prev, data as Comment]);
    return { error };
  }

  async function resolveComment(id: string) {
    const comment = comments.find((c) => c.id === id);
    if (!comment) return;
    const { error } = await supabase
      .from('comments')
      .update({ resolved: !comment.resolved })
      .eq('id', id);
    if (!error) {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
      );
    }
  }

  return { comments, loading, addComment, resolveComment, refetch: fetch };
}

// ===== Topic Grouping =====
export interface TopicGroup {
  topicSlug: string;
  title: string;
  category: ResearchDocument['category'];
  documents: ResearchDocument[];
  updated_at: string;
}

export function useTopicGroups() {
  const { data: documents, loading, refetch } = useResearchDocuments();

  const groups: TopicGroup[] = [];
  const grouped = new Map<string, ResearchDocument[]>();

  for (const doc of documents) {
    const key = doc.topic_slug || doc.slug;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(doc);
  }

  for (const [topicSlug, docs] of grouped) {
    const primary = docs.find((d) => d.status === 'research') || docs[0];
    groups.push({
      topicSlug,
      title: primary.title,
      category: primary.category,
      documents: docs.sort((a, b) => {
        const order = ['research', 'prep', 'session', 'practice', 'complete'];
        return order.indexOf(a.status) - order.indexOf(b.status);
      }),
      updated_at: docs.reduce((latest, d) =>
        d.updated_at > latest ? d.updated_at : latest, docs[0].updated_at
      ),
    });
  }

  groups.sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  return { groups, loading, refetch };
}

export function useTopicDocuments(topicSlug: string | null) {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!topicSlug) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('research_documents')
      .select('*')
      .eq('topic_slug', topicSlug)
      .order('status', { ascending: true });
    setDocuments((data as ResearchDocument[]) || []);
    setLoading(false);
  }, [topicSlug]);

  useEffect(() => { fetch(); }, [fetch]);

  return { documents, loading, refetch: fetch };
}

// ===== Pipeline =====
export function usePipeline() {
  const { data, loading, refetch, setData } = useSupabaseQuery<PipelineItem>('pipeline_items', {
    orderBy: 'updated_at',
    ascending: false,
  });

  async function addItem(title: string, contentType: string) {
    const { data: item, error } = await supabase
      .from('pipeline_items')
      .insert({ title, content_type: contentType, stage: 'idea' })
      .select()
      .single();
    if (!error && item) setData((prev) => [item as PipelineItem, ...prev]);
    return { error };
  }

  async function updateStage(id: string, stage: PipelineItem['stage']) {
    const { error } = await supabase
      .from('pipeline_items')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, stage } : item))
      );
    }
  }

  return { items: data, loading, addItem, updateStage, refetch };
}

// ===== Tasks =====
export function useTasks() {
  const { data, loading, refetch, setData } = useSupabaseQuery<Task>('tasks', {
    orderBy: 'created_at',
    ascending: false,
  });

  async function addTask(title: string, priority: Task['priority'], category: string, description?: string, dueDate?: string) {
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({ title, priority, category, description, due_date: dueDate })
      .select()
      .single();
    if (!error && task) setData((prev) => [task as Task, ...prev]);
    return { error };
  }

  async function toggleDone(id: string) {
    const task = data.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: newStatus === 'done' ? new Date().toISOString() : null,
      })
      .eq('id', id);
    if (!error) {
      setData((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: newStatus as Task['status'], completed_at: newStatus === 'done' ? new Date().toISOString() : null }
            : t
        )
      );
    }
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) setData((prev) => prev.filter((t) => t.id !== id));
  }

  return { tasks: data, loading, addTask, toggleDone, deleteTask, refetch };
}

// ===== Calendar Events =====
export function useEvents() {
  const { data, loading, refetch, setData } = useSupabaseQuery<CalendarEvent>('events', {
    orderBy: 'start_time',
    ascending: true,
  });

  async function addEvent(title: string, startTime: string, endTime?: string, eventType?: string) {
    const { data: event, error } = await supabase
      .from('events')
      .insert({ title, start_time: startTime, end_time: endTime, event_type: eventType })
      .select()
      .single();
    if (!error && event) setData((prev) => [...prev, event as CalendarEvent].sort((a, b) => a.start_time.localeCompare(b.start_time)));
    return { error };
  }

  async function deleteEvent(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) setData((prev) => prev.filter((e) => e.id !== id));
  }

  return { events: data, loading, addEvent, deleteEvent, refetch };
}

// ===== Schedule Blocks =====
export function useScheduleBlocks() {
  const { data, loading, refetch, setData } = useSupabaseQuery<ScheduleBlock>('schedule_blocks', {
    orderBy: 'start_time',
    ascending: true,
  });

  async function addBlock(block: Omit<ScheduleBlock, 'id'>) {
    const { data: newBlock, error } = await supabase
      .from('schedule_blocks')
      .insert(block)
      .select()
      .single();
    if (!error && newBlock) setData((prev) => [...prev, newBlock as ScheduleBlock].sort((a, b) => a.start_time.localeCompare(b.start_time)));
    return { error };
  }

  async function deleteBlock(id: string) {
    const { error } = await supabase.from('schedule_blocks').delete().eq('id', id);
    if (!error) setData((prev) => prev.filter((b) => b.id !== id));
  }

  return { blocks: data, loading, addBlock, deleteBlock, refetch };
}

// ===== Rituals =====
export function useRituals() {
  const { data, loading, refetch, setData } = useSupabaseQuery<Ritual>('rituals', {
    orderBy: 'sort_order',
    ascending: true,
  });

  async function addRitual(name: string, description: string, category: string) {
    const { data: ritual, error } = await supabase
      .from('rituals')
      .insert({ name, description, category })
      .select()
      .single();
    if (!error && ritual) setData((prev) => [...prev, ritual as Ritual]);
    return { error };
  }

  return { rituals: data, loading, addRitual, refetch };
}

export function useRitualCompletions(date: string) {
  const [completions, setCompletions] = useState<RitualCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ritual_completions')
      .select('*')
      .eq('completed_date', date);
    setCompletions((data as RitualCompletion[]) || []);
    setLoading(false);
  }, [date]);

  useEffect(() => { fetch(); }, [fetch]);

  async function toggleCompletion(ritualId: string) {
    const existing = completions.find((c) => c.ritual_id === ritualId);
    if (existing) {
      await supabase.from('ritual_completions').delete().eq('id', existing.id);
      setCompletions((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from('ritual_completions')
        .insert({ ritual_id: ritualId, completed_date: date })
        .select()
        .single();
      if (!error && data) setCompletions((prev) => [...prev, data as RitualCompletion]);
    }
  }

  return { completions, loading, toggleCompletion, refetch: fetch };
}

// ===== Courses =====
export function useCourses() {
  return useSupabaseQuery<Course>('courses', { orderBy: 'created_at', ascending: false });
}

export function useCourseSegments(courseId: string) {
  const [segments, setSegments] = useState<CourseSegment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    const { data } = await supabase
      .from('course_segments')
      .select('*')
      .eq('course_id', courseId)
      .order('segment_number', { ascending: true });
    setSegments((data as CourseSegment[]) || []);
    setLoading(false);
  }, [courseId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function toggleComplete(segmentId: string) {
    const seg = segments.find((s) => s.id === segmentId);
    if (!seg) return;
    const { error } = await supabase
      .from('course_segments')
      .update({
        completed: !seg.completed,
        completed_date: !seg.completed ? new Date().toISOString().split('T')[0] : null,
      })
      .eq('id', segmentId);
    if (!error) {
      setSegments((prev) =>
        prev.map((s) => (s.id === segmentId ? { ...s, completed: !s.completed } : s))
      );
    }
  }

  return { segments, loading, toggleComplete, refetch: fetch };
}

// ===== Daily Lessons =====
export function useDailyLessons() {
  const [lessons, setLessons] = useState<{ course: Course; segment: CourseSegment }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    // Get all courses
    const { data: courses } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: true });
    if (!courses) { setLoading(false); return; }

    // For each course, get the first uncompleted segment
    const results: { course: Course; segment: CourseSegment }[] = [];
    for (const course of courses as Course[]) {
      const { data: segs } = await supabase
        .from('course_segments')
        .select('*')
        .eq('course_id', course.id)
        .eq('completed', false)
        .order('segment_number', { ascending: true })
        .limit(1);
      if (segs && segs.length > 0) {
        results.push({ course, segment: segs[0] as CourseSegment });
      }
    }
    setLessons(results);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function completeSegment(segmentId: string) {
    const { error } = await supabase
      .from('course_segments')
      .update({
        completed: true,
        completed_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', segmentId);
    if (!error) {
      // Remove from current lessons and refetch to get next segment
      setLessons((prev) => prev.filter((l) => l.segment.id !== segmentId));
      fetch();
    }
  }

  return { lessons, loading, completeSegment, refetch: fetch };
}

// ===== Stories =====
export function useStories() {
  const { data, loading, refetch, setData } = useSupabaseQuery<Story>('stories', {
    orderBy: 'created_at',
    ascending: false,
  });

  async function addStory(title: string, content: string, tags: string[], source: string, topics: string[]) {
    const { data: story, error } = await supabase
      .from('stories')
      .insert({ title, content, tags, source, topics })
      .select()
      .single();
    if (!error && story) setData((prev) => [story as Story, ...prev]);
    return { error };
  }

  return { stories: data, loading, addStory, refetch };
}

// ===== Questions =====
export function useQuestions() {
  const { data, loading, refetch, setData } = useSupabaseQuery<Question>('questions', {
    orderBy: 'created_at',
    ascending: false,
  });

  async function addQuestion(question: string, context: string, tags: string[], topics: string[]) {
    const { data: q, error } = await supabase
      .from('questions')
      .insert({ question, context, tags, topics })
      .select()
      .single();
    if (!error && q) setData((prev) => [q as Question, ...prev]);
    return { error };
  }

  return { questions: data, loading, addQuestion, refetch };
}

// ===== Quizzes =====
export function useQuiz(documentId: string) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    setQuiz((data as Quiz | null) || null);
    setLoading(false);
  }, [documentId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { quiz, loading, refetch: fetch };
}

// ===== Shas Tracker =====
export function useShasMasechtos() {
  return useSupabaseQuery<ShasMasechta>('shas_masechtos', {
    orderBy: 'sort_order',
    ascending: true,
  });
}

export function useShasCompletions() {
  const [completions, setCompletions] = useState<ShasCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('shas_completions')
      .select('*');
    setCompletions((data as ShasCompletion[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function toggleCompletion(masechtaId: string, type: CompletionType) {
    const existing = completions.find(
      (c) => c.masechta_id === masechtaId && c.completion_type === type
    );
    if (existing) {
      await supabase.from('shas_completions').delete().eq('id', existing.id);
      setCompletions((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from('shas_completions')
        .insert({ masechta_id: masechtaId, completion_type: type })
        .select()
        .single();
      if (!error && data) setCompletions((prev) => [...prev, data as ShasCompletion]);
    }
  }

  return { completions, loading, toggleCompletion, refetch: fetch };
}

// ===== Practice Logs =====
export function usePracticeLogs() {
  const { data, loading, refetch, setData } = useSupabaseQuery<PracticeLog>('practice_logs', {
    orderBy: 'date',
    ascending: false,
  });

  async function addLog(log: Omit<PracticeLog, 'id' | 'created_at'>) {
    const { data: entry, error } = await supabase
      .from('practice_logs')
      .insert(log)
      .select()
      .single();
    if (!error && entry) setData((prev) => [entry as PracticeLog, ...prev]);
    return { error };
  }

  return { logs: data, loading, addLog, refetch };
}

// ===== Delivery Journal =====
export function useDeliveryJournal() {
  const { data, loading, refetch, setData } = useSupabaseQuery<DeliveryJournal>('delivery_journal', {
    orderBy: 'date',
    ascending: false,
  });

  async function addEntry(entry: Omit<DeliveryJournal, 'id' | 'created_at'>) {
    const { data: newEntry, error } = await supabase
      .from('delivery_journal')
      .insert(entry)
      .select()
      .single();
    if (!error && newEntry) setData((prev) => [newEntry as DeliveryJournal, ...prev]);
    return { error };
  }

  return { entries: data, loading, addEntry, refetch };
}

// ===== Story Captures =====
export function useStoryCaptures() {
  const { data, loading, refetch, setData } = useSupabaseQuery<StoryCapture>('story_captures', {
    orderBy: 'created_at',
    ascending: false,
  });

  // Calculate stats
  const stats = {
    totalCaptures: data.length,
    currentStreak: calculateStreak(data),
    thisWeek: data.filter(c => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(c.captured_date) >= weekAgo;
    }).length,
  };

  async function addCapture(capture: Omit<StoryCapture, 'id' | 'created_at' | 'promoted_to_story_id'>) {
    const { data: newCapture, error } = await supabase
      .from('story_captures')
      .insert(capture)
      .select()
      .single();
    if (!error && newCapture) setData((prev) => [newCapture as StoryCapture, ...prev]);
    return { error };
  }

  async function promoteToStory(captureId: string, storyId: string) {
    const { error } = await supabase
      .from('story_captures')
      .update({ promoted_to_story_id: storyId })
      .eq('id', captureId);
    if (!error) {
      setData((prev) =>
        prev.map((c) => (c.id === captureId ? { ...c, promoted_to_story_id: storyId } : c))
      );
    }
    return { error };
  }

  return { captures: data, loading, addCapture, promoteToStory, stats, refetch };
}

// ===== Goals =====
export function useGoals() {
  const { data, loading, refetch, setData } = useSupabaseQuery<Goal>('goals', {
    orderBy: 'sort_order',
    ascending: true,
  });

  const activeGoals = data.filter((g) => g.status === 'active');

  async function addGoal(title: string, category: Goal['category'], description?: string, targetDate?: string) {
    const { data: goal, error } = await supabase
      .from('goals')
      .insert({ title, category, description, target_date: targetDate })
      .select()
      .single();
    if (!error && goal) setData((prev) => [...prev, goal as Goal]);
    return { error };
  }

  async function updateGoalStatus(id: string, status: Goal['status']) {
    const { error } = await supabase
      .from('goals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setData((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status } : g))
      );
    }
  }

  return { goals: data, activeGoals, loading, addGoal, updateGoalStatus, refetch };
}

// ===== Daily Reflections =====
export function useDailyReflection(date: string) {
  const [reflection, setReflection] = useState<DailyReflection | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    const { data } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('date', date)
      .single();
    setReflection((data as DailyReflection | null) || null);
    setLoading(false);
  }, [date]);

  useEffect(() => { fetch(); }, [fetch]);

  async function saveReflection(fields: {
    wins?: string;
    struggles?: string;
    goal_notes?: GoalNote[];
    gratitude?: string;
    tomorrow_focus?: string;
    growth_prompt?: string;
    themes?: string[];
  }) {
    // Calculate streak
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const { data: prevReflection } = await supabase
      .from('daily_reflections')
      .select('streak_count')
      .eq('date', yesterdayStr)
      .single();
    const streakCount = prevReflection ? (prevReflection.streak_count || 0) + 1 : 1;

    if (reflection) {
      // Update existing
      const { error } = await supabase
        .from('daily_reflections')
        .update({ ...fields, streak_count: streakCount })
        .eq('id', reflection.id);
      if (!error) setReflection({ ...reflection, ...fields, streak_count: streakCount });
      return { error };
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('daily_reflections')
        .insert({ date, ...fields, streak_count: streakCount })
        .select()
        .single();
      if (!error && data) setReflection(data as DailyReflection);
      return { error };
    }
  }

  return { reflection, loading, saveReflection, refetch: fetch };
}

export function useReflectionHistory(days: number = 7) {
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const { data } = await supabase
      .from('daily_reflections')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });
    setReflections((data as DailyReflection[]) || []);
    setLoading(false);
  }, [days]);

  useEffect(() => { fetch(); }, [fetch]);

  return { reflections, loading, refetch: fetch };
}

// ===== Usage Tracking =====
export async function logUsage(page: string, action: string = 'page_view', metadata?: Record<string, unknown>) {
  await supabase.from('usage_events').insert({ page, action, metadata: metadata || {} });
}

export function useUsageStats(days: number = 7) {
  const [stats, setStats] = useState<{ page: string; count: number }[]>([]);
  const [lastVisits, setLastVisits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data } = await supabase
      .from('usage_events')
      .select('page, created_at')
      .eq('action', 'page_view')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (data) {
      // Count page views
      const counts: Record<string, number> = {};
      const lastVisit: Record<string, string> = {};
      for (const event of data) {
        counts[event.page] = (counts[event.page] || 0) + 1;
        if (!lastVisit[event.page]) lastVisit[event.page] = event.created_at;
      }
      setStats(Object.entries(counts).map(([page, count]) => ({ page, count })));
      setLastVisits(lastVisit);
    }
    setLoading(false);
  }, [days]);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, lastVisits, loading };
}

// ===== User Profile =====
export function useUserProfile() {
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('user_profile').select('*');
    if (data) {
      const profileMap: Record<string, unknown> = {};
      for (const entry of data as UserProfileEntry[]) {
        profileMap[entry.key] = entry.value;
      }
      setProfile(profileMap);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { profile, loading, refetch: fetch };
}

// ===== Dashboard Nudges =====
export interface DashboardNudge {
  type: 'practice' | 'story' | 'ritual' | 'reflection' | 'event' | 'goal';
  message: string;
  action: string; // URL to navigate to
  priority: number; // lower = higher priority
}

export function useDashboardNudges() {
  const [nudges, setNudges] = useState<DashboardNudge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const hour = now.getHours();
    const result: DashboardNudge[] = [];

    // Check upcoming events (within 3 days)
    const threeDaysOut = new Date();
    threeDaysOut.setDate(threeDaysOut.getDate() + 3);
    const { data: events } = await supabase
      .from('events')
      .select('title, start_time')
      .gte('start_time', now.toISOString())
      .lte('start_time', threeDaysOut.toISOString())
      .order('start_time', { ascending: true })
      .limit(1);

    if (events && events.length > 0) {
      const event = events[0];
      const eventDate = new Date(event.start_time);
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const dayText = daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;
      result.push({
        type: 'event',
        message: `${event.title} is ${dayText} — time to prepare`,
        action: '/pipeline',
        priority: 1,
      });
    }

    // Check pipeline items in practice stage with no recent practice logs
    const { data: practiceItems } = await supabase
      .from('pipeline_items')
      .select('title, document_slug')
      .eq('stage', 'practice')
      .limit(1);

    if (practiceItems && practiceItems.length > 0) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: recentLogs } = await supabase
        .from('practice_logs')
        .select('id')
        .gte('date', weekAgo.toISOString().split('T')[0])
        .limit(1);

      if (!recentLogs || recentLogs.length === 0) {
        result.push({
          type: 'practice',
          message: `"${practiceItems[0].title}" needs rehearsal`,
          action: '/practice',
          priority: 2,
        });
      }
    }

    // Check rituals for today
    const { data: rituals } = await supabase
      .from('rituals')
      .select('id')
      .eq('active', true);
    const { data: completions } = await supabase
      .from('ritual_completions')
      .select('ritual_id')
      .eq('completed_date', today);

    if (rituals && completions && completions.length < rituals.length) {
      const remaining = rituals.length - completions.length;
      result.push({
        type: 'ritual',
        message: `${remaining} ritual${remaining > 1 ? 's' : ''} waiting for you`,
        action: '/growth/daily',
        priority: 3,
      });
    }

    // Check story capture (no capture in 3+ days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const { data: recentCaptures } = await supabase
      .from('story_captures')
      .select('id')
      .gte('captured_date', threeDaysAgo.toISOString().split('T')[0])
      .limit(1);

    if (!recentCaptures || recentCaptures.length === 0) {
      result.push({
        type: 'story',
        message: 'Capture a moment — 2 minutes',
        action: '/stories/capture',
        priority: 4,
      });
    }

    // Check evening reflection (after 5pm, no reflection today)
    if (hour >= 17) {
      const { data: todayReflection } = await supabase
        .from('daily_reflections')
        .select('id')
        .eq('date', today)
        .limit(1);

      if (!todayReflection || todayReflection.length === 0) {
        result.push({
          type: 'reflection',
          message: 'Take 5 minutes to reflect on your day',
          action: '/growth/daily',
          priority: 2,
        });
      }
    }

    // Sort by priority and take top 3
    result.sort((a, b) => a.priority - b.priority);
    setNudges(result.slice(0, 3));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { nudges, loading };
}

// Helper to calculate streak
function calculateStreak(captures: StoryCapture[]): number {
  if (captures.length === 0) return 0;

  const dates = [...new Set(captures.map(c => c.captured_date))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Must have captured today or yesterday to have a streak
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 0;
  let checkDate = new Date(dates[0]);

  for (const date of dates) {
    const expectedDate = checkDate.toISOString().split('T')[0];
    if (date === expectedDate) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
