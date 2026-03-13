'use client';

import { useState, useEffect, useRef } from 'react';
import { shareCard } from '@/lib/shareImage';
import GameFrame from '../../Components/GameFrame';
import styles from './GuessPrompt.module.css';

const ROUNDS_PER_LEVEL = 10;

// Difficulty: higher levels get shorter timers
function getLevelTimer(level) {
  if (level <= 1) return 0;        // no timer
  if (level === 2) return 120000;  // 2 min
  if (level === 3) return 90000;   // 1.5 min
  if (level === 4) return 60000;   // 1 min
  if (level === 5) return 45000;   // 45s
  if (level === 6) return 30000;   // 30s
  return 20000;                    // 20s for level 7+
}

function getLevelLabel(level) {
  if (level <= 1) return 'Easy';
  if (level <= 2) return 'Medium';
  if (level <= 3) return 'Hard';
  if (level <= 5) return 'Expert';
  return 'Insane';
}

export default function GuessPromptGame() {
  const [phase, setPhase] = useState('idle');
  const [roundData, setRoundData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState(1);
  const [bestLevel, setBestLevel] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [levelCorrect, setLevelCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gp_stats');
      if (saved) {
        const data = JSON.parse(saved);
        setBestScore(data.bestScore || 0);
        setBestLevel(data.bestLevel || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('gp_stats', JSON.stringify({
        bestScore: Math.max(bestScore, score),
        bestLevel: Math.max(bestLevel, level),
      }));
    } catch {}
  }, [bestScore, score, bestLevel, level]);

  // Timer tick
  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 0 && getLevelTimer(level) > 0 && selectedId === null) {
      clearInterval(timerRef.current);
      // Time's up = wrong answer
      setSelectedId(-1);
      setLastResult('timeout');
      setTimeout(() => {
        const levelRound = round % ROUNDS_PER_LEVEL || ROUNDS_PER_LEVEL;
        if (levelRound >= ROUNDS_PER_LEVEL) {
          finishLevel();
        } else {
          loadNextRound();
        }
      }, 1000);
    }
  }, [timeLeft, phase]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = (duration) => {
    if (duration <= 0) return;
    clearInterval(timerRef.current);
    startTimeRef.current = Date.now();
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timerRef.current);
    }, 50);
  };

  const fetchRound = async () => {
    try {
      const res = await fetch(`/api/guess-prompt?t=${Date.now()}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const startGame = async () => {
    setScore(0);
    setRound(0);
    setLevel(1);
    setLevelCorrect(0);
    setLastResult(null);
    setSelectedId(null);
    clearInterval(timerRef.current);
    await loadNextRound(1);
  };

  const loadNextRound = async (lvl) => {
    setLoading(true);
    setLastResult(null);
    setSelectedId(null);
    clearInterval(timerRef.current);

    const data = await fetchRound();
    if (!data || data.error) {
      setPhase('idle');
      setLoading(false);
      return;
    }

    setRoundData(data);
    setRound(r => r + 1);
    setPhase('playing');
    setLoading(false);

    const currentLevel = lvl || level;
    const timer = getLevelTimer(currentLevel);
    if (timer > 0) startTimer(timer);
  };

  const finishLevel = () => {
    // Show level complete or game results
    clearInterval(timerRef.current);
    if (levelCorrect >= ROUNDS_PER_LEVEL) {
      // Perfect! Level up
      setPhase('levelup');
    } else {
      // Level done but not perfect
      if (score > bestScore) setBestScore(score);
      if (level > bestLevel) setBestLevel(level);
      setPhase('gameover');
    }
  };

  const nextLevel = async () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setLevelCorrect(0);
    if (score > bestScore) setBestScore(score);
    if (newLevel - 1 > bestLevel) setBestLevel(newLevel - 1);
    await loadNextRound(newLevel);
  };

  const handleChoice = (id) => {
    if (phase !== 'playing' || !roundData || selectedId !== null) return;
    clearInterval(timerRef.current);
    setSelectedId(id);

    const levelRound = ((round - 1) % ROUNDS_PER_LEVEL) + 1; // 1-10 within level
    const isLastRound = levelRound >= ROUNDS_PER_LEVEL;

    if (id === roundData.correct_id) {
      setLastResult('correct');
      setScore(s => s + 1);
      setLevelCorrect(c => {
        const newCount = c + 1;
        if (isLastRound) {
          // Check after state updates
          setTimeout(() => {
            if (newCount >= ROUNDS_PER_LEVEL) {
              setPhase('levelup');
            } else {
              if (score + 1 > bestScore) setBestScore(score + 1);
              if (level > bestLevel) setBestLevel(level);
              setPhase('gameover');
            }
          }, 800);
        } else {
          setTimeout(() => loadNextRound(), 800);
        }
        return newCount;
      });
    } else {
      setLastResult('wrong');
      if (isLastRound) {
        setTimeout(() => {
          if (score > bestScore) setBestScore(score);
          if (level > bestLevel) setBestLevel(level);
          setPhase('gameover');
        }, 1000);
      } else {
        setTimeout(() => loadNextRound(), 1000);
      }
    }
  };

  const getOptionClass = (optionId) => {
    if (selectedId === null) return styles.optionBtn;
    if (optionId === roundData?.correct_id) return `${styles.optionBtn} ${styles.optionCorrect}`;
    if (optionId === selectedId) return `${styles.optionBtn} ${styles.optionWrong}`;
    return styles.optionBtn;
  };

  const currentBest = Math.max(bestScore, score);
  const levelRound = ((round - 1) % ROUNDS_PER_LEVEL) + 1;
  const timerDuration = getLevelTimer(level);
  const timerPercent = timerDuration > 0 ? (timeLeft / timerDuration) * 100 : 0;
  const timerColor = timeLeft > timerDuration * 0.5 ? '#4caf50' : timeLeft > timerDuration * 0.25 ? '#ff9800' : '#e53935';

  return (
    <GameFrame
      logo="/logo-guess-prompt.png"
      title="Guess the Prompt"
      subtitle="See a human drawing. Guess which prompt they were trying to draw. 10 rounds per level — get them all right to level up!"
      score={phase !== 'idle' ? score : (currentBest > 0 ? currentBest : null)}
      scoreLabel={phase !== 'idle' ? 'Score' : 'Best'}
      onPlay={startGame}
      siteLink="https://youraislopboresmegame.com/games/guess-prompt?utm_source=embed&utm_medium=game_cover&utm_campaign=play_btn"
    >
      <div className={styles.gameArea}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <div>Loading...</div>
          </div>
        )}

        {phase === 'playing' && !loading && roundData && (
          <>
            <div className={styles.hud}>
              <span className={styles.hudScore}>Score: {score}</span>
              <span className={styles.hudLevel}>Lv.{level} {getLevelLabel(level)}</span>
              <span className={styles.hudRound}>{levelRound}/{ROUNDS_PER_LEVEL}</span>
            </div>

            {timerDuration > 0 && (
              <div className={styles.timerBar}>
                <div
                  className={styles.timerFill}
                  style={{ width: `${timerPercent}%`, background: timerColor }}
                />
              </div>
            )}

            <div className={styles.imageCard}>
              <img
                src={roundData.image_url}
                alt="Guess what prompt created this"
                className={styles.roundImage}
              />
            </div>

            <div className={styles.optionsGrid}>
              {roundData.options.map(opt => (
                <button
                  key={opt.id}
                  className={getOptionClass(opt.id)}
                  onClick={() => handleChoice(opt.id)}
                  disabled={selectedId !== null}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {lastResult === 'correct' && (
              <div className={styles.flashCorrect}>✓</div>
            )}
            {lastResult === 'timeout' && (
              <div className={styles.flashWrong}>⏰</div>
            )}
          </>
        )}

        {phase === 'levelup' && (
          <div className={styles.gameOver}>
            <div className={styles.goIcon}>🎉</div>
            <h2 className={styles.goTitle}>Level {level} Complete!</h2>
            <p className={styles.goReason}>
              Perfect! {ROUNDS_PER_LEVEL}/{ROUNDS_PER_LEVEL} correct
            </p>

            <div className={styles.goScore}>
              <div className={styles.goScoreNum}>{score}</div>
              <div className={styles.goScoreLabel}>total score</div>
            </div>

            <p className={styles.nextLevelHint}>
              {getLevelTimer(level + 1) > 0
                ? `Next: Level ${level + 1} (${getLevelLabel(level + 1)}) — ${getLevelTimer(level + 1) / 1000}s timer!`
                : `Next: Level ${level + 1} (${getLevelLabel(level + 1)})`}
            </p>

            <div className={styles.goActions}>
              <button className={styles.playBtn} onClick={nextLevel}>Next Level →</button>
            </div>
          </div>
        )}

        {phase === 'gameover' && (
          <div className={styles.gameOver}>
            <div className={styles.goIcon}>💀</div>
            <h2 className={styles.goTitle}>Game Over</h2>
            <p className={styles.goReason}>
              Level {level}: {levelCorrect}/{ROUNDS_PER_LEVEL} correct — need all {ROUNDS_PER_LEVEL} to advance
            </p>

            <div className={styles.goScore}>
              <div className={styles.goScoreNum}>{score}</div>
              <div className={styles.goScoreLabel}>total score</div>
            </div>

            {score >= bestScore && score > 0 && (
              <div className={styles.newBest}>New Personal Best!</div>
            )}

            <div className={styles.goActions}>
              <button className={styles.playBtn} onClick={startGame}>Play Again</button>
              <button className={styles.shareBtn} onClick={() => shareCard({
                title: 'Guess the Prompt',
                blocks: [
                  { text: `I reached Level ${level} with ${score} points! Can you beat me?`, color: '#f5f5f0', bold: true },
                  { text: `Best: ${currentBest} | Max Level: ${Math.max(bestLevel, level)}`, color: '#ffebee' },
                ],
              })}>Share Score</button>
            </div>
          </div>
        )}
      </div>
    </GameFrame>
  );
}
