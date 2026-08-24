'use client';

import { useState } from 'react';

const weights = [128, 64, 32, 16, 8, 4, 2, 1];

export function BinaryLab() {
  const [bits, setBits] = useState([1, 1, 0, 0, 1, 1, 1, 0]);
  const [bitCount, setBitCount] = useState(4);
  const decimal = parseInt(bits.join(''), 2);
  const upperBits = bits.slice(0, 4).join('');
  const lowerBits = bits.slice(4).join('');
  const upperHex = parseInt(upperBits, 2).toString(16).toUpperCase();
  const lowerHex = parseInt(lowerBits, 2).toString(16).toUpperCase();
  const toggle = (index: number) => setBits((current) => current.map((bit, i) => i === index ? 1 - bit : bit));

  return (
    <section className="learning-section" id="bits">
      <div className="section-kicker"><span>03</span><p>情報量とその単位 · 教科書 pp.54–55</p></div>
      <div className="section-title-row"><div><p className="step-label">組み合わせる</p><h2>8個のスイッチで数をつくろう</h2></div><p className="section-question">1の箱だけを足すと、なぜ10進数になるのだろう。</p></div>
      <div className="lab-panel bit-lab">
        <div className="bit-place-values" aria-hidden="true">
          {weights.map((weight) => <span key={weight}>{weight}</span>)}
        </div>
        <div className="bit-switches" aria-label="8ビットスイッチ">
          {bits.map((bit, index) => (
            <button type="button" key={index} className={bit ? 'on' : ''} aria-pressed={Boolean(bit)} aria-label={`${weights[index]}の位、現在${bit}`} onClick={() => toggle(index)}>
              <b>{bit}</b><small>2<sup>{7 - index}</sup></small>
            </button>
          ))}
        </div>

        <div className="weighted-sum" aria-label={`重みを足すと${decimal}`}>
          {bits.map((bit, index) => (
            <span key={weights[index]} className={bit ? 'active' : 'inactive'}>
              <b>{bit ? weights[index] : 0}</b><small>{bit ? `${weights[index]}を足す` : `${weights[index]}は足さない`}</small>
              {index < bits.length - 1 && <i aria-hidden="true">＋</i>}
            </span>
          ))}
          <strong><i aria-hidden="true">＝</i>{decimal}<small>10進数</small></strong>
        </div>

        <div className="number-readout">
          <div><span>2進数</span><strong>{bits.join('')}</strong></div>
          <div><span>10進数</span><strong>{decimal}</strong></div>
          <div><span>16進数</span><strong>{upperHex}{lowerHex}</strong></div>
        </div>

        <div className="hex-bridge">
          <div><span>上位4ビット</span><b>{upperBits}<sub>2</sub></b><i>→</i><strong>{upperHex}<sub>16</sub></strong></div>
          <div><span>下位4ビット</span><b>{lowerBits}<sub>2</sub></b><i>→</i><strong>{lowerHex}<sub>16</sub></strong></div>
          <p><span>{upperHex}</span><span>{lowerHex}</span><i>＝</i><strong>{upperHex}{lowerHex}<sub>16</sub></strong></p>
        </div>

        <div className="byte-equation"><span className="bracket" aria-hidden="true" /><b>8個のビット</b><i>=</i><b>1バイト</b></div>
        <div className="print-callout print-callout-four">
          <span>プリント ⑤</span><strong>ビット</strong><em>情報量の最小単位</em>
          <span>プリント ⑥</span><strong>8ビット</strong><em>8個まとめる</em>
          <span>プリント ⑦</span><strong>1バイト</strong><em>8ビットのまとまり</em>
        </div>
      </div>

      <div className="pattern-lab">
        <div><p className="step-label">動かして予想</p><h3>nビットで表せる数を確かめよう</h3></div>
        <label className="wide-control"><span><b>ビット数 n</b><output>{bitCount}ビット</output></span><input aria-label="ビット数" type="range" min="1" max="12" value={bitCount} onChange={(event) => setBitCount(Number(event.target.value))} /></label>
        <div className="pattern-result"><span>2<sup>{bitCount}</sup></span><i>=</i><strong>{2 ** bitCount}<small>通り</small></strong><p>0 ～ {2 ** bitCount - 1} を表せる</p></div>
      </div>

      <details className="learn-more">
        <summary>発展：KBとkBは同じではない？</summary>
        <div className="unit-scale"><div><b>プリントで扱う慣習</b><span>2<sup>10</sup> = <mark>1024</mark>倍ごとに KB・MB・GB</span></div><div><b>現在の明確な表記</b><span>1 kB = 1000 B ／ 1 KiB = 1024 B</span></div><div><b>通信速度</b><span>1 kbps = 1000 bps</span></div></div>
      </details>
    </section>
  );
}

