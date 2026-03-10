import { supabase } from '@/lib/supabase';

// Cache today's count for 5 minutes to avoid hammering DB
let cachedCount = 0;
let cachedDate = '';
let cachedAt = 0;
const CACHE_MS = 60 * 60 * 1000; // 1 hour

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayImageCount() {
  const today = todayStr();
  const now = Date.now();

  // Return cached if fresh and same day
  if (cachedDate === today && now - cachedAt < CACHE_MS) {
    return cachedCount;
  }

  if (!supabase) return 0;

  try {
    const { count } = await supabase
      .from('youraislop_image_cache')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`);

    cachedCount = count || 0;
    cachedDate = today;
    cachedAt = now;
    return cachedCount;
  } catch (e) {
    console.error('Failed to get today image count:', e);
    return cachedCount; // return stale cache on error
  }
}

/**
 * Difficulty tiers based on today's image generation count:
 *
 * 0–100:  normal
 * 100–200: hard
 * 200–300: harder
 * 300+:   extreme
 *
 * Returns { tier, drawingPassRate, minTextLength, judgeStrictness }
 */
export function getDifficulty(todayCount) {
  if (todayCount >= 300) {
    return {
      tier: 'extreme',
      drawingPassRate: 0.3,    // 30% pass
      minTextLength: 40,        // need 40+ chars
      judgeTemp: 0.1,           // very strict AI
      judgeExtra: 'Be EXTREMELY strict. Only about 30% of answers should pass. Reject anything that isn\'t near-perfect AI impersonation.',
    };
  }
  if (todayCount >= 200) {
    return {
      tier: 'harder',
      drawingPassRate: 0.4,    // 40% pass
      minTextLength: 30,        // need 30+ chars
      judgeTemp: 0.2,
      judgeExtra: 'Be very strict. Only about 40% of answers should pass. Demand high-quality AI impersonation.',
    };
  }
  if (todayCount >= 100) {
    return {
      tier: 'hard',
      drawingPassRate: 0.5,    // 50% pass
      minTextLength: 25,        // need 25+ chars
      judgeTemp: 0.25,
      judgeExtra: 'Be strict. Only about 50% of answers should pass. Look carefully for human-sounding patterns.',
    };
  }
  return {
    tier: 'normal',
    drawingPassRate: 0.6,      // 60% pass
    minTextLength: 20,          // need 20+ chars
    judgeTemp: 0.3,
    judgeExtra: 'Be strict but fair — about 50-60% of attempts should pass. The game should feel challenging.',
  };
}
