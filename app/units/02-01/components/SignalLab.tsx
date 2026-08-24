'use client';

import { useEffect, useRef, useState } from 'react';

function SignalCanvas({ samples, levels, noise }: { samples: number; levels: number; noise: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const width = rect.width;
      const height = rect.height;
      const pad = 28;
      const graphWidth = width - pad * 2;
      const graphHeight = height - pad * 2;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#d9e4e5';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i += 1) {
        const y = pad + (graphHeight * i) / 4;
        ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(width - pad, y); ctx.stroke();
      }
      const valueAt = (x: number) => {
        const base = 0.5 + Math.sin(x * Math.PI * 2) * 0.26 + Math.sin(x * Math.PI * 5) * 0.08;
        const disturbance = Math.sin(x * 113) * (noise / 100);
        return Math.max(0.04, Math.min(0.96, base + disturbance));
      };
      ctx.strokeStyle = '#e88466';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let px = 0; px <= graphWidth; px += 2) {
        const x = px / graphWidth;
        const y = pad + (1 - valueAt(x)) * graphHeight;
        if (px === 0) ctx.moveTo(pad + px, y); else ctx.lineTo(pad + px, y);
      }
      ctx.stroke();

      const step = graphWidth / (samples - 1);
      const points = Array.from({ length: samples }, (_, i) => {
        const xNorm = i / (samples - 1);
        const quantized = Math.round(valueAt(xNorm) * (levels - 1)) / (levels - 1);
        return { x: pad + i * step, y: pad + (1 - quantized) * graphHeight };
      });
      ctx.strokeStyle = '#2f7c7a';
      ctx.fillStyle = '#2f7c7a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else {
          const previous = points[index - 1];
          ctx.lineTo(point.x, previous.y);
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      points.forEach((point) => {
        ctx.beginPath(); ctx.arc(point.x, point.y, 4, 0, Math.PI * 2); ctx.fill();
      });
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [samples, levels, noise]);

  return <canvas ref={canvasRef} className="signal-canvas" aria-label="連続的なアナログ波形と離散化したデジタル値の比較" />;
}

export function SignalLab() {
  const [samples, setSamples] = useState(9);
  const [levels, setLevels] = useState(6);
  const [noise, setNoise] = useState(0);

  return (
    <section className="learning-section" id="signal">
      <div className="section-kicker"><span>01</span><p>アナログとデジタル</p></div>
      <div className="section-title-row">
        <div><p className="step-label">まず試す</p><h2>波を「区切って」みよう</h2></div>
        <p className="section-question">どこまで細かくすれば、元の波に近づくだろう？</p>
      </div>
      <div className="experiment-card">
        <div className="legend" aria-label="グラフの凡例">
          <span><i className="legend-line analog" />連続した波</span>
          <span><i className="legend-line digital" />区切った値</span>
        </div>
        <SignalCanvas samples={samples} levels={levels} noise={noise} />
        <div className="control-grid control-grid-three">
          <label className="control-panel">
            <span><b>測る回数</b><output>{samples}回</output></span>
            <input aria-label="測る回数" type="range" min="5" max="21" step="2" value={samples} onChange={(event) => setSamples(Number(event.target.value))} />
            <small>時間をどれだけ細かく区切るか</small>
          </label>
          <label className="control-panel">
            <span><b>値の段階</b><output>{levels}段階</output></span>
            <input aria-label="値の段階" type="range" min="3" max="12" value={levels} onChange={(event) => setLevels(Number(event.target.value))} />
            <small>高さを何段階で表すか</small>
          </label>
          <label className="control-panel">
            <span><b>ノイズ</b><output>{noise === 0 ? 'なし' : `${noise}%`}</output></span>
            <input aria-label="アナログ波形に加えるノイズ" type="range" min="0" max="12" value={noise} onChange={(event) => setNoise(Number(event.target.value))} />
            <small>伝送中の小さな乱れを加える</small>
          </label>
        </div>
        <div className="discovery-box">
          <span className="discovery-icon" aria-hidden="true">!</span>
          <div><p>今の操作を言葉にすると…</p><h3><mark>連続的</mark>な量を、一定の間隔で区切って<mark>離散的</mark>な値にした。</h3></div>
          <span className="print-badge">プリント ①・②</span>
        </div>
      </div>
      <details className="learn-more">
        <summary>仕組みを見る：デジタルなら誤差がない？</summary>
        <div><p>区切ることで扱いやすく、多少のノイズが混ざっても元の0・1を判断しやすくなります。一方、区切る間隔や段階が粗いと、元の量との差である<strong>量子化誤差</strong>が生まれます。</p><p className="teacher-note">発展：アナログとデジタルには、それぞれ長所があります。「デジタル＝常に正確」ではありません。</p></div>
      </details>
    </section>
  );
}

const media = {
  voltage: { label: '電圧', one: '高い電圧', zero: '低い電圧', iconOne: '↑', iconZero: '↓' },
  magnet: { label: '磁気', one: 'N極', zero: 'S極', iconOne: 'N', iconZero: 'S' },
  disc: { label: '光ディスク', one: '変化する部分', zero: '変化しない部分', iconOne: '▰', iconZero: '▬' },
} as const;

export function MediaLab() {
  const [medium, setMedium] = useState<keyof typeof media>('voltage');
  const [bits, setBits] = useState([1, 0, 1, 1, 0, 0, 1, 0]);
  const selected = media[medium];
  const toggle = (index: number) => setBits((current) => current.map((bit, i) => i === index ? 1 - bit : bit));

  return (
    <section className="learning-section" id="media">
      <div className="section-kicker"><span>02</span><p>コンピュータのデジタル表現</p></div>
      <div className="section-title-row"><div><p className="step-label">見方を変える</p><h2>0と1は、何でできている？</h2></div><p className="section-question">同じ10110010を、3種類の媒体で表そう。</p></div>
      <div className="lab-panel">
        <div className="segmented-control" aria-label="0と1を表す媒体">
          {Object.entries(media).map(([key, value]) => <button key={key} type="button" className={medium === key ? 'selected' : ''} aria-pressed={medium === key} onClick={() => setMedium(key as keyof typeof media)}>{value.label}</button>)}
        </div>
        <div className="physical-bits" aria-label={`${selected.label}で表した8ビット`}>
          {bits.map((bit, index) => <button type="button" key={index} className={`physical-bit bit-${bit}`} onClick={() => toggle(index)} aria-label={`${index + 1}桁目は${bit}。クリックで切り替え`}><span>{bit ? selected.iconOne : selected.iconZero}</span><b>{bit}</b><small>{bit ? selected.one : selected.zero}</small></button>)}
        </div>
        <p className="action-hint">各マスをクリックすると、0と1が切り替わります。</p>
        <div className="concept-strip"><div><b>表し方</b><span>電圧・磁気・光の変化</span></div><i aria-hidden="true">→</i><div><b>意味</b><span>0 または 1</span></div><i aria-hidden="true">→</i><div><b>数の表現</b><span><mark>2進法</mark>・<mark>2進数</mark></span></div></div>
        <div className="print-callout"><span>プリント ③</span><strong>2進法</strong><em>0と1の組合せで数を表す方法</em><span>プリント ④</span><strong>2進数</strong><em>2進法で表した数値</em></div>
      </div>
    </section>
  );
}

