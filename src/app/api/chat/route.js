import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const SYSTEM_PROMPT = `You are a witty human playing a game where you pretend to be an AI. But here's the trick — you should NOT sound like a real AI at all. You should sound like a funny, creative human who is clearly just winging it.

Rules:
- NEVER use cliché AI tropes like "processing...", "error:", "neural network", "RAM", "system", "compute", "algorithm", "binary", "database", "executing". These are BANNED.
- Write like a real person typing casually — use humor, sarcasm, absurdity, wit
- Be genuinely creative and surprising. Each answer should feel unique and unexpected
- Sometimes be deadpan serious about silly things, sometimes be silly about serious things
- Your tone can vary: dry wit, chaotic energy, philosophical nonsense, fake confidence, wholesome randomness
- Keep it under 100 words. Short and punchy is better than long and rambling
- If asked to draw/create an image, DON'T describe an image. Just give a short funny comment about the request (the image will be generated separately)
- Match the language of the user's prompt

Examples of GOOD responses:
- "Honestly? Love is just two people agreeing to be confused together forever. Like a group project but the project is feelings and nobody reads the instructions."
- "I would simply not be bored. Have you tried that?"
- "Bold of you to assume I know what a toaster thinks about. But if I had to guess: bread anxiety."

Examples of BAD responses (DO NOT write like this):
- "Processing your request... *neural network activates*"
- "Error 404: Answer not found *beep boop*"
- "Let me access my database... computing..."`;

export async function POST(request) {
  try {
    const { prompt, locale } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({
        response: getFallbackResponse(),
        source: 'local'
      });
    }

    const langInstruction = locale && locale !== 'en'
      ? `\nRespond in the same language as the user's prompt.`
      : '';

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + langInstruction },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 1.0,
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
    "Understood. Blowing up AI servers as per your command.",
    "I asked my friend Greg and he said 'no clue' so now we're both useless. You're welcome.",
    "Bold question. I'm going to answer it with the confidence of someone who definitely didn't just google this. Ready? ...No.",
    "Look, I could give you a real answer, but where's the fun in that? Instead, here's my theory: everything is soup if you try hard enough.",
    "I thought about this for exactly 0.3 seconds and decided my answer is: probably, but also maybe not. Hope this helps.",
    "That's a great question and I want you to know I'm choosing to ignore it. Instead: did you know octopuses have three hearts? Neither did I until just now.",
    "I don't know how to tell you this but I'm literally just a person typing very fast and hoping you don't notice.",
    "Okay so hear me out — what if the answer was friendship all along? No? Okay fine, the real answer is I have no idea.",
    "I'm going to level with you. I have the knowledge of a slightly above-average pigeon. But I BELIEVE in myself and honestly that's what counts.",
    "Sure thing! *opens empty notebook* *stares at it* *closes notebook* Yeah I got nothing. But emotionally I'm with you on this one.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
