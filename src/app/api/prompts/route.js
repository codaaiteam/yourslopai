import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// POST: Submit a new prompt (human asks a question)
export async function POST(req) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60000, prefix: 'prompts' });
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  try {
    const { prompt_text, ask_type, prompt_source } = await req.json();

    if (!prompt_text || prompt_text.trim().length < 2) {
      return NextResponse.json({ error: 'Prompt too short' }, { status: 400 });
    }
    if (prompt_text.length > 300) {
      return NextResponse.json({ error: 'Prompt too long' }, { status: 400 });
    }

    const validSource = prompt_source === 'ai' ? 'ai' : 'human';

    const { data, error } = await supabase
      .from('youraislop_prompts')
      .insert({
        prompt_text: prompt_text.trim(),
        ask_type: ask_type || 'text',
        status: 'waiting',
        prompt_source: validSource,
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('Create prompt error:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}

// GET: Poll for answer to a specific prompt
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const promptId = searchParams.get('id');

  if (!promptId) {
    return NextResponse.json({ error: 'Missing prompt id' }, { status: 400 });
  }

  try {
    // Check if there's an answer for this prompt
    const { data: images, error } = await supabase
      .from('youraislop_image_cache')
      .select('image_url, source, original_prompt')
      .eq('prompt_id', parseInt(promptId))
      .limit(1);

    if (error) throw error;

    if (images && images.length > 0) {
      return NextResponse.json({
        answered: true,
        image_url: images[0].image_url,
        source: images[0].source,
        text: images[0].original_prompt,
      });
    }

    // Also check if prompt has a text response
    const { data: prompt, error: pErr } = await supabase
      .from('youraislop_prompts')
      .select('status, response_text, response_source')
      .eq('id', parseInt(promptId))
      .single();

    if (pErr) throw pErr;

    if (prompt.status === 'answered') {
      return NextResponse.json({
        answered: true,
        text: prompt.response_text,
        source: prompt.response_source,
      });
    }

    return NextResponse.json({ answered: false });
  } catch (error) {
    console.error('Poll prompt error:', error);
    return NextResponse.json({ error: 'Failed to poll' }, { status: 500 });
  }
}
