import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit, validateOrigin } from '@/lib/rateLimit';
import { recordCall } from '@/lib/apiStats';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const JUDGE_PROMPT = `You are a judge in a game called "Larp as AI". Humans must PRETEND to be an AI answering prompts. Your job is to decide if their answer sounds like it was written by an AI.

Criteria for PASSING (the answer sounds AI-like):
- Sounds like something ChatGPT, Claude, or a language model would say
- Uses structured, polished, or overly helpful language
- Has that classic AI tone: confident, thorough, slightly generic
- Longer, well-organized answers with good grammar
- Lists, step-by-step explanations, or "Here's what I think..." style

Criteria for FAILING (the answer sounds too human):
- Too short, lazy, or low-effort (under 20 words is almost always a fail)
- Casual slang, typos, or messy grammar that feels too human
- Random gibberish or completely off-topic
- Just a joke or meme with no substance
- Doesn't address the prompt at all
- Sounds like a bored human typing whatever

Be strict but fair — about 50-60% of attempts should pass. The game should feel challenging.
Respond with ONLY valid JSON: {"pass":true,"reason":"short reason"} or {"pass":false,"reason":"short reason"}
Keep reason under 20 words, be witty/snarky. Match the user's language.`;

export async function POST(request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { success } = rateLimit(request, {
    limit: 15, windowMs: 60000, prefix: 'judge',
    globalLimit: 600, globalWindowMs: 3600000,
  });
  if (!success) {
    // On rate limit, just approve
    return NextResponse.json({ pass: true, reason: '' });
  }

  try {
    const { prompt, answer, isDrawing } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ pass: true, reason: '' });
    }

    // Drawings: 60% pass, 40% fail with snarky reasons
    if (isDrawing) {
      if (Math.random() < 0.6) {
        const passReasons = [
          'Nice drawing!',
          'Modern art at its finest.',
          'Picasso would be proud. Maybe.',
          'I can almost tell what that is. Token granted.',
          'Bold strokes. Questionable execution. Approved.',
        ];
        return NextResponse.json({ pass: true, reason: passReasons[Math.floor(Math.random() * passReasons.length)] });
      } else {
        const failReasons = [
          "I don't want to pass you.",
          "I've seen better drawings from a broken printer.",
          "My cat could do better. And I don't have a cat.",
          "This is abstract in the worst way possible.",
          "I'm going to pretend I didn't see this.",
          "No. Just... no.",
          "Were you drawing with your eyes closed?",
          "This made me sad. No token for you.",
        ];
        return NextResponse.json({ pass: false, reason: failReasons[Math.floor(Math.random() * failReasons.length)] });
      }
    }

    // Too short = auto fail, no need to call AI
    if (!answer || answer.trim().length < 20) {
      return NextResponse.json({ pass: false, reason: 'Too short. A real AI would say more than that.' });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ pass: true, reason: '' });
    }

    recordCall('judge');

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: JUDGE_PROMPT },
        { role: 'user', content: `Prompt: ${prompt}\nAnswer: ${answer}` }
      ],
      max_tokens: 80,
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content || '';
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          pass: !!result.pass,
          reason: result.reason || '',
        });
      }
    } catch {}

    // Fallback: approve
    return NextResponse.json({ pass: true, reason: '' });
  } catch (error) {
    console.error('Judge API error:', error);
    return NextResponse.json({ pass: true, reason: '' });
  }
}
