import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const KIE_API_URL = 'https://api.kie.ai/api/v1/jobs';
const KIE_API_KEY = process.env.KIE_API_KEY;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

if (!KIE_API_KEY) {
  console.error('KIE_API_KEY not found in .env.local');
  process.exit(1);
}

const LOGOS = [
  {
    name: 'logo-site',
    prompt: 'minimalist abstract scribble logo, single continuous messy tangled black ink line on pure white background, abstract chaotic doodle ball shape, no text, no details, just raw expressive black lines, like a frustrated person scribbling on paper, modern art logo style',
  },
  {
    name: 'logo-ai-or-human',
    prompt: 'minimalist abstract scribble icon, messy black ink lines on pure white background forming a rough question mark shape mixed with a simple stick figure face, raw expressive doodle, no text, no details, tangled chaotic lines, modern art logo style',
  },
  {
    name: 'logo-ai-roast',
    prompt: 'minimalist abstract scribble icon, messy black ink lines on pure white background forming a rough flame or fire shape, raw expressive doodle, no text, no details, tangled chaotic wobbly lines, modern art logo style',
  },
  {
    name: 'logo-story-chain',
    prompt: 'minimalist abstract scribble icon, messy black ink lines on pure white background forming a rough chain or linked loops shape, raw expressive doodle, no text, no details, tangled chaotic wobbly lines, modern art logo style',
  },
];

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
        output_format: 'png',
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
  for (let i = 0; i < 30; i++) {
    const res = await fetch(`${KIE_API_URL}/recordInfo?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${KIE_API_KEY}` },
    });
    const data = await res.json();
    const state = data.data?.state;

    if (state === 'success') {
      const resultJson = JSON.parse(data.data.resultJson || '{}');
      return resultJson.resultUrls?.[0];
    }
    if (state === 'fail') {
      throw new Error(data.data?.failMsg || 'Generation failed');
    }
    await new Promise(r => setTimeout(r, 2000));
    process.stdout.write('.');
  }
  throw new Error('Timeout');
}

async function downloadImage(url, filepath) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filepath, buffer);
}

async function generateLogo(logo) {
  console.log(`\nGenerating ${logo.name}...`);
  try {
    const taskId = await createTask(logo.prompt);
    process.stdout.write(`  Task ${taskId}, polling`);
    const imageUrl = await pollTask(taskId);
    console.log(' done!');

    const filepath = path.join(PUBLIC_DIR, `${logo.name}.png`);
    await downloadImage(imageUrl, filepath);
    console.log(`  Saved to ${filepath}`);
    return true;
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('Generating logos with KIE API (nano-banana model)...');
  console.log(`Style reference: abstract scribble doodle like public/logo.png\n`);

  // Generate all in parallel
  const results = await Promise.all(LOGOS.map(generateLogo));

  const success = results.filter(Boolean).length;
  console.log(`\nDone! ${success}/${LOGOS.length} logos generated.`);
}

main();
