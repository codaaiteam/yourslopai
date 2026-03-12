import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// POST: Report a prompt/answer — increment reported count
// When reported >= 3, it won't be shown to others
export async function POST(req) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60000, prefix: 'report' });
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  try {
    const { prompt_id } = await req.json();

    if (!prompt_id) {
      return NextResponse.json({ error: 'Missing prompt_id' }, { status: 400 });
    }

    const { data: current, error: fetchErr } = await supabase
      .from('youraislop_prompts')
      .select('reported')
      .eq('id', prompt_id)
      .single();

    if (fetchErr || !current) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    await supabase
      .from('youraislop_prompts')
      .update({ reported: (current.reported || 0) + 1 })
      .eq('id', prompt_id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Report failed' }, { status: 500 });
  }
}
