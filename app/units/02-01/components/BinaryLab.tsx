'use client';

import { useState } from 'react';

const weights = [128, 64, 32, 16, 8, 4, 2, 1];

export function BinaryLab() {
  const [bits, setBits] = useState([0, 1, 1, 1, 1, 0, 0, 0]);
  const [bitCount, setBitCount] = useState(4);
  const decimal = parseInt(bits.join(''), 2);
  const upperBits = bits.slice(0, 4).join('');
  const lowerBits = bits.slice(4).join('');
  const upperDecimal = parseInt(upperBits, 2);
  const lowerDecimal = parseInt(lowerBits, 2);
  const upperHex = parseInt(upperBits, 2).toString(16).toUpperCase();
  const lowerHex = parseInt(lowerBits, 2).toString(16).toUpperCase();
  const toggle = (index: number) => setBits((current) => current.map((bit, i) => i === index ? 1 - bit : bit));

  return (
    <section className="learning-section" id="bits">
      <div className="section-kicker"><span>03</span><p>情報量とその単位 · 教科書 pp.54–55</p></div>
      <div className="section-title-row"><div><p className="step-label">組み合わせる</p><h2>8個のスイッチで数をつくろう</h2></div><p className="section-question">1の箱だけを足すと、なぜ10進数になるのだろう。</p></div>
      <div className="lab-panel bit-lab">
        <div className="bit-calculation-scroll">
          <div className="bit-calculation" aria-label={`8ビットを位の重みで計算すると10進数${decimal}`}>
            <div className="bit-aligned-grid bit-place-values" aria-hidden="true">
              {weights.map((weight) => <span key={weight}>{weight}<small>の位</small></span>)}
            </div>
            <div className="bit-aligned-grid bit-switches" aria-label="8ビットスイッチ">
              {bits.map((bit, index) => (
                <button type="button" key={index} className={bit ? 'on' : ''} aria-pressed={Boolean(bit)} aria-label={`${weights[index]}の位、現在${bit}`} onClick={() => toggle(index)}>
                  <b>{bit}</b><small>2<sup>{7 - index}</sup></small>
                </button>
              ))}
            </div>
            <div className="bit-aligned-grid bit-multiplication-row" aria-label="各ビットと位の重みの掛け算">
              {bits.map((bit, index) => <span key={weights[index]}><small>{bit}×{weights[index]}</small><b>{bit ? weights[index] : 0}</b></span>)}
            </div>
            <div className="bit-aligned-grid bit-addition-row" aria-hidden="true">
              {bits.map((bit, index) => <span key={weights[index]} className={bit ? 'active' : 'inactive'}>{bit ? weights[index] : 0}{index < 7 && <i>＋</i>}</span>)}
            </div>
          </div>
          <div className="bit-total"><i aria-hidden="true">＝</i><strong>{decimal}</strong><span>10進数</span></div>
        </div>

        <div className="nibble-explanation">
          <div className="nibble-position-row" aria-hidden="true"><span>上位4ビット</span><span>下位4ビット</span></div>
          <div className="bit-aligned-grid nibble-bit-row">
            {bits.map((bit, index) => <span key={index} className={index < 4 ? 'upper' : 'lower'}>{bit}</span>)}
          </div>
          <div className="nibble-conversion-row">
            <div><b>{upperBits}<sub>2</sub></b><i>＝</i><strong>{upperDecimal}<sub>10</sub></strong><i>＝</i><em>{upperHex}<sub>16</sub></em></div>
            <div><b>{lowerBits}<sub>2</sub></b><i>＝</i><strong>{lowerDecimal}<sub>10</sub></strong><i>＝</i><em>{lowerHex}<sub>16</sub></em></div>
            <p><span>{upperHex}</span><span>{lowerHex}</span><i>を並べると</i><strong>{upperHex}{lowerHex}<sub>16</sub></strong></p>
          </div>
        </div>

        <div className="number-readout number-readout-summary">
          <div><span>だから 2進数</span><strong>{bits.join('')}<sub>2</sub></strong></div>
          <div><span>10進数では</span><strong>{decimal}<sub>10</sub></strong></div>
          <div><span>16進数では</span><strong>{upperHex}{lowerHex}<sub>16</sub></strong></div>
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

