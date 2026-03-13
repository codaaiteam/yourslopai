import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const MAX_DAILY_USE = 10;

// GET: Fetch a prompt for "larp as AI" users
// Priority: 1) real human waiting prompts  2) reusable answered prompts (<10 uses/day)
export async function GET(req) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60000, prefix: 'prompts-waiting' });
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const excludeIds = searchParams.get('exclude') || '';
  const excludeList = excludeIds
    .split(',')
    .map(id => parseInt(id))
    .filter(id => !isNaN(id));

  try {
    const now = new Date().toISOString();
    const today = new Date().toISOString().slice(0, 10);
    const expiry = new Date(Date.now() - 90 * 1000).toISOString();

    // 1. Try real human waiting prompts first (highest priority)
    const { data: waitingData, error: wErr } = await supabase
      .from('youraislop_prompts')
      .select('id, prompt_text, ask_type, created_at')
      .eq('status', 'waiting')
      .lt('reported', 3)
      .or(`claimed_at.is.null,claimed_at.lt.${expiry}`)
      .order('created_at', { ascending: true })
      .limit(10);

    if (wErr) throw wErr;

    if (waitingData && waitingData.length > 0) {
      const available = waitingData.filter(p => !excludeList.includes(p.id));
      if (available.length > 0) {
        const picked = available[Math.floor(Math.random() * available.length)];
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
            isReal: true,
          },
        });
      }
    }

    // 2. Reuse answered prompts that haven't hit daily limit
    // Get prompts where last_use_date != today OR daily_use_count < MAX
    const { data: reusable, error: rErr } = await supabase
      .from('youraislop_prompts')
      .select('id, prompt_text, ask_type')
      .eq('status', 'answered')
      .lt('reported', 3)
      .or(`last_use_date.is.null,last_use_date.neq.${today},daily_use_count.lt.${MAX_DAILY_USE}`)
      .order('daily_use_count', { ascending: true })
      .limit(20);

    if (rErr) throw rErr;

    if (reusable && reusable.length > 0) {
      const available = reusable.filter(p => !excludeList.includes(p.id));
      if (available.length > 0) {
        const picked = available[Math.floor(Math.random() * Math.min(available.length, 10))];

        // Increment daily use count (reset if new day)
        const { data: current } = await supabase
          .from('youraislop_prompts')
          .select('daily_use_count, last_use_date')
          .eq('id', picked.id)
          .single();

        const isNewDay = !current?.last_use_date || current.last_use_date !== today;
        await supabase
          .from('youraislop_prompts')
          .update({
            daily_use_count: isNewDay ? 1 : (current?.daily_use_count || 0) + 1,
            last_use_date: today,
          })
          .eq('id', picked.id);

        return NextResponse.json({
          prompt: {
            id: picked.id,
            text: picked.prompt_text,
            type: picked.ask_type || 'text',
            isReuse: true,
          },
        });
      }
    }

    // 3. Nothing available
    return NextResponse.json({ prompt: null });
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
