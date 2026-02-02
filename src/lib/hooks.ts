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
