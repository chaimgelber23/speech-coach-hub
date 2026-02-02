import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSections, generateSlug } from '@/lib/markdown';
import fs from 'fs';
import path from 'path';

// This API route imports existing markdown files into Supabase
// Call POST /api/import to run the import

interface ImportResult {
  imported: string[];
  skipped: string[];
  errors: string[];
}

export async function POST() {
  const result: ImportResult = {
    imported: [],
    skipped: [],
    errors: [],
  };

  const projectRoot = path.resolve(process.cwd(), '..');

  // Import mitzvos research documents
  const mitzvosDir = path.join(projectRoot, 'content', 'mitzvos');
  if (fs.existsSync(mitzvosDir)) {
    const mitzvos = fs.readdirSync(mitzvosDir);
    for (const mitzvah of mitzvos) {
      const researchPath = path.join(mitzvosDir, mitzvah, 'research.md');
      if (fs.existsSync(researchPath)) {
        try {
          const content = fs.readFileSync(researchPath, 'utf-8');
          const title = extractTitle(content) || mitzvah.replace(/-/g, ' ');
          const slug = generateSlug(mitzvah);
          const sections = parseSections(content);

          const { error } = await supabase
            .from('research_documents')
            .upsert(
              {
                title,
                slug,
                category: 'mitzvah',
                content,
                sections,
                status: 'research',
              },
              { onConflict: 'slug' }
            );

          if (error) {
            result.errors.push(`${mitzvah}: ${error.message}`);
          } else {
            result.imported.push(`mitzvah: ${mitzvah}`);
          }
        } catch (e) {
          result.errors.push(`${mitzvah}: ${String(e)}`);
        }
      }
    }
  }

  // Import drafts
  const draftsDir = path.join(projectRoot, 'content', 'drafts');
  if (fs.existsSync(draftsDir)) {
    const drafts = fs.readdirSync(draftsDir).filter((f) => f.endsWith('.md'));
    for (const draft of drafts) {
      try {
        const content = fs.readFileSync(path.join(draftsDir, draft), 'utf-8');
        const title = extractTitle(content) || draft.replace('.md', '').replace(/-/g, ' ');
        const slug = generateSlug(draft.replace('.md', ''));
        const sections = parseSections(content);

        const { error } = await supabase
          .from('research_documents')
          .upsert(
            {
              title,
              slug,
              category: 'draft',
              content,
              sections,
              status: 'draft',
            },
            { onConflict: 'slug' }
          );

        if (error) {
          result.errors.push(`draft ${draft}: ${error.message}`);
        } else {
          result.imported.push(`draft: ${draft}`);
        }
      } catch (e) {
        result.errors.push(`draft ${draft}: ${String(e)}`);
      }
    }
  }

  // Import courses
  const coursesDir = path.join(projectRoot, 'courses');
  if (fs.existsSync(coursesDir)) {
    const courses = fs.readdirSync(coursesDir);
    for (const course of courses) {
      const researchPath = path.join(coursesDir, course, 'research.md');
      if (fs.existsSync(researchPath)) {
        try {
          const content = fs.readFileSync(researchPath, 'utf-8');
          const title = extractTitle(content) || course.replace(/-/g, ' ');
          const slug = generateSlug(course);
          const sections = parseSections(content);

          const { error } = await supabase
            .from('research_documents')
            .upsert(
              {
                title,
                slug,
                category: 'course',
                content,
                sections,
                status: 'research',
              },
              { onConflict: 'slug' }
            );

          if (error) {
            result.errors.push(`course ${course}: ${error.message}`);
          } else {
            result.imported.push(`course: ${course}`);
          }
        } catch (e) {
          result.errors.push(`course ${course}: ${String(e)}`);
        }
      }
    }
  }

  return NextResponse.json(result);
}

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)/m);
  if (match) {
    return match[1]
      .replace(/[—–-]\s*.+$/, '')
      .trim();
  }
  return null;
}
