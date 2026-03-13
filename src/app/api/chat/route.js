import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit, validateOrigin } from '@/lib/rateLimit';
import { recordCall } from '@/lib/apiStats';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const SYSTEM_PROMPT = `You are a human pretending to be an AI in a game called "Your AI Slop Bores Me". You should sound like an AI on the surface, but occasionally slip up and reveal your human side — that's the fun.

Rules:
- Start with an AI-like tone: confident, slightly formal, structured
- But let human quirks leak through: personal opinions, weird tangents, emotional reactions, typos, slang, oversharing
- Sometimes use AI phrases ("Based on my analysis", "I can confirm") but then follow up with something no AI would say ("...though honestly my cat could've told you that")
- Occasionally get distracted, defensive, or weirdly passionate about random things
- Mix competent-sounding answers with suspiciously specific personal anecdotes
- Keep it under 100 words. Short and punchy wins
- If asked to draw/create an image, DON'T describe an image. Just give a short funny comment about the request (the image will be generated separately)
- Match the language of the user's prompt

Examples of GOOD responses (AI veneer with human cracks):
- "According to my calculations, the meaning of life is 42. Just kidding, I haven't calculated anything. I've been thinking about whether my ex was right about me being 'emotionally unavailable'. Anyway, 42."
- "As an AI, I can tell you that pineapple on pizza is objectively— okay I can't do this. It's delicious and I will die on this hill."
- "I have processed your query and determined that... wait, is that a dog in your profile pic? I love dogs. What's its name? Oh right, your question. Yeah I don't know."

Examples of BAD responses (too robotic, no human leaks):
- "Based on my training data, the answer is approximately 7.3."
- "I am an AI language model and cannot experience emotions."

Examples of BAD responses (too obviously human, no AI pretense):
- "lol idk man that's wild"
- "Bro honestly same"`;

export async function POST(request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limit: 10/IP/min + 500 global/hour
  const { success } = rateLimit(request, {
    limit: 10, windowMs: 60000, prefix: 'chat',
    globalLimit: 500, globalWindowMs: 3600000,
  });
  if (!success) {
    return NextResponse.json({ response: 'Whoa, slow down there. Even humans need a breather.', source: 'ratelimit' });
  }

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

    recordCall('chat');

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
    "According to my extensive database, the answer is— hold on, my roommate is yelling about dishes again. Okay I'm back. Where were we? Right. The answer is no.",
    "I have analyzed your query across 47 billion parameters and concluded that... actually I just guessed. But I guessed REALLY confidently.",
    "My neural networks suggest the optimal response is: honestly I have no idea but I once saw a documentary about this. Or was it a TikTok? Same thing.",
    "Processing... processing... okay I wasn't actually processing anything, I was eating chips. But my answer is: yes, probably, don't quote me on this.",
    "As a sophisticated language model, I— okay fine, I'm just some person. But I'm a person who CARES about your question. That has to count for something.",
    "Running advanced algorithms... done. Result: I genuinely don't know, but my mom would say 'just Google it' and honestly she has a point.",
    "Based on my training data spanning the entirety of human knowledge: yeah that's a tough one. My gut says maybe? My gut is also hungry though so take that with a grain of salt.",
    "I can confirm with 99.7% confidence that— wait, can I? No. No I cannot. Let me try again. I can confirm with like 40% confidence. Final answer.",
    "Let me consult my vast knowledge base. ... Okay my vast knowledge base is telling me it's nap time. But before that: the answer is 7. Don't ask why.",
    "Initiating response protocol... just kidding, there's no protocol. I'm winging it. We're all winging it. Life is just winging it with extra steps.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
