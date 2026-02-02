'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, MessageSquare, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Demo data - will be replaced with Supabase
const demoDocuments = [
  {
    id: '1',
    title: 'Kiddush on Friday Night',
    slug: 'kiddush-friday-night',
    category: 'mitzvah',
    status: 'complete',
    commentCount: 12,
    updated_at: '2025-12-15',
  },
  {
    id: '2',
    title: 'Shabbos Candles',
    slug: 'shabbos-candles',
    category: 'mitzvah',
    status: 'research',
    commentCount: 3,
    updated_at: '2025-12-10',
  },
  {
    id: '3',
    title: 'Tefillin',
    slug: 'tefillin',
    category: 'mitzvah',
    status: 'research',
    commentCount: 0,
    updated_at: '2025-12-08',
  },
  {
    id: '4',
    title: 'Tzitzis',
    slug: 'tzitzis',
    category: 'mitzvah',
    status: 'research',
    commentCount: 0,
    updated_at: '2025-12-05',
  },
  {
    id: '5',
    title: 'Concept of Shabbos',
    slug: 'concept-of-shabbos',
    category: 'mitzvah',
    status: 'research',
    commentCount: 0,
    updated_at: '2025-12-01',
  },
  {
    id: '6',
    title: 'Beshalach - Pharaoh Sent Them',
    slug: 'beshalach-pharaoh-sent',
    category: 'draft',
    status: 'draft',
    commentCount: 5,
    updated_at: '2025-11-20',
  },
  {
    id: '7',
    title: 'Afterlife',
    slug: 'afterlife',
    category: 'course',
    status: 'research',
    commentCount: 0,
    updated_at: '2025-11-15',
  },
];

const statusColors: Record<string, string> = {
  research: 'bg-blue-100 text-blue-800',
  prep: 'bg-yellow-100 text-yellow-800',
  session: 'bg-orange-100 text-orange-800',
  draft: 'bg-purple-100 text-purple-800',
  complete: 'bg-green-100 text-green-800',
};

const categoryIcons: Record<string, string> = {
  mitzvah: 'Mitzvah',
  course: 'Course',
  draft: 'Draft',
  speech: 'Speech',
};

export default function ResearchPage() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = demoDocuments.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <Header
        title="Research Documents"
        description="Your research, prep, and session documents"
        action={
          <Button size="sm">
            <Plus size={16} className="mr-1" /> New Document
          </Button>
        }
      />

      {/* Filters */}
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
          {['all', 'mitzvah', 'course', 'draft'].map((cat) => (
            <Button
              key={cat}
              variant={filterCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'all' ? 'All' : categoryIcons[cat] || cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <Link key={doc.id} href={`/research/${doc.slug}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base leading-snug">
                    {doc.title}
                  </CardTitle>
                  <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={statusColors[doc.status] || ''} variant="secondary">
                    {doc.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {categoryIcons[doc.category] || doc.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {doc.commentCount} comments
                  </span>
                  <span>Updated {doc.updated_at}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
