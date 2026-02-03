'use client';

import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit3, Eye, BrainCircuit, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DocumentViewer from '@/components/research/DocumentViewer';
import DocumentEditor from '@/components/research/DocumentEditor';
import CommentPanel from '@/components/research/CommentPanel';
import QuizPanel from '@/components/research/QuizPanel';
import SectionNav from '@/components/research/SectionNav';
import { useResearchDocument, useComments, useTopicDocuments } from '@/lib/hooks';
import { FILE_TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

const tabColors: Record<string, string> = {
  research: 'bg-blue-500',
  prep: 'bg-yellow-500',
  session: 'bg-orange-500',
  practice: 'bg-cyan-500',
  complete: 'bg-green-500',
};

export default function ResearchDocPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;

  const { doc, loading, updateContent } = useResearchDocument(slug);
  const {
    comments,
    addComment,
    resolveComment,
  } = useComments(doc?.id || '');
  const { documents: siblingDocs } = useTopicDocuments(doc?.topic_slug || null);

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rightPanel, setRightPanel] = useState<'comments' | 'quiz'>('comments');
  const [sendingToClaude, setSendingToClaude] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const commentPanelRef = useRef<HTMLDivElement>(null);

  const sendToClaude = useCallback(async () => {
    if (!doc || comments.length === 0) return;
    setSendingToClaude(true);
    setSendSuccess(false);
    try {
      const res = await fetch('/api/send-to-claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id, slug: doc.slug }),
      });
      if (res.ok) {
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 3000);
      }
    } catch {
      // silently fail
    } finally {
      setSendingToClaude(false);
    }
  }, [doc, comments]);

  const handleSelectSection = useCallback((id: string) => {
    setSelectedSection(id);
    setRightPanel('comments');
    setTimeout(() => {
      commentPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }, []);

  const sectionCommentCounts: Record<string, number> = {};
  comments
    .filter((c) => !c.resolved)
    .forEach((c) => {
      sectionCommentCounts[c.section_id] = (sectionCommentCounts[c.section_id] || 0) + 1;
    });

  const sectionComments = selectedSection
    ? comments.filter((c) => c.section_id === selectedSection)
    : [];

  // Sort siblings in display order
  const sortedSiblings = [...siblingDocs].sort((a, b) => {
    const order = ['research', 'prep', 'session', 'practice', 'complete'];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });

  if (loading) {
    return (
      <div className="max-w-full mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/research">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
          </Link>
        </div>
        <p className="text-sm text-slate-400">Loading document...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-full mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/research">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
          </Link>
        </div>
        <p className="text-sm text-slate-400">Document not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto">
      {/* Top bar: back + title + actions */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/research">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <Header
            title={doc.title}
            description={FILE_TYPE_LABELS[doc.status] || doc.status}
          />
        </div>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Eye size={16} className="mr-1" /> View Mode
            </>
          ) : (
            <>
              <Edit3 size={16} className="mr-1" /> Edit Mode
            </>
          )}
        </Button>
        <Button
          variant={rightPanel === 'quiz' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRightPanel(rightPanel === 'quiz' ? 'comments' : 'quiz')}
        >
          {rightPanel === 'quiz' ? (
            <>
              <MessageSquare size={16} className="mr-1" /> Comments
            </>
          ) : (
            <>
              <BrainCircuit size={16} className="mr-1" /> Quiz
            </>
          )}
        </Button>
        <Button
          variant={sendSuccess ? 'default' : 'outline'}
          size="sm"
          onClick={sendToClaude}
          disabled={comments.filter((c) => !c.resolved).length === 0 || sendingToClaude}
          title="Send open comments to Claude for review"
          className={sendSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Send size={16} className="mr-1" />
          {sendingToClaude ? 'Sending...' : sendSuccess ? 'Sent!' : 'Send to Claude'}
        </Button>
        <Badge variant="outline">
          {comments.filter((c) => !c.resolved).length} open comments
        </Badge>
      </div>

      {/* File type tabs */}
      {sortedSiblings.length > 1 && (
        <div className="flex gap-1 mb-4 ml-16">
          {sortedSiblings.map((sibling) => {
            const isActive = sibling.slug === slug;
            return (
              <button
                key={sibling.id}
                onClick={() => {
                  if (!isActive) {
                    router.push(`/research/${sibling.slug}`);
                  }
                }}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? `${tabColors[sibling.status] || 'bg-slate-500'} text-white`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {FILE_TYPE_LABELS[sibling.status] || sibling.status}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-4">
        {/* Table of Contents */}
        <div className="w-48 shrink-0 hidden lg:block">
          <SectionNav
            content={doc.content}
            selectedSection={selectedSection}
            onSelectSection={handleSelectSection}
            commentCounts={sectionCommentCounts}
          />
        </div>

        {/* Document Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <DocumentEditor
              content={doc.content}
              onChange={(newContent) => updateContent(newContent)}
            />
          ) : (
            <DocumentViewer
              content={doc.content}
              selectedSection={selectedSection}
              onSelectSection={handleSelectSection}
              commentCounts={sectionCommentCounts}
            />
          )}
        </div>

        {/* Right Panel: Comments or Quiz */}
        <div className="w-80 shrink-0 hidden md:block">
          <div ref={commentPanelRef} className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            {rightPanel === 'comments' ? (
              <CommentPanel
                comments={sectionComments}
                selectedSection={selectedSection}
                onAddComment={addComment}
                onResolveComment={resolveComment}
              />
            ) : (
              <QuizPanel documentId={doc.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
