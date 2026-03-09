'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Game.module.css';
import DrawingCanvas from './DrawingCanvas';
import { getRandomPrompt, getRandomAIResponse } from './prompts';

const TIMER_SECONDS = 60;

export default function GameMain({ t }) {
  // Game state
  const [mode, setMode] = useState('human'); // 'human' | 'larp'
  const [tokens, setTokens] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptType, setPromptType] = useState('text'); // 'text' | 'draw'
  const [inputMode, setInputMode] = useState('text'); // bottom bar toggle: 'text' | 'draw'
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | answering | submitted | waiting | received
  const [messages, setMessages] = useState([]);
  const [humanPrompt, setHumanPrompt] = useState('');
  const [receivedResponse, setReceivedResponse] = useState('');
  const [drawingData, setDrawingData] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [stats, setStats] = useState({ answered: 0, asked: 0 });
  const [onlineCount] = useState(() => Math.floor(Math.random() * 8000) + 12000);
  const [tokenPop, setTokenPop] = useState(false);
  const timerRef = useRef(null);
  const chatRef = useRef(null);
  const prevTokens = useRef(tokens);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('slopai_state');
      if (saved) {
        const data = JSON.parse(saved);
        setTokens(data.tokens || 0);
        setStats(data.stats || { answered: 0, asked: 0 });
        setMessages(data.messages || []);
      }
    } catch (e) {}
  }, []);

  // Save state
  useEffect(() => {
    try {
      localStorage.setItem('slopai_state', JSON.stringify({
        tokens, stats, messages: messages.slice(-30)
      }));
    } catch (e) {}
  }, [tokens, stats, messages]);

  // Token change animation
  useEffect(() => {
    if (tokens !== prevTokens.current) {
      setTokenPop(true);
      const timer = setTimeout(() => setTokenPop(false), 500);
      prevTokens.current = tokens;
      return () => clearTimeout(timer);
    }
  }, [tokens]);

  // Auto scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, phase]);

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
      submitLarpAnswer();
    } else {
      setPhase('idle');
      setCurrentPrompt('');
      setMessages(prev => [...prev, { type: 'system', text: 'Time\'s up! No response submitted.' }]);
    }
  }, [answer, drawingData]);

  // Fetch AI-generated prompt
  const fetchAIPrompt = async () => {
    try {
      const res = await fetch(`/api/prompt?locale=${t?.layout?.language || 'en'}&t=${Date.now()}`);
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

  // Get a local prompt that's different from the current one
  const getNewLocalPrompt = () => {
    const isDrawRound = Math.random() < 0.3;
    const type = isDrawRound ? 'draw' : 'text';
    let prompt = getRandomPrompt(type, t?.layout?.language);
    // Avoid repeating the same prompt
    let attempts = 0;
    while (prompt === currentPrompt && attempts < 5) {
      prompt = getRandomPrompt(type, t?.layout?.language);
      attempts++;
    }
    return { prompt, type };
  };

  // Start larp round
  const startLarp = async () => {
    setPhase('answering');
    setAnswer('');
    setDrawingData(null);
    setInputMode('text');
    setTimeLeft(TIMER_SECONDS);
    setIsActive(true);

    const aiPrompt = await fetchAIPrompt();
    let prompt, type;
    if (aiPrompt && aiPrompt.prompt !== currentPrompt) {
      type = aiPrompt.type;
      prompt = aiPrompt.prompt;
    } else {
      const local = getNewLocalPrompt();
      type = local.type;
      prompt = local.prompt;
    }
    setPromptType(type);
    setCurrentPrompt(prompt);
    setMessages(prev => [...prev, { type: 'prompt', text: prompt, promptType: type }]);
  };

  // Submit larp answer
  const submitLarpAnswer = () => {
    const response = promptType === 'draw' ? drawingData : answer;
    if (!response || (typeof response === 'string' && !response.trim())) return;
    if (promptType === 'text' && answer.trim().length < 10) return;

    setIsActive(false);
    clearTimeout(timerRef.current);
    setTokens(prev => prev + 1);
    setStats(prev => ({ ...prev, answered: prev.answered + 1 }));
    setMessages(prev => [...prev, {
      type: 'answer',
      text: promptType === 'draw' ? null : answer,
      drawingData: promptType === 'draw' ? drawingData : null,
      promptType,
    }]);
    setPhase('submitted');
  };

  // Detect draw request
  const isDrawRequest = (prompt) => {
    const drawKeywords = /\b(draw|paint|sketch|illustrat|picture|image|photo|create.*art|generate.*image|make.*picture|画|描|绘|イラスト|描い|그려|dibujar?)\b/i;
    return drawKeywords.test(prompt);
  };

  // Generate image
  const generateImage = async (prompt) => {
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        return data.imageUrl;
      }
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setIsGeneratingImage(false);
    }
    return null;
  };

  // Human mode submit
  const submitHumanPrompt = async () => {
    if (!humanPrompt.trim() || tokens < 1) return;

    const prompt = humanPrompt;
    setTokens(prev => prev - 1);
    setStats(prev => ({ ...prev, asked: prev.asked + 1 }));
    setPhase('waiting');
    setGeneratedImage(null);
    setMessages(prev => [...prev, { type: 'human-ask', text: prompt }]);
    setHumanPrompt('');

    const wantsDraw = isDrawRequest(prompt);

    try {
      const textPromise = fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          locale: t?.layout?.language || 'en'
        })
      }).then(r => r.json());

      const imagePromise = wantsDraw ? generateImage(prompt) : Promise.resolve(null);
      const [textData, imageUrl] = await Promise.all([textPromise, imagePromise]);

      const response = textData.response || getRandomAIResponse(t?.layout?.language);
      setReceivedResponse(response);

      setMessages(prev => [...prev, {
        type: 'ai-response',
        text: response,
        imageUrl: imageUrl || null,
        source: textData.source || 'unknown',
      }]);
      setPhase('received');
    } catch (error) {
      console.error('Submit error:', error);
      const response = getRandomAIResponse(t?.layout?.language);
      setReceivedResponse(response);
      setMessages(prev => [...prev, {
        type: 'ai-response',
        text: response,
        source: 'fallback',
      }]);
      setPhase('received');
    }
  };

  // Switch modes
  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setPhase('idle');
    setCurrentPrompt('');
    setAnswer('');
    setDrawingData(null);
    setHumanPrompt('');
    setIsActive(false);
    clearTimeout(timerRef.current);
  };

  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 20 ? '#4caf50' : timeLeft > 10 ? '#ff9800' : '#e53935';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (mode === 'human' && humanPrompt.trim() && tokens >= 1) {
        submitHumanPrompt();
      } else if (mode === 'larp' && phase === 'answering' && answer.trim().length >= 10) {
        submitLarpAnswer();
      }
    }
  };

  // ============ RENDER ============
  return (
    <div className={styles.game}>
      {/* Top Tabs */}
      <div className={styles.topTabs}>
        <button
          className={`${styles.tab} ${mode === 'human' ? styles.tabActive : ''}`}
          onClick={() => switchMode('human')}
        >
          human
        </button>
        <button
          className={`${styles.tab} ${mode === 'larp' ? styles.tabActive : ''}`}
          onClick={() => switchMode('larp')}
        >
          larp as ai
          <span className={`${styles.tokenBadge} ${tokenPop ? styles.tokenBadgePop : ''}`}>{tokens}tk</span>
        </button>
      </div>

      {/* Main Card */}
      <div className={styles.card}>
        <div className={styles.cardContent} key={mode}>
        {/* Card Header */}
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>your ai slop bores me</div>
          {mode === 'larp' && phase === 'idle' && (
            <button className={styles.playBtn} onClick={startLarp}>▶</button>
          )}
          <div className={styles.subtitle}>
            SOTA LLM outputting 1 million tokens per sometimes.
          </div>
        </div>

        {/* Timer (larp answering) */}
        {mode === 'larp' && phase === 'answering' && (
          <>
            <div className={styles.timerBar}>
              <div
                className={styles.timerFill}
                style={{ width: `${timerPercent}%`, background: timerColor }}
              />
            </div>
            <div className={styles.timerText} style={{ color: timerColor }}>
              {timeLeft}s remaining
            </div>
          </>
        )}

        {/* Chat Area */}
        <div className={styles.chatArea} ref={chatRef}>
          {/* Larp: show prompt */}
          {mode === 'larp' && phase === 'answering' && (
            <div className={styles.promptDisplay}>
              <div className={styles.promptTag}>
                {promptType === 'draw' ? '🎨 draw this' : '💬 human asks'}
              </div>
              <p className={styles.promptContent}>{currentPrompt}</p>
            </div>
          )}

          {/* Messages */}
          {messages.length === 0 && phase !== 'answering' && phase !== 'waiting' && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>
                {mode === 'human' ? '💬' : '🤖'}
              </span>
              <p className={styles.emptyText}>
                {mode === 'human'
                  ? 'Ask the "AI" anything...'
                  : 'Press ▶ to get a prompt and larp as AI'
                }
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            if (msg.type === 'system') {
              return (
                <div key={i} className={`${styles.chatBubble} ${styles.bubbleSystem}`}>
                  {msg.text}
                </div>
              );
            }
            if (msg.type === 'prompt') {
              return (
                <div key={i} className={`${styles.chatBubble} ${styles.bubblePrompt}`}>
                  {msg.promptType === 'draw' ? '🎨 ' : '💬 '}{msg.text}
                </div>
              );
            }
            if (msg.type === 'answer') {
              return (
                <div key={i} className={`${styles.chatBubble} ${styles.bubbleAnswer}`}>
                  {msg.drawingData ? (
                    <img src={msg.drawingData} alt="Drawing" className={styles.drawingPreview} />
                  ) : (
                    msg.text
                  )}
                </div>
              );
            }
            if (msg.type === 'human-ask') {
              return (
                <div key={i} className={`${styles.chatBubble} ${styles.bubbleAnswer}`}>
                  {msg.text}
                </div>
              );
            }
            if (msg.type === 'ai-response') {
              return (
                <div key={i}>
                  {msg.imageUrl && (
                    <div className={`${styles.chatBubble} ${styles.bubbleImage}`}>
                      <img src={msg.imageUrl} alt="Generated" className={styles.generatedImage} />
                    </div>
                  )}
                  <div className={`${styles.chatBubble} ${styles.bubbleAI}`}>
                    {msg.text}
                  </div>
                </div>
              );
            }
            return null;
          })}

          {/* Waiting indicator */}
          {phase === 'waiting' && (
            <div className={`${styles.chatBubble} ${styles.bubbleAI}`}>
              <div className={styles.loadingDots}>
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}

          {/* Submitted result */}
          {mode === 'larp' && phase === 'submitted' && (
            <div className={styles.resultNotice}>
              <div className={styles.tokenEarned}>+1 token earned!</div>
              <div className={styles.resultText}>Your response has been submitted</div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          {/* Input mode toggle */}
          {mode === 'larp' && phase === 'answering' && (
            <div className={styles.inputToggle}>
              <button
                className={`${styles.toggleBtn} ${inputMode === 'text' ? styles.toggleActive : ''}`}
                onClick={() => setInputMode('text')}
              >
                write something
              </button>
              <button
                className={`${styles.toggleBtn} ${inputMode === 'draw' ? styles.toggleActive : ''}`}
                onClick={() => setInputMode('draw')}
              >
                draw something
              </button>
            </div>
          )}

          {/* Warning for human mode with no tokens */}
          {mode === 'human' && tokens < 1 && (
            <div className={styles.warning}>
              You haven&apos;t larped as an AI enough
            </div>
          )}

          {/* Human mode input */}
          {mode === 'human' && (phase === 'idle' || phase === 'received') && (
            <>
              <div className={styles.inputRow}>
                <textarea
                  className={styles.textInput}
                  placeholder="Ask anything..."
                  value={humanPrompt}
                  onChange={(e) => setHumanPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={300}
                  rows={1}
                />
                <button
                  className={`${styles.sendBtn} ${humanPrompt.trim() && tokens >= 1 ? styles.sendBtnActive : ''}`}
                  onClick={submitHumanPrompt}
                  disabled={!humanPrompt.trim() || tokens < 1}
                  title="Send"
                >
                  ✈
                </button>
              </div>
              <div className={styles.charInfo}>
                <span>{humanPrompt.length}/300</span>
                <span>costs 1 token</span>
              </div>
            </>
          )}

          {/* Larp mode - text input */}
          {mode === 'larp' && phase === 'answering' && inputMode === 'text' && (
            <>
              <div className={styles.inputRow}>
                <textarea
                  className={styles.textInput}
                  placeholder="Type your AI response..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={500}
                  rows={2}
                  autoFocus
                />
                <button
                  className={`${styles.sendBtn} ${answer.trim().length >= 10 ? styles.sendBtnActive : ''}`}
                  onClick={submitLarpAnswer}
                  disabled={answer.trim().length < 10}
                  title="Submit"
                >
                  ✈
                </button>
              </div>
              <div className={styles.charInfo}>
                <span>{answer.length}/500 {answer.trim().length > 0 && answer.trim().length < 10 && '(min 10)'}</span>
              </div>
            </>
          )}

          {/* Larp mode - draw input */}
          {mode === 'larp' && phase === 'answering' && inputMode === 'draw' && (
            <DrawingCanvas
              onSave={(data) => { setDrawingData(data); submitLarpAnswer(); }}
              disabled={false}
            />
          )}

          {/* Larp idle - start button */}
          {mode === 'larp' && phase === 'idle' && (
            <div style={{ textAlign: 'center', padding: '0.25rem' }}>
              <button className={styles.nextBtn} onClick={startLarp}>
                Get a Prompt ▶
              </button>
            </div>
          )}

          {/* Larp submitted */}
          {mode === 'larp' && phase === 'submitted' && (
            <div style={{ textAlign: 'center', padding: '0.25rem' }}>
              <button className={styles.nextBtn} onClick={startLarp}>
                Next Prompt →
              </button>
            </div>
          )}

          {/* Waiting */}
          {phase === 'waiting' && (
            <div style={{ textAlign: 'center', padding: '0.25rem', color: '#999', fontSize: '0.8rem' }}>
              {isGeneratingImage ? '🎨 Generating image...' : 'Waiting for response...'}
            </div>
          )}
        </div>
        </div>{/* end cardContent */}
      </div>

      {/* Footer */}
      <div className={styles.gameFooter}>
        <p>humans make mistakes because that&apos;s what makes us human</p>
        <p><span className={styles.onlineCount}>{onlineCount.toLocaleString()}</span> online</p>
      </div>
    </div>
  );
}
