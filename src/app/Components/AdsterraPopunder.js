'use client';

const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
let scriptLoaded = false;

export function triggerPopunder() {
  const lastPop = localStorage.getItem('adsterra_pop_ts');
  if (lastPop && Date.now() - Number(lastPop) < COOLDOWN_MS) return;
  if (scriptLoaded) return;

  scriptLoaded = true;
  localStorage.setItem('adsterra_pop_ts', String(Date.now()));

  const script = document.createElement('script');
  script.src = 'https://pl28902335.effectivegatecpm.com/29/9c/67/299c67d28688eaa2294a6cefddc9863c.js';
  script.type = 'text/javascript';
  document.head.appendChild(script);
}
