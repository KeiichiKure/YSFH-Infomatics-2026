'use client';

import { useState, type CSSProperties } from 'react';
import { calculateJumpRate, contrastRatio, jumpRateLabel } from './designModels';
import { PrintBadge, SectionHeading } from './LessonParts';

const headlineSizes = [36, 54, 72] as const;
const palettes = [
  { id: 'teal', label: '青緑', accent: '#2f7c7a', ink: '#203553', paper: '#fffdf6' },
  { id: 'coral', label: 'コーラル', accent: '#c9563c', ink: '#203553', paper: '#fffaf2' },
  { id: 'navy', label: '濃紺', accent: '#203553', ink: '#203553', paper: '#ffffff' },
] as const;

export function PosterHierarchyLab() {
  const [headlineSize, setHeadlineSize] = useState<(typeof headlineSizes)[number]>(36);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [safeArea, setSafeArea] = useState(true);
  const bodySize = 18;
  const rate = calculateJumpRate(headlineSize, bodySize);
  const palette = palettes[paletteIndex];
  const contrast = contrastRatio(palette.ink, palette.paper);
  const posterStyle = { '--poster-accent': palette.accent, '--poster-ink': palette.ink, '--poster-paper': palette.paper, '--poster-headline': `${headlineSize}px` } as CSSProperties;

  return <section className="design-learning-section" id="hierarchy">
    <SectionHeading number="04" label="色彩計画と視覚階層" title="最初の3秒で、どこへ目が向く？" question="文字の大きさ、色、余白、整列を変え、気づく・理解する・行動するの順を設計しよう。" />
    <div className="design-panel hierarchy-lab">
      <div className="design-panel-heading"><div><p className="design-step-label">VISUAL HIERARCHY LAB</p><h3>A4ポスターのジャンプ率を比べる</h3></div><PrintBadge number="3-3">色彩・ジャンプ率</PrintBadge></div>
      <div className="hierarchy-layout">
        <div className="poster-stage">
          <div className={`a4-poster ${safeArea ? 'show-safe-area' : ''}`} style={posterStyle}>
            <div className="poster-safe-label">端から約5mm</div>
            <div className="poster-inner">
              <span className="poster-kicker">帰る前に</span><h3>3秒<br />チェック</h3><p className="poster-lead">机・ロッカー・床</p>
              <ol><li><b>1</b><span>机のまわり</span></li><li><b>2</b><span>ロッカーの中</span></li><li><b>3</b><span>足元・床</span></li></ol>
              <strong className="poster-action">見たら、出口へ →</strong>
            </div>
          </div>
        </div>
        <div className="hierarchy-controls">
          <fieldset><legend>見出しの大きさ</legend><div className="size-options">{headlineSizes.map((size) => <button key={size} type="button" className={headlineSize === size ? 'is-active' : ''} aria-pressed={headlineSize === size} onClick={() => setHeadlineSize(size)}><b>{size}</b><small>pt</small></button>)}</div></fieldset>
          <div className="jump-result" aria-live="polite"><span>ジャンプ率</span><strong>{headlineSize} ÷ {bodySize} = {rate.toFixed(1)}</strong><p>{jumpRateLabel(rate)}</p></div>
          <fieldset><legend>アクセントカラー</legend><div className="palette-options">{palettes.map((item, index) => <button key={item.id} type="button" className={paletteIndex === index ? 'is-active' : ''} aria-pressed={paletteIndex === index} onClick={() => setPaletteIndex(index)}><i style={{ background: item.accent }} />{item.label}</button>)}</div></fieldset>
          <label className="safe-toggle"><input type="checkbox" checked={safeArea} onChange={(event) => setSafeArea(event.target.checked)} /><span>約5mmの印刷安全領域を表示する</span></label>
          <div className="contrast-result"><span>本文色と背景色の参考コントラスト</span><b>{contrast.toFixed(2)} : 1</b><small>画面上の参考値です。印刷時の見え方を保証する値ではありません。</small></div>
        </div>
      </div>
      <div className="gaze-order"><span>視線の順序</span><b>1　気づく</b><i>→</i><b>2　内容を理解</b><i>→</i><b>3　行動する</b></div>
      <div className="jump-examples"><article><span>2.0</span><b>36 ÷ 18</b><p>落ち着くが、遠くからは優先順位が弱い。</p></article><article><span>3.0</span><b>54 ÷ 18</b><p>見出しと本文の差が明確。</p></article><article><span>4.0</span><b>72 ÷ 18</b><p>強い注意喚起。要素を増やしすぎない。</p></article></div>
    </div>
    <aside className="design-caution"><b>ジャンプ率だけで正解は決まりません</b><p>掲示距離、文字量、最重要情報、余白との組み合わせで判断します。大きな文字を増やしすぎると、すべてが同じ強さになって視線の入口が失われます。</p></aside>
  </section>;
}

