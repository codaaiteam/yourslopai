'use client';

import { useState, useEffect, useCallback } from 'react';
import { shareCard } from '@/lib/shareImage';
import GameFrame from '../../Components/GameFrame';
import styles from './GuessPrompt.module.css';

export default function GuessPromptGame() {
  const [phase, setPhase] = useState('idle');
  const [roundData, setRoundData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gp_stats');
      if (saved) {
        const data = JSON.parse(saved);
        setBestScore(data.bestScore || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('gp_stats', JSON.stringify({
        bestScore: Math.max(bestScore, score),
      }));
    } catch {}
  }, [bestScore, score]);

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
    setLastResult(null);
    setSelectedId(null);
    await loadNextRound();
  };

  const loadNextRound = async () => {
    setLoading(true);
    setLastResult(null);
    setSelectedId(null);

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
  };

  const handleChoice = (id) => {
    if (phase !== 'playing' || !roundData || selectedId !== null) return;
    setSelectedId(id);

    if (id === roundData.correct_id) {
      setLastResult('correct');
      setScore(s => s + 1);
      setTimeout(() => loadNextRound(), 800);
    } else {
      setLastResult('wrong');
      const finalScore = score;
      if (finalScore > bestScore) setBestScore(finalScore);
      setTimeout(() => setPhase('gameover'), 1000);
    }
  };

  const getOptionClass = (optionId) => {
    if (selectedId === null) return styles.optionBtn;
    if (optionId === roundData.correct_id) return `${styles.optionBtn} ${styles.optionCorrect}`;
    if (optionId === selectedId) return `${styles.optionBtn} ${styles.optionWrong}`;
    return styles.optionBtn;
  };

  const currentBest = Math.max(bestScore, score);

  return (
    <GameFrame
      logo="/logo-guess-prompt.png"
      title="Guess the Prompt"
      subtitle="See the image. Pick the prompt that created it. One wrong guess and it's game over!"
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
              <span className={styles.hudRound}>Round {round}</span>
            </div>

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
          </>
        )}

        {phase === 'gameover' && (
          <div className={styles.gameOver}>
            <div className={styles.goIcon}>💀</div>
            <h2 className={styles.goTitle}>Game Over</h2>
            <p className={styles.goReason}>
              Wrong guess!
            </p>

            <div className={styles.goScore}>
              <div className={styles.goScoreNum}>{score}</div>
              <div className={styles.goScoreLabel}>
                {score === 1 ? 'round survived' : 'rounds survived'}
              </div>
            </div>

            {score > bestScore - 1 && score > 0 && (
              <div className={styles.newBest}>New Personal Best!</div>
            )}

            <div className={styles.goActions}>
              <button className={styles.playBtn} onClick={startGame}>Play Again</button>
              <button className={styles.shareBtn} onClick={() => shareCard({
                title: 'Guess the Prompt',
                blocks: [
                  { text: `I guessed ${score} prompts correctly! Can you beat my score?`, color: '#f5f5f0', bold: true },
                  { text: `Best: ${currentBest}`, color: '#ffebee' },
                ],
              })}>Share Score</button>
            </div>
          </div>
        )}
      </div>
    </GameFrame>
  );
}
