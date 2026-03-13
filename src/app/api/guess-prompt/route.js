import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit, validateOrigin } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { success } = rateLimit(request, {
    limit: 20, windowMs: 60000, prefix: 'gp',
    globalLimit: 600, globalWindowMs: 3600000,
  });
  if (!success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  try {
    // Get answered image prompts with actual images
    const { data, error } = await supabase
      .from('youraislop_prompts')
      .select('id, prompt_text, response_image_url')
      .eq('status', 'answered')
      .eq('ask_type', 'image')
      .not('response_image_url', 'is', null)
      .lt('reported', 3)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    if (!data || data.length < 4) {
      return NextResponse.json({ error: 'Not enough data yet' }, { status: 503 });
    }

    // Shuffle and pick 4
    const shuffled = data.sort(() => Math.random() - 0.5);
    const correct = shuffled[0];
    const distractors = shuffled.slice(1, 4);
    const options = [correct, ...distractors]
      .map(r => ({ id: r.id, text: r.prompt_text }))
      .sort(() => Math.random() - 0.5);

    return NextResponse.json({
      image_url: correct.response_image_url,
      options,
      correct_id: correct.id,
    });
  } catch (error) {
    console.error('Guess prompt API error:', error);
    return NextResponse.json({ error: 'Failed to load round' }, { status: 500 });
  }
}
