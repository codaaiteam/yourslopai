'use client';

import AdsterraSidebar from './AdsterraSidebar';

export default function GameWithSidebarAds({ children }) {
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
      <div className="sidebar-ad" style={{ position: 'sticky', top: '60px' }}>
        <AdsterraSidebar />
      </div>
      <div style={{ flex: '1 1 auto', maxWidth: '650px', width: '100%' }}>
        {children}
      </div>
      <div className="sidebar-ad" style={{ position: 'sticky', top: '60px' }}>
        <AdsterraSidebar />
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-ad { display: none !important; }
        }
      `}</style>
    </div>
  );
}
