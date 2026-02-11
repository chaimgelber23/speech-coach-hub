/**
 * Import Parsha Content to Supabase
 *
 * Imports practice-*.md and research-*.md files from content/parsha/<name>/
 * Groups them by topic under the same topic_slug for clean display.
 *
 * Usage: node scripts/import-parsha.js <parsha-name>
 * Example: node scripts/import-parsha.js mishpatim
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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractTitle(content, fallback) {
  const match = content.match(/^# (.+)$/m);
  if (!match) return fallback;
  return match[1]
    .replace(/^Practice Sheet:\s*/i, '')
    .replace(/^Research:\s*/i, '')
    .trim();
}

async function importParsha(parshaName) {
  const parshaDir = path.join(__dirname, '../../content/parsha', parshaName);

  if (!fs.existsSync(parshaDir)) {
    console.error(`Parsha folder not found: ${parshaDir}`);
    process.exit(1);
  }

  // Find all importable files: practice-*.md and research-*.md
  const allFiles = fs.readdirSync(parshaDir).filter(f => f.endsWith('.md'));
  const practiceFiles = allFiles.filter(f => f.startsWith('practice-'));
  const researchFiles = allFiles.filter(f => f.startsWith('research-'));

  if (practiceFiles.length === 0 && researchFiles.length === 0) {
    console.error(`No practice-*.md or research-*.md files found in ${parshaDir}`);
    process.exit(1);
  }

  console.log(`Found ${practiceFiles.length} practice + ${researchFiles.length} research files in ${parshaName}\n`);

  // Group files by their base name to create topic_slugs
  // e.g. practice-higher-levels-of-mitzvah.md and research-higher-levels.md
  //      both map to the same topic under parsha
  const fileGroups = new Map();

  for (const file of practiceFiles) {
    const baseName = file.replace('practice-', '').replace('.md', '');
    if (!fileGroups.has(baseName)) fileGroups.set(baseName, {});
    fileGroups.get(baseName).practice = file;
  }

  for (const file of researchFiles) {
    const baseName = file.replace('research-', '').replace('.md', '');
    // Try to match with existing practice group
    let matched = false;
    for (const [key, group] of fileGroups) {
      if (key.includes(baseName) || baseName.includes(key)) {
        group.research = file;
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (!fileGroups.has(baseName)) fileGroups.set(baseName, {});
      fileGroups.get(baseName).research = file;
    }
  }

  let totalImported = 0;

  for (const [baseName, group] of fileGroups) {
    const topicSlug = `${parshaName}-${baseName}`;

    // Import practice file
    if (group.practice) {
      const filePath = path.join(parshaDir, group.practice);
      const content = fs.readFileSync(filePath, 'utf-8');
      const rawTitle = extractTitle(content, baseName);
      const title = `${capitalize(parshaName)} - ${rawTitle}`;
      const slug = `${topicSlug}-practice`;

      const { error } = await supabase
        .from('research_documents')
        .upsert({
          title,
          slug,
          category: 'parsha',
          content,
          status: 'practice',
          topic_slug: topicSlug,
        }, { onConflict: 'slug' });

      if (error) {
        console.error(`  Error: ${slug} - ${error.message}`);
      } else {
        console.log(`  Upserted: ${title} (practice)`);
        totalImported++;
      }
    }

    // Import research file
    if (group.research) {
      const filePath = path.join(parshaDir, group.research);
      const content = fs.readFileSync(filePath, 'utf-8');
      const rawTitle = extractTitle(content, baseName);
      const title = `${capitalize(parshaName)} - ${rawTitle}`;
      const slug = topicSlug; // research doc gets the base topic slug

      const { error } = await supabase
        .from('research_documents')
        .upsert({
          title,
          slug,
          category: 'parsha',
          content,
          status: 'research',
          topic_slug: topicSlug,
        }, { onConflict: 'slug' });

      if (error) {
        console.error(`  Error: ${slug} - ${error.message}`);
      } else {
        console.log(`  Upserted: ${title} (research)`);
        totalImported++;
      }
    }

    // Add/update pipeline item
    const practiceSlug = group.practice ? `${topicSlug}-practice` : topicSlug;
    const practiceFile = group.practice || group.research;
    const practiceContent = fs.readFileSync(path.join(parshaDir, practiceFile), 'utf-8');
    const pipelineTitle = `${capitalize(parshaName)} - ${extractTitle(practiceContent, baseName)}`;

    const { data: existingPipeline } = await supabase
      .from('pipeline_items')
      .select('id')
      .eq('document_slug', practiceSlug)
      .single();

    if (!existingPipeline) {
      const { error } = await supabase
        .from('pipeline_items')
        .insert({
          title: pipelineTitle,
          content_type: 'speech',
          stage: group.practice ? 'practice' : 'research',
          description: `Parsha ${capitalize(parshaName)}`,
          document_slug: practiceSlug,
        });

      if (error) {
        console.log(`  Pipeline: skipped (${error.message})`);
      } else {
        console.log(`  Pipeline: added ${pipelineTitle}`);
      }
    }
  }

  console.log(`\nDone! ${totalImported} documents imported for ${capitalize(parshaName)}`);
}

const parshaName = process.argv[2];
if (!parshaName) {
  console.error('Usage: node scripts/import-parsha.js <parsha-name>');
  console.error('Example: node scripts/import-parsha.js mishpatim');
  process.exit(1);
}
importParsha(parshaName.toLowerCase());
