'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type SignalCanvasProps = {
  samples: number;
  levels: number;
  noise: number;
  showAnalog: boolean;
  showDigital: boolean;
};

function SignalCanvas({ samples, levels, noise, showAnalog, showDigital }: SignalCanvasProps) {
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
      const pad = { left: 58, right: 18, top: 22, bottom: 48 };
      const graphWidth = width - pad.left - pad.right;
      const graphHeight = height - pad.top - pad.bottom;
      ctx.clearRect(0, 0, width, height);
      ctx.font = '10px "BIZ UDPGothic", sans-serif';
      ctx.fillStyle = '#586a7d';
      ctx.fillText('段階値', 7, 14);

      for (let level = 0; level < levels; level += 1) {
        const normalized = level / (levels - 1);
        const y = pad.top + (1 - normalized) * graphHeight;
        ctx.strokeStyle = level === 0 || level === levels - 1 ? '#b6c9c5' : '#d9e4e5';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
        ctx.fillStyle = '#2f7c7a';
        ctx.textAlign = 'right';
        ctx.fillText(String(level), pad.left - 9, y + 3);
      }

      const sampleStep = graphWidth / (samples - 1);
      for (let index = 0; index < samples; index += 1) {
        const x = pad.left + index * sampleStep;
        ctx.strokeStyle = 'rgba(47, 124, 122, .16)';
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + graphHeight); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = samples >= 17 ? '8px "BIZ UDPGothic", sans-serif' : '10px "BIZ UDPGothic", sans-serif';
        ctx.fillStyle = '#586a7d';
        ctx.textAlign = 'center';
        ctx.fillText(String(index + 1), x, pad.top + graphHeight + 18);
      }
      ctx.textAlign = 'center';
      ctx.font = '10px "BIZ UDPGothic", sans-serif';
      ctx.fillStyle = '#586a7d';
      ctx.fillText(`測定回（全${samples}回）`, pad.left + graphWidth / 2, height - 7);

      const analogValueAt = (x: number) => 0.5 + Math.sin(x * Math.PI * 2) * 0.26 + Math.sin(x * Math.PI * 5) * 0.08;
      const measuredValueAt = (x: number) => {
        const disturbance = Math.sin(x * 113) * (noise / 100);
        return Math.max(0.04, Math.min(0.96, analogValueAt(x) + disturbance));
      };

      if (showAnalog) {
        ctx.strokeStyle = '#e88466';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let px = 0; px <= graphWidth; px += 2) {
          const x = px / graphWidth;
          const y = pad.top + (1 - analogValueAt(x)) * graphHeight;
          if (px === 0) ctx.moveTo(pad.left + px, y); else ctx.lineTo(pad.left + px, y);
        }
        ctx.stroke();
      }

      if (showDigital) {
        const points = Array.from({ length: samples }, (_, index) => {
          const xNorm = index / (samples - 1);
          const level = Math.round(measuredValueAt(xNorm) * (levels - 1));
          return { x: pad.left + index * sampleStep, y: pad.top + (1 - level / (levels - 1)) * graphHeight, level };
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
          ctx.font = 'bold 10px "BIZ UDPGothic", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(point.level), point.x, point.y - 9);
        });
      }
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [samples, levels, noise, showAnalog, showDigital]);

  return <canvas ref={canvasRef} className="signal-canvas" aria-label="測定回と段階値を示したアナログ波形・デジタル値の比較" />;
}

export function SignalLab() {
  const [samples, setSamples] = useState(9);
  const [levels, setLevels] = useState(6);
  const [noise, setNoise] = useState(0);
  const [showAnalog, setShowAnalog] = useState(true);
  const [showDigital, setShowDigital] = useState(false);

  return (
    <section className="learning-section" id="signal">
      <div className="section-kicker"><span>01</span><p>アナログとデジタル</p></div>
      <div className="section-title-row">
        <div><p className="step-label">まず試す · 教科書 p.54</p><h2>波を「区切って」みよう</h2></div>
        <p className="section-question">アナログ波を表示し、次にデジタル値を重ねて違いを確かめよう。</p>
      </div>
      <div className="experiment-card">
        <div className="signal-toggles" aria-label="グラフに表示する情報">
          <button type="button" className={showAnalog ? 'active analog' : ''} aria-pressed={showAnalog} onClick={() => setShowAnalog((value) => !value)}><i />アナログ波 <b>{showAnalog ? 'ON' : 'OFF'}</b></button>
          <button type="button" className={showDigital ? 'active digital' : ''} aria-pressed={showDigital} onClick={() => setShowDigital((value) => !value)}><i />デジタル値 <b>{showDigital ? 'ON' : 'OFF'}</b></button>
        </div>
        <SignalCanvas samples={samples} levels={levels} noise={noise} showAnalog={showAnalog} showDigital={showDigital} />
        <p className="signal-status">横軸は<strong>{samples}回の測定</strong>、縦軸は<strong>0～{levels - 1}の{levels}段階</strong>。{showDigital ? '丸の上の数字が記録される段階値です。' : '「デジタル値」をONにして、測定結果を重ねてみよう。'}</p>
        <div className="control-grid control-grid-three">
          <label className="control-panel">
            <span><b>測る回数</b><output>{samples}回</output></span>
            <input aria-label="測る回数" type="range" min="5" max="21" step="2" value={samples} onChange={(event) => setSamples(Number(event.target.value))} />
            <small>縦の補助線と測定番号が連動します</small>
          </label>
          <label className="control-panel">
            <span><b>値の段階</b><output>{levels}段階</output></span>
            <input aria-label="値の段階" type="range" min="3" max="12" value={levels} onChange={(event) => setLevels(Number(event.target.value))} />
            <small>横線と左側の段階値が連動します</small>
          </label>
          <label className="control-panel">
            <span><b>小さなノイズ</b><output>{noise === 0 ? 'なし' : `${noise}%`}</output></span>
            <input aria-label="測定時に加える小さなノイズ" type="range" min="0" max="2" step="0.5" value={noise} onChange={(event) => setNoise(Number(event.target.value))} />
            <small>最大2%。境界付近では段階値が変わることもあります</small>
          </label>
        </div>
        <div className="discovery-box">
          <span className="discovery-icon" aria-hidden="true">!</span>
          <div><p>今の操作を言葉にすると…</p><h3><mark>連続的</mark>なアナログ量を、測る時刻と値の段階で区切り、<mark>離散的</mark>なデジタル値にした。</h3></div>
          <span className="print-badge"><small>プリント</small><b>1・2</b></span>
        </div>
      </div>
      <details className="learn-more">
        <summary>仕組みを見る：デジタルなら誤差がない？</summary>
        <div><p>区切ることで扱いやすく、多少のノイズが混ざっても元の0・1を判断しやすくなります。一方、区切る間隔や段階が粗いと、元の量との差である<strong>量子化誤差</strong>が生まれます。</p><p className="teacher-note">発展：ノイズが段階の境界を越えると、デジタル化後の値も変化します。「デジタル＝常に正確」ではありません。</p></div>
      </details>
    </section>
  );
}

