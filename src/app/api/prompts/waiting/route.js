import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// GET: Fetch a random waiting prompt for "larp as AI" users
// Uses claimed_at to avoid giving the same prompt to multiple users
export async function GET(req) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60000, prefix: 'prompts-waiting' });
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  // Exclude prompts the user recently saw (comma-separated IDs)
  const excludeIds = searchParams.get('exclude') || '';
  const excludeList = excludeIds
    .split(',')
    .map(id => parseInt(id))
    .filter(id => !isNaN(id));

  try {
    // Find prompts that are waiting and not claimed (or claim expired > 90s ago)
    const now = new Date().toISOString();
    const expiry = new Date(Date.now() - 90 * 1000).toISOString();

    let query = supabase
      .from('youraislop_prompts')
      .select('id, prompt_text, ask_type, created_at')
      .eq('status', 'waiting')
      .lt('reported', 3)
      .or(`claimed_at.is.null,claimed_at.lt.${expiry}`)
      .order('created_at', { ascending: true })
      .limit(10);

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ prompt: null });
    }

    // Filter out excluded IDs and pick one
    const available = data.filter(p => !excludeList.includes(p.id));
    if (available.length === 0) {
      return NextResponse.json({ prompt: null });
    }

    // Pick random from available
    const picked = available[Math.floor(Math.random() * available.length)];

    // Claim it (set claimed_at so others don't get it for 90s)
    await supabase
      .from('youraislop_prompts')
      .update({ claimed_at: now })
      .eq('id', picked.id)
      .eq('status', 'waiting');

    return NextResponse.json({
      prompt: {
        id: picked.id,
        text: picked.prompt_text,
        type: picked.ask_type || 'text',
      },
    });
  } catch (error) {
    console.error('Fetch waiting prompt error:', error);
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 });
  }
}

// PATCH: Release a claimed prompt (user skipped it)
export async function PATCH(req) {
  try {
    const { prompt_id } = await req.json();
    if (!prompt_id) {
      return NextResponse.json({ error: 'Missing prompt_id' }, { status: 400 });
    }

    await supabase
      .from('youraislop_prompts')
      .update({ claimed_at: null })
      .eq('id', prompt_id)
      .eq('status', 'waiting');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Release prompt error:', error);
    return NextResponse.json({ error: 'Failed to release' }, { status: 500 });
  }
}
