'use client';

import { useEffect, useState } from 'react';

export function MotionLab() {
  const [frameRate, setFrameRate] = useState(12);
  const [playing, setPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [perspective, setPerspective] = useState(true);
  const [occlusion, setOcclusion] = useState(true);
  const [shading, setShading] = useState(true);
  const [parallax, setParallax] = useState(18);

  useEffect(() => {
    if (!playing) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const difference = (now - previous) / 1000;
      previous = now;
      setElapsed((value) => value + difference * playbackRate);
    }, 40);
    return () => window.clearInterval(timer);
  }, [playing, playbackRate]);

  const currentFrame = Math.floor(elapsed * frameRate) + 1;
  const steppedTime = Math.floor(elapsed * frameRate) / frameRate;
  const phase = (steppedTime % 2.4) / 2.4;
  const runnerPosition = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
  const depthAmount = Math.round(parallax / 36 * 100);

  return (
    <section className="learning-section" id="motion">
      <div className="section-kicker"><span>03</span><p>動画と立体の表現 · 教科書 p.60</p></div>
      <div className="section-title-row"><div><p className="step-label">時間と奥行きをつくる</p><h2>静止画は、どう動いて見える？</h2></div><p className="section-question">1秒あたりの枚数と、立体に見せる手がかりを変えてみよう。</p></div>
      <div className="motion-lab-panel">
        <div className="lab-heading"><div><p className="step-label">FRAME RATE</p><h3>フレームを速くめくる</h3></div><span className="print-badge"><small>プリント</small><b>18・19</b></span></div>
        <label className="frame-control"><span>フレームレート <output>{frameRate} fps</output></span><input type="range" min="2" max="60" value={frameRate} onChange={(event) => setFrameRate(Number(event.target.value))} /></label>
        <div className="playback-toolbar">
          <button type="button" className={playing ? 'is-active' : ''} onClick={() => setPlaying((value) => !value)}>{playing ? '一時停止' : '再生する'}</button>
          <button type="button" className={playbackRate === 1 ? 'is-active' : ''} onClick={() => setPlaybackRate(1)}>通常 ×1</button>
          <button type="button" className={playbackRate === 0.25 ? 'is-active' : ''} onClick={() => setPlaybackRate(0.25)}>スロー ×0.25</button>
          <button type="button" onClick={() => { setElapsed(0); setPlaying(true); }}>最初から</button>
        </div>
        <div className="motion-clock" aria-live="polite"><div><small>開始から</small><strong>{elapsed.toFixed(2)} 秒</strong></div><div><small>現在のフレーム</small><strong>{currentFrame.toLocaleString()} 枚目</strong></div><div><small>再生速度</small><strong>{playbackRate === 1 ? '通常' : '1/4スロー'}</strong></div></div>
        <div className="motion-track" aria-label={frameRate + 'fpsの動きの模式表示'}><div className="motion-runner" style={{ left: 'calc(' + (2 + runnerPosition * 88) + '%)' }}><i /><b>→</b></div></div>
        <p className="fps-note"><b>表示は動き方のイメージです。</b> 60 fpsを選んでも、端末の画面更新速度やブラウザの負荷により、実際に毎秒60回描画されるとは限りません。</p>
        <div className="frame-explainer"><div><b>1フレーム</b><span>動画を構成する1枚の静止画</span></div><i aria-hidden="true">×</i><div><b>{frameRate} fps</b><span>1秒間に{frameRate}枚を再生</span></div><i aria-hidden="true">＝</i><div><b>5分で {(frameRate * 300).toLocaleString()}枚</b><span>枚数が増えるほど滑らか</span></div></div>
      </div>

      <div className="depth-lab">
        <div className="lab-heading"><div><p className="step-label">3D CUES</p><h3>平面に奥行きをつくる</h3></div><span className="print-badge"><small>プリント</small><b>20・21</b></span></div>
        <div className="depth-layout">
          <div className={'depth-stage ' + (perspective ? 'has-perspective ' : '') + (occlusion ? 'has-occlusion ' : 'no-occlusion ') + (shading ? 'has-shading' : '')} aria-label="3DCGの奥行き表現の模式図">
            <div className="depth-object depth-back"><span>奥</span></div>
            <div className="depth-object depth-middle"><span>中</span></div>
            <div className="depth-object depth-front"><span>手前</span></div>
            <small>{occlusion ? '手前の物が、奥の物の一部を隠す' : '重なりなし：3つとも全体が見える'}</small>
          </div>
          <div className="depth-controls">
            <label><input type="checkbox" checked={perspective} onChange={(event) => setPerspective(event.target.checked)} /><span><b>遠近法</b>遠い物を小さくする</span></label>
            <label><input type="checkbox" checked={occlusion} onChange={(event) => setOcclusion(event.target.checked)} /><span><b>重なり</b>手前の物で奥を隠す</span></label>
            <label><input type="checkbox" checked={shading} onChange={(event) => setShading(event.target.checked)} /><span><b>陰影</b>光と反対側を暗くする</span></label>
          </div>
        </div>
        <div className="parallax-lab">
          <div className="parallax-control">
            <label><span>左右の目に見せる画像のずれ <output>{parallax}</output></span><input type="range" min="0" max="36" value={parallax} onChange={(event) => setParallax(Number(event.target.value))} /></label>
            <p>近い物ほど左右の目に届く像の位置が大きくずれます。脳は2枚の像を1つに重ね、その<strong>ずれの大きさを距離の手がかり</strong>にして奥行きを感じます。</p>
          </div>
          <div className="eye-pair"><div><span>左目の像</span><i style={{ transform: 'translateX(' + parallax / 2 + 'px)' }} /></div><div><span>右目の像</span><i style={{ transform: 'translateX(' + -parallax / 2 + 'px)' }} /></div><strong>{parallax === 0 ? 'ずれ0：平面的に感じやすい' : '像を重ねる → 手前に感じる（奥行き ' + depthAmount + '）'}</strong></div>
        </div>

        <div className="reality-cards">
          <div className="reality-card"><span>VR</span><div className="reality-scene vr-scene"><i className="vr-sky" /><i className="vr-mountain one" /><i className="vr-mountain two" /><b>視界のすべてが仮想空間</b></div><strong>仮想現実</strong><small>現実の景色を隠し、画像で作った空間に入る。</small></div>
          <div className="reality-card"><span>AR</span><div className="reality-scene ar-scene"><i className="real-road" /><i className="ar-arrow">→</i><b>駅まで120m</b></div><strong>拡張現実</strong><small>現実の写真や映像の上に、案内やデータを重ねる。</small></div>
          <div className="reality-card"><span>MR</span><div className="reality-scene mr-scene"><i className="real-table" /><i className="virtual-cube" /><b>机の上に固定された立体</b></div><strong>複合現実</strong><small>仮想物体が現実の場所や物に合わせて存在し、回り込める。</small></div>
        </div>
      </div>
    </section>
  );
}
