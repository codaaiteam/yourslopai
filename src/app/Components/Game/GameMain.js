'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Game.module.css';
import DrawingCanvas from './DrawingCanvas';
import { getRandomPrompt, getRandomAIResponse } from './prompts';

const TIMER_SECONDS = 60;

export default function GameMain({ t }) {
  // Game state
  const [mode, setMode] = useState('larp'); // 'human' | 'larp'
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
  const [showRules, setShowRules] = useState(false);
  const timerRef = useRef(null);
  const chatRef = useRef(null);
  const prevTokens = useRef(tokens);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('slopai_state');
      if (saved) {
        const data = JSON.parse(saved);
        const savedTokens = data.tokens || 0;
        setTokens(savedTokens);
        setStats(data.stats || { answered: 0, asked: 0 });
        setMessages(data.messages || []);
        if (savedTokens >= 10) setMode('human');
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

  // Track recent prompts to avoid repeats
  const recentPromptsRef = useRef([]);

  const isRecentPrompt = (prompt) => {
    return recentPromptsRef.current.some(p =>
      p === prompt || prompt.includes(p.slice(0, 30)) || p.includes(prompt.slice(0, 30))
    );
  };

  const addToRecent = (prompt) => {
    recentPromptsRef.current.push(prompt);
    if (recentPromptsRef.current.length > 10) {
      recentPromptsRef.current.shift();
    }
  };

  // Get a local prompt that's different from recent ones
  const getNewLocalPrompt = () => {
    const isDrawRound = Math.random() < 0.3;
    const type = isDrawRound ? 'draw' : 'text';
    let prompt = getRandomPrompt(type, t?.layout?.language);
    let attempts = 0;
    while (isRecentPrompt(prompt) && attempts < 10) {
      prompt = getRandomPrompt(type, t?.layout?.language);
      attempts++;
    }
    return { prompt, type };
  };

  // Start larp round
  const startLarp = async () => {
    setPhase('loading');
    setAnswer('');
    setDrawingData(null);
    setInputMode('text');

    // Try API prompt up to 2 times
    let prompt, type;
    for (let attempt = 0; attempt < 2; attempt++) {
      const aiPrompt = await fetchAIPrompt();
      if (aiPrompt && !isRecentPrompt(aiPrompt.prompt)) {
        type = aiPrompt.type;
        prompt = aiPrompt.prompt;
        break;
      }
    }

    // Fallback to local
    if (!prompt) {
      const local = getNewLocalPrompt();
      type = local.type;
      prompt = local.prompt;
    }

    addToRecent(prompt);
    setPromptType(type);
    setCurrentPrompt(prompt);
    setMessages(prev => [...prev, { type: 'prompt', text: prompt, promptType: type }]);
    setTimeLeft(TIMER_SECONDS);
    setIsActive(true);
    setPhase('answering');
  };

  // Submit larp answer — AI judges whether it earns a token
  const submitLarpAnswer = async () => {
    const isDrawing = promptType === 'draw';
    const response = isDrawing ? drawingData : answer;
    if (!response || (typeof response === 'string' && !response.trim())) return;
    if (!isDrawing && answer.trim().length < 10) return;

    setIsActive(false);
    clearTimeout(timerRef.current);
    setMessages(prev => [...prev, {
      type: 'answer',
      text: isDrawing ? null : answer,
      drawingData: isDrawing ? drawingData : null,
      promptType,
    }]);
    setPhase('judging');

    // Call judge API
    let passed = true;
    let reason = '';
    try {
      const res = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          answer: isDrawing ? '[drawing submitted]' : answer,
          isDrawing,
        }),
      });
      const data = await res.json();
      passed = data.pass;
      reason = data.reason || '';
    } catch {
      // On error, approve
      passed = true;
    }

    if (passed) {
      setTokens(prev => prev + 1);
      setStats(prev => ({ ...prev, answered: prev.answered + 1 }));
      setMessages(prev => [...prev, {
        type: 'judge',
        passed: true,
        reason,
      }]);
    } else {
      setMessages(prev => [...prev, {
        type: 'judge',
        passed: false,
        reason,
      }]);
    }
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

  // Human mode submit - detect if asking for text or image
  const submitHumanPrompt = async () => {
    if (!humanPrompt.trim()) return;

    const prompt = humanPrompt;
    const wantsDraw = isDrawRequest(prompt);
    const cost = wantsDraw ? 2 : 1;
    if (tokens < cost) return;
    setTokens(prev => prev - cost);
    setStats(prev => ({ ...prev, asked: prev.asked + 1 }));
    setPhase('waiting');
    setGeneratedImage(null);
    setMessages(prev => [...prev, {
      type: 'human-ask',
      text: prompt,
      askType: wantsDraw ? 'image' : 'text',
    }]);
    setHumanPrompt('');

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

  // Share: generate a screenshot of a specific exchange (human-ask + ai-response pair)
  const shareExchange = async (askMsg, responseMsg) => {
    // Use a temp canvas to measure text first
    const measure = document.createElement('canvas').getContext('2d');
    const W = 600;
    const pad = 30;
    const inPad = 14; // inner padding inside bubbles
    const lineH = 20;
    const bubbleMaxW = W - pad * 2;

    // Load image if present — proxy through our API to avoid CORS canvas tainting
    let loadedImg = null;
    if (responseMsg.imageUrl) {
      try {
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(responseMsg.imageUrl)}`;
        const imgBlob = await fetch(proxyUrl).then(r => r.blob());
        const blobUrl = URL.createObjectURL(imgBlob);
        loadedImg = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = blobUrl;
        });
      } catch (e) { loadedImg = null; }
    }

    // Wrap text
    measure.font = '14px sans-serif';
    const textW = bubbleMaxW - inPad * 2;
    const askLines = wrapText(measure, askMsg.text || '', textW);
    const respLines = responseMsg.text ? wrapText(measure, responseMsg.text, textW) : [];

    // Calculate heights
    const labelH = 18; // "you asked for..." label height
    const askH = labelH + askLines.length * lineH + inPad * 2;

    const imgDrawW = bubbleMaxW - inPad * 2;
    const imgDrawH = loadedImg ? Math.round(imgDrawW * (loadedImg.height / loadedImg.width)) : 0;
    const respTextH = respLines.length > 0 ? respLines.length * lineH : 0;
    const respH = labelH + inPad * 2
      + (loadedImg ? imgDrawH + 10 : 0)
      + respTextH;

    const titleH = 50;
    const footerH = 50;
    const gap = 14;
    const H = pad + titleH + askH + gap + respH + footerH + pad;

    // Create actual canvas
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#faf9f6';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('your ai slop bores me', W / 2, pad + 28);

    let y = pad + titleH;

    // --- Ask bubble (right aligned, green) ---
    const askBW = bubbleMaxW;
    const askX = W - pad - askBW;
    ctx.fillStyle = '#c8f7c5';
    roundRect(ctx, askX, y, askBW, askH, 10);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.fillText(`you asked for ${askMsg.askType || 'text'}`, askX + inPad, y + inPad + 10);

    ctx.fillStyle = '#222';
    ctx.font = 'bold 14px sans-serif';
    askLines.forEach((line, i) => {
      ctx.fillText(line, askX + inPad, y + inPad + labelH + 10 + i * lineH);
    });

    y += askH + gap;

    // --- AI response bubble (left aligned, lavender) ---
    const respBW = bubbleMaxW;
    ctx.fillStyle = '#ece4f4';
    roundRect(ctx, pad, y, respBW, respH, 10);
    ctx.fill();

    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('"ai" responded', pad + inPad, y + inPad + 10);

    let contentY = y + inPad + labelH + 8;

    // Draw image
    if (loadedImg) {
      const imgX = pad + inPad;
      // Clip rounded corners for image
      ctx.save();
      roundRect(ctx, imgX, contentY, imgDrawW, imgDrawH, 6);
      ctx.clip();
      ctx.drawImage(loadedImg, imgX, contentY, imgDrawW, imgDrawH);
      ctx.restore();
      // Border
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      roundRect(ctx, imgX, contentY, imgDrawW, imgDrawH, 6);
      ctx.stroke();
      contentY += imgDrawH + 10;
    }

    // Draw text
    if (respLines.length > 0) {
      ctx.fillStyle = '#222';
      ctx.font = '14px sans-serif';
      respLines.forEach((line, i) => {
        ctx.fillText(line, pad + inPad, contentY + 12 + i * lineH);
      });
    }

    y += respH + 16;

    // Footer
    ctx.fillStyle = '#bbb';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('youraislopboresmegame.com', W / 2, y + 12);

    // Download / Share
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'slop-chat.png', { type: 'image/png' });
        navigator.share({ files: [file], title: 'Your AI Slop Bores Me' }).catch(() => {
          downloadBlob(blob);
        });
      } else {
        downloadBlob(blob);
      }
    }, 'image/png');
  };

  const downloadBlob = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slop-chat.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Text wrapping helper
  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
      const test = currentLine ? currentLine + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = test;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.length ? lines : [''];
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

  // Find the previous human-ask message for a given ai-response index
  const findAskForResponse = (responseIndex) => {
    for (let i = responseIndex - 1; i >= 0; i--) {
      if (messages[i].type === 'human-ask') return messages[i];
    }
    return null;
  };

  // ============ RENDER ============
  return (
    <div className={styles.game}>
      {/* Top Tabs */}
      <div className={styles.topTabs}>
        <button
          className={`${styles.tab} ${mode === 'human' ? styles.tabActive : ''} ${tokens < 5 ? styles.tabDisabled : ''}`}
          onClick={() => tokens >= 5 && switchMode('human')}
        >
          human {tokens < 5 && `(${tokens}/10)`}
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
          <div className={styles.headerRow}>
            <div className={styles.cardTitle}>your ai slop bores me</div>
            <button className={styles.rulesBtn} onClick={() => setShowRules(v => !v)} title="Game Rules">?</button>
          </div>
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
                <div key={i} className={styles.bubbleWrapRight}>
                  <div className={styles.bubbleLabel}>you asked for {msg.askType || 'text'}</div>
                  <div className={styles.bubbleUserCard}>
                    {msg.text}
                  </div>
                </div>
              );
            }
            if (msg.type === 'judge') {
              return (
                <div key={i} className={styles.resultNotice}>
                  {msg.passed ? (
                    <>
                      <div className={styles.tokenEarned}>+1 token earned!</div>
                      {msg.reason && <div className={styles.resultText}>{msg.reason}</div>}
                    </>
                  ) : (
                    <>
                      <div className={styles.tokenDenied}>No token this time</div>
                      {msg.reason && <div className={styles.resultText}>{msg.reason}</div>}
                    </>
                  )}
                </div>
              );
            }
            if (msg.type === 'ai-response') {
              const askMsg = findAskForResponse(i);
              return (
                <div key={i} className={styles.bubbleWrapLeft}>
                  <div className={styles.bubbleAICard}>
                    <div className={styles.bubbleAILabel}>&quot;ai&quot; responded</div>
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Generated" className={styles.generatedImage} />
                    )}
                    {msg.text && <div className={styles.bubbleAIText}>{msg.text}</div>}
                    <div className={styles.bubbleActions}>
                      <button
                        className={styles.shareBtn}
                        onClick={() => askMsg && shareExchange(askMsg, msg)}
                      >
                        share
                      </button>
                      <button className={styles.reportBtn}>
                        report
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}

          {/* Waiting indicator */}
          {phase === 'waiting' && (
            <div className={styles.bubbleWrapLeft}>
              <div className={styles.bubbleAICard}>
                <div className={styles.bubbleAILabel}>&quot;ai&quot; is thinking...</div>
                <div className={styles.loadingDots}>
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            </div>
          )}

          {/* Judging indicator */}
          {mode === 'larp' && phase === 'judging' && (
            <div className={styles.resultNotice}>
              <div className={styles.judgingText}>Evaluating your response...</div>
              <div className={styles.loadingDots}>
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          {/* Input mode toggle - show in both human and larp modes */}
          {((mode === 'larp' && phase === 'answering') || (mode === 'human' && (phase === 'idle' || phase === 'received'))) && (
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
          {mode === 'human' && tokens < 5 && (
            <div className={styles.warning}>
              Earn at least 5 tokens by larping as AI first! ({tokens}/5)
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
                <span>{inputMode === 'draw' || isDrawRequest(humanPrompt) ? 'costs 2 tokens (image)' : 'costs 1 token'}</span>
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

          {/* Larp loading prompt */}
          {mode === 'larp' && phase === 'loading' && (
            <div className={styles.loadingPrompt}>
              <div className={styles.loadingSpinner} />
              <span>Finding a prompt...</span>
            </div>
          )}

          {/* Larp judging */}
          {mode === 'larp' && phase === 'judging' && (
            <div className={styles.loadingPrompt}>
              <div className={styles.loadingSpinner} />
              <span>AI is judging...</span>
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

      {/* Rules Modal */}
      {showRules && (
        <div className={styles.rulesOverlay} onClick={() => setShowRules(false)}>
          <div className={styles.rulesModal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.rulesModalTitle}>your ai slop bores me</h2>
            <p className={styles.rulesIntro}>
              in a world looming with the threat of ai stealing your job, save humanity by stealing ai&apos;s job.
            </p>
            <ul className={styles.rulesList}>
              <li>each text prompt costs <strong>1 token</strong>. image prompts cost <strong>2 tokens</strong>.</li>
              <li>to earn tokens, switch to the <strong>larp as ai</strong> tab and answer someone else&apos;s prompt within 60 seconds.</li>
              <li>you can answer with text or draw a picture — both earn 1 token.</li>
              <li>if you&apos;re broke, keep larping until you&apos;ve earned enough tokens.</li>
              <li>send in a prompt and revel in your (relatively negligible) water waste.</li>
              <li>be nice. this is not grok. hate speech and general unkindness will result in bans.</li>
            </ul>
            <button className={styles.rulesGotIt} onClick={() => setShowRules(false)}>
              got it
            </button>
            <p className={styles.rulesDisclaimer}>
              youraislopboresmegame.com does NOT endorse any crypto tokens under its name.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Canvas rounded rect helper
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
