'use client'

import { useRef, useState, useEffect, useCallback } from 'react';
import styles from './Game.module.css';

export default function DrawingCanvas({ onSave, disabled }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [lastPos, setLastPos] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }, []);

  const startDraw = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDrawing(true);
    setLastPos(getPos(e));
  }, [disabled, getPos]);

  const draw = useCallback((e) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (lastPos) {
      ctx.moveTo(lastPos.x, lastPos.y);
    }
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  }, [isDrawing, disabled, color, brushSize, lastPos, getPos]);

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
    setLastPos(null);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  const colors = ['#ffffff', '#f9a825', '#e53935', '#43a047', '#1e88e5', '#8e24aa', '#ff7043'];

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.canvasToolbar}>
        <div className={styles.colorPicker}>
          {colors.map(c => (
            <button
              key={c}
              className={`${styles.colorBtn} ${color === c ? styles.colorActive : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className={styles.brushSizes}>
          {[2, 4, 8, 12].map(size => (
            <button
              key={size}
              className={`${styles.sizeBtn} ${brushSize === size ? styles.sizeActive : ''}`}
              onClick={() => setBrushSize(size)}
            >
              <span style={{ width: size + 4, height: size + 4, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            </button>
          ))}
        </div>
        <button onClick={clearCanvas} className={styles.clearBtn} disabled={disabled}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <button
        onClick={saveDrawing}
        className={styles.submitDrawBtn}
        disabled={disabled}
      >
        Submit Drawing
      </button>
    </div>
  );
}
