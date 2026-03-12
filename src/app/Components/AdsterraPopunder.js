'use client';

import { useEffect, useRef } from 'react';

const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

export default function AdsterraPopunder() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    // Check cooldown
    const lastPop = localStorage.getItem('adsterra_pop_ts');
    if (lastPop && Date.now() - Number(lastPop) < COOLDOWN_MS) return;

    loaded.current = true;
    localStorage.setItem('adsterra_pop_ts', String(Date.now()));

    const script = document.createElement('script');
    script.src = 'https://pl28902335.effectivegatecpm.com/29/9c/67/299c67d28688eaa2294a6cefddc9863c.js';
    script.type = 'text/javascript';
    document.head.appendChild(script);
  }, []);

  return null;
}
