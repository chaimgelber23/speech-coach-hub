'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SectionNavProps {
  content: string;
  selectedSection: string | null;
  onSelectSection: (id: string) => void;
  commentCounts: Record<string, number>;
}

interface NavItem {
  id: string;
  title: string;
  level: number;
}

function parseHeadings(content: string): NavItem[] {
  const lines = content.split('\n');
  const headings: NavItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      headings.push({ id, title, level });
    }
  }

  return headings;
}

export default function SectionNav({
  content,
  selectedSection,
  onSelectSection,
  commentCounts,
}: SectionNavProps) {
  const headings = parseHeadings(content);

  return (
    <div className="sticky top-6">
      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">
        Contents
      </h3>
      <nav className="space-y-0.5">
        {headings.map((heading) => {
          const count = commentCounts[heading.id] || 0;
          const isSelected = selectedSection === heading.id;

          return (
            <button
              key={heading.id}
              onClick={() => {
                onSelectSection(heading.id);
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
              className={cn(
                'w-full text-left text-xs py-1.5 px-2 rounded transition-colors flex items-center gap-1',
                heading.level === 3 ? 'pl-5' : '',
                isSelected
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <span className="truncate flex-1">
                {heading.title.length > 28
                  ? heading.title.substring(0, 28) + '...'
                  : heading.title}
              </span>
              {count > 0 && (
                <Badge variant="secondary" className="text-xs h-4 px-1 min-w-[18px] justify-center">
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
