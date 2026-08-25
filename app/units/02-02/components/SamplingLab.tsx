'use client';

import { useEffect, useRef, useState } from 'react';

function binary(value: number, bits: number) {
  return value.toString(2).padStart(bits, '0');
}

function sinc(value: number) {
  if (Math.abs(value) < 0.000001) return 1;
  return Math.sin(Math.PI * value) / (Math.PI * value);
}

function prepareCanvas(canvas: HTMLCanvasElement, height: number) {
  const width = Math.max(320, canvas.getBoundingClientRect().width);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  return { context, width, height };
}

export function SamplingLab() {
  const [waveFrequency, setWaveFrequency] = useState(3);
  const [samplingFrequency, setSamplingFrequency] = useState(8);
  const [quantizationBits, setQuantizationBits] = useState(3);
  const [showAnalog, setShowAnalog] = useState(true);
  const [showDigital, setShowDigital] = useState(true);
  const [theoremSampling, setTheoremSampling] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theoremCanvasRef = useRef<HTMLCanvasElement>(null);
  const levels = 2 ** quantizationBits;
  const theoremPassed = theoremSampling > waveFrequency * 2;

  const sampleCodes = Array.from({ length: 8 }, (_, index) => {
    const time = index / samplingFrequency;
    const amplitude = Math.sin(time * waveFrequency * Math.PI * 2);
    const level = Math.max(0, Math.min(levels - 1, Math.round(((amplitude + 1) / 2) * (levels - 1))));
    return { time, level };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const prepared = prepareCanvas(canvas, 310);
      if (!prepared) return;
      const { context, width, height } = prepared;
      const left = 42;
      const right = width - 18;
      const top = 22;
      const bottom = height - 40;
      const center = (top + bottom) / 2;
      const amplitudeHeight = (bottom - top) / 2 - 8;
      const visibleGridLines = Math.min(levels, 17);

      context.strokeStyle = '#d8e3df';
      context.lineWidth = 1;
      for (let level = 0; level < visibleGridLines; level += 1) {
        const y = bottom - (level / Math.max(1, visibleGridLines - 1)) * (bottom - top);
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

      if (showAnalog) {
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
      }

      if (showDigital) {
        const visualSamples = Math.min(samplingFrequency, 240);
        const samples = Array.from({ length: visualSamples + 1 }, (_, index) => {
          const time = index / visualSamples;
          const amplitude = Math.sin(time * waveFrequency * Math.PI * 2);
          const level = Math.max(0, Math.min(levels - 1, Math.round(((amplitude + 1) / 2) * (levels - 1))));
          return { time, amplitude, level };
        });
        context.lineWidth = samplingFrequency > 100 ? 2.4 : 2;
        samples.forEach((sample, index) => {
          const x = left + sample.time * (right - left);
          const sampledY = center - sample.amplitude * amplitudeHeight;
          const quantizedY = bottom - (sample.level / Math.max(1, levels - 1)) * (bottom - top);
          if (visualSamples <= 48) {
            context.strokeStyle = 'rgba(47,124,122,.30)';
            context.beginPath();
            context.moveTo(x, bottom);
            context.lineTo(x, sampledY);
            context.stroke();
            context.fillStyle = '#2f7c7a';
            context.beginPath();
            context.arc(x, quantizedY, 3.4, 0, Math.PI * 2);
            context.fill();
          }
          if (index < samples.length - 1) {
            const next = samples[index + 1];
            const nextX = left + next.time * (right - left);
            const nextY = bottom - (next.level / Math.max(1, levels - 1)) * (bottom - top);
            context.strokeStyle = '#2f7c7a';
            context.beginPath();
            context.moveTo(x, quantizedY);
            context.lineTo(nextX, quantizedY);
            context.lineTo(nextX, nextY);
            context.stroke();
          }
        });
      }

      context.font = '12px "BIZ UDPGothic", sans-serif';
      context.fillStyle = '#586a7d';
      context.fillText('振幅', 4, 20);
      context.fillText('1秒', right - 18, height - 10);
      if (showAnalog) {
        context.fillStyle = '#e88466';
        context.fillText('アナログ（元の波）', left, height - 10);
      }
      if (showDigital) {
        context.fillStyle = '#2f7c7a';
        context.fillText('デジタル（量子化後）', left + (showAnalog ? 126 : 0), height - 10);
      }
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [levels, samplingFrequency, showAnalog, showDigital, waveFrequency]);

  useEffect(() => {
    const canvas = theoremCanvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const prepared = prepareCanvas(canvas, 270);
      if (!prepared) return;
      const { context, width, height } = prepared;
      const left = 38;
      const right = width - 18;
      const top = 20;
      const bottom = height - 34;
      const center = (top + bottom) / 2;
      const amplitudeHeight = (bottom - top) / 2 - 10;
      const xFor = (time: number) => left + time * (right - left);
      const yFor = (amplitude: number) => center - amplitude * amplitudeHeight;

      context.strokeStyle = '#d8e3df';
      context.lineWidth = 1;
      for (let line = 0; line <= 4; line += 1) {
        const y = top + (line / 4) * (bottom - top);
        context.beginPath();
        context.moveTo(left, y);
        context.lineTo(right, y);
        context.stroke();
      }

      context.strokeStyle = '#e88466';
      context.lineWidth = 4;
      context.beginPath();
      for (let pixel = 0; pixel <= right - left; pixel += 2) {
        const time = pixel / (right - left);
        const y = yFor(Math.sin(time * waveFrequency * Math.PI * 2));
        if (pixel === 0) context.moveTo(left + pixel, y);
        else context.lineTo(left + pixel, y);
      }
      context.stroke();

      context.strokeStyle = '#2f7c7a';
      context.lineWidth = 2.5;
      context.beginPath();
      for (let pixel = 0; pixel <= right - left; pixel += 2) {
        const time = pixel / (right - left);
        let reconstructed = 0;
        for (let n = -theoremSampling; n <= theoremSampling * 2; n += 1) {
          const sampleTime = n / theoremSampling;
          const sample = Math.sin(sampleTime * waveFrequency * Math.PI * 2);
          reconstructed += sample * sinc(theoremSampling * time - n);
        }
        const y = yFor(Math.max(-1.15, Math.min(1.15, reconstructed)));
        if (pixel === 0) context.moveTo(left + pixel, y);
        else context.lineTo(left + pixel, y);
      }
      context.stroke();

      context.fillStyle = '#203553';
      for (let index = 0; index <= theoremSampling; index += 1) {
        const time = index / theoremSampling;
        context.beginPath();
        context.arc(xFor(time), yFor(Math.sin(time * waveFrequency * Math.PI * 2)), 3.5, 0, Math.PI * 2);
        context.fill();
      }
      context.font = '11px "BIZ UDPGothic", sans-serif';
      context.fillStyle = '#e88466';
      context.fillText('元の波', left, height - 9);
      context.fillStyle = '#2f7c7a';
      context.fillText('標本点から復元した波', left + 62, height - 9);
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [theoremSampling, waveFrequency]);

  return (
    <section className="learning-section" id="sampling">
      <div className="section-kicker"><span>01</span><p>標本化・量子化・符号化 · 教科書 p.57</p></div>
      <div className="section-title-row">
        <div><p className="step-label">波をデータにする</p><h2>どこで「デジタル」になる？</h2></div>
        <p className="section-question">表示を切り替え、点を増やすほどデジタルの波が元の波へ近づく様子を確かめよう。</p>
      </div>
      <div className="digit-lab-panel">
        <div className="wave-display-toolbar" aria-label="グラフに表示する波">
          <span>表示する波</span>
          <button type="button" className={showAnalog ? 'is-active analog' : 'analog'} aria-pressed={showAnalog} onClick={() => setShowAnalog((value) => !value)}>アナログ</button>
          <button type="button" className={showDigital ? 'is-active digital' : 'digital'} aria-pressed={showDigital} onClick={() => setShowDigital((value) => !value)}>デジタル</button>
        </div>
        <canvas ref={canvasRef} className="digit-wave-canvas" aria-label={(showAnalog ? 'アナログ波と' : '') + (showDigital ? '量子化したデジタル波' : '') + '。元の波' + waveFrequency + 'Hz、標本化周波数' + samplingFrequency + 'Hz、量子化' + quantizationBits + 'ビット'} />
        <div className="digit-controls digit-controls-expanded">
          <div className="range-card">
            <span>元の波の周波数 <output>{waveFrequency} Hz</output></span>
            <input aria-label="元の波の周波数" type="range" min="1" max="20" value={waveFrequency} onChange={(event) => setWaveFrequency(Number(event.target.value))} />
            <div className="preset-row">{[1, 3, 6, 12, 20].map((value) => <button type="button" className={waveFrequency === value ? 'is-active' : ''} key={value} onClick={() => setWaveFrequency(value)}>{value} Hz</button>)}</div>
          </div>
          <div className="range-card">
            <span>標本化周波数 <output>{samplingFrequency.toLocaleString()} Hz</output></span>
            <small>4〜24 Hzは1 Hzずつ細かく動かせます</small>
            <input aria-label="標本化周波数4から24ヘルツ" type="range" min="4" max="24" value={Math.min(samplingFrequency, 24)} onChange={(event) => setSamplingFrequency(Number(event.target.value))} />
            <div className="preset-row">{[48, 240, 2400, 24000].map((value) => <button type="button" className={samplingFrequency === value ? 'is-active' : ''} key={value} onClick={() => setSamplingFrequency(value)}>{value.toLocaleString()} Hz</button>)}</div>
          </div>
          <div className="range-card">
            <span>量子化ビット数 <output>{quantizationBits} bit</output></span>
            <small>1〜8 bitは1 bitずつ、高音質は段階ボタンで</small>
            <input aria-label="量子化ビット数1から8ビット" type="range" min="1" max="8" value={Math.min(quantizationBits, 8)} onChange={(event) => setQuantizationBits(Number(event.target.value))} />
            <div className="preset-row">{[12, 16, 24].map((value) => <button type="button" className={quantizationBits === value ? 'is-active' : ''} key={value} onClick={() => setQuantizationBits(value)}>{value} bit</button>)}</div>
          </div>
        </div>
        <div className="three-step-flow" aria-label="デジタル化の3段階">
          <div><span>1</span><b>標本化</b><small>{samplingFrequency.toLocaleString()}個／秒の標本点</small></div><i aria-hidden="true">→</i>
          <div><span>2</span><b>量子化</b><small>{levels.toLocaleString()}段階にそろえる</small></div><i aria-hidden="true">→</i>
          <div><span>3</span><b>符号化</b><small>{quantizationBits}桁の2進数へ</small></div>
        </div>
        <div className="sample-code-row" aria-label="量子化した値と2進数">
          {sampleCodes.map((sample, index) => <div key={sample.time + '-' + index}><span>標本{index + 1}</span><b>{sample.level.toLocaleString()}</b><code>{binary(sample.level, quantizationBits)}</code></div>)}
        </div>

        <div className="theorem-lab">
          <div className="lab-heading"><div><p className="step-label">SAMPLING THEOREM</p><h3>標本点から元の波を復元する</h3></div><output>{theoremSampling} Hzで標本化</output></div>
          <p>黒い点だけを手がかりに、コンピュータがつないだ波が緑です。標本点が足りないと、別の波に見えてしまいます。</p>
          <canvas ref={theoremCanvasRef} className="theorem-canvas" aria-label={'標本化定理の実験。' + waveFrequency + 'ヘルツの元の波を' + theoremSampling + 'ヘルツで標本化して復元'} />
          <div className="theorem-presets" aria-label="標本化周波数を選ぶ">{[4, 6, 8, 12, 24].map((value) => <button type="button" className={theoremSampling === value ? 'is-active' : ''} key={value} onClick={() => setTheoremSampling(value)}>{value} Hz</button>)}</div>
          <label className="theorem-slider"><span>細かく試す <output>{theoremSampling} Hz</output></span><input type="range" min="2" max="24" value={theoremSampling} onChange={(event) => setTheoremSampling(Number(event.target.value))} /></label>
          <div className={'theorem-status ' + (theoremPassed ? 'passed' : 'warning')} role="status">
            <span aria-hidden="true">{theoremPassed ? '✓' : '!'}</span>
            <div><b>{theoremPassed ? '条件を満たす：元の形を復元できる' : '標本点が不足：別の波に見えることがある'}</b><p>{waveFrequency} Hzの波には、{waveFrequency * 2} Hzより大きい標本化周波数が必要です。現在は{theoremSampling} Hzです。</p></div>
          </div>
        </div>

        <p className="data-tradeoff">1秒分の値だけで <strong>{(samplingFrequency * quantizationBits).toLocaleString()} bit</strong>。標本化周波数や量子化ビット数を増やすと元の波に近づきますが、データ量も増えます。</p>
        <div className="print-callout print-callout-four"><span className="print-number"><small>プリント</small><b>1・2</b></span><strong>波・振幅</strong><em>連続するアナログ量</em><span className="print-number"><small>プリント</small><b>3～6</b></span><strong>標本化・量子化</strong><em>標本点、ビット数、誤差</em><span className="print-number"><small>プリント</small><b>7・8</b></span><strong>周波数・周期</strong><em>1秒間の波の数と1個分の時間</em><span className="print-number"><small>プリント</small><b>9・10</b></span><strong>標本化定理</strong><em>元の周波数の2倍より大きく</em></div>
      </div>
    </section>
  );
}
