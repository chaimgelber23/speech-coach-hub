'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Flame,
  BookOpen,
  Target,
  ArrowRight,
  Sun,
  Plus,
  BarChart3,
  Pause,
  CheckCircle2,
  Play,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  useRituals,
  useRitualCompletions,
  useCourses,
  useGoals,
  usePracticeLogs,
  useStoryCaptures,
  useReflectionHistory,
  useDeliveryJournal,
} from '@/lib/hooks';
import { GOAL_CATEGORIES } from '@/types';
import type { Goal } from '@/types';
import AddDialog from '@/components/AddDialog';
import { useState } from 'react';

export default function GrowthPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { rituals, loading: ritualsLoading, addRitual } = useRituals();
  const { completions, toggleCompletion } = useRitualCompletions(today);
  const { data: courses, loading: coursesLoading } = useCourses();
  const { goals, activeGoals, loading: goalsLoading, addGoal, updateGoalStatus } = useGoals();
  const { logs: practiceLogs } = usePracticeLogs();
  const { stats: captureStats, captures } = useStoryCaptures();
  const { reflections } = useReflectionHistory(7);
  const { entries: deliveryEntries } = useDeliveryJournal();

  const activeRituals = rituals.filter((r) => r.active);
  const completedRitualIds = new Set(completions.map((c) => c.ritual_id));
  const completedCount = activeRituals.filter((r) => completedRitualIds.has(r.id)).length;

  // Weekly stats for Review tab
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const practiceThisWeek = practiceLogs.filter((l) => new Date(l.date) >= weekAgo);
  const capturesThisWeek = captures.filter((c) => new Date(c.captured_date) >= weekAgo);
  const deliveriesThisWeek = deliveryEntries.filter((e) => new Date(e.date) >= weekAgo);
  const totalPracticeMinutes = practiceThisWeek.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);

  // Goal dialog state
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'spiritual' as Goal['category'], description: '', target_date: '' });

  async function handleAddGoal() {
    if (!newGoal.title.trim()) return;
    await addGoal(newGoal.title, newGoal.category, newGoal.description || undefined, newGoal.target_date || undefined);
    setNewGoal({ title: '', category: 'spiritual', description: '', target_date: '' });
    setGoalDialogOpen(false);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Header
        title="Personal Growth"
        description="Track your daily rituals, goals, and development"
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
              <p className="text-xs text-amber-700">Your daily rituals, lessons, and evening reflection</p>
            </div>
            <ArrowRight size={18} className="text-amber-500" />
          </CardContent>
        </Card>
      </Link>

      <Tabs defaultValue="rituals">
        <TabsList className="mb-6">
          <TabsTrigger value="rituals">Daily Rituals</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="review">Weekly Review</TabsTrigger>
        </TabsList>

        {/* ===== RITUALS TAB ===== */}
        <TabsContent value="rituals">
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

        {/* ===== COURSES TAB ===== */}
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
                      <Progress value={0} className="flex-1 h-2" />
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

        {/* ===== GOALS TAB ===== */}
        <TabsContent value="goals">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
            </p>
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-1" /> Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-title">What do you want to work on?</Label>
                    <Input
                      id="goal-title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="e.g. Work on patience"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(v) => setNewGoal({ ...newGoal, category: v as Goal['category'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.key} value={cat.key}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-desc">Description (optional)</Label>
                    <Textarea
                      id="goal-desc"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      placeholder="What does this goal mean to you?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-date">Target Date (optional)</Label>
                    <Input
                      id="goal-date"
                      type="date"
                      value={newGoal.target_date}
                      onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setGoalDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddGoal} disabled={!newGoal.title.trim()}>Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {goalsLoading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : goals.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Target size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  No goals yet. What do you want to work on?
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Goals help you focus your daily reflections and track real growth.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => {
                const cat = GOAL_CATEGORIES.find((c) => c.key === goal.category);
                const daysActive = Math.floor(
                  (Date.now() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <Card
                    key={goal.id}
                    className={goal.status === 'paused' ? 'opacity-60' : goal.status === 'completed' ? 'opacity-50 border-green-200' : ''}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {goal.status === 'completed' ? (
                            <CheckCircle2 size={18} className="text-green-500" />
                          ) : goal.status === 'paused' ? (
                            <Pause size={18} className="text-slate-400" />
                          ) : (
                            <Target size={18} className="text-rose-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-sm font-semibold ${goal.status === 'completed' ? 'line-through' : ''}`}>
                              {goal.title}
                            </h3>
                            {cat && (
                              <Badge variant="outline" className={`text-xs ${cat.color}`}>
                                {cat.label}
                              </Badge>
                            )}
                          </div>
                          {goal.description && (
                            <p className="text-xs text-slate-500 mt-1">{goal.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span>{daysActive} day{daysActive !== 1 ? 's' : ''} active</span>
                            {goal.target_date && (
                              <span>Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {goal.status === 'active' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateGoalStatus(goal.id, 'paused')}
                                title="Pause"
                              >
                                <Pause size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateGoalStatus(goal.id, 'completed')}
                                title="Complete"
                              >
                                <CheckCircle2 size={14} />
                              </Button>
                            </>
                          )}
                          {goal.status === 'paused' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateGoalStatus(goal.id, 'active')}
                              title="Resume"
                            >
                              <Play size={14} />
                            </Button>
                          )}
                          {goal.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateGoalStatus(goal.id, 'active')}
                              title="Reopen"
                            >
                              <Target size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ===== WEEKLY REVIEW TAB ===== */}
        <TabsContent value="review">
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-500" />
                This Week&apos;s Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-700">
                    {completedCount}/{activeRituals.length}
                  </p>
                  <p className="text-xs text-amber-600">Rituals Today</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">
                    {practiceThisWeek.length}
                  </p>
                  <p className="text-xs text-purple-600">
                    Practice Sessions ({totalPracticeMinutes} min)
                  </p>
                </div>
                <div className="text-center p-3 bg-teal-50 rounded-lg">
                  <p className="text-2xl font-bold text-teal-700">
                    {capturesThisWeek.length}
                  </p>
                  <p className="text-xs text-teal-600">Stories Captured</p>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-700">
                    {reflections.length}
                  </p>
                  <p className="text-xs text-indigo-600">Reflections Written</p>
                </div>
                <div className="text-center p-3 bg-rose-50 rounded-lg">
                  <p className="text-2xl font-bold text-rose-700">
                    {activeGoals.length}
                  </p>
                  <p className="text-xs text-rose-600">Active Goals</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">
                    {deliveriesThisWeek.length}
                  </p>
                  <p className="text-xs text-green-600">Talks Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reflection themes from this week */}
          {reflections.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">This Week&apos;s Reflections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reflections.map((r) => (
                  <div key={r.id} className="border-l-2 border-indigo-200 pl-3">
                    <p className="text-xs text-slate-400 mb-1">
                      {format(new Date(r.date), 'EEEE, MMM d')}
                    </p>
                    {r.wins && (
                      <p className="text-xs text-green-700">
                        <span className="font-medium">Wins:</span> {r.wins.slice(0, 100)}{r.wins.length > 100 ? '...' : ''}
                      </p>
                    )}
                    {r.tomorrow_focus && (
                      <p className="text-xs text-blue-700">
                        <span className="font-medium">Focus:</span> {r.tomorrow_focus}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
