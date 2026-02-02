'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  CheckCircle2,
  BookOpen,
  Kanban,
  ListTodo,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { format, isFuture, isToday, parseISO } from 'date-fns';
import { useRituals, useRitualCompletions, useEvents, useTasks, usePipeline, useCourses } from '@/lib/hooks';
import { PIPELINE_STAGES } from '@/types';

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { rituals, loading: ritualsLoading } = useRituals();
  const { completions, toggleCompletion } = useRitualCompletions(today);
  const { events, loading: eventsLoading } = useEvents();
  const { tasks, loading: tasksLoading } = useTasks();
  const { items: pipelineItems, loading: pipelineLoading } = usePipeline();
  const { data: courses } = useCourses();

  const activeRituals = rituals.filter((r) => r.active);
  const completedRitualIds = new Set(completions.map((c) => c.ritual_id));
  const completedCount = activeRituals.filter((r) => completedRitualIds.has(r.id)).length;

  // Upcoming events (today or future, max 5)
  const upcomingEvents = events
    .filter((e) => {
      try {
        const d = parseISO(e.start_time);
        return isToday(d) || isFuture(d);
      } catch { return false; }
    })
    .slice(0, 5);

  // Priority tasks (pending/in_progress, sorted by priority)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const activeTasks = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1))
    .slice(0, 5);

  // Pipeline summary
  const pipelineSummary = PIPELINE_STAGES.map((stage) => ({
    stage: stage.label,
    count: pipelineItems.filter((item) => item.stage === stage.key).length,
  }));

  return (
    <div className="max-w-6xl mx-auto">
      <Header
        title={`Good ${getGreeting()}`}
        description={format(new Date(), 'EEEE, MMMM d, yyyy')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Rituals */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                Daily Rituals
              </CardTitle>
              <span className="text-xs text-slate-500">
                {completedCount}/{activeRituals.length}
              </span>
            </div>
            <Progress value={activeRituals.length > 0 ? (completedCount / activeRituals.length) * 100 : 0} className="h-1.5" />
          </CardHeader>
          <CardContent className="space-y-2">
            {ritualsLoading ? (
              <p className="text-xs text-slate-400">Loading...</p>
            ) : activeRituals.length === 0 ? (
              <p className="text-xs text-slate-400">No rituals defined yet.</p>
            ) : (
              activeRituals.map((ritual) => (
                <label
                  key={ritual.id}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={completedRitualIds.has(ritual.id)}
                    onCheckedChange={() => toggleCompletion(ritual.id)}
                  />
                  <span className={completedRitualIds.has(ritual.id) ? 'line-through text-slate-400' : ''}>
                    {ritual.name}
                  </span>
                </label>
              ))
            )}
            <Link
              href="/growth"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
            >
              Manage rituals <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventsLoading ? (
              <p className="text-xs text-slate-400">Loading...</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-xs text-slate-400">No upcoming events.</p>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-slate-500">
                      {format(parseISO(event.start_time), 'EEE, MMM d · h:mm a')}
                    </p>
                  </div>
                  {event.event_type && (
                    <Badge variant="outline" className="text-xs">
                      {event.event_type}
                    </Badge>
                  )}
                </div>
              ))
            )}
            <Link
              href="/calendar"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
            >
              View calendar <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>

        {/* Active Tasks */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ListTodo size={16} className="text-green-500" />
              Priority Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksLoading ? (
              <p className="text-xs text-slate-400">Loading...</p>
            ) : activeTasks.length === 0 ? (
              <p className="text-xs text-slate-400">No active tasks.</p>
            ) : (
              activeTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-slate-300 shrink-0" />
                  <span className="text-sm flex-1 truncate">{task.title}</span>
                  <Badge
                    variant="outline"
                    className={
                      task.priority === 'high'
                        ? 'border-red-300 text-red-700 text-xs'
                        : task.priority === 'medium'
                        ? 'border-yellow-300 text-yellow-700 text-xs'
                        : 'border-slate-300 text-slate-500 text-xs'
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))
            )}
            <Link
              href="/tasks"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
            >
              All tasks <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>

        {/* Content Pipeline */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Kanban size={16} className="text-purple-500" />
              Content Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <p className="text-xs text-slate-400">Loading...</p>
            ) : (
              <div className="flex gap-4">
                {pipelineSummary.map((stage) => (
                  <div
                    key={stage.stage}
                    className="flex-1 text-center p-3 bg-slate-100 rounded-lg"
                  >
                    <p className="text-2xl font-bold text-slate-700">{stage.count}</p>
                    <p className="text-xs text-slate-500">{stage.stage}</p>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/pipeline"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-3"
            >
              View pipeline <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>

        {/* Today's Micro-Lesson */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen size={16} className="text-teal-500" />
              Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-sm text-slate-400">No courses imported yet.</p>
            ) : (
              <div className="space-y-2">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="text-sm">
                    <p className="font-medium truncate">{course.title}</p>
                    <p className="text-xs text-slate-500">{course.total_segments} segments</p>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/growth/courses"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
            >
              View courses <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}
