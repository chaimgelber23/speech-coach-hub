'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'done';
  category: string;
}

const demoTasks: TaskItem[] = [
  { id: '1', title: 'Finish Shabbos Candles research', description: 'Complete halachos and machshava sections', due_date: '2026-02-05', priority: 'high', status: 'in_progress', category: 'prep' },
  { id: '2', title: 'Practice Beshalach speech', description: 'Table read and block movements', due_date: '2026-02-07', priority: 'high', status: 'pending', category: 'practice' },
  { id: '3', title: 'Add stories to Kiddush prep', description: 'Personal stories for Step 3 and Step 6', due_date: '2026-02-10', priority: 'medium', status: 'pending', category: 'prep' },
  { id: '4', title: 'Upload self-esteem course notes', description: 'Scan and organize notes from confidence course', due_date: null, priority: 'medium', status: 'pending', category: 'growth' },
  { id: '5', title: 'Set up daily affirmations', description: 'Write out morning affirmation routine', due_date: null, priority: 'low', status: 'pending', category: 'growth' },
  { id: '6', title: 'Review Tefillin research', description: 'Check completeness of sources', due_date: '2026-02-15', priority: 'low', status: 'pending', category: 'prep' },
];

const priorityColors = {
  high: 'border-red-300 text-red-700',
  medium: 'border-yellow-300 text-yellow-700',
  low: 'border-slate-300 text-slate-500',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(demoTasks);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('active');

  const filtered = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
        ? t.status !== 'done'
        : t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  function toggleDone(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'done' ? 'pending' : 'done' as TaskItem['status'] }
          : t
      )
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Tasks"
        description="Track what needs to get done"
        action={
          <Button size="sm">
            <Plus size={16} className="mr-1" /> Add Task
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {['active', 'pending', 'in_progress', 'done', 'all'].map((s) => (
            <Button
              key={s}
              variant={filterStatus === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(s)}
            >
              {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.map((task) => (
          <Card key={task.id} className={task.status === 'done' ? 'opacity-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.status === 'done'}
                  onCheckedChange={() => toggleDone(task.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`text-sm font-medium ${
                        task.status === 'done' ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{task.description}</p>
                  {task.due_date && (
                    <p className="text-xs text-slate-400 mt-1">Due: {task.due_date}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
