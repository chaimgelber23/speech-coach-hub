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
import { format } from 'date-fns';
import { useState } from 'react';

// Demo data - will be replaced with Supabase queries
const todaysRituals = [
  { id: '1', name: 'Morning Meditation', completed: false },
  { id: '2', name: 'Daily Affirmation', completed: false },
  { id: '3', name: 'Torah Learning', completed: false },
  { id: '4', name: 'Evening Reflection', completed: false },
];

const upcomingEvents = [
  { id: '1', title: 'Chavrusa - Kiddush', time: '7:00 PM', type: 'chavrusa' },
  { id: '2', title: 'Parsha Shiur Prep', time: 'Tomorrow 9:00 AM', type: 'prep' },
  { id: '3', title: 'Weekly Shiur', time: 'Thu 8:00 PM', type: 'shiur' },
];

const activeTasks = [
  { id: '1', title: 'Finish Shabbos Candles research', priority: 'high' },
  { id: '2', title: 'Practice Beshalach speech', priority: 'medium' },
  { id: '3', title: 'Add stories to Kiddush prep', priority: 'low' },
];

const pipelineSummary = [
  { stage: 'Research', count: 3 },
  { stage: 'Draft', count: 1 },
  { stage: 'Practice', count: 1 },
  { stage: 'Ready', count: 0 },
];

export default function Dashboard() {
  const [rituals, setRituals] = useState(todaysRituals);
  const today = new Date();
  const completedRituals = rituals.filter((r) => r.completed).length;

  return (
    <div className="max-w-6xl mx-auto">
      <Header
        title={`Good ${getGreeting()}`}
        description={format(today, 'EEEE, MMMM d, yyyy')}
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
                {completedRituals}/{rituals.length}
              </span>
            </div>
            <Progress value={(completedRituals / rituals.length) * 100} className="h-1.5" />
          </CardHeader>
          <CardContent className="space-y-2">
            {rituals.map((ritual) => (
              <label
                key={ritual.id}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={ritual.completed}
                  onCheckedChange={(checked) => {
                    setRituals((prev) =>
                      prev.map((r) =>
                        r.id === ritual.id
                          ? { ...r, completed: checked === true }
                          : r
                      )
                    );
                  }}
                />
                <span className={ritual.completed ? 'line-through text-slate-400' : ''}>
                  {ritual.name}
                </span>
              </label>
            ))}
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
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-slate-500">{event.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.type}
                </Badge>
              </div>
            ))}
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
            {activeTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-slate-300 shrink-0" />
                <span className="text-sm flex-1">{task.title}</span>
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
            ))}
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
              Today&apos;s Lesson
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 italic">
              &ldquo;Confidence isn&apos;t about being sure of yourself. It&apos;s about being willing
              to try even when you&apos;re not sure.&rdquo;
            </p>
            <p className="text-xs text-slate-400 mt-2">
              From: Self-Esteem Course — Segment 14
            </p>
            <Link
              href="/growth/courses"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
            >
              Continue course <ArrowRight size={12} />
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
