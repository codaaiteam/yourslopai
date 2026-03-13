'use client';

import { useEffect, useRef } from 'react';

const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
const SCRIPT_URL = 'https://pl28902335.effectivegatecpm.com/29/9c/67/299c67d28688eaa2294a6cefddc9863c.js';

export default function AdsterraPopunder() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    // Check 30-min cooldown
    const lastPop = localStorage.getItem('adsterra_pop_ts');
    if (lastPop && Date.now() - Number(lastPop) < COOLDOWN_MS) return;

    // Only load the popunder script on first click, then remove the listener
    // so Adsterra's script only gets one click to trigger on
    function onFirstClick() {
      document.removeEventListener('click', onFirstClick, true);
      if (loaded.current) return;
      loaded.current = true;
      localStorage.setItem('adsterra_pop_ts', String(Date.now()));

      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.type = 'text/javascript';
      document.head.appendChild(script);

      // Remove the script after a short delay so it can't attach
      // persistent click handlers for subsequent clicks
      setTimeout(() => {
        script.remove();
      }, 3000);
    }

    document.addEventListener('click', onFirstClick, true);
    return () => document.removeEventListener('click', onFirstClick, true);
  }, []);

  return null;
}
