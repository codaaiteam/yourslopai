import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { findSimilarImage } from '@/lib/imageCache';

export const dynamic = 'force-dynamic';

// GET: AI fallback — for image requests, search community image pool first
// ?type=text|image&prompt=xxx
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const askType = searchParams.get('type') || 'text';
  const prompt = searchParams.get('prompt') || '';

  try {
    // For image requests, search the image cache for a similar existing image
    let cachedImageUrl = null;
    if (askType === 'image' && prompt) {
      cachedImageUrl = await findSimilarImage(prompt);
    }

    // Get a random pre-seeded text response matching ask_type
    const { count } = await supabase
      .from('youraislop_prompts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'answered')
      .eq('ask_type', askType)
      .lt('reported', 3)
      .not('response_text', 'is', null);

    let text = null;
    if (count && count > 0) {
      const offset = Math.floor(Math.random() * count);
      const { data } = await supabase
        .from('youraislop_prompts')
        .select('response_text, response_image_url')
        .eq('status', 'answered')
        .eq('ask_type', askType)
        .lt('reported', 3)
        .not('response_text', 'is', null)
        .range(offset, offset)
        .limit(1);

      if (data && data.length > 0) {
        text = data[0].response_text;
        // Use cached image from image_cache if found, otherwise use prompt's image
        if (!cachedImageUrl) {
          cachedImageUrl = data[0].response_image_url;
        }
      }
    }

    return NextResponse.json({
      text,
      image_url: cachedImageUrl,
    });
  } catch (error) {
    console.error('Fallback fetch error:', error);
    return NextResponse.json({ text: null });
  }
}
