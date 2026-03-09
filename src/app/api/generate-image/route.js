import { NextResponse } from 'next/server';

const KIE_API_URL = 'https://api.kie.ai/api/v1/jobs';
const KIE_API_KEY = process.env.KIE_API_KEY || '';
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLLS = 30; // max 60 seconds

async function createTask(prompt) {
  const res = await fetch(`${KIE_API_URL}/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'google/nano-banana',
      input: {
        prompt,
        output_format: 'jpeg',
        image_size: '1:1',
      },
    }),
  });

  const data = await res.json();
  if (data.code !== 200 || !data.data?.taskId) {
    throw new Error(data.message || 'Failed to create task');
  }
  return data.data.taskId;
}

async function pollTask(taskId) {
  for (let i = 0; i < MAX_POLLS; i++) {
    const res = await fetch(`${KIE_API_URL}/recordInfo?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
      },
    });

    const data = await res.json();
    const state = data.data?.state;

    if (state === 'success') {
      const resultJson = JSON.parse(data.data.resultJson || '{}');
      const imageUrl = resultJson.resultUrls?.[0];
      return { success: true, imageUrl };
    }

    if (state === 'fail') {
      return { success: false, error: data.data?.failMsg || 'Generation failed' };
    }

    // Still processing (waiting/queuing/generating)
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }

  return { success: false, error: 'Generation timed out' };
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    if (!KIE_API_KEY) {
      return NextResponse.json({
        error: 'KIE API key not configured',
        imageUrl: null,
      }, { status: 503 });
    }

    // Prepend style instruction to make it look like a human's rough doodle
    const styledPrompt = `crude simple hand-drawn doodle sketch on white paper, messy wobbly lines, childlike MS Paint style, low effort funny drawing, stick figures, no shading, no details, amateur scribble: ${prompt}`;

    // Create task
    const taskId = await createTask(styledPrompt);

    // Poll for result
    const result = await pollTask(taskId);

    if (result.success) {
      return NextResponse.json({
        imageUrl: result.imageUrl,
        taskId,
      });
    } else {
      return NextResponse.json({
        error: result.error,
        imageUrl: null,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({
      error: error.message || 'Image generation failed',
      imageUrl: null,
    }, { status: 500 });
  }
}
