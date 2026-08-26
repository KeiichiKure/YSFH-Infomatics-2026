'use client';

import { useState } from 'react';

const originalBlocks = ['A', 'A', 'A', 'B', 'B', 'C', 'C', 'C', 'C', 'D', 'D', 'E'];
const lossyOriginalBlocks = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3'];
const lossyExpandedBlocks = ['A2', 'A2', 'A2', 'B2', 'B2', 'B2', 'C2', 'C2', 'C2', 'D2', 'D2', 'D2'];

export function CompressionBasicsLab() {
  const [mode, setMode] = useState<'lossless' | 'lossy'>('lossless');
  const [originalSize, setOriginalSize] = useState(100);
  const [compressedSize, setCompressedSize] = useState(60);
  const rate = Math.round((compressedSize / Math.max(1, originalSize)) * 1000) / 10;
  const saved = Math.max(0, originalSize - compressedSize);
  const displayOriginal = mode === 'lossless' ? originalBlocks : lossyOriginalBlocks;

  return (
    <section className="learning-section" id="basics">
      <div className="section-kicker"><span>01</span><p>圧縮・可逆圧縮・非可逆圧縮 · 教科書 p.62</p></div>
      <div className="section-title-row">
        <div><p className="step-label">小さくして、戻してみる</p><h2>何を取り除くと小さくなる？</h2></div>
        <p className="section-question">同じ情報をまとめる場合と、重要度の低い情報も省く場合を比べよう。</p>
      </div>

      <div className="compression-basics-panel">
        <div className="lab-heading">
          <div><p className="step-label">COMPRESS / EXPAND</p><h3>圧縮したデータを伸張する</h3></div>
          <span className="print-badge"><small>プリント</small><b>1〜4</b></span>
        </div>
        <div className="compression-mode" aria-label="圧縮方法を選ぶ">
          <button type="button" className={mode === 'lossless' ? 'is-active' : ''} aria-pressed={mode === 'lossless'} onClick={() => setMode('lossless')}><b>可逆圧縮</b><small>冗長な部分をまとめる</small></button>
          <button type="button" className={mode === 'lossy' ? 'is-active lossy' : 'lossy'} aria-pressed={mode === 'lossy'} onClick={() => setMode('lossy')}><b>非可逆圧縮</b><small>重要度の低い情報も省く</small></button>
        </div>

        <div className="compression-flow">
          <div className="data-canister">
            <span>元のデータ</span>
            <div className="data-blocks">{displayOriginal.map((value, index) => <i key={index}>{value}</i>)}</div>
            <small>{mode === 'lossless' ? '同じ内容を含む12個の記録' : 'A〜Dのグループに、少しずつ違う細部がある'}</small>
          </div>
          <div className="compression-arrow"><b>圧縮</b><i aria-hidden="true">→</i><small>{mode === 'lossless' ? '同じ内容をまとめる' : 'まとめて、一部を省く'}</small></div>
          <div className={'data-canister compressed ' + mode}>
            <span>圧縮後</span>
            <div className="data-blocks">
              {(mode === 'lossless' ? ['3A', '2B', '4C', '2D', 'E'] : ['A2×3', 'B2×3', 'C2×3', 'D2×3']).map((value) => <i key={value}>{value}</i>)}
            </div>
            <small>{mode === 'lossless' ? '回数と内容を記録' : '近い値を代表値へまとめ、個々の細部を省く'}</small>
          </div>
        </div>

        <div className={'expand-result ' + mode} role="status">
          <span>{mode === 'lossless' ? '伸張すると完全に戻る' : '伸張すると、元に近い状態まで戻る'}</span>
          <div>{(mode === 'lossless' ? originalBlocks : lossyExpandedBlocks).map((value, index) => <i className={mode === 'lossy' && value !== lossyOriginalBlocks[index] ? 'is-approximate' : ''} key={index}>{value}</i>)}</div>
          <p>{mode === 'lossless' ? '文書やプログラムなど、1ビットも変わってはいけないデータに向きます。' : 'たとえば A1・A2・A3 を代表値 A2 にまとめます。全体の傾向は残りますが、A1とA3の違いは戻りません。画像や音声など、わずかな違いより小ささを優先できるデータに使われます。'}</p>
        </div>

        <div className="compression-rate-lab">
          <div className="rate-heading">
            <p className="step-label">COMPRESSION RATE</p>
            <h3>圧縮率を計算する</h3>
          </div>
          <div className="rate-formula" aria-label="圧縮率の公式">
            <span>圧縮率（%）＝</span><b>圧縮後のデータ量</b><span>÷</span><b>圧縮前のデータ量</b><span>× 100</span>
          </div>
          <div className="rate-bars" aria-label={`同じ尺度で比較。圧縮前${originalSize}キロバイト、圧縮後${compressedSize}キロバイト`}>
            <label><span>圧縮前</span><input className="before" type="range" min="20" max="200" step="10" value={originalSize} onChange={(event) => { const value = Number(event.target.value); setOriginalSize(value); setCompressedSize((current) => Math.min(current, value)); }} /><output>{originalSize} KB</output></label>
            <label><span>圧縮後</span><input className="after" type="range" min="10" max="200" step="10" value={compressedSize} onChange={(event) => setCompressedSize(Math.min(Number(event.target.value), originalSize))} /><output>{compressedSize} KB</output></label>
            <small>2本とも0〜200 KBの同じ尺度で、どちらも動かせます。圧縮後は圧縮前より右へ進みません。位置が半分なら圧縮率は50%です。</small>
          </div>
          <div className="rate-answer">
            <span className="rate-working">{compressedSize} ÷ {originalSize} × 100 ＝ {rate}</span><strong>圧縮率 {rate}%</strong><small>{saved} KB小さくなった。圧縮率の数値が小さいほど、強く圧縮されています。</small>
          </div>
          <div className="rate-presets" aria-label="教科書の例題">
            <button type="button" onClick={() => { setOriginalSize(100); setCompressedSize(80); }}>A：100 → 80 KB</button>
            <button type="button" onClick={() => { setOriginalSize(100); setCompressedSize(60); }}>B：100 → 60 KB</button>
            <button type="button" onClick={() => { setOriginalSize(100); setCompressedSize(50); }}>半分：100 → 50 KB</button>
          </div>
        </div>

        <div className="print-callout print-callout-four">
          <span className="print-number"><small>プリント</small><b>1</b></span><strong>圧縮</strong><em>情報をできるだけ保ったまま、ファイルサイズを小さくする</em>
          <span className="print-number"><small>プリント</small><b>2</b></span><strong>冗長</strong><em>同じ情報や不要な部分が含まれている状態</em>
          <span className="print-number"><small>プリント</small><b>3・4</b></span><strong>可逆／非可逆</strong><em>伸張後に完全に元へ戻るかどうかが違う</em>
        </div>
      </div>
    </section>
  );
}
