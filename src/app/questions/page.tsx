'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useQuestions } from '@/lib/hooks';
import AddDialog from '@/components/AddDialog';

export default function QuestionsPage() {
  const { questions, loading, addQuestion } = useQuestions();
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  const allTags = [...new Set(questions.flatMap((q) => q.tags || []))];

  const filtered = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.context || '').toLowerCase().includes(search.toLowerCase());
    const matchesTag = filterTag === 'all' || (q.tags || []).includes(filterTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Question Bank"
        description="Crafted questions that feel natural, not preachy"
        action={
          <AddDialog
            title="Add Question"
            buttonLabel="Add Question"
            fields={[
              { name: 'question', label: 'Question', type: 'textarea', required: true, placeholder: 'The question...' },
              { name: 'context', label: 'Context / When to use', type: 'textarea', placeholder: 'Setup, when this question works well...' },
              { name: 'tags', label: 'Tags (comma separated)', type: 'text', placeholder: 'hashkafa, opener, relatable' },
              { name: 'topics', label: 'Topics (comma separated)', type: 'text', placeholder: 'free-will, shabbos, values' },
            ]}
            onSubmit={async (values) => {
              return addQuestion(
                values.question,
                values.context || '',
                values.tags ? values.tags.split(',').map((t) => t.trim()) : [],
                values.topics ? values.topics.split(',').map((t) => t.trim()) : []
              );
            }}
          />
        }
      />

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilterTag('all')} className={`px-2 py-1 text-xs rounded ${filterTag === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>All</button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setFilterTag(tag)} className={`px-2 py-1 text-xs rounded ${filterTag === tag ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>{tag}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">No questions yet. Click &quot;Add Question&quot; to add one.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <Card key={q.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">&ldquo;{q.question}&rdquo;</h3>
                    {q.context && <p className="text-xs text-slate-500 mb-2">{q.context}</p>}
                    <div className="flex flex-wrap gap-1">
                      {(q.topics || []).map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
