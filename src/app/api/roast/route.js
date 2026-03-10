import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit, validateOrigin } from '@/lib/rateLimit';
import { recordCall } from '@/lib/apiStats';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const SYSTEM_PROMPT = `You are a savage but funny roast comedian. The user will describe themselves or a situation. Deliver a short, witty roast (2-3 sentences max). Be creative, absurd, and hilarious — not mean-spirited or offensive. Match the language of the user's input.`;

export async function POST(request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limit: 10/IP/min + 400 global/hour
  const { success } = rateLimit(request, {
    limit: 10, windowMs: 60000, prefix: 'roast',
    globalLimit: 400, globalWindowMs: 3600000,
  });
  if (!success) {
    return NextResponse.json({
      roast: 'Easy there, roast addict. Even comedians take bathroom breaks.',
      source: 'ratelimit',
    });
  }

  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Invalid description' }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({
        roast: getFallbackRoast(),
        source: 'fallback',
      });
    }

    recordCall('roast');

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: description },
      ],
      max_tokens: 200,
      temperature: 1.0,
      top_p: 0.95,
    });

    const roast = completion.choices[0]?.message?.content || getFallbackRoast();

    return NextResponse.json({
      roast,
      source: 'deepseek',
    });
  } catch (error) {
    console.error('DeepSeek Roast API error:', error);
    return NextResponse.json({
      roast: getFallbackRoast(),
      source: 'fallback',
    });
  }
}

function getFallbackRoast() {
  const roasts = [
    "You just described yourself and somehow I'm the one who's embarrassed.",
    "I'd roast you harder but nature already did most of the work.",
    "That description was so mid, even autocomplete would've given up halfway through.",
    "You're like a human participation trophy — technically present, barely contributing.",
    "I've seen more personality in a default WiFi password.",
    "You described yourself like a LinkedIn bio written at 2 AM after three energy drinks. Ambitious yet deeply concerning.",
    "That was brave of you to share. Wrong, but brave.",
  ];
  return roasts[Math.floor(Math.random() * roasts.length)];
}
