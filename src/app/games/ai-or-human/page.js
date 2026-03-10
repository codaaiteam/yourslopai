'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import MoreGames from '../../Components/MoreGames';
import QuestionFAQ from '../../Components/QuestionFAQ';
import { useTranslations } from '@/hooks/useTranslations';
import styles from './AiOrHuman.module.css';
import gp from '../gamePage.module.css';

export default function AiOrHumanPage() {
  const { t } = useTranslations();
  const g = t.aiOrHuman || {};

  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [choice, setChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  const fetchRound = useCallback(async () => {
    setLoading(true);
    setError(null);
    setChoice(null);
    try {
      const res = await fetch('/api/ai-or-human', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to load round');
      const data = await res.json();
      setSnippet(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRound(); }, [fetchRound]);

  const handleChoice = (pick) => {
    if (choice || !snippet) return;
    setChoice(pick);
    setTotal((t) => t + 1);
    if (pick === snippet.answer) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const isCorrect = choice && snippet && choice === snippet.answer;

  return (
    <>
      <Header />
      <main className={gp.pageWrapper}>
        {/* Hero */}
        <section className={gp.hero}>
          <div className={gp.heroInner}>
            <Image src="/logo-ai-or-human.png" alt="AI or Human?" width={80} height={80} className={gp.heroLogo} />
            <h1 className={gp.heroTitle}>{g.hero?.title || 'AI or Human?'}</h1>
            <p className={gp.heroSubtitle}>{g.hero?.subtitle || 'Can you tell who wrote it?'}</p>
          </div>
        </section>

        {/* Game */}
        <section className={gp.gameSection}>
          <div className={gp.container}>
            <div className={styles.gameArea}>
              <div className={styles.scoreBar}>
                <span className={styles.scoreStat}>
                  Score: <span className={styles.scoreValue}>{score}/{total}</span>
                </span>
                <span className={styles.scoreStat}>
                  Streak: <span className={styles.streakValue}>{streak}</span>
                </span>
              </div>

              {loading && (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <div>Loading round...</div>
                </div>
              )}

              {error && (
                <div className={styles.error}>
                  <div>{error}</div>
                  <button className={styles.retryBtn} onClick={fetchRound}>Try again</button>
                </div>
              )}

              {!loading && !error && snippet && (
                <>
                  <div className={styles.card}>
                    <div className={styles.roundLabel}>Round {total + (choice ? 0 : 1)}</div>
                    <p className={styles.snippetText}>{snippet.text}</p>
                  </div>

                  <div className={styles.buttonRow}>
                    <button
                      className={`${styles.choiceBtn} ${choice && snippet.answer === 'ai' ? styles.choiceBtnCorrect : ''} ${choice === 'ai' && snippet.answer !== 'ai' ? styles.choiceBtnWrong : ''}`}
                      onClick={() => handleChoice('ai')}
                      disabled={!!choice}
                    >
                      AI Wrote This
                    </button>
                    <button
                      className={`${styles.choiceBtn} ${choice && snippet.answer === 'human' ? styles.choiceBtnCorrect : ''} ${choice === 'human' && snippet.answer !== 'human' ? styles.choiceBtnWrong : ''}`}
                      onClick={() => handleChoice('human')}
                      disabled={!!choice}
                    >
                      Human Wrote This
                    </button>
                  </div>

                  {choice && (
                    <div className={isCorrect ? styles.resultCorrect : styles.resultWrong}>
                      <div className={styles.resultIcon}>{isCorrect ? '\u2713' : '\u2717'}</div>
                      <div className={styles.resultText}>
                        {isCorrect ? 'Nice call!' : 'Nope!'} It was written by{' '}
                        <strong>{snippet.answer === 'ai' ? 'AI' : 'a human'}</strong>.
                      </div>
                      <button className={styles.nextBtn} onClick={fetchRound}>Next Round</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* More Games */}
        <MoreGames current="ai-or-human" />

        {/* What Is */}
        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.about?.sectionTitle || 'What Is AI or Human?'}</h2>
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
                <h3>{g.howToPlay?.step1Title || 'Read the Text'}</h3>
                <p>{g.howToPlay?.step1Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>2</div>
                <h3>{g.howToPlay?.step2Title || 'Make Your Guess'}</h3>
                <p>{g.howToPlay?.step2Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>3</div>
                <h3>{g.howToPlay?.step3Title || 'See the Result'}</h3>
                <p>{g.howToPlay?.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className={gp.whySection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.why?.sectionTitle || 'Why Play AI or Human?'}</h2>
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
            <h2 className={gp.sectionTitle}>{g.tips?.sectionTitle || 'Spotting the Difference'}</h2>
            <div className={gp.featuresGrid}>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🔍</span>
                <h3>{g.tips?.tip1Title || 'Watch for Perfection'}</h3>
                <p>{g.tips?.tip1Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>💬</span>
                <h3>{g.tips?.tip2Title || 'Check the Emotion'}</h3>
                <p>{g.tips?.tip2Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🎯</span>
                <h3>{g.tips?.tip3Title || 'Notice the Structure'}</h3>
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
