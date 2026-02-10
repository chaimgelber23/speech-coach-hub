'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useTopicGroups, createResearchDocument } from '@/lib/hooks';
import { FILE_TYPE_LABELS } from '@/types';
import AddDialog from '@/components/AddDialog';
import { cn } from '@/lib/utils';

const STAGES = ['research', 'prep', 'session', 'practice', 'complete'] as const;

const stageConfig: Record<string, { dot: string; activeBg: string }> = {
  research: { dot: 'bg-blue-400', activeBg: 'bg-blue-50 text-blue-700 ring-blue-200' },
  prep: { dot: 'bg-yellow-400', activeBg: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
  session: { dot: 'bg-orange-400', activeBg: 'bg-orange-50 text-orange-700 ring-orange-200' },
  practice: { dot: 'bg-cyan-400', activeBg: 'bg-cyan-50 text-cyan-700 ring-cyan-200' },
  complete: { dot: 'bg-green-400', activeBg: 'bg-green-50 text-green-700 ring-green-200' },
};

const categoryConfig: Record<string, { label: string; accent: string; bg: string }> = {
  mitzvah: { label: 'Mitzvah', accent: 'border-l-purple-400', bg: 'text-purple-600' },
  course: { label: 'Course', accent: 'border-l-green-400', bg: 'text-green-600' },
  draft: { label: 'Draft', accent: 'border-l-slate-400', bg: 'text-slate-600' },
  speech: { label: 'Speech', accent: 'border-l-orange-400', bg: 'text-orange-600' },
  parsha: { label: 'Parsha', accent: 'border-l-amber-400', bg: 'text-amber-600' },
};

export default function ResearchPage() {
  const { groups, loading, refetch } = useTopicGroups();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterParsha, setFilterParsha] = useState<string>('all');

  // Count topics per category for filter badges
  const categoryCounts: Record<string, number> = { all: groups.length };
  for (const g of groups) {
    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
  }

  // Extract unique parsha names from topic_slug for parsha-category groups
  const parshaGroups = groups.filter((g) => g.category === 'parsha');
  const parshaNames = [...new Set(parshaGroups.map((g) => {
    // topic_slug format: "mishpatim-higher-levels" → extract first word as parsha name
    const slug = g.topicSlug || '';
    const firstWord = slug.split('-')[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  }))].filter(Boolean).sort();

  const filtered = groups.filter((group) => {
    const matchesSearch =
      group.title.toLowerCase().includes(search.toLowerCase()) ||
      group.documents.some((d) => d.title.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || group.category === filterCategory;
    const matchesParsha = filterCategory !== 'parsha' || filterParsha === 'all' ||
      (group.topicSlug || '').toLowerCase().startsWith(filterParsha.toLowerCase());
    return matchesSearch && matchesCategory && matchesParsha;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <Header
        title="Torah Library"
        description="Your parsha, mitzvos, speeches, courses, and drafts"
        action={
          <AddDialog
            title="New Document"
            buttonLabel="New Document"
            fields={[
              { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Shabbos Candles' },
              {
                name: 'category',
                label: 'Category',
                type: 'select',
                required: true,
                options: [
                  { value: 'parsha', label: 'Parsha' },
                  { value: 'mitzvah', label: 'Mitzvah' },
                  { value: 'speech', label: 'Speech' },
                  { value: 'course', label: 'Course' },
                ],
              },
            ]}
            onSubmit={async (values) => {
              const { error } = await createResearchDocument(
                values.title,
                values.category as 'mitzvah' | 'course' | 'draft' | 'speech' | 'parsha'
              );
              if (!error) refetch();
              return { error };
            }}
          />
        }
      />

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['all', 'parsha', 'mitzvah', 'speech', 'course', 'draft'].map((cat) => {
            const count = categoryCounts[cat] || 0;
            const config = categoryConfig[cat];
            return (
              <Button
                key={cat}
                variant={filterCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setFilterCategory(cat); if (cat !== 'parsha') setFilterParsha('all'); }}
                className="gap-1.5"
              >
                {cat === 'all' ? 'All' : config?.label || cat}
                <span className={cn(
                  'text-xs rounded-full px-1.5 min-w-[1.25rem] text-center',
                  filterCategory === cat ? 'bg-white/20' : 'bg-slate-100'
                )}>
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Parsha sub-filter */}
      {filterCategory === 'parsha' && parshaNames.length > 1 && (
        <div className="flex gap-1.5 flex-wrap mb-6">
          <Button
            variant={filterParsha === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterParsha('all')}
            className="h-7 text-xs"
          >
            All Parsha
          </Button>
          {parshaNames.map((name) => (
            <Button
              key={name}
              variant={filterParsha === name.toLowerCase() ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterParsha(name.toLowerCase())}
              className="h-7 text-xs"
            >
              {name}
            </Button>
          ))}
        </div>
      )}

      {/* Document Grid */}
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">No documents yet. Click &quot;New Document&quot; to create one.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group) => {
            const primaryDoc = group.documents.find((d) => d.status === 'research') || group.documents[0];
            const catConfig = categoryConfig[group.category];
            const existingStatuses = new Set(group.documents.map((d) => d.status));
            // Find the furthest stage reached
            const furthestStage = [...STAGES].reverse().find((s) => existingStatuses.has(s)) || 'research';

            return (
              <Link key={group.topicSlug} href={`/research/${primaryDoc.slug}`}>
                <Card className={cn(
                  'hover:shadow-md transition-shadow cursor-pointer h-full border-l-4',
                  catConfig?.accent || 'border-l-slate-300'
                )}>
                  <CardContent className="pt-4 pb-3">
                    {/* Category label */}
                    <span className={cn('text-[11px] font-medium uppercase tracking-wide', catConfig?.bg || 'text-slate-500')}>
                      {catConfig?.label || group.category}
                    </span>

                    {/* Title */}
                    <h3 className="text-[15px] font-semibold text-slate-900 mt-1 mb-3 leading-snug">
                      {group.title}
                    </h3>

                    {/* Stage progress stepper */}
                    <div className="flex items-center gap-1 mb-3">
                      {STAGES.map((stage, i) => {
                        const hasStage = existingStatuses.has(stage);
                        return (
                          <div key={stage} className="flex items-center gap-1 flex-1">
                            <div className={cn(
                              'flex items-center justify-center rounded-full text-[10px] font-medium px-2 py-0.5 w-full transition-colors',
                              hasStage
                                ? `${stageConfig[stage].activeBg} ring-1`
                                : 'bg-slate-50 text-slate-300'
                            )}>
                              {FILE_TYPE_LABELS[stage]?.[0] || stage[0].toUpperCase()}
                            </div>
                            {i < STAGES.length - 1 && (
                              <div className={cn(
                                'w-1 h-px shrink-0',
                                hasStage ? stageConfig[stage].dot : 'bg-slate-200'
                              )} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {new Date(group.updated_at).toLocaleDateString()}
                      </span>
                      <span className={cn(
                        'text-[11px] font-medium',
                        stageConfig[furthestStage]?.activeBg?.split(' ')[1] || 'text-slate-500'
                      )}>
                        {FILE_TYPE_LABELS[furthestStage] || furthestStage}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
