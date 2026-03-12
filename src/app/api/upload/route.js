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
    const { dataUrl } = await req.json();
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    // Parse base64 data URL
    const matches = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
    }

    const ext = matches[1] === 'jpg' ? 'jpeg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

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
