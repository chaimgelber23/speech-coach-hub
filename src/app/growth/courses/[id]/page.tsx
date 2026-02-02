'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const demoSegments = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  segment_number: i + 1,
  title: `Segment ${i + 1}: ${
    [
      'Understanding Self-Image',
      'The Inner Critic',
      'Core Beliefs',
      'Reframing Thoughts',
      'Self-Compassion',
      'Setting Boundaries',
      'Assertive Communication',
      'Handling Criticism',
      'Building on Strengths',
      'Daily Practice',
    ][i % 10]
  }`,
  content: `This is the content for segment ${
    i + 1
  }. In a real application, this would contain the actual course material broken down into digestible daily pieces.\n\nKey points:\n- Point one about this topic\n- Point two with practical application\n- Point three connecting to daily life\n\nReflection question: How does this apply to your life today?`,
  completed: i < 14,
}));

export default function CourseDetailPage() {
  const [segments, setSegments] = useState(demoSegments);
  const [currentSegment, setCurrentSegment] = useState(14); // first uncompleted

  const segment = segments[currentSegment];
  const totalCompleted = segments.filter((s) => s.completed).length;

  return (
    <div className="max-w-3xl mx-auto">
      <Header
        title="Self-Esteem Foundations"
        description={`${totalCompleted} of ${segments.length} segments completed`}
      />

      {/* Segment Navigation */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {segments.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentSegment(i)}
            className={`w-7 h-7 rounded text-xs font-medium transition-colors
              ${
                i === currentSegment
                  ? 'bg-blue-600 text-white'
                  : s.completed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }
            `}
          >
            {s.segment_number}
          </button>
        ))}
      </div>

      {/* Current Segment */}
      {segment && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{segment.title}</h2>
              <Badge variant={segment.completed ? 'default' : 'outline'}>
                {segment.completed ? 'Completed' : 'Not done'}
              </Badge>
            </div>

            <div className="prose prose-sm max-w-none mb-6">
              {segment.content.split('\n').map((line, i) => (
                <p key={i} className="text-sm text-slate-700 mb-2">
                  {line}
                </p>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={segment.completed}
                  onCheckedChange={(checked) => {
                    setSegments((prev) =>
                      prev.map((s, i) =>
                        i === currentSegment
                          ? { ...s, completed: checked === true }
                          : s
                      )
                    );
                  }}
                />
                <span className="text-sm">Mark as completed</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSegment(Math.max(0, currentSegment - 1))}
                  disabled={currentSegment === 0}
                >
                  <ChevronLeft size={16} /> Previous
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    setCurrentSegment(Math.min(segments.length - 1, currentSegment + 1))
                  }
                  disabled={currentSegment === segments.length - 1}
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
