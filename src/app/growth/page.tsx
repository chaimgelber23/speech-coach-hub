'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Flame, BookOpen, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface RitualItem {
  id: string;
  name: string;
  description: string;
  category: string;
  completed: boolean;
  streak: number;
}

const demoRituals: RitualItem[] = [
  { id: '1', name: 'Morning Meditation', description: '10 minutes of mindful breathing', category: 'meditation', completed: false, streak: 12 },
  { id: '2', name: 'Daily Affirmation', description: 'Read and internalize affirmation card', category: 'affirmation', completed: false, streak: 8 },
  { id: '3', name: 'Torah Learning', description: 'Minimum 30 minutes focused learning', category: 'learning', completed: false, streak: 45 },
  { id: '4', name: 'Gratitude Journal', description: 'Write 3 things grateful for', category: 'reflection', completed: false, streak: 5 },
  { id: '5', name: 'Evening Reflection', description: 'Review the day, what went well, what to improve', category: 'reflection', completed: false, streak: 3 },
  { id: '6', name: 'Physical Exercise', description: '20+ minutes movement', category: 'exercise', completed: false, streak: 7 },
];

const demoCourses = [
  { id: '1', title: 'Self-Esteem Foundations', total: 30, completed: 14, source: 'Course Notes' },
  { id: '2', title: 'Confidence Building', total: 20, completed: 6, source: 'Workshop' },
  { id: '3', title: 'Public Speaking Mastery', total: 15, completed: 2, source: 'Eliezer Blatt' },
];

// Generate a heatmap for the last 90 days
const heatmapData = Array.from({ length: 90 }, (_, i) => ({
  date: new Date(Date.now() - (89 - i) * 86400000),
  count: Math.floor(Math.random() * 7),
}));

export default function GrowthPage() {
  const [rituals, setRituals] = useState(demoRituals);
  const completedCount = rituals.filter((r) => r.completed).length;

  return (
    <div className="max-w-5xl mx-auto">
      <Header
        title="Personal Growth"
        description="Track your daily rituals, courses, and development"
        action={
          <Button size="sm">
            <Plus size={16} className="mr-1" /> Add Ritual
          </Button>
        }
      />

      <Tabs defaultValue="rituals">
        <TabsList className="mb-6">
          <TabsTrigger value="rituals">Daily Rituals</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        <TabsContent value="rituals">
          {/* Today's Progress */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Today&apos;s Progress</h3>
                <span className="text-sm text-slate-500">
                  {completedCount} / {rituals.length} completed
                </span>
              </div>
              <Progress value={(completedCount / rituals.length) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Ritual List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rituals.map((ritual) => (
              <Card key={ritual.id} className={ritual.completed ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={ritual.completed}
                      onCheckedChange={(checked) => {
                        setRituals((prev) =>
                          prev.map((r) =>
                            r.id === ritual.id ? { ...r, completed: checked === true } : r
                          )
                        );
                      }}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-medium ${ritual.completed ? 'line-through' : ''}`}>
                          {ritual.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {ritual.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{ritual.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Flame size={12} className="text-orange-500" />
                        <span className="text-xs text-orange-600 font-medium">
                          {ritual.streak} day streak
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <div className="space-y-4">
            {demoCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <BookOpen size={14} className="text-teal-500" />
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500">Source: {course.source}</p>
                    </div>
                    <Link href={`/growth/courses/${course.id}`}>
                      <Button size="sm" variant="outline">
                        Continue
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={(course.completed / course.total) * 100}
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {course.completed}/{course.total} segments
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="streaks">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target size={16} className="text-blue-500" />
                Activity Heatmap (Last 90 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {heatmapData.map((d, i) => {
                  const intensity =
                    d.count === 0
                      ? 'bg-slate-100'
                      : d.count < 3
                      ? 'bg-green-200'
                      : d.count < 5
                      ? 'bg-green-400'
                      : 'bg-green-600';
                  return (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-sm ${intensity}`}
                      title={`${d.date.toLocaleDateString()}: ${d.count} rituals completed`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-slate-100" />
                <div className="w-3 h-3 rounded-sm bg-green-200" />
                <div className="w-3 h-3 rounded-sm bg-green-400" />
                <div className="w-3 h-3 rounded-sm bg-green-600" />
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
