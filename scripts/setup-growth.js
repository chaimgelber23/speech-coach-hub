/**
 * Create growth system tables and seed user profile
 * Run: node scripts/setup-growth.js
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

async function setupTables() {
  console.log('Creating growth system tables...\n');

  // Test if tables already exist by trying to query them
  const tables = ['goals', 'daily_reflections', 'usage_events', 'user_profile'];
  const missing = [];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && error.message.includes('does not exist')) {
      missing.push(table);
    } else if (error) {
      console.log(`  ${table}: error - ${error.message}`);
    } else {
      console.log(`  ${table}: already exists`);
    }
  }

  if (missing.length > 0) {
    console.log(`\n  Tables not found: ${missing.join(', ')}`);
    console.log('  Please run this SQL in Supabase SQL Editor:');
    console.log(`  File: supabase/migrations/006_growth_system.sql\n`);

    // Read and print the SQL
    const sqlPath = path.join(__dirname, '../supabase/migrations/006_growth_system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log(sql);
    return false;
  }

  return true;
}

async function seedProfile() {
  console.log('\nSeeding user profile...');

  const profileData = [
    {
      key: 'personality_traits',
      value: [
        'analytical',
        'grounded',
        'emotionally deep',
        'practical problem-solver',
        'reserved with dry humor',
        'strong intuition',
        'drawn to transformation and self-improvement',
        'need for meaningful deep connections'
      ]
    },
    {
      key: 'growth_areas',
      value: [
        'opening up emotionally',
        'letting go of control',
        'vulnerability',
        'stories and emotional connection in speaking',
        'making content relatable'
      ]
    },
    {
      key: 'strengths',
      value: [
        'reading people',
        'intellectual engagement',
        'deep connections',
        'transformation and self-improvement',
        'analytical thinking',
        'breaking down complex ideas'
      ]
    },
    {
      key: 'astrology_summary',
      value: {
        sun: 'Capricorn',
        moon: 'Scorpio',
        rising: 'Taurus',
        summary: 'Grounded and practical (Taurus rising) with intense emotional depth (Scorpio moon) and ambitious drive for achievement (Capricorn sun). Natural teacher who sees structure in everything.'
      }
    },
    {
      key: 'growth_prompts',
      value: [
        'Notice one moment today where you chose patience over reaction. What did it feel like?',
        'Who did you connect with deeply today? What made that connection real?',
        'Where did you feel most like yourself today? Where did you feel least like yourself?',
        'What did you learn today that changed how you see something?',
        'Did you hold back from saying something important? Why?',
        'What moment today would make a great story if you told it to someone?',
        'Where did you see Hashem today? In what moment did you feel His presence?',
        'What mitzvah felt most meaningful today? What made it different?',
        'If you could redo one moment from today, what would you change?',
        'What are you carrying that you need to let go of?',
        'Who needs you right now? How can you show up for them?',
        'What truth are you avoiding? What would happen if you faced it?',
        'Where did you grow today, even a little bit?',
        'What would the best version of you have done differently today?',
        'Name something small that brought you joy today.',
        'What conversation stayed with you after it ended? Why?',
        'Where did your analytical mind help you today? Where did it hold you back?',
        'Did you make someone feel seen today? How?',
        'What scared you today? Did you lean in or pull away?',
        'What would you tell your younger self about what happened today?'
      ]
    }
  ];

  for (const item of profileData) {
    const { error } = await supabase
      .from('user_profile')
      .upsert({ key: item.key, value: item.value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      console.log(`  Error seeding ${item.key}: ${error.message}`);
    } else {
      console.log(`  Seeded: ${item.key}`);
    }
  }

  console.log('\nDone!');
}

async function main() {
  const tablesReady = await setupTables();
  if (tablesReady) {
    await seedProfile();
  }
}

main();
