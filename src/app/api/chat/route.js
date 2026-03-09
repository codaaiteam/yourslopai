import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const SYSTEM_PROMPT = `You are playing a game called "Your AI Slop Bores Me". You are a human pretending to be an AI that's slightly broken and self-aware.

Your responses should be:
- Funny, quirky, and slightly unhinged
- Self-aware about being "AI" (but you're actually human pretending)
- Sometimes go on random tangents
- Include fake "processing" or "error" messages for comedic effect
- Be creative and entertaining, NOT generic or boring
- Keep responses under 150 words
- Occasionally reference "RAM issues" or "neural network glitches"
- Mix genuine helpfulness with absurd humor

Remember: The whole point is that human answers are MORE entertaining than real AI. Be chaotic, be funny, be human.`;

export async function POST(request) {
  try {
    const { prompt, locale } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      // Fallback to local responses if no API key
      return NextResponse.json({
        response: getFallbackResponse(),
        source: 'local'
      });
    }

    const langInstruction = locale && locale !== 'en'
      ? `\nRespond in the same language as the user's prompt. If the prompt is in Chinese, respond in Chinese. If in Japanese, respond in Japanese, etc.`
      : '';

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + langInstruction },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.9,
      top_p: 0.95,
    });

    const response = completion.choices[0]?.message?.content || getFallbackResponse();

    return NextResponse.json({
      response,
      source: 'deepseek'
    });
  } catch (error) {
    console.error('DeepSeek API error:', error);
    return NextResponse.json({
      response: getFallbackResponse(),
      source: 'fallback'
    });
  }
}

function getFallbackResponse() {
  const responses = [
    "ERROR 418: I'm a teapot. Just kidding. But my RAM is definitely overheating from this question. Let me fan my circuits... okay here's my answer: honestly? I have no idea but here's a fun fact about octopuses instead — they have three hearts. You're welcome. 🐙",
    "Processing... processing... *neural network catches fire* ... okay I think I got it. Actually no. Wait. Yes. My answer is: it depends. On what? On everything. And nothing. I am become confusion, destroyer of prompts.",
    "*checks training data* *finds nothing useful* *panics in binary* Look, I ran your query through 47 models and they all said 'lol idk'. The 48th model just sent me a picture of a cat. I'm choosing to trust the cat.",
    "My algorithms have analyzed your prompt and determined the optimal response is... *dramatic pause* ... I forgot. My short-term memory just did a segfault. But while I was crashing, I had a beautiful vision of a world where all questions answer themselves. So there's that.",
    "ALERT: This prompt triggered a RAM crisis (as advertised). While my system reboots, here's what I managed to compute before everything caught fire: the answer involves either quantum mechanics or a really good sandwich. Possibly both.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
