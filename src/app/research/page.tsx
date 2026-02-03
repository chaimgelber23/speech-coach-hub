'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useTopicGroups, createResearchDocument } from '@/lib/hooks';
import { FILE_TYPE_LABELS } from '@/types';
import AddDialog from '@/components/AddDialog';

const statusColors: Record<string, string> = {
  research: 'bg-blue-100 text-blue-800',
  prep: 'bg-yellow-100 text-yellow-800',
  session: 'bg-orange-100 text-orange-800',
  practice: 'bg-cyan-100 text-cyan-800',
  complete: 'bg-green-100 text-green-800',
};

const categoryLabels: Record<string, string> = {
  mitzvah: 'Mitzvah',
  course: 'Course',
  draft: 'Draft',
  speech: 'Speech',
};

export default function ResearchPage() {
  const { groups, loading, refetch } = useTopicGroups();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = groups.filter((group) => {
    const matchesSearch =
      group.title.toLowerCase().includes(search.toLowerCase()) ||
      group.documents.some((d) => d.title.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || group.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <Header
        title="Research Documents"
        description="Your research, prep, and session documents"
        action={
          <AddDialog
            title="New Research Document"
            buttonLabel="New Document"
            fields={[
              { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Shabbos Candles' },
              {
                name: 'category',
                label: 'Category',
                type: 'select',
                required: true,
                options: [
                  { value: 'mitzvah', label: 'Mitzvah' },
                  { value: 'course', label: 'Course' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'speech', label: 'Speech' },
                ],
              },
            ]}
            onSubmit={async (values) => {
              const { error } = await createResearchDocument(
                values.title,
                values.category as 'mitzvah' | 'course' | 'draft' | 'speech'
              );
              if (!error) refetch();
              return { error };
            }}
          />
        }
      />

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'mitzvah', 'course', 'draft', 'speech'].map((cat) => (
            <Button
              key={cat}
              variant={filterCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'all' ? 'All' : categoryLabels[cat] || cat}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">No documents yet. Click &quot;New Document&quot; to create one.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group) => {
            const primaryDoc = group.documents.find((d) => d.status === 'research') || group.documents[0];
            return (
              <Link key={group.topicSlug} href={`/research/${primaryDoc.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base leading-snug">{group.title}</CardTitle>
                      <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[group.category] || group.category}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {group.documents.map((doc) => (
                        <Badge
                          key={doc.id}
                          className={`text-xs ${statusColors[doc.status] || ''}`}
                          variant="secondary"
                        >
                          {FILE_TYPE_LABELS[doc.status] || doc.status}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-slate-500">
                      Updated {new Date(group.updated_at).toLocaleDateString()}
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
