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
  Mic,
  BookOpenCheck,
  PenLine,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { format, isFuture, isToday, parseISO } from 'date-fns';
import {
  useRituals,
  useRitualCompletions,
  useEvents,
  useTasks,
  usePipeline,
  useGoals,
  usePracticeLogs,
  useStoryCaptures,
  useDashboardNudges,
} from '@/lib/hooks';
import { PIPELINE_STAGES } from '@/types';

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { rituals, loading: ritualsLoading } = useRituals();
  const { completions, toggleCompletion } = useRitualCompletions(today);
  const { events, loading: eventsLoading } = useEvents();
  const { tasks, loading: tasksLoading } = useTasks();
  const { items: pipelineItems, loading: pipelineLoading } = usePipeline();
  const { activeGoals } = useGoals();
  const { logs: practiceLogs } = usePracticeLogs();
  const { stats: captureStats } = useStoryCaptures();
  const { nudges, loading: nudgesLoading } = useDashboardNudges();

  const activeRituals = rituals.filter((r) => r.active);
  const completedRitualIds = new Set(completions.map((c) => c.ritual_id));
  const completedCount = activeRituals.filter((r) => completedRitualIds.has(r.id)).length;

  // Practice sessions this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const practiceThisWeek = practiceLogs.filter((l) => new Date(l.date) >= weekAgo).length;

  // Upcoming events (today or future, max 3)
  const upcomingEvents = events
    .filter((e) => {
      try {
        const d = parseISO(e.start_time);
        return isToday(d) || isFuture(d);
      } catch { return false; }
    })
    .slice(0, 3);

  // Priority tasks (pending/in_progress, sorted by priority, max 3)
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const activeTasks = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1))
    .slice(0, 3);

  // Pipeline summary
  const pipelineSummary = PIPELINE_STAGES.map((stage) => ({
    stage: stage.label,
    count: pipelineItems.filter((item) => item.stage === stage.key).length,
  }));

  // Nudge icons + colors
  const nudgeStyle: Record<string, { color: string; bg: string }> = {
    event: { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    practice: { color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    ritual: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    reflection: { color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    story: { color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
    goal: { color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Header
        title={`Good ${getGreeting()}`}
        description={format(new Date(), 'EEEE, MMMM d, yyyy')}
      />

      {/* Today's Focus — the hero section */}
      {!nudgesLoading && nudges.length > 0 && (
        <Card className="mb-6 border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              Today&apos;s Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nudges.map((nudge, i) => {
              const style = nudgeStyle[nudge.type] || nudgeStyle.goal;
              return (
                <Link key={i} href={nudge.action}>
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${style.bg} hover:shadow-sm transition-all cursor-pointer`}>
                    <div className={`w-2 h-2 rounded-full ${style.color.replace('text-', 'bg-')}`} />
                    <span className={`text-sm font-medium ${style.color}`}>
                      {nudge.message}
                    </span>
                    <ArrowRight size={14} className={`ml-auto ${style.color} opacity-50`} />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Link href="/practice">
          <Card className="hover:shadow-md transition-all cursor-pointer hover:border-purple-300">
            <CardContent className="p-3 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                <Mic size={16} className="text-purple-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">Practice</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/stories/capture">
          <Card className="hover:shadow-md transition-all cursor-pointer hover:border-teal-300">
            <CardContent className="p-3 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
                <PenLine size={16} className="text-teal-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">Capture Story</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tasks">
          <Card className="hover:shadow-md transition-all cursor-pointer hover:border-green-300">
            <CardContent className="p-3 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                <ListTodo size={16} className="text-green-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">Add Task</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/growth/daily">
          <Card className="hover:shadow-md transition-all cursor-pointer hover:border-indigo-300">
            <CardContent className="p-3 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                <BookOpenCheck size={16} className="text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">Reflect</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Daily Progress Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Rituals</span>
              <Sparkles size={14} className="text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-800">{completedCount}</span>
              <span className="text-xs text-slate-400">/ {activeRituals.length}</span>
            </div>
            <Progress value={activeRituals.length > 0 ? (completedCount / activeRituals.length) * 100 : 0} className="h-1 mt-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Story Streak</span>
              <PenLine size={14} className="text-teal-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-800">{captureStats.currentStreak}</span>
              <span className="text-xs text-slate-400">days</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Practice</span>
              <Mic size={14} className="text-purple-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-800">{practiceThisWeek}</span>
              <span className="text-xs text-slate-400">this week</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Goals</span>
              <Target size={14} className="text-rose-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-800">{activeGoals.length}</span>
              <span className="text-xs text-slate-400">active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: existing cards, compacted */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Rituals */}
        <Card>
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
          </CardHeader>
          <CardContent className="space-y-2">
            {ritualsLoading ? (
              <p className="text-xs text-slate-400">Loading...</p>
            ) : activeRituals.length === 0 ? (
              <p className="text-xs text-slate-400">No rituals defined yet.</p>
            ) : (
              activeRituals.slice(0, 5).map((ritual) => (
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
              href="/growth/daily"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
            >
              Go to My Daily <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
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

        {/* Priority Tasks */}
        <Card>
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Kanban size={16} className="text-purple-500" />
              Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <p className="text-xs text-slate-400">Loading...</p>
            ) : (
              <div className="flex gap-2">
                {pipelineSummary.map((stage) => (
                  <div
                    key={stage.stage}
                    className="flex-1 text-center p-2 bg-slate-100 rounded-lg"
                  >
                    <p className="text-lg font-bold text-slate-700">{stage.count}</p>
                    <p className="text-[10px] text-slate-500">{stage.stage}</p>
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
