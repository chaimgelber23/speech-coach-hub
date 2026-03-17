/**
 * Import All Content to Supabase
 *
 * Imports all markdown content files into the research_documents table.
 * Skips parsha files (already imported via import-parsha.js).
 * Safe to run multiple times - uses upsert on slug.
 *
 * Usage: node scripts/import-all.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env manually (no dotenv dependency)
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Base content directory
const CONTENT_BASE = path.join(__dirname, '../..');

function extractTitle(content, fallbackFilename) {
  const match = content.match(/^# (.+)$/m);
  if (match) {
    return match[1]
      .replace(/^Practice Sheet:\s*/i, '')
      .replace(/^Research:\s*/i, '')
      .replace(/^Prep:\s*/i, '')
      .replace(/^Session:\s*/i, '')
      .trim();
  }
  // Fallback: humanize filename
  return fallbackFilename
    .replace(/\.md$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// All files to import with their metadata
const FILES = [
  // === MITZVOS ===
  { file: 'content/mitzvos/613-mitzvos-and-the-body/research.md', category: 'mitzvah', topic_slug: '613-mitzvos-and-the-body', status: 'research' },
  { file: 'content/mitzvos/concept-of-shabbos/research.md', category: 'mitzvah', topic_slug: 'concept-of-shabbos', status: 'research' },
  { file: 'content/mitzvos/kiddush-friday-night/research.md', category: 'mitzvah', topic_slug: 'kiddush-friday-night', status: 'research' },
  { file: 'content/mitzvos/kiddush-friday-night/prep.md', category: 'mitzvah', topic_slug: 'kiddush-friday-night', status: 'prep' },
  { file: 'content/mitzvos/kiddush-friday-night/practice.md', category: 'mitzvah', topic_slug: 'kiddush-friday-night', status: 'practice' },
  { file: 'content/mitzvos/kiddush-friday-night/session.md', category: 'mitzvah', topic_slug: 'kiddush-friday-night', status: 'session' },
  { file: 'content/mitzvos/shabbos-candles/research.md', category: 'mitzvah', topic_slug: 'shabbos-candles', status: 'research' },
  { file: 'content/mitzvos/tefillin/research.md', category: 'mitzvah', topic_slug: 'tefillin', status: 'research' },
  { file: 'content/mitzvos/three-cardinal-sins/research-yehareg-val-yaavor.md', category: 'mitzvah', topic_slug: 'three-cardinal-sins', status: 'research' },
  { file: 'content/mitzvos/torah-shebaal-peh/research.md', category: 'mitzvah', topic_slug: 'torah-shebaal-peh', status: 'research' },
  { file: 'content/mitzvos/torah-shebaal-peh/one-sheet-scope.md', category: 'mitzvah', topic_slug: 'torah-shebaal-peh', status: 'prep' },
  { file: 'content/mitzvos/tzitzis/research.md', category: 'mitzvah', topic_slug: 'tzitzis', status: 'research' },

  // === DRAFTS ===
  { file: 'content/drafts/beshalach-pharaoh-sent-them-speakers-edition.md', category: 'draft', topic_slug: 'beshalach-pharaoh', status: 'practice' },
  { file: 'content/drafts/beshalach-shabbos-table-edition.md', category: 'draft', topic_slug: 'beshalach-pharaoh', status: 'practice' },

  // === COURSES ===
  { file: 'courses/judaism-ground-up/curriculum.md', category: 'course', topic_slug: 'judaism-ground-up', status: 'complete' },
  { file: 'courses/judaism-ground-up/research.md', category: 'course', topic_slug: 'judaism-ground-up', status: 'research' },
  { file: 'courses/afterlife/research.md', category: 'course', topic_slug: 'afterlife', status: 'research' },
  { file: 'courses/afterlife/prep.md', category: 'course', topic_slug: 'afterlife', status: 'prep' },
  { file: 'courses/afterlife/session.md', category: 'course', topic_slug: 'afterlife', status: 'session' },
  { file: 'courses/nefesh-hachaim/course-map.md', category: 'course', topic_slug: 'nefesh-hachaim', status: 'prep' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-01-research.md', category: 'course', topic_slug: 'nefesh-hachaim-class-01', status: 'research' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-01-prep.md', category: 'course', topic_slug: 'nefesh-hachaim-class-01', status: 'prep' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-01-session.md', category: 'course', topic_slug: 'nefesh-hachaim-class-01', status: 'session' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-02-research.md', category: 'course', topic_slug: 'nefesh-hachaim-class-02', status: 'research' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-02-prep.md', category: 'course', topic_slug: 'nefesh-hachaim-class-02', status: 'prep' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-02-session.md', category: 'course', topic_slug: 'nefesh-hachaim-class-02', status: 'session' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-03-research.md', category: 'course', topic_slug: 'nefesh-hachaim-class-03', status: 'research' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-03-prep.md', category: 'course', topic_slug: 'nefesh-hachaim-class-03', status: 'prep' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-03-session.md', category: 'course', topic_slug: 'nefesh-hachaim-class-03', status: 'session' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-04-research.md', category: 'course', topic_slug: 'nefesh-hachaim-class-04', status: 'research' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-04-prep.md', category: 'course', topic_slug: 'nefesh-hachaim-class-04', status: 'prep' },
  { file: 'courses/nefesh-hachaim/shaar-1/class-04-session.md', category: 'course', topic_slug: 'nefesh-hachaim-class-04', status: 'session' },
  { file: 'courses/shoftim/course-map.md', category: 'course', topic_slug: 'shoftim', status: 'prep' },
  { file: 'courses/yehoshua/course-map.md', category: 'course', topic_slug: 'yehoshua', status: 'prep' },

  // === KUMZITZ ===
  { file: 'content/kumzitz/kumzitz-master-plan.md', category: 'draft', topic_slug: 'kumzitz', status: 'prep' },

  // === HOLIDAY ===
  { file: 'content/pesach/whatsapp-30-day-countdown.md', category: 'draft', topic_slug: 'pesach-countdown', status: 'complete' },
  { file: 'content/purim/whatsapp-16-day-countdown.md', category: 'draft', topic_slug: 'purim-countdown', status: 'complete' },
];

function generateSlug(filePath, topicSlug, status) {
  // Create a unique slug from topic_slug + status type + filename differentiation
  const filename = path.basename(filePath, '.md');

  // For files where the filename IS the status (research.md, prep.md, session.md, practice.md)
  const simpleNames = ['research', 'prep', 'session', 'practice', 'curriculum', 'course-map', 'one-sheet-scope'];
  if (simpleNames.includes(filename)) {
    return `${topicSlug}-${filename}`;
  }

  // For files with descriptive names, use topic_slug + filename
  return `${topicSlug}-${filename}`;
}

async function importAll() {
  console.log(`Importing ${FILES.length} documents to Supabase...\n`);

  let success = 0;
  let errors = 0;
  let skipped = 0;

  for (const entry of FILES) {
    const fullPath = path.join(CONTENT_BASE, entry.file);

    // Check file exists
    if (!fs.existsSync(fullPath)) {
      console.log(`  SKIP (not found): ${entry.file}`);
      skipped++;
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const filename = path.basename(entry.file, '.md');
    const title = extractTitle(content, filename);
    const slug = generateSlug(entry.file, entry.topic_slug, entry.status);

    const doc = {
      title,
      slug,
      category: entry.category,
      content,
      status: entry.status,
      topic_slug: entry.topic_slug,
    };

    const { error } = await supabase
      .from('research_documents')
      .upsert(doc, { onConflict: 'slug' });

    if (error) {
      console.log(`  ERROR: ${slug} - ${error.message}`);
      errors++;
    } else {
      console.log(`  OK: ${slug} (${entry.category}/${entry.status}) - "${title}"`);
      success++;
    }
  }

  console.log(`\n--- Import Complete ---`);
  console.log(`  Success: ${success}`);
  console.log(`  Errors:  ${errors}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total:   ${FILES.length}`);
}

importAll().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
