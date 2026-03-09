'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Game.module.css';
import DrawingCanvas from './DrawingCanvas';
import { getRandomPrompt, getRandomAIResponse } from './prompts';

const TIMER_SECONDS = 60;

export default function GameMain({ t }) {
  // Game state
  const [mode, setMode] = useState(null); // null | 'larp' | 'human'
  const [tokens, setTokens] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptType, setPromptType] = useState('text'); // 'text' | 'draw'
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | answering | submitted | waiting | received
  const [history, setHistory] = useState([]);
  const [humanPrompt, setHumanPrompt] = useState('');
  const [receivedResponse, setReceivedResponse] = useState('');
  const [drawingData, setDrawingData] = useState(null);
  const [stats, setStats] = useState({ answered: 0, asked: 0 });
  const timerRef = useRef(null);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('slopai_state');
      if (saved) {
        const data = JSON.parse(saved);
        setTokens(data.tokens || 0);
        setStats(data.stats || { answered: 0, asked: 0 });
        setHistory(data.history || []);
      }
    } catch (e) {}
  }, []);

  // Save state
  useEffect(() => {
    try {
      localStorage.setItem('slopai_state', JSON.stringify({ tokens, stats, history: history.slice(-20) }));
    } catch (e) {}
  }, [tokens, stats, history]);

  // Timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    if (isActive && timeLeft === 0) {
      handleTimerEnd();
    }
  }, [isActive, timeLeft]);

  const handleTimerEnd = useCallback(() => {
    setIsActive(false);
    if (answer.trim() || drawingData) {
      submitAnswer();
    } else {
      setPhase('idle');
      setCurrentPrompt('');
    }
  }, [answer, drawingData]);

  // Fetch AI-generated prompt or fallback to local
  const fetchAIPrompt = async () => {
    try {
      const res = await fetch(`/api/prompt?locale=${t?.layout?.language || 'en'}`);
      const data = await res.json();
      if (data.prompt) {
        const isDraw = data.prompt.startsWith('Draw:') || data.prompt.startsWith('🎨');
        return { prompt: data.prompt, type: isDraw ? 'draw' : 'text' };
      }
    } catch (e) {
      console.error('Failed to fetch AI prompt:', e);
    }
    return null;
  };

  // Start "Larp as AI" round
  const startLarp = async () => {
    // Try AI-generated prompt first, fallback to local
    const aiPrompt = await fetchAIPrompt();
    if (aiPrompt) {
      setPromptType(aiPrompt.type);
      setCurrentPrompt(aiPrompt.prompt);
    } else {
      const isDrawRound = Math.random() < 0.3;
      const type = isDrawRound ? 'draw' : 'text';
      setPromptType(type);
      setCurrentPrompt(getRandomPrompt(type));
    }
    setAnswer('');
    setDrawingData(null);
    setTimeLeft(TIMER_SECONDS);
    setIsActive(true);
    setPhase('answering');
  };

  const submitAnswer = () => {
    const response = promptType === 'draw' ? drawingData : answer;
    if (!response || (typeof response === 'string' && !response.trim())) return;

    setIsActive(false);
    clearTimeout(timerRef.current);
    setTokens(prev => prev + 1);
    setStats(prev => ({ ...prev, answered: prev.answered + 1 }));
    setHistory(prev => [...prev, {
      type: 'larp',
      prompt: currentPrompt,
      answer: promptType === 'draw' ? '[Drawing]' : answer,
      drawingData: promptType === 'draw' ? drawingData : null,
      promptType,
      time: new Date().toLocaleTimeString()
    }]);
    setPhase('submitted');
  };

  // Human mode - submit prompt (calls DeepSeek API)
  const submitHumanPrompt = async () => {
    if (!humanPrompt.trim() || tokens < 1) return;

    setTokens(prev => prev - 1);
    setStats(prev => ({ ...prev, asked: prev.asked + 1 }));
    setPhase('waiting');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: humanPrompt,
          locale: t?.layout?.language || 'en'
        })
      });
      const data = await res.json();
      const response = data.response || getRandomAIResponse();
      setReceivedResponse(response);
      setHistory(prev => [...prev, {
        type: 'human',
        prompt: humanPrompt,
        answer: response,
        source: data.source || 'unknown',
        time: new Date().toLocaleTimeString()
      }]);
      setPhase('received');
    } catch (error) {
      console.error('Chat API error:', error);
      const response = getRandomAIResponse();
      setReceivedResponse(response);
      setHistory(prev => [...prev, {
        type: 'human',
        prompt: humanPrompt,
        answer: response,
        source: 'fallback',
        time: new Date().toLocaleTimeString()
      }]);
      setPhase('received');
    }
  };

  const resetToMenu = () => {
    setMode(null);
    setPhase('idle');
    setCurrentPrompt('');
    setAnswer('');
    setDrawingData(null);
    setHumanPrompt('');
    setReceivedResponse('');
    setIsActive(false);
  };

  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 20 ? 'var(--accent)' : timeLeft > 10 ? '#ff9800' : '#e53935';

  // ============ RENDER ============

  // Mode selection screen
  if (!mode) {
    return (
      <div className={styles.game}>
        <div className={styles.modeSelect}>
          <div className={styles.tokenDisplay}>
            <span className={styles.tokenIcon}>🪙</span>
            <span className={styles.tokenCount}>{tokens}</span>
            <span className={styles.tokenLabel}>tokens</span>
          </div>

          <h2 className={styles.modeTitle}>Choose Your Role</h2>
          <p className={styles.modeSubtitle}>Your AI Slop Bores Me — be the AI or be the human</p>

          <div className={styles.modeCards}>
            <button className={styles.modeCard} onClick={() => { setMode('larp'); }}>
              <span className={styles.modeEmoji}>🤖</span>
              <h3>Larp as AI</h3>
              <p>Answer prompts from humans within 60 seconds. Write or draw your response. Earn tokens!</p>
              <span className={styles.modeTag}>+ Earn Tokens</span>
            </button>

            <button
              className={`${styles.modeCard} ${tokens < 1 ? styles.modeDisabled : ''}`}
              onClick={() => { if (tokens >= 1) setMode('human'); }}
            >
              <span className={styles.modeEmoji}>🧑</span>
              <h3>Be Human</h3>
              <p>Submit your question and get a response from a real human pretending to be AI. Costs 1 token.</p>
              <span className={styles.modeTag}>
                {tokens < 1 ? '🔒 Need 1 Token' : '- 1 Token'}
              </span>
            </button>
          </div>

          {stats.answered > 0 && (
            <div className={styles.statsBar}>
              <span>📊 Answered: {stats.answered}</span>
              <span>❓ Asked: {stats.asked}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LARP AS AI mode
  if (mode === 'larp') {
    return (
      <div className={styles.game}>
        <div className={styles.gameHeader}>
          <button className={styles.backBtn} onClick={resetToMenu}>← Back</button>
          <div className={styles.tokenDisplay}>
            <span className={styles.tokenIcon}>🪙</span>
            <span className={styles.tokenCount}>{tokens}</span>
          </div>
        </div>

        {phase === 'idle' && (
          <div className={styles.larpIdle}>
            <span className={styles.bigEmoji}>🤖</span>
            <h2>Ready to Larp as AI?</h2>
            <p>You'll get a random prompt from a "human" and have 60 seconds to respond.</p>
            <button className={styles.startBtn} onClick={startLarp}>
              Get a Prompt
            </button>
          </div>
        )}

        {phase === 'answering' && (
          <div className={styles.answerPhase}>
            {/* Timer */}
            <div className={styles.timerBar}>
              <div
                className={styles.timerFill}
                style={{ width: `${timerPercent}%`, background: timerColor }}
              />
            </div>
            <div className={styles.timerText} style={{ color: timerColor }}>
              {timeLeft}s
            </div>

            {/* Prompt */}
            <div className={styles.promptCard}>
              <span className={styles.promptLabel}>
                {promptType === 'draw' ? '🎨 Draw this:' : '💬 Human asks:'}
              </span>
              <p className={styles.promptText}>{currentPrompt}</p>
            </div>

            {/* Answer area */}
            {promptType === 'text' ? (
              <div className={styles.answerArea}>
                <textarea
                  className={styles.answerInput}
                  placeholder="Type your response as an AI... be creative, be funny, be human!"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  maxLength={500}
                  autoFocus
                />
                <div className={styles.charCount}>{answer.length}/500</div>
                <button
                  className={styles.submitBtn}
                  onClick={submitAnswer}
                  disabled={!answer.trim()}
                >
                  Submit Response →
                </button>
              </div>
            ) : (
              <DrawingCanvas
                onSave={(data) => { setDrawingData(data); submitAnswer(); }}
                disabled={false}
              />
            )}
          </div>
        )}

        {phase === 'submitted' && (
          <div className={styles.resultPhase}>
            <span className={styles.bigEmoji}>✅</span>
            <h2>Response Submitted!</h2>
            <p className={styles.tokenEarned}>+1 🪙 Token Earned</p>
            <div className={styles.yourAnswer}>
              <span className={styles.promptLabel}>Prompt:</span>
              <p>{currentPrompt}</p>
              <span className={styles.promptLabel}>Your Answer:</span>
              {drawingData ? (
                <img src={drawingData} alt="Your drawing" className={styles.drawingPreview} />
              ) : (
                <p className={styles.answerPreview}>{answer}</p>
              )}
            </div>
            <div className={styles.resultActions}>
              <button className={styles.startBtn} onClick={startLarp}>
                Next Prompt →
              </button>
              <button className={styles.backBtn} onClick={resetToMenu}>
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // HUMAN mode
  if (mode === 'human') {
    return (
      <div className={styles.game}>
        <div className={styles.gameHeader}>
          <button className={styles.backBtn} onClick={resetToMenu}>← Back</button>
          <div className={styles.tokenDisplay}>
            <span className={styles.tokenIcon}>🪙</span>
            <span className={styles.tokenCount}>{tokens}</span>
          </div>
        </div>

        {phase === 'idle' && (
          <div className={styles.humanIdle}>
            <span className={styles.bigEmoji}>🧑</span>
            <h2>Ask the "AI" Anything</h2>
            <p>Type your question or request below. A human pretending to be AI will answer it. Costs 1 token.</p>
            <textarea
              className={styles.answerInput}
              placeholder="Ask anything... e.g., 'Draw me a cat with a top hat' or 'Explain love using only pizza metaphors'"
              value={humanPrompt}
              onChange={(e) => setHumanPrompt(e.target.value)}
              maxLength={300}
              autoFocus
            />
            <div className={styles.charCount}>{humanPrompt.length}/300</div>
            <button
              className={styles.submitBtn}
              onClick={submitHumanPrompt}
              disabled={!humanPrompt.trim() || tokens < 1}
            >
              Submit Prompt (-1 🪙) →
            </button>
          </div>
        )}

        {phase === 'waiting' && (
          <div className={styles.waitingPhase}>
            <div className={styles.waitingAnimation}>
              <span className={styles.bigEmoji}>⏳</span>
              <h2>Processing your prompt...</h2>
              <p>A human-powered "AI" is crafting your response...</p>
              <div className={styles.loadingDots}>
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          </div>
        )}

        {phase === 'received' && (
          <div className={styles.resultPhase}>
            <span className={styles.bigEmoji}>📨</span>
            <h2>Response Received!</h2>
            <div className={styles.yourAnswer}>
              <span className={styles.promptLabel}>Your Question:</span>
              <p>{humanPrompt}</p>
              <span className={styles.promptLabel}>"AI" Response:</span>
              <p className={styles.aiResponse}>{receivedResponse}</p>
            </div>
            <div className={styles.resultActions}>
              <button className={styles.startBtn} onClick={() => {
                setPhase('idle');
                setHumanPrompt('');
                setReceivedResponse('');
              }}>
                Ask Another →
              </button>
              <button className={styles.backBtn} onClick={resetToMenu}>
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
