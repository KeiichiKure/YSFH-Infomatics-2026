'use client';

import { useState } from 'react';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function DataSizeLab() {
  const [seconds, setSeconds] = useState(10);
  const [sampleRate, setSampleRate] = useState(44100);
  const [audioBits, setAudioBits] = useState(16);
  const [channels, setChannels] = useState(2);
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);
  const [colorBits, setColorBits] = useState(24);
  const audioBytes = sampleRate * seconds * audioBits * channels / 8;
  const imageBytes = width * height * colorBits / 8;

  return (
    <section className="learning-section" id="data-size">
      <div className="section-kicker"><span>04</span><p>発展 · データ量の計算 · 教科書 p.61</p></div>
      <div className="section-title-row"><div><p className="step-label">条件を掛け合わせる</p><h2>高画質にすると、何が増える？</h2></div><p className="section-question">音声と画像の条件を変え、式のどの数が結果へ効くか確かめよう。</p></div>
      <div className="data-size-grid">
        <div className="size-card">
          <p className="step-label">AUDIO</p><h3>音声のデータ量</h3>
          <label><span>録音時間 <output>{seconds}秒</output></span><input type="range" min="1" max="60" value={seconds} onChange={(event) => setSeconds(Number(event.target.value))} /></label>
          <label><span>標本化周波数</span><select value={sampleRate} onChange={(event) => setSampleRate(Number(event.target.value))}><option value="8000">8 kHz</option><option value="44100">44.1 kHz</option><option value="96000">96 kHz</option></select></label>
          <label><span>量子化ビット数</span><select value={audioBits} onChange={(event) => setAudioBits(Number(event.target.value))}><option value="8">8 bit</option><option value="16">16 bit</option><option value="24">24 bit</option></select></label>
          <label><span>チャンネル</span><select value={channels} onChange={(event) => setChannels(Number(event.target.value))}><option value="1">モノラル</option><option value="2">ステレオ</option></select></label>
          <div className="size-formula"><span>{sampleRate.toLocaleString()} × {seconds} × {audioBits} × {channels} ÷ 8</span><strong>{formatSize(audioBytes)}</strong></div>
        </div>
        <div className="size-card">
          <p className="step-label">IMAGE</p><h3>静止画像のデータ量</h3>
          <label><span>横の画素数 <output>{width}</output></span><input type="range" min="160" max="1920" step="160" value={width} onChange={(event) => setWidth(Number(event.target.value))} /></label>
          <label><span>縦の画素数 <output>{height}</output></span><input type="range" min="120" max="1080" step="120" value={height} onChange={(event) => setHeight(Number(event.target.value))} /></label>
          <label><span>1画素のビット数</span><select value={colorBits} onChange={(event) => setColorBits(Number(event.target.value))}><option value="8">8 bit</option><option value="24">24 bit</option><option value="32">32 bit</option></select></label>
          <div className="size-formula"><span>{width} × {height} × {colorBits} ÷ 8</span><strong>{formatSize(imageBytes)}</strong></div>
        </div>
      </div>
      <p className="teacher-note">ここでは圧縮前のデータ量を計算しています。次の単元「02-03 データの圧縮」で、保存時に小さくする仕組みへつなげます。</p>
    </section>
  );
}
