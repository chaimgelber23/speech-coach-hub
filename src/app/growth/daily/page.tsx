'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Moon,
  Lightbulb,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  useDailyReflection,
  useUserProfile,
  useReflectionHistory,
} from '@/lib/hooks';
import { useState, useEffect } from 'react';

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

export default function DailyReflectionPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { reflection, loading: reflectionLoading, saveReflection } = useDailyReflection(today);
  const { profile } = useUserProfile();
  const { reflections: recentReflections } = useReflectionHistory(14);

  const [wins, setWins] = useState('');
  const [struggles, setStruggles] = useState('');
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
    }
  }, [reflection]);

  // Pick a growth prompt based on day
  useEffect(() => {
    if (growthPrompt) return;
    const prompts = (profile?.growth_prompts as string[]) || DEFAULT_PROMPTS;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setGrowthPrompt(prompts[dayOfYear % prompts.length]);
  }, [profile, growthPrompt]);

  async function handleSave() {
    setSaving(true);
    const allText = [wins, struggles, gratitude, tomorrowFocus].join(' ').toLowerCase();
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
      goal_notes: [],
      gratitude: gratitude || undefined,
      tomorrow_focus: tomorrowFocus || undefined,
      growth_prompt: growthPrompt || undefined,
      themes,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Streak from recent reflections
  const streakCount = reflection?.streak_count || 0;

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
        title="Daily Reflection"
        description={format(new Date(), 'EEEE, MMMM d, yyyy')}
      />

      {/* Something to think about — shown at top as inspiration */}
      {growthPrompt && (
        <Card className="mb-6 border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
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

      {reflectionLoading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="space-y-4">
          {/* Streak indicator */}
          {streakCount > 1 && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
              <Moon size={14} className="text-indigo-500" />
              {streakCount} day reflection streak
            </div>
          )}

          {/* What went well? */}
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

          {/* What was hard? */}
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

          {/* Gratitude */}
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

          {/* Tomorrow's focus */}
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
        </div>
      )}
    </div>
  );
}
