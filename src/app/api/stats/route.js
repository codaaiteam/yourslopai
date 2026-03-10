import { NextResponse } from 'next/server';
import { getStats } from '@/lib/apiStats';

// Protect with a secret key — set STATS_SECRET in .env
const STATS_SECRET = process.env.STATS_SECRET || 'slop-stats-2026';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key !== STATS_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = getStats();

  // Check if format=text for easy reading
  const format = searchParams.get('format');
  if (format === 'text') {
    const lines = [
      `=== API Usage Stats ===`,
      `Server started: ${stats.serverStarted}`,
      ``,
      `--- Current Hour (${stats.currentHour.key}) ---`,
      `  Chat: ${stats.currentHour.chat}  |  Prompt: ${stats.currentHour.prompt}  |  Image: ${stats.currentHour.image}`,
      `  Est. cost: $${stats.currentHour.cost}`,
      ``,
      `--- Today ---`,
      `  Chat: ${stats.today.chat}  |  Prompt: ${stats.today.prompt}  |  Image: ${stats.today.image}`,
      `  Est. cost: $${stats.today.cost}`,
      ``,
      `--- Since Server Start ---`,
      `  Chat: ${stats.lifetime.chat}  |  Prompt: ${stats.lifetime.prompt}  |  Image: ${stats.lifetime.image}`,
      `  Est. cost: $${stats.lifetime.cost}`,
      ``,
      `--- Hourly Breakdown ---`,
    ];

    for (const [hour, data] of Object.entries(stats.hourly)) {
      lines.push(`  ${hour}  chat:${data.chat} prompt:${data.prompt} img:${data.image} cost:$${data.cost}`);
    }

    return new Response(lines.join('\n'), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return NextResponse.json(stats);
}
