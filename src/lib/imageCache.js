import { supabase } from '@/lib/supabase';

const SIMILARITY_THRESHOLD = 0.6;

const STOP_WORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being',
  'i','me','my','you','your','he','she','it','we','they',
  'do','does','did','will','would','could','should','can','may',
  'of','in','to','for','with','on','at','by','from','and','or','but','not',
  'that','this','what','how','if','so','just','very','really','about',
  'draw','paint','sketch','make','create','generate','picture','image','photo',
  'please','want','need','give','show','let','some','something',
  '画','个','一个','的','请','帮','我','给','要','一',
]);

export function normalizePrompt(prompt) {
  const words = prompt
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
  const cjk = prompt.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || [];
  const all = [...new Set([...words, ...cjk])].sort();
  return all.join(' ');
}

function calcSimilarity(keyA, keyB) {
  const tokensA = new Set(keyA.split(' '));
  const tokensB = new Set(keyB.split(' '));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap++;
  }
  return overlap / Math.max(tokensA.size, tokensB.size);
}

/**
 * Search youraislop_image_cache for a similar image (exact + fuzzy match)
 * @param {string} prompt - user's prompt
 * @returns {string|null} image URL or null
 */
export async function findSimilarImage(prompt) {
  if (!supabase) return null;
  const normalizedKey = normalizePrompt(prompt);
  if (!normalizedKey) return null;

  try {
    // Search youraislop_prompts — the single source of truth for all answers
    // Priority: human > ai (same similarity score, prefer human)
    const inputTokens = normalizedKey.split(' ');
    const searchHints = inputTokens.slice(0, 3);

    let query = supabase
      .from('youraislop_prompts')
      .select('prompt_text, response_image_url, response_source')
      .eq('status', 'answered')
      .eq('ask_type', 'image')
      .not('response_image_url', 'is', null)
      .lt('reported', 3)
      .order('created_at', { ascending: false })
      .limit(200);

    if (searchHints.length > 0) {
      const orFilter = searchHints.map(h => `prompt_text.ilike.%${h}%`).join(',');
      query = query.or(orFilter);
    }

    const { data: candidates } = await query;
    if (!candidates || candidates.length === 0) {
      // Fallback: also check youraislop_image_cache (legacy AI-generated images)
      return await findInImageCache(normalizedKey, inputTokens);
    }

    // Collect all matches above threshold, split by source
    const humanMatches = [];
    const aiMatches = [];

    for (const row of candidates) {
      const rowKey = normalizePrompt(row.prompt_text || '');
      const score = calcSimilarity(normalizedKey, rowKey);
      if (score >= SIMILARITY_THRESHOLD) {
        if (row.response_source === 'human') {
          humanMatches.push(row.response_image_url);
        } else {
          aiMatches.push(row.response_image_url);
        }
      }
    }

    // Pick random from human matches first (already sorted newest first by query)
    if (humanMatches.length > 0) {
      return humanMatches[Math.floor(Math.random() * humanMatches.length)];
    }
    if (aiMatches.length > 0) {
      return aiMatches[Math.floor(Math.random() * aiMatches.length)];
    }

    // Fallback: check legacy image_cache table
    return await findInImageCache(normalizedKey, inputTokens);
  } catch (e) {
    console.error('Image cache search error:', e);
    return null;
  }
}

// Search legacy youraislop_image_cache table (AI-generated images without prompt_id)
async function findInImageCache(normalizedKey, inputTokens) {
  try {
    // Exact match
    const { data: exact } = await supabase
      .from('youraislop_image_cache')
      .select('image_url')
      .eq('normalized_key', normalizedKey)
      .limit(1)
      .single();

    if (exact) return exact.image_url;

    // Fuzzy match
    const searchHints = inputTokens.slice(0, 3);
    let query = supabase
      .from('youraislop_image_cache')
      .select('image_url, normalized_key')
      .order('created_at', { ascending: false })
      .limit(200);

    if (searchHints.length > 0) {
      const orFilter = searchHints.map(h => `normalized_key.ilike.%${h}%`).join(',');
      query = query.or(orFilter);
    }

    const { data: candidates } = await query;
    if (!candidates || candidates.length === 0) return null;

    let bestUrl = null;
    let bestScore = 0;
    for (const row of candidates) {
      const score = calcSimilarity(normalizedKey, row.normalized_key);
      if (score > bestScore) {
        bestScore = score;
        bestUrl = row.image_url;
      }
    }
    return bestScore >= SIMILARITY_THRESHOLD ? bestUrl : null;
  } catch {
    return null;
  }
}
