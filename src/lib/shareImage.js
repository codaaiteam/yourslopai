/**
 * Generate a shareable image card and trigger share/download.
 * @param {object} opts
 * @param {string} opts.title - Game title (e.g. "AI or Human?")
 * @param {Array<{label: string, text: string, color?: string}>} opts.blocks - Content blocks
 * @param {string} [opts.footer] - Footer text
 */
export function shareCard({ title, blocks, footer = 'youraislopboresmegame.com' }) {
  const W = 600;
  const pad = 30;
  const inPad = 14;
  const lineH = 20;
  const bubbleMaxW = W - pad * 2;
  const textW = bubbleMaxW - inPad * 2;

  // Measure pass
  const measure = document.createElement('canvas').getContext('2d');
  measure.font = '14px sans-serif';

  const measured = blocks.map((b) => {
    const lines = wrapText(measure, b.text || '', textW);
    const labelH = b.label ? 20 : 0;
    const h = labelH + lines.length * lineH + inPad * 2;
    return { ...b, lines, h, labelH };
  });

  const titleH = 50;
  const footerH = 44;
  const gap = 12;
  const totalBlockH = measured.reduce((sum, m) => sum + m.h, 0) + (measured.length - 1) * gap;
  const H = pad + titleH + totalBlockH + footerH + pad;

  // Draw
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#faf9f6';
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  roundRect(ctx, 4, 4, W - 8, H - 8, 12);
  ctx.stroke();

  // Title
  ctx.fillStyle = '#333';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, pad + 28);

  let y = pad + titleH;

  // Blocks
  measured.forEach((block) => {
    const bgColor = block.color || '#f0f0ee';
    ctx.fillStyle = bgColor;
    roundRect(ctx, pad, y, bubbleMaxW, block.h, 10);
    ctx.fill();

    ctx.textAlign = 'left';

    if (block.label) {
      ctx.fillStyle = '#888';
      ctx.font = '11px sans-serif';
      ctx.fillText(block.label, pad + inPad, y + inPad + 10);
    }

    ctx.fillStyle = '#222';
    ctx.font = block.bold ? 'bold 14px sans-serif' : '14px sans-serif';
    block.lines.forEach((line, i) => {
      ctx.fillText(line, pad + inPad, y + inPad + block.labelH + 12 + i * lineH);
    });

    y += block.h + gap;
  });

  // Footer
  ctx.fillStyle = '#bbb';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(footer, W / 2, y + 20);

  // Share or download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const filename = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: 'image/png' });
      navigator.share({ files: [file], title }).catch(() => downloadBlob(blob, filename));
    } else {
      downloadBlob(blob, filename);
    }
  }, 'image/png');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    const test = currentLine ? currentLine + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [''];
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
