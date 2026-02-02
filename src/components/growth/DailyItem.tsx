'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DailyItemProps {
  title: string;
  subtitle?: string;
  content: string;
  completed: boolean;
  onComplete: () => void;
  icon?: React.ReactNode;
  accentColor?: string;
}

function parseReflection(content: string): { main: string; reflection: string | null } {
  // Look for "Reflection:", "Practice:", or "Exercise:" prompts
  const patterns = [
    /\n\n(Reflection:[\s\S]+)$/,
    /\n\n(Practice:[\s\S]+)$/,
    /\n\n(Exercise:[\s\S]+)$/,
    /\n\n(Practice today:[\s\S]+)$/,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return {
        main: content.slice(0, match.index!).trimEnd(),
        reflection: match[1].trim(),
      };
    }
  }

  return { main: content, reflection: null };
}

export default function DailyItem({
  title,
  subtitle,
  content,
  completed,
  onComplete,
  icon,
  accentColor = 'border-blue-200',
}: DailyItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [reflectionInput, setReflectionInput] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  const { main, reflection } = parseReflection(content);

  return (
    <Card
      className={cn(
        'transition-all duration-300 border-l-4',
        accentColor,
        completed && 'opacity-50'
      )}
    >
      <CardContent className="p-0">
        {/* Header — always visible, clickable */}
        <button
          onClick={() => !completed && setExpanded(!expanded)}
          className={cn(
            'w-full flex items-center gap-3 p-4 text-left transition-colors',
            !completed && 'hover:bg-slate-50 cursor-pointer'
          )}
        >
          {/* Completion indicator */}
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
              completed
                ? 'bg-green-500 text-white scale-110'
                : 'bg-slate-100 text-slate-400'
            )}
            onClick={(e) => {
              if (completed) {
                e.stopPropagation();
              }
            }}
          >
            {completed ? (
              <Check size={18} strokeWidth={3} />
            ) : (
              icon || <div className="w-3 h-3 rounded-full bg-slate-300" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'text-sm font-semibold',
                completed && 'line-through text-slate-500'
              )}
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>

          {completed ? (
            <Badge className="bg-green-100 text-green-700 shrink-0">Done</Badge>
          ) : (
            <span className="text-slate-400 shrink-0">
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          )}
        </button>

        {/* Expanded content */}
        {expanded && !completed && (
          <div className="px-4 pb-4 border-t border-slate-100">
            {/* Main content */}
            <div className="pt-4 space-y-2">
              {main.split('\n').map((line, i) => (
                <p
                  key={i}
                  className={cn(
                    'text-sm text-slate-700 leading-relaxed',
                    line.trim() === '' && 'h-2'
                  )}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Reflection / Interactive section */}
            {reflection && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">
                    Reflect & Apply
                  </span>
                </div>
                <p className="text-sm text-amber-900 mb-3">{reflection}</p>

                {!showReflection ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => setShowReflection(true)}
                  >
                    Write my response
                  </Button>
                ) : (
                  <Textarea
                    placeholder="Your thoughts..."
                    value={reflectionInput}
                    onChange={(e) => setReflectionInput(e.target.value)}
                    className="bg-white border-amber-200 text-sm min-h-[80px]"
                  />
                )}
              </div>
            )}

            {/* Mark complete button */}
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                  setExpanded(false);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check size={16} className="mr-1" />
                Mark Complete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
