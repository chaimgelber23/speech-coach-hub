'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useStories } from '@/lib/hooks';
import AddDialog from '@/components/AddDialog';
import Link from 'next/link';

const sourceColors: Record<string, string> = {
  personal: 'bg-blue-100 text-blue-800',
  chazal: 'bg-purple-100 text-purple-800',
  heard: 'bg-green-100 text-green-800',
  book: 'bg-orange-100 text-orange-800',
};

export default function StoriesPage() {
  const { stories, loading, addStory } = useStories();
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  const allTags = [...new Set(stories.flatMap((s) => s.tags || []))];

  const filtered = stories.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = filterTag === 'all' || (s.tags || []).includes(filterTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Story Bank"
        description="Your collection of personal and borrowed stories"
        action={
          <div className="flex gap-2">
            <Link href="/stories/capture">
              <Button variant="outline" size="sm">
                <Sparkles size={14} className="mr-1" />
                Daily Capture
              </Button>
            </Link>
            <AddDialog
            title="Add Story"
            buttonLabel="Add Story"
            fields={[
              { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Story name' },
              { name: 'content', label: 'Story', type: 'textarea', required: true, placeholder: 'Write the story...' },
              {
                name: 'source',
                label: 'Source',
                type: 'select',
                options: [
                  { value: 'personal', label: 'Personal' },
                  { value: 'heard', label: 'Heard' },
                  { value: 'book', label: 'Book' },
                  { value: 'chazal', label: 'Chazal' },
                ],
              },
              { name: 'tags', label: 'Tags (comma separated)', type: 'text', placeholder: 'personal, growth, family' },
              { name: 'topics', label: 'Topics (comma separated)', type: 'text', placeholder: 'shabbos, emunah, chesed' },
            ]}
            onSubmit={async (values) => {
              return addStory(
                values.title,
                values.content,
                values.tags ? values.tags.split(',').map((t) => t.trim()) : [],
                values.source || 'personal',
                values.topics ? values.topics.split(',').map((t) => t.trim()) : []
              );
            }}
          />
          </div>
        }
      />

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search stories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
        <p className="text-sm text-slate-400">No stories yet. Click &quot;Add Story&quot; to add one.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((story) => (
            <Card key={story.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen size={14} className="text-slate-400" />
                  {story.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 line-clamp-3 mb-3">{story.content}</p>
                <div className="flex flex-wrap gap-1">
                  {story.source && (
                    <Badge className={sourceColors[story.source] || ''} variant="secondary">{story.source}</Badge>
                  )}
                  {(story.topics || []).map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
