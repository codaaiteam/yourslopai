'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { shareCard } from '@/lib/shareImage';
import styles from './StoryChain.module.css';

const MAX_SENTENCES = 20;

export default function StoryChainGame() {
  const [sentences, setSentences] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const storyAreaRef = useRef(null);
  const inputRef = useRef(null);

  const isFinished = sentences.length >= MAX_SENTENCES;

  const scrollToBottom = useCallback(() => {
    const el = storyAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => { scrollToBottom(); }, [sentences, loading, scrollToBottom]);

  const fetchAiSentence = useCallback(async (storySoFar) => {
    try {
      const res = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: storySoFar }),
      });
      const data = await res.json();
      return data.sentence || 'And then something unexpected happened.';
    } catch {
      return 'And then something unexpected happened.';
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || isFinished) return;

    const humanEntry = { text, author: 'human' };
    const updatedSentences = [...sentences, humanEntry];
    setSentences(updatedSentences);
    setInput('');

    if (updatedSentences.length >= MAX_SENTENCES) return;

    setLoading(true);
    const storySoFar = updatedSentences.map((s) => s.text).join(' ');
    const aiText = await fetchAiSentence(storySoFar);
    setSentences((prev) => [...prev, { text: aiText, author: 'ai' }]);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [input, loading, isFinished, sentences, fetchAiSentence]);

  const handleReset = useCallback(() => {
    setSentences([]);
    setInput('');
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleCopy = useCallback(() => {
    const text = sentences.map((s) => s.text).join(' ');
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [sentences]);

  return (
    <>
      <div className={styles.gameCard}>
        <div className={styles.toolbar}>
          <button className={styles.toolBtn} onClick={handleReset}>New Story</button>
          <button className={styles.toolBtn} onClick={handleCopy} disabled={sentences.length === 0}>
            Copy Story
          </button>
          <button className={styles.toolBtn} onClick={() => {
            if (sentences.length === 0) return;
            const storyBlocks = sentences.map((s) => ({
              text: s.text,
              label: s.author === 'human' ? 'you' : 'ai',
              color: s.author === 'human' ? '#f6faf6' : '#faf6fc',
            }));
            shareCard({ title: 'Story Chain', blocks: storyBlocks });
          }} disabled={sentences.length === 0}>
            Share Story
          </button>
          <span className={styles.turnCount}>{sentences.length}/{MAX_SENTENCES}</span>
        </div>

        <div className={styles.storyArea} ref={storyAreaRef}>
          {sentences.length === 0 && !loading && (
            <div className={styles.emptyState}>Type a sentence below to begin the story...</div>
          )}

          {sentences.map((s, i) => (
            <div key={i} className={`${styles.sentence} ${s.author === 'human' ? styles.sentenceHuman : styles.sentenceAi}`}>
              <span className={`${styles.label} ${s.author === 'human' ? styles.labelHuman : styles.labelAi}`}>
                {s.author === 'human' ? 'you' : 'ai'}
              </span>
              <span className={styles.sentenceText}>{s.text}</span>
            </div>
          ))}

          {loading && (
            <div className={styles.loading}>
              <span className={`${styles.label} ${styles.labelAi}`}>ai</span>
              <span className={styles.dots}><span /><span /><span /></span>
            </div>
          )}

          {isFinished && !loading && (
            <div className={styles.theEnd}>~ The End ~</div>
          )}
        </div>

        {!isFinished && (
          <form className={styles.inputBar} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className={styles.storyInput}
              type="text"
              placeholder="Write the next sentence..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              maxLength={300}
              autoFocus
            />
            <button className={styles.addBtn} type="submit" disabled={loading || !input.trim()}>
              {loading ? 'Waiting...' : 'Add to Story'}
            </button>
          </form>
        )}
      </div>

      <div className={styles.siteLink}>
        <a href="https://youraislopboresmegame.com/games/story-chain" target="_blank" rel="noopener noreferrer">
          Full version → youraislopboresmegame.com
        </a>
      </div>

      {copied && <div className={styles.toast}>Copied to clipboard</div>}
    </>
  );
}
