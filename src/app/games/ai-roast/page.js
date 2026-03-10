'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import MoreGames from '../../Components/MoreGames';
import QuestionFAQ from '../../Components/QuestionFAQ';
import { useTranslations } from '@/hooks/useTranslations';
import { shareCard } from '@/lib/shareImage';
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
  const { t } = useTranslations();
  const g = t.aiRoast || {};

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
            <h1 className={gp.heroTitle}>{g.hero?.title || 'AI Roast Me'}</h1>
            <p className={gp.heroSubtitle}>{g.hero?.subtitle || 'Describe yourself and let AI roast you.'}</p>
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
          </div>
        </section>

        {/* More Games */}
        <MoreGames current="ai-roast" />

        {/* What Is */}
        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.about?.sectionTitle || 'What Is AI Roast Me?'}</h2>
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
            <h2 className={gp.sectionTitle}>{g.howToPlay?.sectionTitle || 'How to Get Roasted'}</h2>
            <div className={gp.stepsGrid}>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>1</div>
                <h3>{g.howToPlay?.step1Title || 'Describe Yourself'}</h3>
                <p>{g.howToPlay?.step1Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>2</div>
                <h3>{g.howToPlay?.step2Title || 'Hit "Roast Me"'}</h3>
                <p>{g.howToPlay?.step2Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>3</div>
                <h3>{g.howToPlay?.step3Title || 'Laugh (or Cry)'}</h3>
                <p>{g.howToPlay?.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className={gp.whySection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.why?.sectionTitle || 'Why AI Roast Me Is So Addictive'}</h2>
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
            <h2 className={gp.sectionTitle}>{g.tips?.sectionTitle || 'Pro Tips for Better Roasts'}</h2>
            <div className={gp.featuresGrid}>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🎯</span>
                <h3>{g.tips?.tip1Title || 'Be Specific'}</h3>
                <p>{g.tips?.tip1Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>😂</span>
                <h3>{g.tips?.tip2Title || 'Lean Into It'}</h3>
                <p>{g.tips?.tip2Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🌍</span>
                <h3>{g.tips?.tip3Title || 'Any Language'}</h3>
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
    </>
  );
}
