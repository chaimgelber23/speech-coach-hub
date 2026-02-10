'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Flame,
  BookOpen,
  Sun,
  ArrowLeft,
  Trophy,
  Moon,
  Lightbulb,
  Save,
  ChevronDown,
  ChevronUp,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  useRituals,
  useRitualCompletions,
  useDailyLessons,
  useDailyReflection,
  useGoals,
  useUserProfile,
  useReflectionHistory,
} from '@/lib/hooks';
import DailyItem from '@/components/growth/DailyItem';
import { useState, useEffect } from 'react';

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

// Default growth prompts — used when user_profile isn't loaded yet
const DEFAULT_PROMPTS = [
  "What's one thing you can do differently tomorrow to be more present?",
  "Think about someone you interacted with today. Did you give them your full attention?",
  "What's one middah (character trait) you want to strengthen this week?",
  "Is there something you've been avoiding? What's the first small step?",
  "Who in your life could use a kind word from you tomorrow?",
  "What's one thing you learned today that changed how you see something?",
  "Think about a moment today where you felt truly connected. What made it special?",
  "What assumption did you make today that might not be true?",
  "How did you grow today, even in a small way?",
  "What would tomorrow look like if you gave it your absolute best?",
];

export default function DailyGrowthPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const hour = new Date().getHours();
  const { rituals, loading: ritualsLoading } = useRituals();
  const { completions, toggleCompletion } = useRitualCompletions(today);
  const { lessons, loading: lessonsLoading, completeSegment } = useDailyLessons();
  const { reflection, loading: reflectionLoading, saveReflection } = useDailyReflection(today);
  const { activeGoals } = useGoals();
  const { profile } = useUserProfile();
  const { reflections: recentReflections } = useReflectionHistory(14);

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

  // Reflection state
  const [reflectionOpen, setReflectionOpen] = useState(hour >= 17 || !!reflection);
  const [wins, setWins] = useState('');
  const [struggles, setStruggles] = useState('');
  const [goalNotes, setGoalNotes] = useState<Record<string, { note: string; rating: number }>>({});
  const [gratitude, setGratitude] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [growthPrompt, setGrowthPrompt] = useState('');

  // Load existing reflection data
  useEffect(() => {
    if (reflection) {
      setWins(reflection.wins || '');
      setStruggles(reflection.struggles || '');
      setGratitude(reflection.gratitude || '');
      setTomorrowFocus(reflection.tomorrow_focus || '');
      setGrowthPrompt(reflection.growth_prompt || '');
      if (reflection.goal_notes) {
        const notes: Record<string, { note: string; rating: number }> = {};
        for (const gn of reflection.goal_notes) {
          notes[gn.goal_id] = { note: gn.note, rating: gn.rating };
        }
        setGoalNotes(notes);
      }
      setReflectionOpen(true);
    }
  }, [reflection]);

  // Pick a growth prompt based on personality and themes
  useEffect(() => {
    if (growthPrompt) return; // Already set
    const prompts = (profile?.growth_prompts as string[]) || DEFAULT_PROMPTS;
    // Pick based on day of year so it's consistent for the day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setGrowthPrompt(prompts[dayOfYear % prompts.length]);
  }, [profile, growthPrompt]);

  async function handleSave() {
    setSaving(true);
    const goalNotesArray = activeGoals.map((g) => ({
      goal_id: g.id,
      note: goalNotes[g.id]?.note || '',
      rating: goalNotes[g.id]?.rating || 0,
    })).filter((gn) => gn.note || gn.rating > 0);

    // Simple theme extraction: find repeated significant words
    const allText = [wins, struggles, gratitude, tomorrowFocus, ...goalNotesArray.map((g) => g.note)].join(' ').toLowerCase();
    const words = allText.split(/\s+/).filter((w) => w.length > 4);
    const wordCounts: Record<string, number> = {};
    for (const w of words) {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    }
    const themes = Object.entries(wordCounts)
      .filter(([, count]) => count >= 2)
      .map(([word]) => word)
      .slice(0, 5);

    await saveReflection({
      wins: wins || undefined,
      struggles: struggles || undefined,
      goal_notes: goalNotesArray,
      gratitude: gratitude || undefined,
      tomorrow_focus: tomorrowFocus || undefined,
      growth_prompt: growthPrompt || undefined,
      themes,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function setGoalRating(goalId: string, rating: number) {
    setGoalNotes((prev) => ({
      ...prev,
      [goalId]: { ...prev[goalId], note: prev[goalId]?.note || '', rating },
    }));
  }

  function setGoalNote(goalId: string, note: string) {
    setGoalNotes((prev) => ({
      ...prev,
      [goalId]: { ...prev[goalId], rating: prev[goalId]?.rating || 0, note },
    }));
  }

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
      ) : totalItems === 0 && !reflectionOpen ? (
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

          {/* ===== EVENING REFLECTION ===== */}
          <div className="mt-8">
            <button
              onClick={() => setReflectionOpen(!reflectionOpen)}
              className="flex items-center gap-2 w-full text-left mb-3"
            >
              <Moon size={16} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex-1">
                Evening Reflection
              </h2>
              {reflection && (
                <span className="text-xs text-green-600 font-medium mr-2">Saved</span>
              )}
              {reflectionOpen ? (
                <ChevronUp size={16} className="text-slate-400" />
              ) : (
                <ChevronDown size={16} className="text-slate-400" />
              )}
            </button>

            {reflectionOpen && !reflectionLoading && (
              <div className="space-y-4">
                {/* Streak indicator */}
                {reflection && reflection.streak_count > 1 && (
                  <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
                    <Flame size={14} className="text-indigo-500" />
                    {reflection.streak_count} day reflection streak — keep it going!
                  </div>
                )}

                {/* 1. What went well? */}
                <Card>
                  <CardContent className="p-4">
                    <Label className="text-sm font-medium text-green-700">
                      What went well today?
                    </Label>
                    <Textarea
                      value={wins}
                      onChange={(e) => setWins(e.target.value)}
                      placeholder="Wins, accomplishments, good moments..."
                      rows={2}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                {/* 2. What was hard? */}
                <Card>
                  <CardContent className="p-4">
                    <Label className="text-sm font-medium text-amber-700">
                      What was hard?
                    </Label>
                    <Textarea
                      value={struggles}
                      onChange={(e) => setStruggles(e.target.value)}
                      placeholder="Challenges, struggles, things you want to improve..."
                      rows={2}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                {/* 3. Goal reflections */}
                {activeGoals.length > 0 && (
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <Label className="text-sm font-medium text-rose-700 flex items-center gap-1.5">
                        <Target size={14} />
                        Goal Check-in
                      </Label>
                      {activeGoals.map((goal) => (
                        <div key={goal.id} className="border-l-2 border-rose-200 pl-3 space-y-2">
                          <p className="text-sm font-medium text-slate-700">{goal.title}</p>
                          {/* Rating 1-5 */}
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400 mr-1">How&apos;d it go?</span>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() => setGoalRating(goal.id, n)}
                                className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
                                  (goalNotes[goal.id]?.rating || 0) >= n
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                          <Textarea
                            value={goalNotes[goal.id]?.note || ''}
                            onChange={(e) => setGoalNote(goal.id, e.target.value)}
                            placeholder="Quick note on this goal..."
                            rows={1}
                            className="text-xs"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 4. Gratitude */}
                <Card>
                  <CardContent className="p-4">
                    <Label className="text-sm font-medium text-teal-700">
                      What are you grateful for?
                    </Label>
                    <Textarea
                      value={gratitude}
                      onChange={(e) => setGratitude(e.target.value)}
                      placeholder="Something from today you appreciate..."
                      rows={2}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                {/* 5. Tomorrow's focus */}
                <Card>
                  <CardContent className="p-4">
                    <Label className="text-sm font-medium text-blue-700">
                      One thing to focus on tomorrow
                    </Label>
                    <Textarea
                      value={tomorrowFocus}
                      onChange={(e) => setTomorrowFocus(e.target.value)}
                      placeholder="Your main intention for tomorrow..."
                      rows={1}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                {/* Save button */}
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save size={14} className="mr-1" />
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Reflection'}
                  </Button>
                </div>

                {/* "Something to think about" — shown after save or if reflection exists */}
                {(saved || reflection) && growthPrompt && (
                  <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <Lightbulb size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                            Something to think about
                          </p>
                          <p className="text-sm text-indigo-800 leading-relaxed">
                            {growthPrompt}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
