'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import MoreGames from '../../Components/MoreGames';
import styles from './AiRoast.module.css';
import gp from '../gamePage.module.css';

const WAITING_TEXTS = [
  'Charging up the insults...',
  'Consulting the burn ward...',
  'Sharpening the wit...',
  'Loading savage mode...',
  'Warming up the roast pit...',
];

export default function AiRoastPage() {
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
    <>
      <Header />
      <main className={gp.pageWrapper}>
        {/* Hero */}
        <section className={gp.hero}>
          <div className={gp.heroInner}>
            <Image src="/logo-ai-roast.png" alt="AI Roast Me" width={80} height={80} className={gp.heroLogo} />
            <h1 className={gp.heroTitle}>AI Roast Me</h1>
            <p className={gp.heroSubtitle}>
              Describe yourself, your life, or your situation — and let AI deliver the most creative, savage (but lovingly funny) roast it can come up with.
            </p>
          </div>
        </section>

        {/* Game */}
        <section className={gp.gameSection}>
          <div className={gp.container}>
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
          </div>
        </section>

        {/* More Games */}
        <MoreGames current="ai-roast" />

        {/* About */}
        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>About AI Roast Me</h2>
            <div className={gp.aboutContent}>
              <p>
                AI Roast Me is the ultimate test of whether artificial intelligence can actually be funny. Give the AI a target — yourself — and see if its roast lands or falls flat. Think of it as a comedy open mic night, except the comedian is a language model with zero stage fright.
              </p>
              <p>
                The roasts are designed to be witty and absurd, never mean-spirited. We use carefully crafted prompts to ensure the AI punches up, not down — delivering creative burns that make you laugh, not cry. Every roast is unique, generated in real-time based on what you share.
              </p>
              <p>
                Share your best (or worst) roasts with friends, build up a roast history, and discover just how savage AI can get when you give it permission.
              </p>
            </div>
          </div>
        </section>

        {/* How to Play */}
        <section className={gp.howtoSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>How to Get Roasted</h2>
            <div className={gp.stepsGrid}>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>1</div>
                <h3>Describe Yourself</h3>
                <p>Type a short description of yourself, your job, your habits — the more specific, the better the roast.</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>2</div>
                <h3>Hit "Roast Me"</h3>
                <p>The AI will analyze your description and craft a personalized roast just for you.</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>3</div>
                <h3>Laugh (or Cry)</h3>
                <p>Read the roast, share it with friends, and come back for more. Your roast history is saved in the session.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>Pro Tips for Better Roasts</h2>
            <div className={gp.featuresGrid}>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🎯</span>
                <h3>Be Specific</h3>
                <p>"I'm a developer" is okay. "I'm a developer who debugs at 3am eating cold pizza" is roast gold.</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>😂</span>
                <h3>Lean Into It</h3>
                <p>The more self-aware your description is, the funnier the AI's comeback will be.</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🌍</span>
                <h3>Any Language</h3>
                <p>Write in any language — the AI will roast you in the same language you use.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
