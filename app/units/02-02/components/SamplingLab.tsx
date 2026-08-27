'use client';

import { useEffect, useRef, useState } from 'react';

function binary(value: number, bits: number) {
  return value.toString(2).padStart(bits, '0');
}

const graphHeight = 320;
const graphTop = 22;
const graphBottom = graphHeight - 43;
const graphCenter = (graphTop + graphBottom) / 2;
const graphAmplitudeHeight = (graphBottom - graphTop) / 2 - 9;

function verticalScaleFor(graphZoom: number, waveFrequency: number) {
  return graphZoom === 1 ? 1 : Math.max(1, graphZoom / (waveFrequency * 4));
}

function visibleQuantizationRange(bits: number, waveFrequency: number, graphZoom: number) {
  const levelCount = 2 ** bits;
  const maximumLevel = levelCount - 1;
  const centerAmplitude = Math.sin(0.5 * waveFrequency * Math.PI * 2);
  const verticalScale = verticalScaleFor(graphZoom, waveFrequency);
  const visibleAmplitudeRadius = ((graphCenter - graphTop) / graphAmplitudeHeight) / verticalScale;
  const levelForAmplitude = (amplitude: number) => ((amplitude + 1) / 2) * maximumLevel;
  const rawMinimum = levelForAmplitude(centerAmplitude - visibleAmplitudeRadius);
  const rawMaximum = levelForAmplitude(centerAmplitude + visibleAmplitudeRadius);
  return {
    minimum: Math.max(0, Math.min(maximumLevel, Math.floor(rawMinimum))),
    maximum: Math.max(0, Math.min(maximumLevel, Math.ceil(rawMaximum))),
  };
}

