import { NextResponse } from 'next/server';
import { rateLimit, validateOrigin } from '@/lib/rateLimit';

// In-memory leaderboard (top 50, sorted by streak then score%)
const leaderboard = [];
const MAX_ENTRIES = 50;

export async function GET() {
  return NextResponse.json({ leaderboard: leaderboard.slice(0, 20) });
}

export async function POST(request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { success } = rateLimit(request, {
    limit: 10, windowMs: 60000, prefix: 'lb',
    globalLimit: 300, globalWindowMs: 3600000,
  });
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { name, score, total, streak } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 16) {
      return NextResponse.json({ error: 'Name must be 1-16 characters' }, { status: 400 });
    }
    if (typeof score !== 'number' || typeof total !== 'number' || typeof streak !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    if (total < 1) {
      return NextResponse.json({ error: 'Play at least 1 round' }, { status: 400 });
    }

    const cleanName = name.trim().slice(0, 16);
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

    const entry = {
      name: cleanName,
      score,
      total,
      streak,
      accuracy,
      timestamp: Date.now(),
    };

    // Remove existing entry from same name (keep latest)
    const existingIdx = leaderboard.findIndex(
      (e) => e.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existingIdx !== -1) {
      const existing = leaderboard[existingIdx];
      // Only update if new score is better
      if (streak > existing.streak || (streak === existing.streak && accuracy > existing.accuracy)) {
        leaderboard.splice(existingIdx, 1);
      } else {
        return NextResponse.json({ leaderboard: leaderboard.slice(0, 20), rank: existingIdx + 1 });
      }
    }

    leaderboard.push(entry);

    // Sort: highest streak first, then highest accuracy
    leaderboard.sort((a, b) => b.streak - a.streak || b.accuracy - a.accuracy || b.total - a.total);

    // Trim
    if (leaderboard.length > MAX_ENTRIES) leaderboard.length = MAX_ENTRIES;

    const rank = leaderboard.findIndex(
      (e) => e.name.toLowerCase() === cleanName.toLowerCase()
    ) + 1;

    return NextResponse.json({ leaderboard: leaderboard.slice(0, 20), rank });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
