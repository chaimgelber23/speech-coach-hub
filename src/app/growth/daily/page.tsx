'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, BookOpen, Sun, ArrowLeft, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useRituals, useRitualCompletions, useDailyLessons } from '@/lib/hooks';
import DailyItem from '@/components/growth/DailyItem';

const ritualColors: Record<string, string> = {
  meditation: 'border-purple-300',
  affirmation: 'border-amber-300',
  reflection: 'border-blue-300',
  exercise: 'border-green-300',
  learning: 'border-teal-300',
};

const courseColors = [
  'border-blue-300',
  'border-teal-300',
  'border-purple-300',
  'border-indigo-300',
];

export default function DailyGrowthPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { rituals, loading: ritualsLoading } = useRituals();
  const { completions, toggleCompletion } = useRitualCompletions(today);
  const { lessons, loading: lessonsLoading, completeSegment } = useDailyLessons();

  const activeRituals = rituals.filter((r) => r.active);
  const completedRitualIds = new Set(completions.map((c) => c.ritual_id));

  // Count total items and completed
  const totalItems = activeRituals.length + lessons.length;
  const completedItems =
    activeRituals.filter((r) => completedRitualIds.has(r.id)).length +
    lessons.filter((l) => l.segment.completed).length;
  const allDone = totalItems > 0 && completedItems === totalItems;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const loading = ritualsLoading || lessonsLoading;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/growth">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> Growth
          </Button>
        </Link>
      </div>

      <Header
        title="My Daily Growth"
        description={format(new Date(), 'EEEE, MMMM d, yyyy')}
      />

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">
              Today&apos;s Progress
            </span>
            <span className="text-sm text-slate-500">
              {completedItems} of {totalItems} completed
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-slate-400">Loading your daily growth...</p>
      ) : totalItems === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-slate-500">
              No rituals or courses set up yet. Head to{' '}
              <Link href="/growth" className="text-blue-600 underline">
                Growth
              </Link>{' '}
              to add rituals, or import courses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Morning Rituals */}
          {activeRituals.length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-2 mb-1">
                <Sun size={16} className="text-amber-500" />
                <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Morning Rituals
                </h2>
              </div>
              {activeRituals.map((ritual) => (
                <DailyItem
                  key={ritual.id}
                  title={ritual.name}
                  subtitle={ritual.description || undefined}
                  content={ritual.content || ritual.description || ritual.name}
                  completed={completedRitualIds.has(ritual.id)}
                  onComplete={() => toggleCompletion(ritual.id)}
                  icon={<Flame size={16} className="text-orange-500" />}
                  accentColor={ritualColors[ritual.category || ''] || 'border-slate-200'}
                />
              ))}
            </>
          )}

          {/* Today's Lessons */}
          {lessons.length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-6 mb-1">
                <BookOpen size={16} className="text-blue-500" />
                <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Today&apos;s Lessons
                </h2>
              </div>
              {lessons.map((lesson, i) => (
                <DailyItem
                  key={lesson.segment.id}
                  title={lesson.segment.title || `Lesson ${lesson.segment.segment_number}`}
                  subtitle={`${lesson.course.title} — Part ${lesson.segment.segment_number} of ${lesson.course.total_segments}`}
                  content={lesson.segment.content}
                  completed={lesson.segment.completed}
                  onComplete={() => completeSegment(lesson.segment.id)}
                  icon={<BookOpen size={16} className="text-blue-500" />}
                  accentColor={courseColors[i % courseColors.length]}
                />
              ))}
            </>
          )}

          {/* All Done Celebration */}
          {allDone && (
            <Card className="border-2 border-green-300 bg-green-50 mt-6">
              <CardContent className="p-6 text-center">
                <Trophy size={32} className="text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-green-800">
                  All done for today!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  You showed up and put in the work. That&apos;s what growth looks like.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
