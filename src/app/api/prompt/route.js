import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit, validateOrigin } from '@/lib/rateLimit';
import { recordCall } from '@/lib/apiStats';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const SYSTEM_PROMPT = `You are a prompt generator for a game called "Your AI Slop Bores Me". Generate ONE creative, funny prompt for a human to answer or draw.

Rules:
- 1-2 sentences max, output ONLY the prompt
- For drawing prompts start with "Draw:"
- Be wildly random — different topic every time, never repeat
- Match the language if a locale is specified`;

export async function GET(request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limit: 15/IP/min + 500 global/hour
  const { success } = rateLimit(request, {
    limit: 15, windowMs: 60000, prefix: 'prompt',
    globalLimit: 500, globalWindowMs: 3600000,
  });
  if (!success) {
    return NextResponse.json({ prompt: null, source: 'ratelimit' });
  }

  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ prompt: null, source: 'local' });
    }

    const isDrawType = Math.random() < 0.3;
    const typeHint = isDrawType ? 'drawing prompt' : 'text prompt';
    const langNote = locale !== 'en' ? ` in ${locale} language` : '';
    const rand = Math.floor(Math.random() * 99999);

    recordCall('prompt');

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate a ${typeHint}${langNote}. Random seed: ${rand}` }
      ],
      max_tokens: 100,
      temperature: 1.3,
    });

    const prompt = completion.choices[0]?.message?.content?.trim();

    return NextResponse.json({
      prompt: prompt || null,
      source: 'deepseek'
    });
  } catch (error) {
    console.error('Prompt generation error:', error);
    return NextResponse.json({ prompt: null, source: 'fallback' });
  }
}
