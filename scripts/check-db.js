const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  console.log('=== STORIES ===');
  const { data: stories, error: sErr } = await supabase
    .from('stories')
    .select('id, title, source')
    .order('created_at', { ascending: false })
    .limit(20);

  if (sErr) console.log('Stories error:', sErr.message);
  else {
    console.log(`Found ${stories.length} stories:`);
    stories.forEach(s => console.log(`  - ${s.title} (${s.source})`));
  }

  console.log('\n=== RESEARCH DOCUMENTS (speeches) ===');
  const { data: docs, error: dErr } = await supabase
    .from('research_documents')
    .select('id, title, slug, category, status')
    .eq('category', 'speech');

  if (dErr) console.log('Docs error:', dErr.message);
  else {
    console.log(`Found ${docs.length} speech documents:`);
    docs.forEach(d => console.log(`  - ${d.title} [${d.status}] (${d.slug})`));
  }

  console.log('\n=== ALL RESEARCH DOCUMENTS ===');
  const { data: allDocs, error: aErr } = await supabase
    .from('research_documents')
    .select('id, title, category, status')
    .limit(20);

  if (aErr) console.log('All docs error:', aErr.message);
  else {
    console.log(`Found ${allDocs.length} total documents:`);
    allDocs.forEach(d => console.log(`  - ${d.title} [${d.category}/${d.status}]`));
  }
}

check();
