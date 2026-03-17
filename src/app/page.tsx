'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  CheckCircle2,
  BookOpen,
  Kanban,
  ListTodo,
  ArrowRight,
  Mic,
  PenLine,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { format, isFuture, isToday, parseISO } from 'date-fns';
import {
  useEvents,
  useTasks,
  usePipeline,
  useGoals,
  useDashboardNudges,
} from '@/lib/hooks';
import { PIPELINE_STAGES, GOAL_CATEGORIES } from '@/types';

export default function Dashboard() {
  const { events, loading: eventsLoading } = useEvents();
  const { tasks, loading: tasksLoading } = useTasks();
  const { items: pipelineItems, loading: pipelineLoading } = usePipeline();
  const { activeGoals } = useGoals();
  const { nudges, loading: nudgesLoading } = useDashboardNudges();

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

  // Nudge styles
  const nudgeStyle: Record<string, { color: string; bg: string }> = {
    event: { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    practice: { color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    story: { color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
    goal: { color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Header
        title={`Good ${getGreeting()}`}
        description={format(new Date(), 'EEEE, MMMM d, yyyy')}
      />

      {/* Today's Focus — nudges */}
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
        <Link href="/research">
          <Card className="hover:shadow-md transition-all cursor-pointer hover:border-amber-300">
            <CardContent className="p-3 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <BookOpen size={16} className="text-amber-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">Torah Library</span>
            </CardContent>
          </Card>
        </Link>
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
        <Link href="/growth">
          <Card className="hover:shadow-md transition-all cursor-pointer hover:border-rose-300">
            <CardContent className="p-3 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
                <Target size={16} className="text-rose-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">Goals</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goals — what I'm working on */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target size={16} className="text-rose-500" />
              What I&apos;m Working On
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeGoals.length === 0 ? (
              <p className="text-xs text-slate-400">No active goals yet.</p>
            ) : (
              activeGoals.slice(0, 4).map((goal) => {
                const cat = GOAL_CATEGORIES.find((c) => c.key === goal.category);
                return (
                  <div key={goal.id} className="flex items-start gap-2">
                    <Target size={14} className="text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{goal.title}</span>
                      {goal.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{goal.description}</p>
                      )}
                    </div>
                    {cat && (
                      <Badge variant="outline" className={`text-xs ${cat.color}`}>
                        {cat.label}
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
            <Link
              href="/growth"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
            >
              Manage goals <ArrowRight size={12} />
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
