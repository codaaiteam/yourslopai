'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import MoreGames from '../../Components/MoreGames';
import QuestionFAQ from '../../Components/QuestionFAQ';
import AdSense from '../../Components/AdSense';
import { useTranslations } from '@/hooks/useTranslations';
import { shareCard } from '@/lib/shareImage';
import styles from './AiOrHuman.module.css';
import gp from '../gamePage.module.css';

const TIME_LIMIT = 2000; // 2 seconds per round
const TICK_MS = 50;

export default function AiOrHumanPage() {
  const { t } = useTranslations();
  const g = t.aiOrHuman || {};

  // Game phases: 'idle' | 'playing' | 'gameover'
  const [phase, setPhase] = useState('idle');
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [lastResult, setLastResult] = useState(null); // 'correct' | 'wrong' | 'timeout'
  const [bestScore, setBestScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [playerRank, setPlayerRank] = useState(null);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Load best score & leaderboard
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aoh_stats');
      if (saved) {
        const data = JSON.parse(saved);
        setBestScore(data.bestScore || 0);
        setPlayerName(data.name || '');
      }
    } catch {}
    fetchLeaderboard();
  }, []);

  // Save best score
  useEffect(() => {
    try {
      localStorage.setItem('aoh_stats', JSON.stringify({
        bestScore: Math.max(bestScore, score),
        name: playerName,
      }));
    } catch {}
  }, [bestScore, score, playerName]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    } catch {}
  };

  const submitToLeaderboard = async () => {
    const name = playerName.trim();
    if (!name || score < 1) return;
    setSubmitStatus('submitting');
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score, total: round, streak: score }),
      });
      const data = await res.json();
      if (data.leaderboard) setLeaderboard(data.leaderboard);
      if (data.rank) setPlayerRank(data.rank);
      setSubmitStatus('done');
      setShowNameInput(false);
    } catch {
      setSubmitStatus('error');
    }
  };

  const fetchSnippet = async () => {
    try {
      const res = await fetch('/api/ai-or-human', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      return await res.json();
    } catch {
      return null;
    }
  };

  // Start timer countdown
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setTimeLeft(TIME_LIMIT);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, TIME_LIMIT - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
      }
    }, TICK_MS);
  }, []);

  // Handle timeout
  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 0 && snippet) {
      clearInterval(timerRef.current);
      setLastResult('timeout');
      if (score > bestScore) setBestScore(score);
      setPhase('gameover');
    }
  }, [timeLeft, phase, snippet, score, bestScore]);

  // Start game
  const startGame = async () => {
    setScore(0);
    setRound(0);
    setLastResult(null);
    setSubmitStatus(null);
    setPlayerRank(null);
    setShowNameInput(false);
    await loadNextRound(true);
  };

  // Load next round
  const loadNextRound = async (isFirst = false) => {
    setLoading(true);
    setLastResult(null);
    clearInterval(timerRef.current);

    const data = await fetchSnippet();
    if (!data) {
      setPhase('idle');
      setLoading(false);
      return;
    }

    setSnippet(data);
    setRound((r) => r + 1);
    setPhase('playing');
    setLoading(false);
    startTimer();
  };

  // Handle player choice
  const handleChoice = (pick) => {
    if (phase !== 'playing' || !snippet || timeLeft <= 0) return;
    clearInterval(timerRef.current);

    if (pick === snippet.answer) {
      setLastResult('correct');
      setScore((s) => s + 1);
      // Brief flash then auto next round
      setTimeout(() => loadNextRound(), 600);
    } else {
      setLastResult('wrong');
      const finalScore = score; // current score (before this wrong answer)
      if (finalScore > bestScore) setBestScore(finalScore);
      setPhase('gameover');
    }
  };

  // Cleanup
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const timerPercent = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timeLeft > 1000 ? '#4caf50' : timeLeft > 500 ? '#ff9800' : '#e53935';
  const currentBest = Math.max(bestScore, score);

  return (
    <>
      <AdSense />
      <Header />
      <main className={gp.pageWrapper}>
        {/* Hero */}
        <section className={gp.hero}>
          <div className={gp.heroInner}>
            <Image src="/logo-ai-or-human.png" alt="AI or Human?" width={80} height={80} className={gp.heroLogo} />
            <h1 className={gp.heroTitle}>{g.hero?.title || 'AI or Human?'}</h1>
            <p className={gp.heroSubtitle}>{g.hero?.subtitle || 'Can you tell who wrote it? You have 2 seconds per round!'}</p>
          </div>
        </section>

        {/* Game */}
        <section className={gp.gameSection}>
          <div className={gp.container}>
            <div className={styles.gameArea}>

              {/* === IDLE === */}
              {phase === 'idle' && !loading && (
                <div className={styles.startScreen}>
                  <div className={styles.startIcon}>⚡</div>
                  <h2 className={styles.startTitle}>{g.game?.speedRound || 'Speed Round'}</h2>
                  <p className={styles.startDesc}>{g.game?.speedRoundDesc || 'Read the text. Guess AI or Human. You have 2 seconds per round. One wrong answer and it\'s game over!'}</p>
                  {currentBest > 0 && (
                    <div className={styles.bestBadge}>{g.game?.personalBest || 'Personal Best'}: {currentBest}</div>
                  )}
                  <button className={styles.playBtn} onClick={startGame}>{g.game?.play || 'Play'}</button>
                </div>
              )}

              {/* === LOADING === */}
              {loading && (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <div>{g.game?.loading || 'Loading...'}</div>
                </div>
              )}

              {/* === PLAYING === */}
              {phase === 'playing' && !loading && snippet && (
                <>
                  <div className={styles.hud}>
                    <span className={styles.hudScore}>{g.game?.score || 'Score'}: {score}</span>
                    <span className={styles.hudRound}>{g.game?.round || 'Round'} {round}</span>
                  </div>

                  <div className={styles.timerBar}>
                    <div
                      className={styles.timerFill}
                      style={{ width: `${timerPercent}%`, background: timerColor }}
                    />
                  </div>

                  <div className={styles.card}>
                    <p className={styles.snippetText}>{snippet.text}</p>
                  </div>

                  <div className={styles.buttonRow}>
                    <button
                      className={`${styles.choiceBtn} ${lastResult === 'correct' ? styles.choiceBtnFlash : ''}`}
                      onClick={() => handleChoice('ai')}
                      disabled={lastResult !== null}
                    >
                      AI
                    </button>
                    <button
                      className={`${styles.choiceBtn} ${lastResult === 'correct' ? styles.choiceBtnFlash : ''}`}
                      onClick={() => handleChoice('human')}
                      disabled={lastResult !== null}
                    >
                      {g.game?.human || 'Human'}
                    </button>
                  </div>

                  {lastResult === 'correct' && (
                    <div className={styles.flashCorrect}>✓</div>
                  )}
                </>
              )}

              {/* === GAME OVER === */}
              {phase === 'gameover' && (
                <div className={styles.gameOver}>
                  <div className={styles.goIcon}>
                    {lastResult === 'timeout' ? '⏰' : '💀'}
                  </div>
                  <h2 className={styles.goTitle}>{g.game?.gameOver || 'Game Over'}</h2>
                  <p className={styles.goReason}>
                    {lastResult === 'timeout' ? (g.game?.timesUp || "Time's up!") : (g.game?.wrongAnswer || 'Wrong answer!')}
                    {snippet && lastResult === 'wrong' && (
                      <> {g.game?.itWas || 'It was'} <strong>{snippet.answer === 'ai' ? 'AI' : (g.game?.human || 'Human')}</strong>.</>
                    )}
                  </p>

                  <div className={styles.goScore}>
                    <div className={styles.goScoreNum}>{score}</div>
                    <div className={styles.goScoreLabel}>
                      {score === 1 ? (g.game?.roundSurvived || 'round survived') : (g.game?.roundsSurvived || 'rounds survived')}
                    </div>
                  </div>

                  {score > bestScore - 1 && score > 0 && (
                    <div className={styles.newBest}>{g.game?.newBest || 'New Personal Best!'}</div>
                  )}

                  <div className={styles.goActions}>
                    <button className={styles.playBtn} onClick={startGame}>{g.game?.playAgain || 'Play Again'}</button>
                    <button className={styles.shareBtn} onClick={() => shareCard({
                      title: 'AI or Human? — Speed Round',
                      blocks: [
                        { text: `${g.game?.shareText || `I survived ${score} rounds in AI or Human speed mode! Can you beat my score?`}`, color: '#f5f5f0', bold: true },
                        { text: `${lastResult === 'timeout' ? (g.game?.timesUp || "Time's up!") : (g.game?.wrongAnswer || 'Wrong answer!')} | Best: ${currentBest}`, color: '#ffebee' },
                      ],
                    })}>{g.game?.shareScore || 'Share Score'}</button>
                  </div>

                  {score >= 1 && (
                    <div className={styles.submitSection}>
                      {!showNameInput && submitStatus !== 'done' ? (
                        <button className={styles.submitScoreBtn} onClick={() => setShowNameInput(true)}>
                          {g.game?.submitToLeaderboard || 'Submit to Leaderboard'}
                        </button>
                      ) : submitStatus !== 'done' ? (
                        <div className={styles.nameInputRow}>
                          <input
                            className={styles.nameInput}
                            type="text"
                            placeholder={g.game?.yourName || 'Your name'}
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            maxLength={16}
                            onKeyDown={(e) => e.key === 'Enter' && submitToLeaderboard()}
                            autoFocus
                          />
                          <button
                            className={styles.submitBtn}
                            onClick={submitToLeaderboard}
                            disabled={!playerName.trim() || submitStatus === 'submitting'}
                          >
                            {submitStatus === 'submitting' ? '...' : (g.game?.submit || 'Submit')}
                          </button>
                        </div>
                      ) : (
                        playerRank && <div className={styles.rankMsg}>{g.game?.ranked || 'Ranked'} #{playerRank}!</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* === LEADERBOARD === */}
              {leaderboard.length > 0 && (phase === 'idle' || phase === 'gameover') && (
                <div className={styles.leaderboard}>
                  <h3 className={styles.lbTitle}>{g.game?.leaderboard || 'Leaderboard'}</h3>
                  <div className={styles.lbTable}>
                    <div className={styles.lbHeader}>
                      <span>#</span>
                      <span>{g.game?.player || 'Player'}</span>
                      <span>{g.game?.score || 'Score'}</span>
                    </div>
                    {leaderboard.map((entry, i) => (
                      <div key={i} className={`${styles.lbRow} ${i < 3 ? styles.lbRowTop : ''}`}>
                        <span className={styles.lbRank}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </span>
                        <span className={styles.lbName}>{entry.name}</span>
                        <span className={styles.lbStreak}>{entry.streak}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
