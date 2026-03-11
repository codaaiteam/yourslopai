'use client';

import { useState, useRef } from 'react';
import { shareCard } from '@/lib/shareImage';
import styles from './AiRoast.module.css';

const WAITING_TEXTS = [
  'Charging up the insults...',
  'Consulting the burn ward...',
  'Sharpening the wit...',
  'Loading savage mode...',
  'Warming up the roast pit...',
];

export default function AiRoastGame() {
  const [description, setDescription] = useState('');
  const [roast, setRoast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [waitingText, setWaitingText] = useState('');
  const [history, setHistory] = useState([]);
  const resultRef = useRef(null);

  const handleRoast = async () => {
    if (!description.trim() || loading) return;
    setLoading(true);
    setRoast(null);
    setWaitingText(WAITING_TEXTS[Math.floor(Math.random() * WAITING_TEXTS.length)]);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = await res.json();
      if (data.roast) {
        setRoast(data.roast);
        setHistory((prev) => [
          { description: description.trim(), roast: data.roast, timestamp: Date.now() },
          ...prev,
        ]);
      } else {
        setRoast('The roast machine broke. Even AI has off days.');
      }
    } catch {
      setRoast('The roast machine broke. Even AI has off days.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setRoast(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRoast();
  };

  return (
    <div className={styles.gameArea}>
      <textarea
        className={styles.textarea}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. I'm a 28-year-old developer who talks to rubber ducks more than people..."
        rows={4}
        maxLength={500}
        disabled={loading}
      />
      <div className={styles.inputFooter}>
        <span className={styles.charCount}>{description.length}/500</span>
        {!roast ? (
          <button
            className={styles.roastBtn}
            onClick={handleRoast}
            disabled={loading || !description.trim()}
          >
            {loading ? waitingText : 'Roast Me'}
          </button>
        ) : (
          <button className={styles.resetBtn} onClick={handleReset}>
            Roast Again
          </button>
        )}
      </div>

      {loading && (
        <div className={styles.loadingSection}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>{waitingText}</p>
        </div>
      )}

      {roast && !loading && (
        <div className={styles.roastCard} ref={resultRef}>
          <div className={styles.fireDecor}>&#x1F525;</div>
          <p className={styles.roastText}>{roast}</p>
          <div className={styles.fireDecor}>&#x1F525;</div>
          <button className={styles.shareBtn} onClick={() => shareCard({
            title: 'AI Roast Me',
            blocks: [
              { label: 'I said...', text: description.trim(), color: '#f5f5f0' },
              { label: '🔥 AI roasted me', text: roast, color: '#fff3e0', bold: true },
            ],
          })}>Share Roast</button>
        </div>
      )}

      {history.length > 0 && (
        <div className={styles.historySection}>
          <h3 className={styles.historyTitle}>Roast History</h3>
          <div className={styles.historyList}>
            {history.map((item) => (
              <div key={item.timestamp} className={styles.historyItem}>
                <p className={styles.historyDescription}>&ldquo;{item.description}&rdquo;</p>
                <p className={styles.historyRoast}>{item.roast}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
