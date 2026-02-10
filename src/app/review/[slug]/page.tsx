'use client';

import { use } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, BookOpen, HelpCircle, Mic } from 'lucide-react';
import Link from 'next/link';
import { useResearchDocument, usePipeline } from '@/lib/hooks';
import PracticeTimer from '@/components/PracticeTimer';

export default function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { doc, loading } = useResearchDocument(slug);
  const { items: pipelineItems } = usePipeline();

  // Find matching pipeline item
  const pipelineItem = pipelineItems.find((p) => p.document_slug === slug);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
        </Link>
        <p className="text-sm text-slate-500 mt-4">Document not found.</p>
      </div>
    );
  }

  // Extract sections from markdown content
  const content = doc.content || '';

  // Extract outline section
  const outlineMatch = content.match(/## (?:OUTLINE|Outline|outline)[\s\S]*?(?=\n## |\n# |$)/i);
  const outlineContent = outlineMatch ? outlineMatch[0] : null;

  // Extract questions section
  const questionsMatch = content.match(/## (?:QUESTIONS|Questions to Ask|QUESTIONS TO ASK)[\s\S]*?(?=\n## |\n# |$)/i);
  const questionsContent = questionsMatch ? questionsMatch[0] : null;

  // Extract stories (look for story markers or ### Story sections)
  const storyMatches = content.match(/(?:### (?:Story|STORY|Personal Story)[^\n]*\n[\s\S]*?(?=\n### |\n## |\n# |$))/gi);
  const storiesContent = storyMatches ? storyMatches.join('\n\n') : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">{doc.title}</h1>
        {pipelineItem?.target_date && (
          <p className="text-sm text-slate-500 mt-1">
            Scheduled: {new Date(pipelineItem.target_date).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </p>
        )}
      </div>

      <Tabs defaultValue="full">
        <TabsList className="mb-4">
          <TabsTrigger value="full" className="flex items-center gap-1">
            <FileText size={14} /> Full
          </TabsTrigger>
          {outlineContent && (
            <TabsTrigger value="outline" className="flex items-center gap-1">
              <FileText size={14} /> Outline
            </TabsTrigger>
          )}
          {storiesContent && (
            <TabsTrigger value="stories" className="flex items-center gap-1">
              <BookOpen size={14} /> Stories
            </TabsTrigger>
          )}
          {questionsContent && (
            <TabsTrigger value="questions" className="flex items-center gap-1">
              <HelpCircle size={14} /> Questions
            </TabsTrigger>
          )}
          <TabsTrigger value="practice" className="flex items-center gap-1">
            <Mic size={14} /> Practice
          </TabsTrigger>
        </TabsList>

        {/* Full content */}
        <TabsContent value="full">
          <Card>
            <CardContent className="p-6 prose prose-sm max-w-none">
              <MarkdownContent content={content} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outline */}
        {outlineContent && (
          <TabsContent value="outline">
            <Card>
              <CardContent className="p-6 prose prose-sm max-w-none">
                <MarkdownContent content={outlineContent} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Stories */}
        {storiesContent && (
          <TabsContent value="stories">
            <Card>
              <CardContent className="p-6 prose prose-sm max-w-none">
                <MarkdownContent content={storiesContent} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Questions */}
        {questionsContent && (
          <TabsContent value="questions">
            <Card>
              <CardContent className="p-6 prose prose-sm max-w-none">
                <MarkdownContent content={questionsContent} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Practice */}
        <TabsContent value="practice">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <PracticeTimer pipelineId={pipelineItem?.id} />
            </div>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-500" />
                  Reference
                </h3>
                <div className="prose prose-xs max-w-none text-xs max-h-[500px] overflow-y-auto">
                  <MarkdownContent content={outlineContent || content} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple markdown renderer — renders basic markdown as HTML
function MarkdownContent({ content }: { content: string }) {
  const html = content
    .split('\n')
    .map((line) => {
      // Headers
      if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
      // Bold
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Italic
      line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
      // Lists
      if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
      if (/^\d+\.\s/.test(line)) return `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
      // Blockquote
      if (line.startsWith('> ')) return `<blockquote>${line.slice(2)}</blockquote>`;
      // Empty line
      if (!line.trim()) return '<br/>';
      // Regular paragraph
      return `<p>${line}</p>`;
    })
    .join('\n');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
