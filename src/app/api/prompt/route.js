import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit, validateOrigin } from '@/lib/rateLimit';
import { recordCall } from '@/lib/apiStats';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const SYSTEM_PROMPT = `You are a prompt generator for a game called "Your AI Slop Bores Me". Generate a single creative, funny, or thought-provoking prompt that a human would ask an "AI" to answer or draw.

Rules:
- Keep it to 1-2 sentences max
- Make it creative, absurd, or thought-provoking
- Alternate between text prompts and drawing prompts
- For drawing prompts, start with "Draw:" or "🎨"
- Examples: "Explain gravity but you're a pirate", "Draw: a penguin doing taxes", "Write a Yelp review for the void"
- DO NOT include any preamble, just output the prompt directly
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

    const langNote = locale !== 'en'
      ? `Generate the prompt in the language for locale: ${locale}`
      : 'Generate the prompt in English';

    recordCall('prompt');

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: langNote }
      ],
      max_tokens: 100,
      temperature: 1.0,
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