const media = {
  voltage: { label: '電圧', one: '高い電圧', zero: '低い電圧', iconOne: '↑', iconZero: '↓' },
  magnet: { label: '磁気', one: 'N極', zero: 'S極', iconOne: 'N', iconZero: 'S' },
  disc: { label: '光ディスク', one: '高さが変化', zero: '同じ高さが続く', iconOne: '', iconZero: '' },
} as const;

export function MediaLab() {
  const [medium, setMedium] = useState<keyof typeof media>('voltage');
  const [bits, setBits] = useState([1, 0, 1, 1, 0, 0, 1, 0]);
  const selected = media[medium];
  const discStates = useMemo(() => bits.map((_, index) => (
    bits.slice(0, index + 1).filter((bit) => bit === 1).length % 2 === 0 ? 'land' : 'pit'
  )), [bits]);
  const toggle = (index: number) => setBits((current) => current.map((bit, i) => i === index ? 1 - bit : bit));

  return (
    <section className="learning-section" id="media">
      <div className="section-kicker"><span>02</span><p>コンピュータのデジタル表現</p></div>
      <div className="section-title-row"><div><p className="step-label">見方を変える · 教科書 p.54</p><h2>0と1は、何でできている？</h2></div><p className="section-question">同じ10110010を、3種類の媒体で表そう。</p></div>
      <div className="lab-panel">
        <div className="segmented-control" aria-label="0と1を表す媒体">
          {Object.entries(media).map(([key, value]) => <button key={key} type="button" className={medium === key ? 'selected' : ''} aria-pressed={medium === key} onClick={() => setMedium(key as keyof typeof media)}>{value.label}</button>)}
        </div>
        <div className={`physical-bits ${medium === 'disc' ? 'disc-bits' : ''}`} aria-label={`${selected.label}で表した8ビット`}>
          {bits.map((bit, index) => <button type="button" key={index} className={`physical-bit bit-${bit} ${medium === 'disc' ? `disc-${discStates[index]}` : ''}`} onClick={() => toggle(index)} aria-label={`${index + 1}桁目は${bit}。クリックで切り替え`}>
            {medium === 'disc' ? <span className="disc-profile" aria-hidden="true"><i /></span> : <span>{bit ? selected.iconOne : selected.iconZero}</span>}
            <b>{bit}</b><small>{medium === 'disc' ? (bit ? '高さが変わる' : `${discStates[index] === 'land' ? 'ランド' : 'ピット'}が続く`) : (bit ? selected.one : selected.zero)}</small>
          </button>)}
        </div>
        {medium === 'disc' && <div className="disc-legend"><span><i className="land" />ランド：平らな面</span><span><i className="pit" />ピット：へこんだ部分</span><strong>高さが変わる位置を1として読み取る</strong></div>}
        <p className="action-hint">各マスをクリックすると、0と1が切り替わります。</p>
        <div className="concept-strip"><div><b>表し方</b><span>電圧・磁気・光の変化</span></div><i aria-hidden="true">→</i><div><b>意味</b><span>0 または 1</span></div><i aria-hidden="true">→</i><div><b>数の表現</b><span><mark>2進法</mark>・<mark>2進数</mark></span></div></div>
        <div className="print-callout"><span className="print-number"><small>プリント</small><b>3</b></span><strong>2進法</strong><em>0と1の組合せで数を表す方法</em><span className="print-number"><small>プリント</small><b>4</b></span><strong>2進数</strong><em>2進法で表した数値</em></div>
      </div>
    </section>
  );
}

