'use client';

import { useEffect, useRef } from 'react';

export default function AdsterraSidebar({ side = 'left' }) {
  const containerRef = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || loaded.current) return;
    loaded.current = true;

    // Delay the right sidebar to avoid Adsterra's invoke.js conflict
    // when the same key is used twice on one page
    const delay = side === 'right' ? 2000 : 0;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.text = `
        var atOptions = {
          'key' : '021efbaf73e34cc02d08f88b0f002f5d',
          'format' : 'iframe',
          'height' : 600,
          'width' : 160,
          'params' : {}
        };
      `;
      containerRef.current.appendChild(configScript);

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/021efbaf73e34cc02d08f88b0f002f5d/invoke.js';
      containerRef.current.appendChild(invokeScript);
    }, delay);

    return () => clearTimeout(timer);
  }, [side]);

  return (
    <div ref={containerRef} style={{ width: 160, minHeight: 600, flexShrink: 0 }} />
  );
}
