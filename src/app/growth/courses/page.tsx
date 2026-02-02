'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, BookOpen } from 'lucide-react';
import Link from 'next/link';

const demoCourses = [
  {
    id: '1',
    title: 'Self-Esteem Foundations',
    description: 'Building a healthy self-image from the inside out',
    total: 30,
    completed: 14,
    source: 'Course Notes',
    nextSegment: 'Segment 15: Recognizing Negative Self-Talk',
  },
  {
    id: '2',
    title: 'Confidence Building',
    description: 'Practical tools for building real confidence',
    total: 20,
    completed: 6,
    source: 'Workshop',
    nextSegment: 'Segment 7: Body Language Basics',
  },
  {
    id: '3',
    title: 'Public Speaking Mastery',
    description: 'Eliezer Blatt method — Vocal, Vitality, Visual',
    total: 15,
    completed: 2,
    source: 'Eliezer Blatt',
    nextSegment: 'Segment 3: Finding Your Natural Voice',
  },
];

export default function CoursesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Courses"
        description="Imported courses broken into daily segments"
        action={
          <Button size="sm">
            <Upload size={16} className="mr-1" /> Import Course
          </Button>
        }
      />

      <div className="space-y-4">
        {demoCourses.map((course) => (
          <Card key={course.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <BookOpen size={16} className="text-teal-500" />
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">{course.description}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {course.source}
                  </Badge>
                </div>
                <Link href={`/growth/courses/${course.id}`}>
                  <Button size="sm">Continue</Button>
                </Link>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <Progress
                  value={(course.completed / course.total) * 100}
                  className="flex-1 h-2"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {course.completed}/{course.total}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Next: <span className="font-medium">{course.nextSegment}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
