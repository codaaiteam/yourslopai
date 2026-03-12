import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';
import { normalizePrompt } from '@/lib/imageCache';

export const dynamic = 'force-dynamic';

// POST: Submit an answer to a prompt (human or AI fallback)
export async function POST(req) {
  const rl = rateLimit(req, { limit: 15, windowMs: 60000, prefix: 'prompts-answer' });
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  try {
    const { prompt_id, text, image_url, source } = await req.json();

    if (!prompt_id) {
      return NextResponse.json({ error: 'Missing prompt_id' }, { status: 400 });
    }
    if (!text && !image_url) {
      return NextResponse.json({ error: 'Need text or image' }, { status: 400 });
    }

    const validSource = source === 'ai' ? 'ai' : 'human';

    // Check prompt still exists and is waiting
    const { data: prompt, error: pErr } = await supabase
      .from('youraislop_prompts')
      .select('id, status, prompt_text')
      .eq('id', prompt_id)
      .single();

    if (pErr || !prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    if (prompt.status === 'answered') {
      return NextResponse.json({ error: 'Already answered' }, { status: 409 });
    }

    // If there's an image, store in image cache with normalized_key for search
    if (image_url) {
      const normalizedKey = normalizePrompt(prompt.prompt_text || '');
      await supabase
        .from('youraislop_image_cache')
        .upsert({
          normalized_key: normalizedKey || `prompt_${prompt_id}`,
          original_prompt: (prompt.prompt_text || '').slice(0, 500),
          image_url,
          source: validSource,
          prompt_id,
        }, { onConflict: 'normalized_key' });
    }

    // Update prompt status
    await supabase
      .from('youraislop_prompts')
      .update({
        status: 'answered',
        response_text: text || null,
        response_image_url: image_url || null,
        response_source: validSource,
        answered_at: new Date().toISOString(),
      })
      .eq('id', prompt_id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Answer prompt error:', error);
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 });
  }
}
