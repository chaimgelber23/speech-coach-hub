'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, BookOpen, Target, ArrowRight, Sun } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useRituals, useRitualCompletions, useCourses } from '@/lib/hooks';
import AddDialog from '@/components/AddDialog';

export default function GrowthPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { rituals, loading: ritualsLoading, addRitual } = useRituals();
  const { completions, toggleCompletion } = useRitualCompletions(today);
  const { data: courses, loading: coursesLoading } = useCourses();

  const activeRituals = rituals.filter((r) => r.active);
  const completedRitualIds = new Set(completions.map((c) => c.ritual_id));
  const completedCount = activeRituals.filter((r) => completedRitualIds.has(r.id)).length;

  return (
    <div className="max-w-5xl mx-auto">
      <Header
        title="Personal Growth"
        description="Track your daily rituals, courses, and development"
        action={
          <AddDialog
            title="Add Ritual"
            buttonLabel="Add Ritual"
            fields={[
              { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Morning Meditation' },
              { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What does this ritual involve?' },
              {
                name: 'category',
                label: 'Category',
                type: 'select',
                options: [
                  { value: 'meditation', label: 'Meditation' },
                  { value: 'affirmation', label: 'Affirmation' },
                  { value: 'reflection', label: 'Reflection' },
                  { value: 'exercise', label: 'Exercise' },
                  { value: 'learning', label: 'Learning' },
                ],
              },
            ]}
            onSubmit={async (values) => {
              return addRitual(values.name, values.description || '', values.category || 'reflection');
            }}
          />
        }
      />

      {/* Daily Growth CTA */}
      <Link href="/growth/daily">
        <Card className="mb-6 border-2 border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Sun size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">Start Today&apos;s Growth</h3>
              <p className="text-xs text-amber-700">Your daily rituals and lessons, all in one place</p>
            </div>
            <ArrowRight size={18} className="text-amber-500" />
          </CardContent>
        </Card>
      </Link>

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
                  {completedCount} / {activeRituals.length} completed
                </span>
              </div>
              <Progress value={activeRituals.length > 0 ? (completedCount / activeRituals.length) * 100 : 0} className="h-2" />
            </CardContent>
          </Card>

          {/* Ritual List */}
          {ritualsLoading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : activeRituals.length === 0 ? (
            <p className="text-sm text-slate-400">No rituals yet. Click &quot;Add Ritual&quot; to create one.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeRituals.map((ritual) => {
                const isCompleted = completedRitualIds.has(ritual.id);
                return (
                  <Card key={ritual.id} className={isCompleted ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => toggleCompletion(ritual.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-medium ${isCompleted ? 'line-through' : ''}`}>
                              {ritual.name}
                            </h3>
                            {ritual.category && (
                              <Badge variant="outline" className="text-xs">
                                {ritual.category}
                              </Badge>
                            )}
                          </div>
                          {ritual.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{ritual.description}</p>
                          )}
                          <div className="flex items-center gap-1 mt-2">
                            <Flame size={12} className="text-orange-500" />
                            <span className="text-xs text-orange-600 font-medium">
                              {ritual.frequency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses">
          {coursesLoading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-slate-400">No courses yet. Go to <Link href="/growth/courses" className="text-blue-600 underline">Courses</Link> to add one.</p>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <BookOpen size={14} className="text-teal-500" />
                          {course.title}
                        </h3>
                        {course.description && (
                          <p className="text-xs text-slate-500">{course.description}</p>
                        )}
                        {course.source_type && (
                          <Badge variant="outline" className="text-xs mt-1">{course.source_type}</Badge>
                        )}
                      </div>
                      <Link href={`/growth/courses/${course.id}`}>
                        <button className="text-sm text-blue-600 hover:underline">Continue</button>
                      </Link>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={0}
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {course.total_segments} segments
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="streaks">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target size={16} className="text-blue-500" />
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                You have {activeRituals.length} active rituals and completed {completedCount} today.
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Streak tracking with heatmap will be available as you build more completion history.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
