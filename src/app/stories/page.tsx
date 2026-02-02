'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, BookOpen } from 'lucide-react';
import { useState } from 'react';

const demoStories = [
  {
    id: '1',
    title: 'The Taxi Driver in Jerusalem',
    content: 'A personal experience with a taxi driver who taught me about emunah through his simple faith...',
    tags: ['personal', 'emunah'],
    source: 'personal',
    topics: ['faith', 'everyday-life'],
    used_in: ['Kiddush Friday Night'],
  },
  {
    id: '2',
    title: 'Grandfather\'s Shabbos Table',
    content: 'Growing up, my grandfather\'s Shabbos table was the center of the family...',
    tags: ['personal', 'family'],
    source: 'personal',
    topics: ['shabbos', 'family', 'tradition'],
    used_in: [],
  },
  {
    id: '3',
    title: 'The Chofetz Chaim and the Soldier',
    content: 'A famous story about the Chofetz Chaim hosting a soldier who didn\'t know who he was...',
    tags: ['chazal', 'chesed'],
    source: 'chazal',
    topics: ['chesed', 'humility'],
    used_in: [],
  },
  {
    id: '4',
    title: 'First Time Putting on Tefillin',
    content: 'My first real experience putting on tefillin as a baal teshuva...',
    tags: ['personal', 'growth'],
    source: 'personal',
    topics: ['tefillin', 'teshuva', 'growth'],
    used_in: ['Tefillin Research'],
  },
];

const sourceColors: Record<string, string> = {
  personal: 'bg-blue-100 text-blue-800',
  chazal: 'bg-purple-100 text-purple-800',
  heard: 'bg-green-100 text-green-800',
  book: 'bg-orange-100 text-orange-800',
};

export default function StoriesPage() {
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  const allTags = [...new Set(demoStories.flatMap((s) => s.tags))];

  const filtered = demoStories.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = filterTag === 'all' || s.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Story Bank"
        description="Your collection of personal and borrowed stories"
        action={
          <Button size="sm">
            <Plus size={16} className="mr-1" /> Add Story
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
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

      {/* Story Cards */}
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
              <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                {story.content}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge className={sourceColors[story.source || 'personal']} variant="secondary">
                  {story.source}
                </Badge>
                {story.topics.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
              {story.used_in.length > 0 && (
                <p className="text-xs text-slate-400">
                  Used in: {story.used_in.join(', ')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
