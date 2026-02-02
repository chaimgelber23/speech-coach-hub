'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTasks } from '@/lib/hooks';
import AddDialog from '@/components/AddDialog';

const priorityColors = {
  high: 'border-red-300 text-red-700',
  medium: 'border-yellow-300 text-yellow-700',
  low: 'border-slate-300 text-slate-500',
};

export default function TasksPage() {
  const { tasks, loading, addTask, toggleDone, deleteTask } = useTasks();
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

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Tasks"
        description="Track what needs to get done"
        action={
          <AddDialog
            title="New Task"
            buttonLabel="Add Task"
            fields={[
              { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'What needs to be done?' },
              { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Details...' },
              {
                name: 'priority',
                label: 'Priority',
                type: 'select',
                options: [
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ],
              },
              {
                name: 'category',
                label: 'Category',
                type: 'select',
                options: [
                  { value: 'prep', label: 'Prep' },
                  { value: 'practice', label: 'Practice' },
                  { value: 'growth', label: 'Growth' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'personal', label: 'Personal' },
                ],
              },
              { name: 'due_date', label: 'Due Date', type: 'date' },
            ]}
            onSubmit={async (values) => {
              return addTask(
                values.title,
                (values.priority || 'medium') as 'low' | 'medium' | 'high',
                values.category || 'prep',
                values.description,
                values.due_date || undefined
              );
            }}
          />
        }
      />

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

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">No tasks. Click &quot;Add Task&quot; to create one.</p>
      ) : (
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
                      <h3 className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </h3>
                      <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </Badge>
                      {task.category && (
                        <Badge variant="outline" className="text-xs">{task.category}</Badge>
                      )}
                    </div>
                    {task.description && <p className="text-xs text-slate-500">{task.description}</p>}
                    {task.due_date && <p className="text-xs text-slate-400 mt-1">Due: {task.due_date}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
