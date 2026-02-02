'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCourseSegments } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { segments, loading, toggleComplete } = useCourseSegments(courseId);
  const [courseTitle, setCourseTitle] = useState('Course');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch course title
  useEffect(() => {
    if (!courseId) return;
    supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single()
      .then(({ data }) => {
        if (data) setCourseTitle(data.title);
      });
  }, [courseId]);

  // Auto-select first uncompleted segment
  useEffect(() => {
    if (segments.length > 0) {
      const firstUncompleted = segments.findIndex((s) => !s.completed);
      setCurrentIndex(firstUncompleted >= 0 ? firstUncompleted : 0);
    }
  }, [segments.length]); // Only run when segments first load

  const segment = segments[currentIndex];
  const totalCompleted = segments.filter((s) => s.completed).length;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Header title="Loading..." description="" />
        <p className="text-sm text-slate-400">Loading course segments...</p>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <Header title={courseTitle} description="No segments yet" />
        <p className="text-sm text-slate-400">
          This course has no segments yet. Segments can be added by importing course content.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Header
        title={courseTitle}
        description={`${totalCompleted} of ${segments.length} segments completed`}
      />

      {/* Segment Navigation */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {segments.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-7 h-7 rounded text-xs font-medium transition-colors
              ${
                i === currentIndex
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
              <h2 className="text-lg font-semibold">
                {segment.title || `Segment ${segment.segment_number}`}
              </h2>
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
                  onCheckedChange={() => toggleComplete(segment.id)}
                />
                <span className="text-sm">Mark as completed</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft size={16} /> Previous
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    setCurrentIndex(Math.min(segments.length - 1, currentIndex + 1))
                  }
                  disabled={currentIndex === segments.length - 1}
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
