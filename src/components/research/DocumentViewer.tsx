'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { Components } from 'react-markdown';

interface DocumentViewerProps {
  content: string;
  selectedSection: string | null;
  onSelectSection: (id: string) => void;
  commentCounts: Record<string, number>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function DocumentViewer({
  content,
  selectedSection,
  onSelectSection,
  commentCounts,
}: DocumentViewerProps) {
  const components: Components = {
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-slate-900 mb-4 mt-6">
        {children}
      </h1>
    ),
    h2: ({ children }) => {
      const text = String(children);
      const id = slugify(text);
      const count = commentCounts[id] || 0;
      const isSelected = selectedSection === id;

      return (
        <div
          id={id}
          className={cn(
            'group flex items-center gap-2 mt-8 mb-3 -mx-3 px-3 py-1 rounded cursor-pointer transition-colors',
            isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-slate-50'
          )}
          onClick={() => onSelectSection(id)}
        >
          <h2 className="text-xl font-bold text-slate-800 flex-1">{children}</h2>
          {count > 0 && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <MessageSquare size={10} />
              {count}
            </Badge>
          )}
          <button className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 transition-opacity">
            + Comment
          </button>
        </div>
      );
    },
    h3: ({ children }) => {
      const text = String(children);
      const id = slugify(text);
      const count = commentCounts[id] || 0;
      const isSelected = selectedSection === id;

      return (
        <div
          id={id}
          className={cn(
            'group flex items-center gap-2 mt-6 mb-2 -mx-2 px-2 py-0.5 rounded cursor-pointer transition-colors',
            isSelected ? 'bg-blue-50 border-l-3 border-blue-400' : 'hover:bg-slate-50'
          )}
          onClick={() => onSelectSection(id)}
        >
          <h3 className="text-lg font-semibold text-slate-700 flex-1">{children}</h3>
          {count > 0 && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <MessageSquare size={10} />
              {count}
            </Badge>
          )}
        </div>
      );
    },
    p: ({ children }) => (
      <p className="text-sm text-slate-700 mb-3 leading-relaxed">{children}</p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-slate-900">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-slate-600">{children}</em>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-slate-300 pl-4 py-1 my-3 text-slate-500 italic">
        {children}
      </blockquote>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
    ),
    li: ({ children }) => (
      <li className="text-sm text-slate-700">{children}</li>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse border border-slate-200 rounded">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-slate-100">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-700">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-slate-200 px-3 py-2 text-xs text-slate-600">
        {children}
      </td>
    ),
    hr: () => <hr className="my-6 border-slate-200" />,
    code: ({ children }) => (
      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-700 font-mono">
        {children}
      </code>
    ),
  };

  return (
    <Card>
      <CardContent className="p-6 prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}
