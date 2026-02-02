'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const demoQuestions = [
  {
    id: '1',
    question: 'If God knows the future, do we really have free will?',
    context: 'Great opener for hashkafa discussions. Feels natural — people wonder this on their own.',
    tags: ['hashkafa', 'opener'],
    topics: ['free-will', 'divine-knowledge'],
    used_in: [],
  },
  {
    id: '2',
    question: 'Why does the Torah start with Bereishis and not with the first mitzvah?',
    context: 'Rashi\'s famous question. Good for showing how Torah anticipates questions.',
    tags: ['parsha', 'classic'],
    topics: ['bereishis', 'torah-structure'],
    used_in: ['Bereishis Shiur'],
  },
  {
    id: '3',
    question: 'What would you grab if you only had 30 seconds to leave your house?',
    context: 'Setup for values discussion. Leads naturally into what matters most.',
    tags: ['relatable', 'values'],
    topics: ['priorities', 'values'],
    used_in: [],
  },
  {
    id: '4',
    question: 'Have you ever done something meaningful that nobody else saw?',
    context: 'Opens up discussion about intrinsic motivation vs. external validation.',
    tags: ['personal', 'relatable'],
    topics: ['motivation', 'sincerity'],
    used_in: [],
  },
  {
    id: '5',
    question: 'Why do we specifically sanctify Shabbos with wine?',
    context: 'Natural question for Kiddush teaching. Leads to understanding wine symbolism.',
    tags: ['mitzvah', 'kiddush'],
    topics: ['shabbos', 'kiddush', 'symbolism'],
    used_in: ['Kiddush Friday Night'],
  },
];

export default function QuestionsPage() {
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  const allTags = [...new Set(demoQuestions.flatMap((q) => q.tags))];

  const filtered = demoQuestions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.context.toLowerCase().includes(search.toLowerCase());
    const matchesTag = filterTag === 'all' || q.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Question Bank"
        description="Crafted questions that feel natural, not preachy"
        action={
          <Button size="sm">
            <Plus size={16} className="mr-1" /> Add Question
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button
            variant={filterTag === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterTag('all')}
          >
            All
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={filterTag === tag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {filtered.map((q) => (
          <Card key={q.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <HelpCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    &ldquo;{q.question}&rdquo;
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">{q.context}</p>
                  <div className="flex flex-wrap gap-1">
                    {q.topics.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                    {q.used_in.length > 0 && (
                      <span className="text-xs text-slate-400 ml-2">
                        Used in: {q.used_in.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
