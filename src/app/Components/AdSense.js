'use client';

import { useEffect } from 'react';

export default function AdSense() {
  useEffect(() => {
    // Only load once
    if (document.querySelector('script[src*="adsbygoogle"]')) return;
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5451478429268021';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, []);

  return null;
}
