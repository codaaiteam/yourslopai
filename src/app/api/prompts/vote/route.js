import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// POST: Vote on a prompt's answer (upvote or downvote)
export async function POST(req) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60000, prefix: 'vote' });
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  try {
    const { prompt_id, vote } = await req.json();

    if (!prompt_id || (vote !== 'up' && vote !== 'down')) {
      return NextResponse.json({ error: 'Need prompt_id and vote (up/down)' }, { status: 400 });
    }

    const column = vote === 'up' ? 'upvotes' : 'downvotes';

    // Fetch current count and increment
    const { data: current, error: fetchErr } = await supabase
      .from('youraislop_prompts')
      .select(`${column}`)
      .eq('id', prompt_id)
      .single();

    if (fetchErr || !current) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const { error: updateErr } = await supabase
      .from('youraislop_prompts')
      .update({ [column]: (current[column] || 0) + 1 })
      .eq('id', prompt_id);

    if (updateErr) throw updateErr;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Vote failed' }, { status: 500 });
  }
}
