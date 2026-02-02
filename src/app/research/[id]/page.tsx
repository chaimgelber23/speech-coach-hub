'use client';

import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit3, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import DocumentViewer from '@/components/research/DocumentViewer';
import DocumentEditor from '@/components/research/DocumentEditor';
import CommentPanel from '@/components/research/CommentPanel';
import SectionNav from '@/components/research/SectionNav';
import { useResearchDocument, useComments } from '@/lib/hooks';

export default function ResearchDocPage() {
  const params = useParams();
  const slug = params.id as string;

  const { doc, loading, updateContent } = useResearchDocument(slug);
  const {
    comments,
    loading: commentsLoading,
    addComment,
    resolveComment,
  } = useComments(doc?.id || '');

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const sectionCommentCounts: Record<string, number> = {};
  comments
    .filter((c) => !c.resolved)
    .forEach((c) => {
      sectionCommentCounts[c.section_id] = (sectionCommentCounts[c.section_id] || 0) + 1;
    });

  const sectionComments = selectedSection
    ? comments.filter((c) => c.section_id === selectedSection)
    : [];

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
      <div className="flex items-center gap-3 mb-4">
        <Link href="/research">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <Header
            title={doc.title}
            description={doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
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
        <Badge variant="outline">
          {comments.filter((c) => !c.resolved).length} open comments
        </Badge>
      </div>

      <div className="flex gap-4">
        {/* Table of Contents */}
        <div className="w-48 shrink-0 hidden lg:block">
          <SectionNav
            content={doc.content}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
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
              onSelectSection={setSelectedSection}
              commentCounts={sectionCommentCounts}
            />
          )}
        </div>

        {/* Comments Panel */}
        <div className="w-80 shrink-0 hidden md:block">
          <CommentPanel
            comments={sectionComments}
            selectedSection={selectedSection}
            onAddComment={addComment}
            onResolveComment={resolveComment}
          />
        </div>
      </div>
    </div>
  );
}
