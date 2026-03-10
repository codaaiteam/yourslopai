import { NextResponse } from 'next/server';
import { rateLimit, validateOrigin } from '@/lib/rateLimit';
import { recordCall } from '@/lib/apiStats';
import { supabase } from '@/lib/supabase';

const KIE_API_URL = 'https://api.kie.ai/api/v1/jobs';
const KIE_API_KEY = process.env.KIE_API_KEY || '';
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLLS = 30; // max 60 seconds
const SIMILARITY_THRESHOLD = 0.6;

// ---- Prompt normalization ----
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

// ---- Supabase cache operations ----
async function findCachedImageDB(normalizedKey) {
  if (!supabase) return null;
  try {
    // Exact match first
    const { data: exact } = await supabase
      .from('youraislop_image_cache')
      .select('image_url, normalized_key')
      .eq('normalized_key', normalizedKey)
      .limit(1)
      .single();

    if (exact) return exact.image_url;

    // Fuzzy: fetch recent entries and compare
    const inputTokens = normalizedKey.split(' ');
    // Use first 3 tokens as search hints via ilike
    const searchHints = inputTokens.slice(0, 3);
    let query = supabase
      .from('youraislop_image_cache')
      .select('image_url, normalized_key')
      .order('created_at', { ascending: false })
      .limit(200);

    // Filter: at least one keyword must appear
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
  } catch (e) {
    console.error('Supabase cache lookup error:', e);
    return null;
  }
}

async function storeCachedImageDB(normalizedKey, originalPrompt, imageUrl) {
  if (!supabase) return;
  try {
    await supabase
      .from('youraislop_image_cache')
      .upsert({
        normalized_key: normalizedKey,
        original_prompt: originalPrompt.slice(0, 500),
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      }, { onConflict: 'normalized_key' });
  } catch (e) {
    console.error('Supabase cache store error:', e);
  }
}

// ---- In-memory fallback (when Supabase not configured) ----
const memCache = new Map();
const MEM_CACHE_MAX = 500;

function findCachedImageMem(normalizedKey) {
  if (memCache.has(normalizedKey)) return memCache.get(normalizedKey);
  const inputTokens = new Set(normalizedKey.split(' '));
  if (inputTokens.size === 0) return null;
  let bestUrl = null;
  let bestScore = 0;
  for (const [key, url] of memCache) {
    const score = calcSimilarity(normalizedKey, key);
    if (score > bestScore) { bestScore = score; bestUrl = url; }
  }
  return bestScore >= SIMILARITY_THRESHOLD ? bestUrl : null;
}

function storeCachedImageMem(normalizedKey, imageUrl) {
  if (memCache.size >= MEM_CACHE_MAX) {
    const oldest = memCache.keys().next().value;
    memCache.delete(oldest);
  }
  memCache.set(normalizedKey, imageUrl);
}

// ---- KIE API ----
async function createTask(prompt) {
  const res = await fetch(`${KIE_API_URL}/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'google/nano-banana',
      input: {
        prompt,
        output_format: 'jpeg',
        image_size: '1:1',
      },
    }),
  });

  const data = await res.json();
  if (data.code !== 200 || !data.data?.taskId) {
    throw new Error(data.message || 'Failed to create task');
  }
  return data.data.taskId;
}

async function pollTask(taskId) {
  for (let i = 0; i < MAX_POLLS; i++) {
    const res = await fetch(`${KIE_API_URL}/recordInfo?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
      },
    });

    const data = await res.json();
    const state = data.data?.state;

    if (state === 'success') {
      const resultJson = JSON.parse(data.data.resultJson || '{}');
      const imageUrl = resultJson.resultUrls?.[0];
      return { success: true, imageUrl };
    }

    if (state === 'fail') {
      return { success: false, error: data.data?.failMsg || 'Generation failed' };
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }

  return { success: false, error: 'Generation timed out' };
}

// ---- POST handler ----
export async function POST(request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden', imageUrl: null }, { status: 403 });
  }

  const { success } = rateLimit(request, {
    limit: 5, windowMs: 60000, prefix: 'img',
    globalLimit: 200, globalWindowMs: 3600000,
  });
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Try again later.', imageUrl: null }, { status: 429 });
  }

  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    if (!KIE_API_KEY) {
      return NextResponse.json({ error: 'KIE API key not configured', imageUrl: null }, { status: 503 });
    }

    // Check cache
    const normalizedKey = normalizePrompt(prompt);
    const cachedUrl = supabase
      ? await findCachedImageDB(normalizedKey)
      : findCachedImageMem(normalizedKey);

    if (cachedUrl) {
      return NextResponse.json({ imageUrl: cachedUrl, cached: true });
    }

    // Generate new image
    const styledPrompt = `crude simple hand-drawn doodle sketch on white paper, messy wobbly lines, childlike MS Paint style, low effort funny drawing, stick figures, no shading, no details, amateur scribble: ${prompt}`;

    recordCall('image');

    const taskId = await createTask(styledPrompt);
    const result = await pollTask(taskId);

    if (result.success) {
      // Store in cache (non-blocking)
      if (supabase) {
        storeCachedImageDB(normalizedKey, prompt, result.imageUrl);
      } else {
        storeCachedImageMem(normalizedKey, result.imageUrl);
      }

      return NextResponse.json({ imageUrl: result.imageUrl, taskId });
    } else {
      return NextResponse.json({ error: result.error, imageUrl: null }, { status: 500 });
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: error.message || 'Image generation failed', imageUrl: null }, { status: 500 });
  }
}
