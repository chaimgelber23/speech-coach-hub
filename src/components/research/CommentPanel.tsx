'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Check, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Comment } from '@/types';
import { COMMENT_TYPE_COLORS } from '@/types';
import { cn } from '@/lib/utils';

interface CommentPanelProps {
  comments: Comment[];
  selectedSection: string | null;
  onAddComment: (sectionId: string, content: string, type: Comment['comment_type']) => void;
  onResolveComment: (id: string) => void;
}

const commentTypeLabels: Record<Comment['comment_type'], string> = {
  'note': 'Note',
  'needs-research': 'Needs Research',
  'simplify': 'Simplify',
  'add-story': 'Add Story',
  'great': 'Great!',
  'question': 'Question',
};

export default function CommentPanel({
  comments,
  selectedSection,
  onAddComment,
  onResolveComment,
}: CommentPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [newType, setNewType] = useState<Comment['comment_type']>('note');
  const [isAdding, setIsAdding] = useState(false);

  function handleSubmit() {
    if (!selectedSection || !newComment.trim()) return;
    onAddComment(selectedSection, newComment.trim(), newType);
    setNewComment('');
    setNewType('note');
    setIsAdding(false);
  }

  const sectionTitle = selectedSection
    ? selectedSection
        .replace(/-/g, ' ')
        .replace(/^\d+\s*/, '')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare size={14} />
          {selectedSection ? 'Comments' : 'Select a Section'}
        </CardTitle>
        {sectionTitle && (
          <p className="text-xs text-slate-500 truncate">{sectionTitle}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!selectedSection && (
          <p className="text-xs text-slate-400">
            Click on any section heading in the document to view and add comments.
          </p>
        )}

        {/* Existing Comments */}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={cn(
              'p-3 rounded-lg border text-sm',
              comment.resolved ? 'opacity-50 bg-slate-50' : 'bg-white'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <Badge className={cn('text-xs', COMMENT_TYPE_COLORS[comment.comment_type])}>
                {commentTypeLabels[comment.comment_type]}
              </Badge>
              <button
                onClick={() => onResolveComment(comment.id)}
                className={cn(
                  'p-1 rounded transition-colors',
                  comment.resolved
                    ? 'text-green-500 hover:text-green-700'
                    : 'text-slate-300 hover:text-green-500'
                )}
                title={comment.resolved ? 'Mark as unresolved' : 'Mark as resolved'}
              >
                <Check size={14} />
              </button>
            </div>
            <p className="text-slate-700">{comment.content}</p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(comment.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}

        {/* Add Comment */}
        {selectedSection && (
          <>
            {isAdding ? (
              <div className="border rounded-lg p-3 space-y-2">
                <Select
                  value={newType}
                  onValueChange={(v) => setNewType(v as Comment['comment_type'])}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(commentTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your comment..."
                  className="text-sm min-h-[80px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim()}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAdding(false);
                      setNewComment('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setIsAdding(true)}
              >
                <Plus size={14} className="mr-1" /> Add Comment
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
