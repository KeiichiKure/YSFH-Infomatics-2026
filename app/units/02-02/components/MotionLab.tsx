'use client';

import { useState } from 'react';

export function MotionLab() {
  const [frameRate, setFrameRate] = useState(12);
  const [perspective, setPerspective] = useState(true);
  const [occlusion, setOcclusion] = useState(true);
  const [shading, setShading] = useState(true);
  const [parallax, setParallax] = useState(18);

  return (
    <section className="learning-section" id="motion">
      <div className="section-kicker"><span>03</span><p>動画と立体の表現 · 教科書 p.60</p></div>
      <div className="section-title-row"><div><p className="step-label">時間と奥行きをつくる</p><h2>静止画は、どう動いて見える？</h2></div><p className="section-question">1秒あたりの枚数と、立体に見せる手がかりを変えてみよう。</p></div>
      <div className="motion-lab-panel">
        <div className="lab-heading"><div><p className="step-label">FRAME RATE</p><h3>フレームを速くめくる</h3></div><span className="print-badge"><small>プリント</small><b>18・19</b></span></div>
        <label className="frame-control"><span>フレームレート <output>{frameRate} fps</output></span><input type="range" min="2" max="60" value={frameRate} onChange={(event) => setFrameRate(Number(event.target.value))} /></label>
        <div className="motion-track" aria-label={`${frameRate}fpsの動きの模式表示`}><div className="motion-runner" style={{ animationTimingFunction: `steps(${frameRate})` }}><i /><b>→</b></div></div>
        <div className="frame-explainer"><div><b>1フレーム</b><span>動画を構成する1枚の静止画</span></div><i aria-hidden="true">×</i><div><b>{frameRate} fps</b><span>1秒間に{frameRate}枚を再生</span></div><i aria-hidden="true">＝</i><div><b>5分で {frameRate * 300}枚</b><span>枚数が増えるほど滑らか</span></div></div>
      </div>

      <div className="depth-lab">
        <div className="lab-heading"><div><p className="step-label">3D CUES</p><h3>平面に奥行きをつくる</h3></div><span className="print-badge"><small>プリント</small><b>20・21</b></span></div>
        <div className="depth-layout">
          <div className={`depth-stage ${perspective ? 'has-perspective' : ''} ${occlusion ? 'has-occlusion' : ''} ${shading ? 'has-shading' : ''}`} aria-label="3DCGの奥行き表現の模式図"><i className="depth-object one" /><i className="depth-object two" /><i className="depth-object three" /><span>遠く</span><b>近く</b></div>
          <div className="depth-controls">
            <label><input type="checkbox" checked={perspective} onChange={(event) => setPerspective(event.target.checked)} /><span><b>遠近法</b>遠い物を小さくする</span></label>
            <label><input type="checkbox" checked={occlusion} onChange={(event) => setOcclusion(event.target.checked)} /><span><b>重なり</b>手前の物で奥を隠す</span></label>
            <label><input type="checkbox" checked={shading} onChange={(event) => setShading(event.target.checked)} /><span><b>陰影</b>光と反対側を暗くする</span></label>
          </div>
        </div>
        <div className="parallax-lab">
          <label><span>左右の目に見せる画像のずれ <output>{parallax}</output></span><input type="range" min="0" max="36" value={parallax} onChange={(event) => setParallax(Number(event.target.value))} /></label>
          <div className="eye-pair"><div><span>左目</span><i style={{ transform: `translateX(${parallax / 2}px)` }} /></div><div><span>右目</span><i style={{ transform: `translateX(${-parallax / 2}px)` }} /></div><strong>{parallax === 0 ? '同じ像：平面的' : '視差がある：立体感'}</strong></div>
        </div>
        <div className="reality-cards"><div><span>VR</span><b>仮想現実</b><small>視界全体をCGで覆う</small></div><div><span>AR</span><b>拡張現実</b><small>現実の画像にCGを付加</small></div><div><span>MR</span><b>複合現実</b><small>現実の視界にCGを融合</small></div></div>
      </div>
    </section>
  );
}
