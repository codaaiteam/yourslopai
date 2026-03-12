// One-time script: backfill normalized_key for existing youraislop_image_cache rows
// Run with: node scripts/fix-normalized-keys.js

const { createClient } = require('@supabase/supabase-js');

const STOP_WORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being',
  'i','me','my','you','your','he','she','it','we','they',
  'do','does','did','will','would','could','should','can','may',
  'of','in','to','for','with','on','at','by','from','and','or','but','not',
  'that','this','what','how','if','so','just','very','really','about',
  'draw','paint','sketch','make','create','generate','picture','image','photo',
  'please','want','need','give','show','let','some','something',
]);

function normalizePrompt(prompt) {
  const words = prompt
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
  const cjk = prompt.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || [];
  const all = [...new Set([...words, ...cjk])].sort();
  return all.join(' ');
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get all image_cache rows with prompt_id but missing normalized_key
  const { data: rows, error } = await supabase
    .from('youraislop_image_cache')
    .select('id, prompt_id, normalized_key, original_prompt')
    .not('prompt_id', 'is', null);

  if (error) { console.error('Fetch error:', error); return; }

  console.log(`Found ${rows.length} rows with prompt_id`);

  // Get all related prompts
  const promptIds = [...new Set(rows.map(r => r.prompt_id))];
  const { data: prompts } = await supabase
    .from('youraislop_prompts')
    .select('id, prompt_text')
    .in('id', promptIds);

  const promptMap = {};
  for (const p of prompts || []) {
    promptMap[p.id] = p.prompt_text;
  }

  let updated = 0;
  for (const row of rows) {
    const promptText = promptMap[row.prompt_id];
    if (!promptText) continue;

    const newKey = normalizePrompt(promptText);
    if (!newKey) continue;

    // Skip if already has a good key
    if (row.normalized_key && row.normalized_key.trim()) continue;

    const { error: updateErr } = await supabase
      .from('youraislop_image_cache')
      .update({
        normalized_key: newKey,
        original_prompt: promptText.slice(0, 500),
      })
      .eq('id', row.id);

    if (updateErr) {
      console.error(`Failed to update row ${row.id}:`, updateErr);
    } else {
      updated++;
      console.log(`Updated row ${row.id}: "${newKey}"`);
    }
  }

  console.log(`Done. Updated ${updated}/${rows.length} rows.`);
}

main();
