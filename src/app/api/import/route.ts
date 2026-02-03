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

const STATUS_MAP: Record<string, string> = {
  'research': 'research',
  'prep': 'prep',
  'session': 'session',
  'practice': 'practice',
};

export async function POST() {
  const result: ImportResult = {
    imported: [],
    skipped: [],
    errors: [],
  };

  const projectRoot = path.resolve(process.cwd(), '..');

  // Import mitzvos - dynamically discover all .md files in each folder
  const mitzvosDir = path.join(projectRoot, 'content', 'mitzvos');
  if (fs.existsSync(mitzvosDir)) {
    const mitzvos = fs.readdirSync(mitzvosDir);
    for (const mitzvah of mitzvos) {
      const mitzvahDir = path.join(mitzvosDir, mitzvah);
      if (!fs.statSync(mitzvahDir).isDirectory()) continue;

      const files = fs.readdirSync(mitzvahDir).filter(
        (f) => f.endsWith('.md') && !f.endsWith('-print.md')
      );

      for (const file of files) {
        const baseName = file.replace('.md', '');
        const status = STATUS_MAP[baseName] || 'research';
        const filePath = path.join(mitzvahDir, file);

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const folderLabel = mitzvah.replace(/-/g, ' ');
          const suffix = status !== 'research' ? ` - ${status}` : '';
          const title = extractTitle(content) || `${folderLabel}${suffix}`;
          const slugSuffix = status !== 'research' ? `-${status}` : '';
          const slug = generateSlug(`${mitzvah}${slugSuffix}`);
          const sections = parseSections(content);

          const row: Record<string, unknown> = {
                title,
                slug,
                category: 'mitzvah',
                content,
                sections,
                status,
              };
          const { error } = await supabase
            .from('research_documents')
            .upsert(row, { onConflict: 'slug' });

          if (error) {
            result.errors.push(`${mitzvah} ${status}: ${error.message}`);
          } else {
            result.imported.push(`mitzvah ${status}: ${mitzvah}`);
          }
        } catch (e) {
          result.errors.push(`${mitzvah} ${baseName}: ${String(e)}`);
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
              status: 'research',
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

  // Import courses (research/prep/session)
  const coursesDir = path.join(projectRoot, 'courses');
  if (fs.existsSync(coursesDir)) {
    const courses = fs.readdirSync(coursesDir);
    for (const course of courses) {
      const courseDir = path.join(coursesDir, course);
      if (!fs.statSync(courseDir).isDirectory()) continue;

      const files = fs.readdirSync(courseDir).filter(
        (f) => f.endsWith('.md') && !f.endsWith('-print.md')
      );

      for (const file of files) {
        const baseName = file.replace('.md', '');
        const status = STATUS_MAP[baseName] || 'research';
        const filePath = path.join(courseDir, file);

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const folderLabel = course.replace(/-/g, ' ');
          const suffix = status !== 'research' ? ` - ${status}` : '';
          const title = extractTitle(content) || `${folderLabel}${suffix}`;
          const slugSuffix = status !== 'research' ? `-${status}` : '';
          const slug = generateSlug(`${course}${slugSuffix}`);
          const sections = parseSections(content);

          const row: Record<string, unknown> = {
                title,
                slug,
                category: 'course',
                content,
                sections,
                status,
              };
          const { error } = await supabase
            .from('research_documents')
            .upsert(row, { onConflict: 'slug' });

          if (error) {
            result.errors.push(`course ${course} ${status}: ${error.message}`);
          } else {
            result.imported.push(`course ${status}: ${course}`);
          }
        } catch (e) {
          result.errors.push(`course ${course} ${baseName}: ${String(e)}`);
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
