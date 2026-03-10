import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit, validateOrigin } from '@/lib/rateLimit';
import { recordCall } from '@/lib/apiStats';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const SYSTEM_PROMPT = `You are co-writing a collaborative story with a human. The human writes one sentence, then you write the next sentence. Rules:
- Write ONLY one sentence (15-25 words).
- Be creative, unexpected, and fun.
- Match the tone and language of the story so far.
- Add surprising twists.
- Keep it PG-13.`;

const FALLBACK_SENTENCES = [
  'Suddenly, a raccoon wearing a tiny top hat appeared and demanded everyone speak in rhymes.',
  'Nobody expected the vending machine to start dispensing life advice instead of snacks.',
  'The clouds parted to reveal a giant neon sign that simply read: "Good luck with that."',
  'Meanwhile, somewhere across town, a cat was plotting something far more elaborate.',
  'A mysterious envelope slid under the door, smelling faintly of cinnamon and regret.',
  'The lights flickered twice, which according to ancient tradition meant it was taco time.',
  'From the shadows emerged a figure holding nothing but a rubber duck and an air of confidence.',
];

export async function POST(request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { success } = rateLimit(request, {
    limit: 15,
    windowMs: 60000,
    prefix: 'story',
    globalLimit: 500,
    globalWindowMs: 3600000,
  });

  if (!success) {
    return NextResponse.json({
      sentence: 'The narrator paused, overwhelmed by the sheer pace of this story.',
      source: 'ratelimit',
    });
  }

  try {
    const { story } = await request.json();

    if (!story || typeof story !== 'string') {
      return NextResponse.json({ error: 'Invalid story' }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({
        sentence: getFallbackSentence(),
        source: 'fallback',
      });
    }

    recordCall('story');

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: story },
      ],
      max_tokens: 80,
      temperature: 1.0,
      top_p: 0.95,
    });

    const sentence =
      completion.choices[0]?.message?.content?.trim() || getFallbackSentence();

    return NextResponse.json({ sentence, source: 'deepseek' });
  } catch (error) {
    console.error('Story API error:', error);
    return NextResponse.json({
      sentence: getFallbackSentence(),
      source: 'fallback',
    });
  }
}

function getFallbackSentence() {
  return FALLBACK_SENTENCES[
    Math.floor(Math.random() * FALLBACK_SENTENCES.length)
  ];
}
