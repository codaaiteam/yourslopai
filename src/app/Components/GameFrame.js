'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './GameFrame.module.css';

export default function GameFrame({ logo, title, subtitle, score, scoreLabel, onPlay, children, siteLink }) {
  const [started, setStarted] = useState(false);

  const handlePlay = () => {
    setStarted(true);
    if (onPlay) onPlay();
  };

  return (
    <div className={styles.frame}>
      {/* Header bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Image src={logo} alt={title} width={28} height={28} className={styles.headerLogo} />
          <span className={styles.headerTitle}>{title}</span>
        </div>
        {started && score !== undefined && score !== null && (
          <div className={styles.headerScore}>
            {scoreLabel || 'Score'}: <strong>{score}</strong>
          </div>
        )}
      </div>

      {/* Cover / Game */}
      {!started ? (
        <div className={styles.cover}>
          <Image src={logo} alt={title} width={120} height={120} className={styles.coverLogo} />
          <h2 className={styles.coverTitle}>{title}</h2>
          <p className={styles.coverSubtitle}>{subtitle}</p>
          <button className={styles.playBtn} onClick={handlePlay}>
            ▶ Play
          </button>
          {siteLink && (
            <a href={siteLink} target="_blank" rel="noopener noreferrer" className={styles.coverLink}>
              Open Full Game ↗
            </a>
          )}
        </div>
      ) : (
        <div className={styles.gameContent}>
          {children}
        </div>
      )}
    </div>
  );
}
