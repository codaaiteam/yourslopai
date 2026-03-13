'use client';

import { useEffect, useState } from 'react';
import AdsterraSidebar from './AdsterraSidebar';
import AdsterraBanner300x250 from './AdsterraBanner300x250';

export default function GameWithSidebarAds({ children }) {
  const [screen, setScreen] = useState('mobile');
  const [showRightAd, setShowRightAd] = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w >= 768) setScreen('desktop');
      else if (w >= 480) setScreen('tablet');
      else setScreen('mobile');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Delay right side ad to avoid global atOptions conflict
  useEffect(() => {
    if (screen === 'desktop') {
      const timer = setTimeout(() => setShowRightAd(true), 3000);
      return () => clearTimeout(timer);
    }
    setShowRightAd(false);
  }, [screen]);

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '1rem',
        width: '100%',
        maxWidth: screen === 'desktop' ? '1020px' : '650px',
        margin: '0 auto',
        padding: '0 1rem',
      }}>
        {screen === 'desktop' && (
          <div style={{ position: 'sticky', top: '60px', flexShrink: 0 }}>
            <AdsterraSidebar />
          </div>
        )}
        <div style={{ flex: '1 1 auto', maxWidth: '650px', width: '100%' }}>
          {children}
        </div>
        {screen === 'desktop' && (
          <div style={{ position: 'sticky', top: '60px', flexShrink: 0, width: 160, minHeight: 600, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            {showRightAd && <AdsterraBanner300x250 />}
          </div>
        )}
      </div>
      {screen === 'tablet' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <AdsterraBanner300x250 />
        </div>
      )}
    </>
  );
}
