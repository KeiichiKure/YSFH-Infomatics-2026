'use client';

import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import arStreetPhoto from '@/public/images/02-02/ar-street-photo.jpg';
import mrClassroomPhoto from '@/public/images/02-02/mr-classroom-photo.jpg';
import realityHand from '@/public/images/02-02/reality-hand.png';

type RealityHandState = { x: number; y: number; visible: boolean };

export function MotionLab() {
  const [frameRate, setFrameRate] = useState(12);
  const [playing, setPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [perspective, setPerspective] = useState(true);
  const [occlusion, setOcclusion] = useState(true);
  const [shading, setShading] = useState(true);
  const [parallax, setParallax] = useState(18);
  const [arHand, setArHand] = useState<RealityHandState>({ x: 50, y: 42, visible: false });
  const [mrHand, setMrHand] = useState<RealityHandState>({ x: 52, y: 42, visible: false });

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
  const stepFrame = (direction: -1 | 1) => {
    setPlaying(false);
    setElapsed((value) => {
      const frameIndex = Math.floor(value * frameRate + 0.000001);
      return Math.max(0, frameIndex + direction) / frameRate;
    });
  };
  const moveRealityHand = (event: ReactPointerEvent<HTMLDivElement>, target: 'ar' | 'mr') => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const next = {
      x: Math.max(5, Math.min(95, ((event.clientX - bounds.left) / bounds.width) * 100)),
      y: Math.max(4, Math.min(88, ((event.clientY - bounds.top) / bounds.height) * 100)),
      visible: true,
    };
    if (target === 'ar') setArHand(next);
    else setMrHand(next);
  };

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
          <button type="button" className="frame-step-button" disabled={currentFrame <= 1} onClick={() => stepFrame(-1)}>← 前のフレーム</button>
          <button type="button" className="frame-step-button" onClick={() => stepFrame(1)}>次のフレーム →</button>
          <button type="button" onClick={() => { setElapsed(0); setPlaying(true); }}>最初から</button>
        </div>
        <div className="motion-clock" aria-live="polite"><div><small>開始から</small><strong>{elapsed.toFixed(2)} 秒</strong></div><div><small>現在のフレーム</small><strong>{currentFrame.toLocaleString()} 枚目</strong></div><div><small>再生状態</small><strong>{playing ? (playbackRate === 1 ? '通常' : '1/4スロー') : '一時停止／コマ送り'}</strong></div></div>
        <div className="motion-track" aria-label={frameRate + 'fpsの動きの模式表示'}><div className="motion-runner" style={{ left: 'calc(' + (2 + runnerPosition * 88) + '%)' }}><i /><b>→</b></div></div>
        <p className="fps-note"><b>表示は動き方のイメージです。</b> 60 fpsを選んでも、端末の画面更新速度やブラウザの負荷により、実際に毎秒60回描画されるとは限りません。</p>
        <div className="frame-explainer"><div><b>1フレーム</b><span>動画を構成する1枚の静止画</span></div><i aria-hidden="true">×</i><div><b>{frameRate} fps</b><span>1秒間に{frameRate}枚を再生</span></div><i aria-hidden="true">＝</i><div><b>5分で {(frameRate * 300).toLocaleString()}枚</b><span>枚数が増えるほど滑らか</span></div></div>
        <div className="print-callout">
          <span className="print-number"><small>プリント</small><b>18</b></span><strong>フレーム</strong><em>動画を構成する1枚ずつの静止画像</em>
          <span className="print-number"><small>プリント</small><b>19</b></span><strong>fps</strong><em>1秒間に表示するフレーム数。大きいほど滑らかに見える</em>
        </div>
      </div>

      <div className="depth-lab">
        <div className="lab-heading"><div><p className="step-label">3D CUES</p><h3>平面に奥行きをつくる</h3></div><span className="print-badge"><small>プリント</small><b>20・21</b></span></div>
        <div className="depth-layout">
          <div className={'depth-stage sphere-stage ' + (perspective ? 'has-perspective ' : 'no-perspective ') + (occlusion ? 'has-occlusion ' : 'no-occlusion ') + (shading ? 'has-shading' : 'no-shading')} aria-label="球体を使った3DCGの奥行き表現">
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

        <div className="reality-cards reality-cards-large">
          <div className="reality-card">
            <div className="reality-card-copy"><span>VR</span><div><strong>仮想現実</strong><small>現実の景色をすべて隠し、CGだけで作られた空間に入ります。</small></div></div>
            <div className="reality-scene vr-scene"><i className="vr-sky" /><i className="vr-mountain one" /><i className="vr-mountain two" /><b>見えているもの：すべて仮想</b></div>
            <p><b>例：</b>ゴーグルを着けて、CGで作られた海底や宇宙を360度見回す。</p>
          </div>
          <div className="reality-card">
            <div className="reality-card-copy"><span>AR</span><div><strong>拡張現実</strong><small>現実の写真やカメラ映像の上へ、案内や数値を平面的に重ねます。現実空間の奥行きまでは扱いません。</small></div></div>
            <div className="reality-scene ar-scene interactive-reality-scene" tabIndex={0} aria-label="ARの案内表示。マウスを動かして、手を重ねても案内が隠れないことを確認" onPointerMove={(event) => moveRealityHand(event, 'ar')} onPointerEnter={() => setArHand((value) => ({ ...value, visible: true }))} onPointerLeave={() => setArHand((value) => ({ ...value, visible: false }))} onFocus={() => setArHand((value) => ({ ...value, visible: true }))} onBlur={() => setArHand((value) => ({ ...value, visible: false }))}>
              <Image className="reality-photo" src={arStreetPhoto} alt="現実の日本の街路の写真" fill sizes="(max-width: 860px) 100vw, 55vw" />
              <Image className={'reality-hand ar-reality-hand ' + (arHand.visible ? 'is-visible' : '')} src={realityHand} alt="" aria-hidden="true" width={170} height={255} style={{ left: arHand.x + '%', top: arHand.y + '%' }} />
              <div className="ar-route-overlay"><i>↑</i><b>目的地まで120m</b></div>
              <b className="reality-hover-hint">マウスを矢印へ：手を重ねても表示は隠れない</b>
              <em>AR：案内表示は手より前に残る</em>
            </div>
            <p><b>ARの特徴：</b>手は現実の映像の一部ですが、案内は画面の上へ重ねるため、手を重ねても隠れません。</p>
          </div>
          <div className="reality-card">
            <div className="reality-card-copy"><span>MR</span><div><strong>複合現実</strong><small>仮想の立体が現実の机や教科書との位置関係を理解します。手前の現実物体に隠れるため、同じ空間にあるように見えます。</small></div></div>
            <div className="reality-scene mr-scene interactive-reality-scene" tabIndex={0} aria-label="MRの仮想分子模型。マウスを動かして、手で模型が隠れることを確認" onPointerMove={(event) => moveRealityHand(event, 'mr')} onPointerEnter={() => setMrHand((value) => ({ ...value, visible: true }))} onPointerLeave={() => setMrHand((value) => ({ ...value, visible: false }))} onFocus={() => setMrHand((value) => ({ ...value, visible: true }))} onBlur={() => setMrHand((value) => ({ ...value, visible: false }))}>
              <Image className="reality-photo" src={mrClassroomPhoto} alt="現実の理科室と実験机の写真" fill sizes="(max-width: 860px) 100vw, 55vw" />
              <div className="mr-anchor-ring" />
              <div className="mr-molecule"><i /><i /><i /><i /></div>
              <Image className={'reality-hand mr-reality-hand ' + (mrHand.visible ? 'is-visible' : '')} src={realityHand} alt="" aria-hidden="true" width={170} height={255} style={{ left: mrHand.x + '%', top: mrHand.y + '%' }} />
              <b className="reality-hover-hint">マウスを模型へ：現実の手が模型を隠す</b>
              <em>MR：手と仮想模型に前後関係がある</em>
            </div>
            <p><b>MRの特徴：</b>現実の手が仮想模型より手前にあると判定し、重なった部分で模型を隠す「遮蔽（オクルージョン）」が起こります。</p>
          </div>
        </div>
        <div className="print-callout">
          <span className="print-number"><small>プリント</small><b>20</b></span><strong>3DCG</strong><em>遠近法・重なり・陰影などで平面に立体を表現する技術</em>
          <span className="print-number"><small>プリント</small><b>21</b></span><strong>視差</strong><em>左右の目に届く像のずれ。脳が奥行きを判断する手がかり</em>
        </div>
      </div>
    </section>
  );
}
