'use client';

import { useEffect, useState } from 'react';
import AdsterraSidebar from './AdsterraSidebar';

export default function GameWithSidebarAds({ children }) {
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth > 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '1rem',
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '0 1rem',
    }}>
      {isWide && (
        <div style={{ position: 'sticky', top: '60px', flexShrink: 0 }}>
          <AdsterraSidebar />
        </div>
      )}
      <div style={{ flex: '1 1 auto', maxWidth: '650px', width: '100%' }}>
        {children}
      </div>
      {isWide && (
        <div style={{ position: 'sticky', top: '60px', flexShrink: 0 }}>
          <AdsterraSidebar />
        </div>
      )}
    </div>
  );
}
