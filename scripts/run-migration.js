/**
 * Run a SQL migration against Supabase
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
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

async function runMigration() {
  // Add document_slug column to pipeline_items
  const { error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE pipeline_items ADD COLUMN IF NOT EXISTS document_slug TEXT'
  });

  if (error) {
    // RPC might not exist, try direct approach
    console.log('RPC not available, column may need to be added via Supabase Dashboard');
    console.log('SQL to run: ALTER TABLE pipeline_items ADD COLUMN IF NOT EXISTS document_slug TEXT');

    // Test if column exists by trying to select it
    const { error: testError } = await supabase
      .from('pipeline_items')
      .select('document_slug')
      .limit(1);

    if (testError && testError.message.includes('document_slug')) {
      console.log('\nColumn does not exist yet. Please add it in Supabase Dashboard.');
    } else {
      console.log('\nColumn already exists or query succeeded!');
    }
  } else {
    console.log('Migration completed successfully!');
  }
}

runMigration();
