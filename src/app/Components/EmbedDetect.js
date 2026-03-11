'use client';

import { useEffect } from 'react';

export default function EmbedDetect() {
  useEffect(() => {
    if (window.top !== window.self) {
      document.body.classList.add('embed');
    }
  }, []);
  return null;
}
