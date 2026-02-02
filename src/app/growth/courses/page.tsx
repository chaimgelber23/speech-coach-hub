'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useCourses } from '@/lib/hooks';
import AddDialog from '@/components/AddDialog';
import { supabase } from '@/lib/supabase';

export default function CoursesPage() {
  const { data: courses, loading, refetch } = useCourses();

  async function addCourse(title: string, description: string, sourceType: string) {
    const { error } = await supabase
      .from('courses')
      .insert({ title, description: description || null, source_type: sourceType || null, total_segments: 0 });
    if (!error) refetch();
    return { error };
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Courses"
        description="Imported courses broken into daily segments"
        action={
          <AddDialog
            title="Add Course"
            buttonLabel="Add Course"
            fields={[
              { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Self-Esteem Foundations' },
              { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What is this course about?' },
              {
                name: 'source_type',
                label: 'Source Type',
                type: 'select',
                options: [
                  { value: 'pdf', label: 'PDF' },
                  { value: 'text', label: 'Text/Notes' },
                  { value: 'workshop', label: 'Workshop' },
                ],
              },
            ]}
            onSubmit={async (values) => {
              return addCourse(values.title, values.description || '', values.source_type || '');
            }}
          />
        }
      />

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-slate-400">No courses yet. Click &quot;Add Course&quot; to create one.</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <BookOpen size={16} className="text-teal-500" />
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-slate-500 mt-0.5">{course.description}</p>
                    )}
                    {course.source_type && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {course.source_type}
                      </Badge>
                    )}
                  </div>
                  <Link href={`/growth/courses/${course.id}`}>
                    <button className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700">
                      Continue
                    </button>
                  </Link>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <Progress
                    value={0}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {course.total_segments} segments
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
