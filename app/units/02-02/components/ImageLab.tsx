'use client';

import { useMemo, useState } from 'react';

const rasterPattern = Array.from({ length: 64 }, (_, index) => {
  const x = index % 8;
  const y = Math.floor(index / 8);
  return Math.abs(x - y) <= 1 || (x > 4 && y < 3);
});

export function ImageLab() {
  const [zoom, setZoom] = useState(4);
  const [red, setRed] = useState(255);
  const [green, setGreen] = useState(170);
  const [blue, setBlue] = useState(80);
  const [density, setDensity] = useState(8);
  const [gradationBits, setGradationBits] = useState(3);
  const pixels = useMemo(() => Array.from({ length: density * density }, (_, index) => {
    const x = index % density;
    const y = Math.floor(index / density);
    const line = Math.abs(x - y) <= Math.max(0, Math.floor(density / 10));
    const cross = x > density * 0.58 && y < density * 0.35;
    return line || cross;
  }), [density]);
  const gradations = 2 ** gradationBits;

  return (
    <section className="learning-section" id="images">
      <div className="section-kicker"><span>02</span><p>画像のデジタル化 · 教科書 pp.58–59</p></div>
      <div className="section-title-row">
        <div><p className="step-label">点と色を比べる</p><h2>画像を拡大すると何が見える？</h2></div>
        <p className="section-question">画像形式、光の三原色、解像度、階調を別々に動かして確かめよう。</p>
      </div>

      <div className="image-format-lab">
        <div className="lab-heading"><div><p className="step-label">ZOOM</p><h3>ラスタ形式とベクタ形式</h3></div><label><span>拡大率 {zoom}倍</span><input type="range" min="1" max="8" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label></div>
        <div className="format-compare">
          <div><span>ラスタ形式</span><div className="raster-frame" style={{ width: `${128 + zoom * 12}px` }}>{rasterPattern.map((active, index) => <i key={index} className={active ? 'active' : ''} />)}</div><b>画素も一緒に大きくなる</b><small>写真向き · bmp / jpg / gif / png</small></div>
          <div><span>ベクタ形式</span><div className="vector-frame" style={{ transform: `scale(${0.72 + zoom * 0.035})` }}><i /><b>V</b></div><b>倍率に合わせて描き直す</b><small>ロゴ・図形向き · svg / dxf</small></div>
        </div>
        <div className="print-callout"><span className="print-number"><small>プリント</small><b>11</b></span><strong>画素（ピクセル）</strong><em>ラスタ画像をつくる点</em></div>
      </div>

      <div className="rgb-lab">
        <div className="lab-heading"><div><p className="step-label">COLOR MIXER</p><h3>光の三原色を混ぜる</h3></div><span className="print-badge"><small>プリント</small><b>12・13</b></span></div>
        <div className="rgb-stage">
          <div className="rgb-circles" aria-label="赤、緑、青の光を重ねる模式図"><i className="red" /><i className="green" /><i className="blue" /><strong style={{ color: `rgb(${red},${green},${blue})` }}>●</strong></div>
          <div className="rgb-controls">
            <label className="red"><span>R 赤 <output>{red}</output></span><input type="range" min="0" max="255" value={red} onChange={(event) => setRed(Number(event.target.value))} /></label>
            <label className="green"><span>G 緑 <output>{green}</output></span><input type="range" min="0" max="255" value={green} onChange={(event) => setGreen(Number(event.target.value))} /></label>
            <label className="blue"><span>B 青 <output>{blue}</output></span><input type="range" min="0" max="255" value={blue} onChange={(event) => setBlue(Number(event.target.value))} /></label>
            <div className="mixed-color" style={{ background: `rgb(${red},${green},${blue})` }}><span>混ぜた光</span><code>rgb({red}, {green}, {blue})</code></div>
          </div>
        </div>
        <p className="data-tradeoff">光は混ぜるほど明るくなり、白へ近づきます。これが<strong>加法混色</strong>です。</p>
      </div>

      <div className="resolution-lab">
        <div className="lab-heading"><div><p className="step-label">PIXEL &amp; GRADATION</p><h3>細かさと色の段階を変える</h3></div><span className="print-badge"><small>プリント</small><b>14～17</b></span></div>
        <div className="resolution-controls">
          <label><span>一辺の画素数 <output>{density}画素</output></span><input type="range" min="4" max="16" value={density} onChange={(event) => setDensity(Number(event.target.value))} /></label>
          <label><span>1色の量子化ビット数 <output>{gradationBits} bit</output></span><input type="range" min="1" max="8" value={gradationBits} onChange={(event) => setGradationBits(Number(event.target.value))} /></label>
        </div>
        <div className="resolution-stage">
          <div><div className="pixel-art" style={{ gridTemplateColumns: `repeat(${density}, 1fr)` }}>{pixels.map((active, index) => <i key={index} className={active ? 'active' : ''} />)}</div><b>{density} × {density} ＝ {density * density}画素</b></div>
          <div><div className="gradation-strip">{Array.from({ length: Math.min(gradations, 16) }, (_, index) => <i key={index} style={{ background: `rgb(${Math.round(index / (Math.min(gradations, 16) - 1 || 1) * 255)},${Math.round(index / (Math.min(gradations, 16) - 1 || 1) * 255)},${Math.round(index / (Math.min(gradations, 16) - 1 || 1) * 255)})` }} />)}</div><b>{gradationBits} bit ＝ {gradations}階調</b><small>RGB各8 bitなら24ビットフルカラー</small></div>
        </div>
      </div>
    </section>
  );
}