function periodLabel(frequency: number) {
  if (frequency === 1) return '1秒';
  const seconds = 1 / frequency;
  if (seconds >= 0.1) return `1/${frequency.toLocaleString()}秒 ≈ ${seconds.toFixed(3)}秒`;
  if (seconds >= 0.001) return `1/${frequency.toLocaleString()}秒 ≈ ${(seconds * 1000).toFixed(seconds >= 0.01 ? 1 : 2)} ms`;
  return `1/${frequency.toLocaleString()}秒 ≈ ${(seconds * 1_000_000).toFixed(seconds >= 0.0001 ? 0 : 1)} µs`;
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
  const [graphZoom, setGraphZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levels = 2 ** quantizationBits;
  const theoremPassed = samplingFrequency > waveFrequency * 2;
  const focusZoom = Math.max(2, Math.round(samplingFrequency / 6));
  const visibleLevels = visibleQuantizationRange(quantizationBits, waveFrequency, graphZoom);

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
      const prepared = prepareCanvas(canvas, graphHeight);
      if (!prepared) return;
      const { context, width, height } = prepared;
      const left = 42;
      const right = width - 18;
      const top = graphTop;
      const bottom = graphBottom;
      const center = (top + bottom) / 2;
      const amplitudeHeight = (bottom - top) / 2 - 9;
      const duration = 1 / graphZoom;
      const viewCenter = 0.5;
      const viewStart = viewCenter - duration / 2;
      const centerAmplitude = Math.sin(viewCenter * waveFrequency * Math.PI * 2);
      const verticalScale = verticalScaleFor(graphZoom, waveFrequency);
      const plotWidth = right - left;
      const xFor = (time: number) => left + ((time - viewStart) / duration) * plotWidth;
      const yFor = (amplitude: number) => center - (amplitude - centerAmplitude) * amplitudeHeight * verticalScale;
      const amplitudeForLevel = (level: number) => (level / Math.max(1, levels - 1)) * 2 - 1;
      const quantize = (amplitude: number) => {
        const level = Math.max(0, Math.min(levels - 1, Math.round(((amplitude + 1) / 2) * (levels - 1))));
        return amplitudeForLevel(level);
      };

      const visibleAmplitudeRadius = ((center - top) / amplitudeHeight) / verticalScale;
      const firstVisibleLevel = Math.max(0, Math.ceil(((centerAmplitude - visibleAmplitudeRadius + 1) / 2) * (levels - 1)));
      const lastVisibleLevel = Math.min(levels - 1, Math.floor(((centerAmplitude + visibleAmplitudeRadius + 1) / 2) * (levels - 1)));
      const visibleLevelCount = Math.max(0, lastVisibleLevel - firstVisibleLevel + 1);
      const lineStep = Math.max(1, Math.ceil(visibleLevelCount / 12));
      const guideLevels: number[] = [];
      for (let level = firstVisibleLevel; level <= lastVisibleLevel; level += lineStep) guideLevels.push(level);
      if (visibleLevelCount > 0 && guideLevels.at(-1) !== lastVisibleLevel) guideLevels.push(lastVisibleLevel);

      context.strokeStyle = '#d8e3df';
      context.lineWidth = 1;
      for (const level of guideLevels) {
        const y = yFor(amplitudeForLevel(level));
        context.beginPath();
        context.moveTo(left, y);
        context.lineTo(right, y);
        context.stroke();
      }
      context.save();
      context.beginPath();
      context.rect(left, top, plotWidth, bottom - top);
      context.clip();

      if (showAnalog) {
        context.strokeStyle = '#e88466';
        context.lineWidth = 4;
        context.beginPath();
        for (let pixel = 0; pixel <= plotWidth; pixel += 1) {
          const time = viewStart + (pixel / plotWidth) * duration;
          const y = yFor(Math.sin(time * waveFrequency * Math.PI * 2));
          if (pixel === 0) context.moveTo(left + pixel, y);
          else context.lineTo(left + pixel, y);
        }
        context.stroke();
      }

      if (showDigital) {
        const visibleSamples = samplingFrequency * duration;
        context.strokeStyle = '#2f7c7a';
        context.lineWidth = graphZoom === 1 && visibleSamples > 1000 ? 2.2 : 2.6;
        context.beginPath();
        if (visibleSamples <= 1200) {
          const firstSample = Math.floor(viewStart * samplingFrequency) - 1;
          const lastSample = Math.ceil((viewStart + duration) * samplingFrequency) + 1;
          let started = false;
          for (let index = firstSample; index <= lastSample; index += 1) {
            const sampleTime = index / samplingFrequency;
            const nextTime = (index + 1) / samplingFrequency;
            const amplitude = Math.sin(sampleTime * waveFrequency * Math.PI * 2);
            const y = yFor(quantize(amplitude));
            const x1 = xFor(sampleTime);
            const x2 = xFor(nextTime);
            if (!started) {
              context.moveTo(x1, y);
              started = true;
            } else {
              context.lineTo(x1, y);
            }
            context.lineTo(x2, y);
          }
        } else {
          for (let pixel = 0; pixel <= plotWidth; pixel += 1) {
            const time = viewStart + (pixel / plotWidth) * duration;
            const sampleTime = Math.floor(time * samplingFrequency) / samplingFrequency;
            const amplitude = Math.sin(sampleTime * waveFrequency * Math.PI * 2);
            const y = yFor(quantize(amplitude));
            if (pixel === 0) context.moveTo(left + pixel, y);
            else context.lineTo(left + pixel, y);
          }
        }
        context.stroke();

        if (visibleSamples <= 32) {
          context.fillStyle = '#203553';
          const firstSample = Math.ceil(viewStart * samplingFrequency);
          const lastSample = Math.floor((viewStart + duration) * samplingFrequency);
          for (let index = firstSample; index <= lastSample; index += 1) {
            const time = index / samplingFrequency;
            const amplitude = quantize(Math.sin(time * waveFrequency * Math.PI * 2));
            context.beginPath();
            context.arc(xFor(time), yFor(amplitude), 3.3, 0, Math.PI * 2);
            context.fill();
          }
        }
      }
      context.restore();

      context.font = '12px "BIZ UDPGothic", sans-serif';
      context.fillStyle = '#586a7d';
      context.fillText('振幅', 4, 20);
      context.fillText(graphZoom === 1 ? '1秒' : '時間・振幅を拡大', right - (graphZoom === 1 ? 18 : 94), height - 10);
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
  }, [graphZoom, levels, samplingFrequency, showAnalog, showDigital, waveFrequency]);

  return (
    <section className="learning-section" id="sampling">
      <div className="section-kicker"><span>01</span><p>標本化・量子化・符号化 · 教科書 p.57</p></div>
      <div className="section-title-row">
        <div><p className="step-label">波をデータにする</p><h2>どこで「デジタル」になる？</h2></div>
        <p className="section-question">全体では重なって見える高精度な波も、拡大すると標本ごとの段差があることを確かめよう。</p>
      </div>
      <div className="digit-lab-panel">
        <div className="wave-display-toolbar" aria-label="グラフに表示する波">
          <span>表示する波</span>
          <button type="button" className={showAnalog ? 'is-active analog' : 'analog'} aria-pressed={showAnalog} onClick={() => setShowAnalog((value) => !value)}>アナログ</button>
          <button type="button" className={showDigital ? 'is-active digital' : 'digital'} aria-pressed={showDigital} onClick={() => setShowDigital((value) => !value)}>デジタル</button>
        </div>
        <div className="sampling-zoom-toolbar">
          <span>波を拡大して観察 <output>{graphZoom.toLocaleString()}倍</output></span>
          <div>{[1, 10, 100, 1000].map((value) => <button type="button" className={graphZoom === value ? 'is-active' : ''} key={value} onClick={() => setGraphZoom(value)}>{value.toLocaleString()}×</button>)}<button type="button" className={graphZoom === focusZoom ? 'is-active' : ''} onClick={() => setGraphZoom(focusZoom)}>標本6個まで拡大</button></div>
        </div>
        <div className="digit-wave-frame">
          <canvas ref={canvasRef} className="digit-wave-canvas" aria-label={(showAnalog ? 'アナログ波と' : '') + (showDigital ? '量子化したデジタル波' : '') + '。元の波' + waveFrequency + 'Hz、標本化周波数' + samplingFrequency + 'Hz、量子化' + quantizationBits + 'ビット、' + graphZoom + '倍表示。表示範囲の最大値' + visibleLevels.maximum + '、2進数' + binary(visibleLevels.maximum, quantizationBits) + '。最小値' + visibleLevels.minimum + '、2進数' + binary(visibleLevels.minimum, quantizationBits)} />
          <div className="quantization-range-label range-maximum" aria-hidden="true"><small>{graphZoom === 1 ? `${levels.toLocaleString()}段階` : '表示範囲'}</small><strong>最大値 {visibleLevels.maximum.toLocaleString()} <code>（{binary(visibleLevels.maximum, quantizationBits)}）</code></strong></div>
          <div className="quantization-range-label range-minimum" aria-hidden="true"><small>{graphZoom === 1 ? `${quantizationBits} bit` : '表示範囲'}</small><strong>最小値 {visibleLevels.minimum.toLocaleString()} <code>（{binary(visibleLevels.minimum, quantizationBits)}）</code></strong></div>
        </div>
        <div className="digit-controls digit-controls-expanded">
          <div className="range-card">
            <span>元の波の周波数 <output>{waveFrequency} Hz</output></span>
            <small className="period-readout">（元の波の周期：{periodLabel(waveFrequency)}）</small>
            <input aria-label="元の波の周波数" type="range" min="1" max="20" value={waveFrequency} onChange={(event) => { setWaveFrequency(Number(event.target.value)); setGraphZoom(1); }} />
            <div className="preset-row">{[1, 3, 6, 12, 20].map((value) => <button type="button" className={waveFrequency === value ? 'is-active' : ''} key={value} onClick={() => { setWaveFrequency(value); setGraphZoom(1); }}>{value} Hz</button>)}</div>
          </div>
          <div className="range-card">
            <span>標本化周波数 <output>{samplingFrequency.toLocaleString()} Hz</output></span>
            <small className="period-readout">（標本化周期：{periodLabel(samplingFrequency)}）</small>
            <small>4〜24 Hzは1 Hzずつ細かく動かせます</small>
            <input aria-label="標本化周波数4から24ヘルツ" type="range" min="4" max="24" value={Math.min(samplingFrequency, 24)} onChange={(event) => { setSamplingFrequency(Number(event.target.value)); setGraphZoom(1); }} />
            <div className="preset-row">{[48, 240, 2400, 24000].map((value) => <button type="button" className={samplingFrequency === value ? 'is-active' : ''} key={value} onClick={() => { setSamplingFrequency(value); setGraphZoom(1); }}>{value.toLocaleString()} Hz</button>)}</div>
          </div>
          <div className="range-card">
            <span>量子化ビット数 <output>{quantizationBits} bit</output></span>
            <small>1〜8 bitは1 bitずつ、高音質は段階ボタンで</small>
            <input aria-label="量子化ビット数1から8ビット" type="range" min="1" max="8" value={Math.min(quantizationBits, 8)} onChange={(event) => { setQuantizationBits(Number(event.target.value)); setGraphZoom(1); }} />
            <div className="preset-row">{[12, 16, 24].map((value) => <button type="button" className={quantizationBits === value ? 'is-active' : ''} key={value} onClick={() => { setQuantizationBits(value); setGraphZoom(1); }}>{value} bit</button>)}</div>
          </div>
        </div>

        <div className={'theorem-status sampling-theorem-note ' + (theoremPassed ? 'passed' : 'warning')} role="status">
          <span aria-hidden="true">{theoremPassed ? '✓' : '!'}</span>
          <div><b>標本化定理：{theoremPassed ? '元の形をある程度復元できる条件です' : '元の形とは異なる波に見える条件です'}</b><p>元の波は{waveFrequency} Hzなので、標本化周波数は{waveFrequency * 2} Hzより大きい値が必要です。現在は{samplingFrequency.toLocaleString()} Hzで、{theoremPassed ? '2倍より大きくなっています。' : '2倍以下です。'}</p></div>
        </div>

        <div className="three-step-flow" aria-label="デジタル化の3段階">
          <div><span>1</span><b>標本化</b><small>{samplingFrequency.toLocaleString()}個／秒の標本点</small></div><i aria-hidden="true">→</i>
          <div><span>2</span><b>量子化</b><small>{levels.toLocaleString()}段階にそろえる</small></div><i aria-hidden="true">→</i>
          <div><span>3</span><b>符号化</b><small>{quantizationBits}桁の2進数へ</small></div>
        </div>
        <div className={'sample-code-row ' + (quantizationBits >= 16 ? 'high-bit-values' : '')} aria-label="量子化した値と2進数">
          {sampleCodes.map((sample, index) => <div key={sample.time + '-' + index}><span>標本{index + 1}</span><b>{sample.level.toLocaleString()}</b><code>{binary(sample.level, quantizationBits)}</code></div>)}
        </div>
        <p className="data-tradeoff">1秒分の値だけで <strong>{(samplingFrequency * quantizationBits).toLocaleString()} bit</strong>。標本化周波数や量子化ビット数を増やすと元の波に近づきますが、データ量も増えます。</p>
        <div className="print-callout print-callout-four"><span className="print-number"><small>プリント</small><b>1・2</b></span><strong>波・振幅</strong><em>波の大きさが連続して変わるアナログ量</em></div>
        <div className="print-callout print-callout-four">
          <span className="print-number"><small>プリント</small><b>3</b></span><strong>サンプリング（標本化）</strong><em>アナログ量を一定の時間間隔で取り出すこと</em>
          <span className="print-number"><small>プリント</small><b>4</b></span><strong>標本点</strong><em>サンプリングによって取り出した1つ1つの値</em>
          <span className="print-number"><small>プリント</small><b>5</b></span><strong>量子化ビット数</strong><em>1つの標本値を何段階で表すかを決めるビット数</em>
          <span className="print-number"><small>プリント</small><b>6</b></span><strong>量子化誤差</strong><em>元の標本値と、段階にそろえた量子化後の値との差</em>
        </div>
        <div className="print-callout print-callout-four"><span className="print-number"><small>プリント</small><b>7・8</b></span><strong>周波数・周期</strong><em>1秒間の波の数と、波1個分にかかる時間</em><span className="print-number"><small>プリント</small><b>9</b></span><strong>標本化定理</strong><em>元の最高周波数の2倍より大きい周波数で標本化する</em></div>
      </div>
    </section>
  );
}
