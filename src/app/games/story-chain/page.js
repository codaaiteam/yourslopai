'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import MoreGames from '../../Components/MoreGames';
import styles from './StoryChain.module.css';
import gp from '../gamePage.module.css';

const MAX_SENTENCES = 20;

export default function StoryChainPage() {
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
      <Header />
      <main className={gp.pageWrapper}>
        {/* Hero */}
        <section className={gp.hero}>
          <div className={gp.heroInner}>
            <Image src="/logo-story-chain.png" alt="Story Chain" width={80} height={80} className={gp.heroLogo} />
            <h1 className={gp.heroTitle}>Story Chain</h1>
            <p className={gp.heroSubtitle}>
              Write a story with AI, one sentence at a time. You write, AI continues. How wild, funny, or bizarre can your collaborative story get?
            </p>
          </div>
        </section>

        {/* Game */}
        <section className={gp.gameSection}>
          <div className={gp.container}>
            <div className={styles.gameCard}>
              <div className={styles.toolbar}>
                <button className={styles.toolBtn} onClick={handleReset}>New Story</button>
                <button className={styles.toolBtn} onClick={handleCopy} disabled={sentences.length === 0}>
                  Copy Story
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
          </div>
        </section>

        {/* More Games */}
        <MoreGames current="story-chain" />

        {/* About */}
        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>About Story Chain</h2>
            <div className={gp.aboutContent}>
              <p>
                Story Chain is a collaborative creative writing game where you and AI take turns building a story, one sentence at a time. Think of it as an improv comedy show — except your scene partner is a language model with a flair for the unexpected.
              </p>
              <p>
                Every story is unique. The AI adapts to your tone, genre, and language, adding twists and turns you never saw coming. Whether you start with "Once upon a time" or "The raccoon had a plan," the AI will roll with it and keep the story going in surprising directions.
              </p>
              <p>
                Stories max out at 20 sentences (10 turns each), so every word counts. When you're done, copy your masterpiece and share it with friends. Some of the best stories are the ones that go completely off the rails.
              </p>
            </div>
          </div>
        </section>

        {/* How to Play */}
        <section className={gp.howtoSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>How to Play</h2>
            <div className={gp.stepsGrid}>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>1</div>
                <h3>Start the Story</h3>
                <p>Type your opening sentence. Set the scene, introduce a character, or just say something weird.</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>2</div>
                <h3>AI Continues</h3>
                <p>The AI reads everything so far and adds the next sentence. Watch the story evolve in real time.</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>3</div>
                <h3>Keep Going</h3>
                <p>Take turns until 20 sentences. Then copy and share your collaborative masterpiece.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>Story Writing Tips</h2>
            <div className={gp.featuresGrid}>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🎭</span>
                <h3>Set the Tone Early</h3>
                <p>Your first sentence defines the genre. Start funny and the AI stays funny. Start dark and it goes noir.</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🔀</span>
                <h3>Throw Curveballs</h3>
                <p>Introduce random elements mid-story. The AI handles plot twists surprisingly well.</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>📋</span>
                <h3>Copy & Share</h3>
                <p>Use the "Copy Story" button to save your creation. The best stories deserve an audience.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      {copied && <div className={styles.toast}>Copied to clipboard</div>}
    </>
  );
}
