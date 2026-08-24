'use client';

import { useEffect, useRef, useState } from 'react';

function binary(value: number, bits: number) {
  return value.toString(2).padStart(bits, '0');
}

export function SamplingLab() {
  const [waveFrequency, setWaveFrequency] = useState(3);
  const [samplingFrequency, setSamplingFrequency] = useState(8);
  const [quantizationBits, setQuantizationBits] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levels = 2 ** quantizationBits;
  const theoremPassed = samplingFrequency > waveFrequency * 2;

  const samples = Array.from({ length: samplingFrequency + 1 }, (_, index) => {
    const time = index / samplingFrequency;
    const amplitude = Math.sin(time * waveFrequency * Math.PI * 2);
    const level = Math.max(0, Math.min(levels - 1, Math.round(((amplitude + 1) / 2) * (levels - 1))));
    return { time, amplitude, level };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = 300;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const context = canvas.getContext('2d');
      if (!context) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      const left = 42;
      const right = width - 18;
      const top = 22;
      const bottom = height - 36;
      const center = (top + bottom) / 2;
      const amplitudeHeight = (bottom - top) / 2 - 8;

      context.strokeStyle = '#d8e3df';
      context.lineWidth = 1;
      for (let level = 0; level < levels; level += 1) {
        const y = bottom - (level / (levels - 1)) * (bottom - top);
        context.beginPath();
        context.moveTo(left, y);
        context.lineTo(right, y);
        context.stroke();
      }
      context.strokeStyle = '#aab8b5';
      context.beginPath();
      context.moveTo(left, center);
      context.lineTo(right, center);
      context.stroke();

      context.strokeStyle = '#e88466';
      context.lineWidth = 3;
      context.beginPath();
      for (let pixel = 0; pixel <= right - left; pixel += 2) {
        const time = pixel / (right - left);
        const y = center - Math.sin(time * waveFrequency * Math.PI * 2) * amplitudeHeight;
        if (pixel === 0) context.moveTo(left + pixel, y);
        else context.lineTo(left + pixel, y);
      }
      context.stroke();

      context.strokeStyle = '#2f7c7a';
      context.lineWidth = 2;
      samples.forEach((sample, index) => {
        const x = left + sample.time * (right - left);
        const sampledY = center - sample.amplitude * amplitudeHeight;
        const quantizedY = bottom - (sample.level / (levels - 1)) * (bottom - top);
        context.strokeStyle = 'rgba(47,124,122,.38)';
        context.beginPath();
        context.moveTo(x, bottom);
        context.lineTo(x, sampledY);
        context.stroke();
        context.fillStyle = '#e88466';
        context.beginPath();
        context.arc(x, sampledY, 4, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#2f7c7a';
        context.fillRect(x - 4, quantizedY - 4, 8, 8);
        if (index < samples.length - 1) {
          const next = samples[index + 1];
          const nextX = left + next.time * (right - left);
          context.strokeStyle = '#2f7c7a';
          context.beginPath();
          context.moveTo(x, quantizedY);
          context.lineTo(nextX, quantizedY);
          context.lineTo(nextX, bottom - (next.level / (levels - 1)) * (bottom - top));
          context.stroke();
        }
      });

      context.fillStyle = '#586a7d';
      context.font = '12px "BIZ UDPGothic", sans-serif';
      context.fillText('振幅', 4, 20);
      context.fillText('1秒', right - 18, height - 10);
      context.fillStyle = '#e88466';
      context.fillText('元の波', left, height - 10);
      context.fillStyle = '#2f7c7a';
      context.fillText('量子化後', left + 62, height - 10);
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [levels, samples, waveFrequency]);

  return (
    <section className="learning-section" id="sampling">
      <div className="section-kicker"><span>01</span><p>標本化・量子化・符号化 · 教科書 p.57</p></div>
      <div className="section-title-row">
        <div><p className="step-label">波をデータにする</p><h2>どこで「デジタル」になる？</h2></div>
        <p className="section-question">赤い波から点を取り出し、段階値へそろえ、0と1へ変える流れを追おう。</p>
      </div>
      <div className="digit-lab-panel">
        <canvas ref={canvasRef} className="digit-wave-canvas" aria-label={`周波数${waveFrequency}Hzの波を毎秒${samplingFrequency}回標本化し、${quantizationBits}ビットで量子化したグラフ`} />
        <div className="digit-controls">
          <label><span>元の波の周波数 <output>{waveFrequency} Hz</output></span><input type="range" min="1" max="6" value={waveFrequency} onChange={(event) => setWaveFrequency(Number(event.target.value))} /></label>
          <label><span>標本化周波数 <output>{samplingFrequency} Hz</output></span><input type="range" min="4" max="24" value={samplingFrequency} onChange={(event) => setSamplingFrequency(Number(event.target.value))} /></label>
          <label><span>量子化ビット数 <output>{quantizationBits} bit</output></span><input type="range" min="2" max="5" value={quantizationBits} onChange={(event) => setQuantizationBits(Number(event.target.value))} /></label>
        </div>
        <div className="three-step-flow" aria-label="デジタル化の3段階">
          <div><span>1</span><b>標本化</b><small>{samplingFrequency}個／秒の標本点</small></div><i aria-hidden="true">→</i>
          <div><span>2</span><b>量子化</b><small>{levels}段階にそろえる</small></div><i aria-hidden="true">→</i>
          <div><span>3</span><b>符号化</b><small>{quantizationBits}桁の2進数へ</small></div>
        </div>
        <div className="sample-code-row" aria-label="量子化した値と2進数">
          {samples.slice(0, 8).map((sample, index) => <div key={`${sample.time}-${index}`}><span>標本{index + 1}</span><b>{sample.level}</b><code>{binary(sample.level, quantizationBits)}</code></div>)}
        </div>
        <div className={`theorem-status ${theoremPassed ? 'passed' : 'warning'}`} role="status">
          <span aria-hidden="true">{theoremPassed ? '✓' : '!'}</span>
          <div><b>標本化定理：{theoremPassed ? '条件を満たしています' : '条件を満たしていません'}</b><p>元の波が{waveFrequency} Hzなら、標本化周波数は{waveFrequency * 2} Hzより大きくする。現在は{samplingFrequency} Hzです。</p></div>
        </div>
        <p className="data-tradeoff">1秒分の値だけで <strong>{samplingFrequency * quantizationBits} bit</strong>。標本化周波数や量子化ビット数を増やすと再現性は上がりますが、データ量も増えます。</p>
        <div className="print-callout print-callout-four"><span className="print-number"><small>プリント</small><b>1・2</b></span><strong>波・振幅</strong><em>連続するアナログ量</em><span className="print-number"><small>プリント</small><b>3～6</b></span><strong>標本化・量子化</strong><em>標本点、ビット数、誤差</em><span className="print-number"><small>プリント</small><b>7・8</b></span><strong>周波数・周期</strong><em>1秒間の波の数と1個分の時間</em><span className="print-number"><small>プリント</small><b>9・10</b></span><strong>標本化定理</strong><em>元の周波数の2倍より大きく</em></div>
      </div>
    </section>
  );
}
