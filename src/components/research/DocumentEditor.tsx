'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  Quote,
  Highlighter,
  Table,
  Minus,
} from 'lucide-react';
import { useRef, useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function DocumentEditor({ content, onChange }: DocumentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = useCallback(
    (before: string, after: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);

      const newContent =
        content.substring(0, start) +
        before +
        selectedText +
        after +
        content.substring(end);

      onChange(newContent);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          end + before.length
        );
      }, 0);
    },
    [content, onChange]
  );

  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const newContent =
        content.substring(0, start) + text + content.substring(start);

      onChange(newContent);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    },
    [content, onChange]
  );

  const toolbarActions = [
    {
      icon: Bold,
      label: 'Bold (Ctrl+B)',
      action: () => wrapSelection('**', '**'),
    },
    {
      icon: Italic,
      label: 'Italic (Ctrl+I)',
      action: () => wrapSelection('*', '*'),
    },
    {
      icon: Highlighter,
      label: 'Highlight',
      action: () => wrapSelection('==', '=='),
    },
    { type: 'separator' as const },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => insertAtCursor('\n## '),
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => insertAtCursor('\n### '),
    },
    { type: 'separator' as const },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertAtCursor('\n- '),
    },
    {
      icon: Quote,
      label: 'Blockquote',
      action: () => insertAtCursor('\n> '),
    },
    {
      icon: Minus,
      label: 'Horizontal Rule',
      action: () => insertAtCursor('\n---\n'),
    },
    {
      icon: Table,
      label: 'Table',
      action: () =>
        insertAtCursor('\n| Column 1 | Column 2 |\n|---|---|\n| cell | cell |\n'),
    },
  ];

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        wrapSelection('**', '**');
      } else if (e.key === 'i') {
        e.preventDefault();
        wrapSelection('*', '*');
      }
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Toolbar */}
        <TooltipProvider>
          <div className="flex items-center gap-0.5 p-2 border-b bg-slate-50 flex-wrap">
            {toolbarActions.map((action, i) => {
              if ('type' in action && action.type === 'separator') {
                return <Separator key={i} orientation="vertical" className="h-6 mx-1" />;
              }
              const Icon = 'icon' in action ? action.icon : Bold;
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={'action' in action ? action.action : undefined}
                    >
                      <Icon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{'label' in action ? action.label : ''}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Editor */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[600px] p-6 text-sm font-mono text-slate-700 leading-relaxed resize-none focus:outline-none"
          placeholder="Start writing..."
          spellCheck
        />
      </CardContent>
    </Card>
  );
}
