/**
 * Upload all PDFs to Supabase Storage and update pdf_path to public URLs
 */
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://trakxowvjsosbzbbfoxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyYWt4b3d2anNvc2J6YmJmb3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzUwODQsImV4cCI6MjA4ODc1MTA4NH0.ZlvfSqtIhgsHD6CPKZRNU2AYu27biU_rbeN-en_zteI';
const BASE_DIR = path.resolve('C:/Users/chaim/C Gelber JRE');
const BUCKET = 'pdfs';

// PDFs to upload (filename -> storage path)
const pdfs = [
  'Judaism-from-the-Ground-Up.pdf',
  'Torah-Shebaal-Peh-Complete-Guide.pdf',
  'kiddush-friday-night-research.pdf',
  'kiddush-friday-night-session.pdf',
  'mishpatim-higher-levels-handout.pdf',
  'JRE-Kumzitz-Cheat-Sheet.pdf',
  'JRE-Kumzitz-Visual-Guide.pdf',
];

async function uploadPdf(filename) {
  const filePath = path.join(BASE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`  [skip] ${filename} — file not found`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const storagePath = filename;

  // Upload to Supabase Storage
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/pdf',
        'x-upsert': 'true',
      },
      body: fileBuffer,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error(`  [err]  ${filename} — ${response.status}: ${err.slice(0, 200)}`);
    return null;
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
  console.log(`  [ok]   ${filename} → ${publicUrl}`);
  return publicUrl;
}

async function updatePdfPath(oldPath, newUrl) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/research_documents?pdf_path=eq.${encodeURIComponent(oldPath)}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ pdf_path: newUrl }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error(`  [err]  Failed to update ${oldPath}: ${err.slice(0, 200)}`);
    return;
  }

  const updated = await response.json();
  console.log(`  [db]   Updated ${updated.length} record(s) for ${oldPath}`);
}

async function main() {
  console.log('Uploading PDFs to Supabase Storage...\n');

  for (const filename of pdfs) {
    const publicUrl = await uploadPdf(filename);
    if (publicUrl) {
      await updatePdfPath(filename, publicUrl);
    }
  }

  console.log('\nDone!');
}

main();
