'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import MoreGames from '../../Components/MoreGames';
import styles from './AiOrHuman.module.css';
import gp from '../gamePage.module.css';

export default function AiOrHumanPage() {
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
            <h1 className={gp.heroTitle}>AI or Human?</h1>
            <p className={gp.heroSubtitle}>
              Can you tell who wrote it? Read a short text snippet and guess whether it was crafted by artificial intelligence or penned by a real human being.
            </p>
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

        {/* About */}
        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>About AI or Human?</h2>
            <div className={gp.aboutContent}>
              <p>
                As AI-generated text becomes increasingly sophisticated, telling the difference between machine-written and human-written content is harder than ever. AI or Human? puts your detection skills to the test in a fast-paced guessing game.
              </p>
              <p>
                Each round presents you with a short text snippet — some written by DeepSeek AI, others sourced from real human conversations complete with typos, slang, and personal quirks. Your job is to read carefully and make your call. Can you spot the patterns that give AI away?
              </p>
              <p>
                Track your score, build your streak, and see how well you really know the difference between artificial intelligence and genuine human expression. It's harder than you think.
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
                <h3>Read the Text</h3>
                <p>A short snippet appears on screen. Read it carefully — look for subtle clues.</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>2</div>
                <h3>Make Your Guess</h3>
                <p>Click "AI Wrote This" or "Human Wrote This" based on your gut feeling.</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>3</div>
                <h3>See the Result</h3>
                <p>Find out if you were right! Build your streak and aim for a perfect score.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>Spotting the Difference</h2>
            <div className={gp.featuresGrid}>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🔍</span>
                <h3>Watch for Perfection</h3>
                <p>AI text tends to be grammatically flawless. Humans make typos and use informal language.</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>💬</span>
                <h3>Check the Emotion</h3>
                <p>Humans inject personal feelings, sarcasm, and lived experiences into their writing.</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🎯</span>
                <h3>Notice the Structure</h3>
                <p>AI often writes in balanced, symmetrical sentences. Humans ramble and jump between ideas.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
