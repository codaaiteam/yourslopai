import { NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60000, prefix: 'upload' });
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  try {
    const body = await req.text();
    let dataUrl;
    try {
      dataUrl = JSON.parse(body).dataUrl;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    // Parse base64 data URL
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) {
      return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
    }
    const header = dataUrl.slice(0, commaIdx);
    const headerMatch = header.match(/^data:image\/(png|jpeg|jpg|webp);base64$/);
    if (!headerMatch) {
      return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
    }
    const base64Data = dataUrl.slice(commaIdx + 1);

    const ext = headerMatch[1] === 'jpg' ? 'jpeg' : headerMatch[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Max 5MB
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large (max 5MB)' }, { status: 400 });
    }

    const key = `drawings/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const url = await uploadToR2(buffer, key, `image/${ext}`);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
