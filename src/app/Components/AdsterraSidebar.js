'use client';

import { useEffect, useRef } from 'react';

export default function AdsterraSidebar() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (containerRef.current.querySelector('script')) return;

    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.text = `
      atOptions = {
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
  }, []);

  return (
    <div ref={containerRef} style={{ width: 160, minHeight: 600, flexShrink: 0 }} />
  );
}
