'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Calendar, BookOpen, RefreshCw } from 'lucide-react';
import { STORY_PROMPTS, CATEGORY_LABELS, CATEGORY_COLORS, type StoryPrompt } from '@/lib/story-prompts';
import { useStoryCaptures } from '@/lib/hooks';
import Link from 'next/link';

// Simple "today" prompts
const TODAY_PROMPTS = [
  "What happened today that surprised you?",
  "What conversation stood out today?",
  "What moment made you feel something today?",
  "What did you notice today that others might have missed?",
  "What's one thing from today worth remembering?",
];

export default function StoryCapturePage() {
  const { captures, loading, addCapture, stats } = useStoryCaptures();
  const [mode, setMode] = useState<'today' | 'past'>('today');
  const [response, setResponse] = useState('');
  const [emotion, setEmotion] = useState('');
  const [saving, setSaving] = useState(false);

  // Today mode
  const [todayPrompt, setTodayPrompt] = useState(TODAY_PROMPTS[0]);

  // Past mode - rotating through 30 prompts
  const [pastDay, setPastDay] = useState(1);
  const pastPrompt = STORY_PROMPTS.find(p => p.day === pastDay) || STORY_PROMPTS[0];

  // Set past day based on captures
  useEffect(() => {
    if (!loading && captures) {
      const pastCaptures = captures.filter(c => c.prompt_day > 0);
      const nextDay = (pastCaptures.length % 30) + 1;
      setPastDay(nextDay);
    }
  }, [captures, loading]);

  // Check if already captured today
  const today = new Date().toISOString().split('T')[0];
  const todaysCapture = captures?.find(c => c.captured_date === today);

  function shuffleTodayPrompt() {
    const others = TODAY_PROMPTS.filter(p => p !== todayPrompt);
    setTodayPrompt(others[Math.floor(Math.random() * others.length)]);
  }

  async function handleSave() {
    if (!response.trim()) return;
    setSaving(true);

    const promptText = mode === 'today' ? todayPrompt : pastPrompt.prompt;
    const promptDay = mode === 'today' ? 0 : pastDay; // 0 = today mode

    await addCapture({
      prompt_day: promptDay,
      prompt_text: promptText,
      response: response.trim(),
      emotion: emotion.trim() || null,
      captured_date: today,
    });

    setResponse('');
    setEmotion('');
    setSaving(false);

    // Move to next past prompt if in past mode
    if (mode === 'past') {
      setPastDay(prev => prev < 30 ? prev + 1 : 1);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Header
        title="Daily Story Capture"
        description="Build your story library one day at a time"
        action={
          <Link href="/stories">
            <Button variant="outline" size="sm">
              <BookOpen size={14} className="mr-1" />
              Story Bank
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Sparkles size={14} />
          <span>{stats?.totalCaptures || 0} captures</span>
        </div>
        {stats?.currentStreak > 0 && (
          <Badge variant="secondary">{stats.currentStreak} day streak</Badge>
        )}
      </div>

      {/* Already captured notice */}
      {todaysCapture && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardContent className="py-3">
            <p className="text-sm text-green-800">
              You captured something today. You can add more or browse past prompts.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'today' | 'past')} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">
            <Calendar size={14} className="mr-1" />
            Today
          </TabsTrigger>
          <TabsTrigger value="past">
            <RefreshCw size={14} className="mr-1" />
            Past Excavation
          </TabsTrigger>
        </TabsList>

        {/* TODAY MODE */}
        <TabsContent value="today">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-800">What happened today?</Badge>
                <Button variant="ghost" size="sm" onClick={shuffleTodayPrompt}>
                  <RefreshCw size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium mb-4">{todayPrompt}</p>

              <Textarea
                placeholder="Just write what comes to mind... even a few sentences"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-[120px] mb-3"
              />

              <Input
                placeholder="How did it make you feel? (optional)"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="mb-4"
              />

              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">
                  Capture the moment. Polish it later.
                </p>
                <Button onClick={handleSave} disabled={!response.trim() || saving}>
                  {saving ? 'Saving...' : 'Capture'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAST EXCAVATION MODE */}
        <TabsContent value="past">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className={CATEGORY_COLORS[pastPrompt.category]}>
                  {CATEGORY_LABELS[pastPrompt.category]}
                </Badge>
                <span className="text-sm text-slate-500">Day {pastDay}/30</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium mb-2">{pastPrompt.prompt}</p>
              {pastPrompt.followUp && (
                <p className="text-sm text-slate-500 italic mb-4">{pastPrompt.followUp}</p>
              )}

              <Textarea
                placeholder="Let memories surface... even fragments count"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-[120px] mb-3"
              />

              <Input
                placeholder="What emotion comes up? (optional)"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="mb-4"
              />

              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">
                  Some days nothing comes. That&apos;s fine.
                </p>
                <Button onClick={handleSave} disabled={!response.trim() || saving}>
                  {saving ? 'Saving...' : 'Capture'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Captures */}
      {captures && captures.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Recent Captures</h3>
          <div className="space-y-3">
            {captures.slice(0, 5).map((capture) => (
              <Card key={capture.id} className="bg-slate-50">
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {capture.prompt_day === 0 ? 'Today' : `Day ${capture.prompt_day}`}
                    </Badge>
                    <span className="text-xs text-slate-400">{capture.captured_date}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{capture.response}</p>
                  {capture.emotion && (
                    <p className="text-xs text-slate-400 mt-1 italic">Felt: {capture.emotion}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <Card className="mt-6 bg-amber-50 border-amber-200">
        <CardContent className="py-4">
          <h4 className="text-sm font-medium text-amber-900 mb-2">Daily Practice:</h4>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• <strong>Today:</strong> Notice one thing worth remembering</li>
            <li>• <strong>Past:</strong> Let one memory surface</li>
            <li>• <strong>Goal:</strong> Build the muscle of noticing your life</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
