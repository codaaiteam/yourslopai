'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import MoreGames from '../../Components/MoreGames';
import QuestionFAQ from '../../Components/QuestionFAQ';
import AdSense from '../../Components/AdSense';
import { useTranslations } from '@/hooks/useTranslations';
import { shareCard } from '@/lib/shareImage';
import styles from './StoryChain.module.css';
import gp from '../gamePage.module.css';

const MAX_SENTENCES = 20;

export default function StoryChainPage() {
  const { t } = useTranslations();
  const g = t.storyChain || {};

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
      <AdSense />
      <Header />
      <main className={gp.pageWrapper}>
        {/* Hero */}
        <section className={gp.hero}>
          <div className={gp.heroInner}>
            <Image src="/logo-story-chain.png" alt="Story Chain" width={80} height={80} className={gp.heroLogo} />
            <h1 className={gp.heroTitle}>{g.hero?.title || 'Story Chain'}</h1>
            <p className={gp.heroSubtitle}>{g.hero?.subtitle || 'Write a story with AI, one sentence at a time.'}</p>
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
          </div>
        </section>

        {/* More Games */}
        <MoreGames current="story-chain" />

        {/* What Is */}
        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.about?.sectionTitle || 'What Is Story Chain?'}</h2>
            <div className={gp.aboutContent}>
              <p>{g.about?.p1}</p>
              <p>{g.about?.p2}</p>
              <p>{g.about?.p3}</p>
            </div>
          </div>
        </section>

        {/* How to Play */}
        <section className={gp.howtoSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.howToPlay?.sectionTitle || 'How to Play'}</h2>
            <div className={gp.stepsGrid}>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>1</div>
                <h3>{g.howToPlay?.step1Title || 'Start the Story'}</h3>
                <p>{g.howToPlay?.step1Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>2</div>
                <h3>{g.howToPlay?.step2Title || 'AI Continues'}</h3>
                <p>{g.howToPlay?.step2Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>3</div>
                <h3>{g.howToPlay?.step3Title || 'Keep Going'}</h3>
                <p>{g.howToPlay?.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className={gp.whySection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.why?.sectionTitle || 'Why Story Chain Is So Fun'}</h2>
            <div className={gp.whyContent}>
              <p>{g.why?.p1}</p>
              <p>{g.why?.p2}</p>
              <p>{g.why?.p3}</p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={gp.howtoSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.tips?.sectionTitle || 'Story Writing Tips'}</h2>
            <div className={gp.featuresGrid}>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🎭</span>
                <h3>{g.tips?.tip1Title || 'Set the Tone Early'}</h3>
                <p>{g.tips?.tip1Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🔀</span>
                <h3>{g.tips?.tip2Title || 'Throw Curveballs'}</h3>
                <p>{g.tips?.tip2Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>📋</span>
                <h3>{g.tips?.tip3Title || 'Copy & Share'}</h3>
                <p>{g.tips?.tip3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={gp.faqSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.faq?.sectionTitle || 'Frequently Asked Questions'}</h2>
            <div className={gp.faqList}>
              <QuestionFAQ question={g.faq?.q1} answer={g.faq?.a1} />
              <QuestionFAQ question={g.faq?.q2} answer={g.faq?.a2} />
              <QuestionFAQ question={g.faq?.q3} answer={g.faq?.a3} />
              <QuestionFAQ question={g.faq?.q4} answer={g.faq?.a4} />
              <QuestionFAQ question={g.faq?.q5} answer={g.faq?.a5} />
              <QuestionFAQ question={g.faq?.q6} answer={g.faq?.a6} />
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {copied && <div className={styles.toast}>Copied to clipboard</div>}
    </>
  );
}
