'use client';

import { useEffect, useRef, useState } from 'react';

function formatApprox(value: number) {
  return value.toLocaleString('ja-JP', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function SizeConversions({ bytes }: { bytes: number }) {
  const exactBytes = Math.round(bytes);
  const binaryKB = exactBytes / 1024;
  const binaryMB = exactBytes / 1024 ** 2;
  const decimalKB = exactBytes / 1000;
  const decimalMB = exactBytes / 1000 ** 2;

  return (
    <div className="size-conversions">
      <div className="size-conversion textbook-conversion">
        <div><b>教科書の換算（1024倍）</b><small>1 MB ＝ 1024 KB ／ 1 KB ＝ 1024 B</small></div>
        {binaryKB >= 1 && <p><span>{exactBytes.toLocaleString()} ÷ 1,024</span><strong>＝ 約 {formatApprox(binaryKB)} KB <small>（KiB）</small></strong></p>}
        {binaryMB >= 1 && <p><span>{exactBytes.toLocaleString()} ÷ 1,048,576</span><strong>＝ 約 {formatApprox(binaryMB)} MB <small>（MiB）</small></strong></p>}
      </div>
      <div className="size-conversion decimal-conversion">
        <div><b>1000倍で換算する場合</b><small>1 MB ＝ 1000 kB ／ 1 kB ＝ 1000 B</small></div>
        {(decimalKB >= 1 || decimalMB >= 1) && <p>
          {decimalKB >= 1 && <strong>約 {formatApprox(decimalKB)} kB</strong>}
          {decimalKB >= 1 && decimalMB >= 1 && <span>／</span>}
          {decimalMB >= 1 && <strong>約 {formatApprox(decimalMB)} MB</strong>}
        </p>}
      </div>
    </div>
  );
}

export function DataSizeLab() {
  const [seconds, setSeconds] = useState(10);
  const [sampleRate, setSampleRate] = useState(44100);
  const [audioBits, setAudioBits] = useState(16);
  const [channels, setChannels] = useState(2);
  const [width, setWidth] = useState(640);
  const [colorBits, setColorBits] = useState(8);
  const imagePreviewRef = useRef<HTMLCanvasElement>(null);
  const height = Math.round(width * 3 / 4);
  const audioBytes = sampleRate * seconds * audioBits * channels / 8;
  const imageBytes = width * height * colorBits * 3 / 8;

  useEffect(() => {
    const canvas = imagePreviewRef.current;
    if (!canvas) return;
    const draw = () => {
      const displayWidth = Math.max(280, canvas.getBoundingClientRect().width);
      const displayHeight = 220;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);
      const context = canvas.getContext('2d');
      if (!context) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sampleWidth = Math.max(8, Math.min(160, Math.round(width / 12)));
      const sampleHeight = Math.max(6, Math.min(100, Math.round(height / 12)));
      const source = document.createElement('canvas');
      source.width = sampleWidth;
      source.height = sampleHeight;
      const sourceContext = source.getContext('2d');
      if (!sourceContext) return;
      const sky = sourceContext.createLinearGradient(0, 0, 0, sampleHeight);
      sky.addColorStop(0, '#bfe7ef');
      sky.addColorStop(1, '#f7d783');
      sourceContext.fillStyle = sky;
      sourceContext.fillRect(0, 0, sampleWidth, sampleHeight);
      sourceContext.fillStyle = '#ffe17c';
      sourceContext.beginPath();
      sourceContext.arc(sampleWidth * 0.78, sampleHeight * 0.22, sampleHeight * 0.11, 0, Math.PI * 2);
      sourceContext.fill();
      sourceContext.fillStyle = '#78a98f';
      sourceContext.beginPath();
      sourceContext.moveTo(0, sampleHeight);
      sourceContext.quadraticCurveTo(sampleWidth * 0.27, sampleHeight * 0.48, sampleWidth * 0.55, sampleHeight * 0.83);
      sourceContext.quadraticCurveTo(sampleWidth * 0.8, sampleHeight * 0.58, sampleWidth, sampleHeight * 0.76);
      sourceContext.lineTo(sampleWidth, sampleHeight);
      sourceContext.closePath();
      sourceContext.fill();
      sourceContext.fillStyle = '#e88466';
      sourceContext.beginPath();
      sourceContext.arc(sampleWidth * 0.43, sampleHeight * 0.42, sampleHeight * 0.17, 0, Math.PI * 2);
      sourceContext.fill();
      sourceContext.fillStyle = '#203553';
      sourceContext.fillRect(sampleWidth * 0.39, sampleHeight * 0.59, sampleWidth * 0.08, sampleHeight * 0.1);

      const image = sourceContext.getImageData(0, 0, sampleWidth, sampleHeight);
      const perChannelBits = colorBits;
      const levels = 2 ** perChannelBits;
      const step = 255 / Math.max(1, levels - 1);
      for (let index = 0; index < image.data.length; index += 4) {
        image.data[index] = Math.round(image.data[index] / step) * step;
        image.data[index + 1] = Math.round(image.data[index + 1] / step) * step;
        image.data[index + 2] = Math.round(image.data[index + 2] / step) * step;
      }
      sourceContext.putImageData(image, 0, 0);
      context.clearRect(0, 0, displayWidth, displayHeight);
      context.imageSmoothingEnabled = false;
      const ratio = Math.min(displayWidth / sampleWidth, displayHeight / sampleHeight);
      const targetWidth = sampleWidth * ratio;
      const targetHeight = sampleHeight * ratio;
      context.drawImage(source, (displayWidth - targetWidth) / 2, (displayHeight - targetHeight) / 2, targetWidth, targetHeight);
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [colorBits, height, width]);

  return (
    <section className="learning-section" id="data-size">
      <div className="section-kicker"><span>04</span><p>発展 · データ量の計算 · 教科書 p.61</p></div>
      <div className="section-title-row"><div><p className="step-label">条件を掛け合わせる</p><h2>高画質にすると、何が増える？</h2></div><p className="section-question">音声と画像の条件を変え、式のどの数が結果へ効くか確かめよう。</p></div>
      <div className="data-size-grid">
        <div className="size-card">
          <p className="step-label">AUDIO</p><h3>音声のデータ量</h3>
          <label><span>標本化周波数</span><select value={sampleRate} onChange={(event) => setSampleRate(Number(event.target.value))}><option value="8000">8 kHz</option><option value="44100">44.1 kHz</option><option value="96000">96 kHz</option></select></label>
          <label><span>録音時間 <output>{seconds}秒</output></span><input type="range" min="1" max="60" value={seconds} onChange={(event) => setSeconds(Number(event.target.value))} /></label>
          <label><span>量子化ビット数</span><select value={audioBits} onChange={(event) => setAudioBits(Number(event.target.value))}><option value="8">8 bit</option><option value="16">16 bit</option><option value="24">24 bit</option></select></label>
          <label><span>チャンネル</span><select value={channels} onChange={(event) => setChannels(Number(event.target.value))}><option value="1">モノラル</option><option value="2">ステレオ</option></select></label>
          <div className="size-formula"><span>{sampleRate.toLocaleString()} × {seconds} × {audioBits} × {channels} ÷ 8</span><b>＝ {Math.round(audioBytes).toLocaleString()} B</b><SizeConversions bytes={audioBytes} /></div>
        </div>
        <div className="size-card">
          <p className="step-label">IMAGE</p><h3>静止画像のデータ量</h3>
          <label><span>横の画素数 <output>{width}</output></span><input type="range" min="80" max="1920" step="80" value={width} onChange={(event) => setWidth(Number(event.target.value))} /></label>
          <div className="linked-dimension"><span>縦の画素数</span><output>{height}</output><small>横：縦 ＝ 4：3を保って自動計算</small></div>
          <label><span>1色の量子化ビット数</span><select value={colorBits} onChange={(event) => setColorBits(Number(event.target.value))}><option value="1">1 bit</option><option value="2">2 bit</option><option value="4">4 bit</option><option value="8">8 bit</option></select></label>
          <div className="quality-preview"><canvas ref={imagePreviewRef} aria-label={width + 'かける' + height + '画素、RGB各色' + colorBits + 'ビットで再現した画像'} /><p><b>画質プレビュー</b><span>画素数を減らすとカクカクに、1色のビット数を減らすと色の段差が見えます。</span></p></div>
          <div className="size-formula"><span>{width} × {height} × {colorBits} × 3色 ÷ 8</span><b>＝ {Math.round(imageBytes).toLocaleString()} B</b><SizeConversions bytes={imageBytes} /></div>
        </div>
      </div>
      <p className="teacher-note">ここでは圧縮前のデータ量を計算しています。次の単元「02-03 データの圧縮」で、保存時に小さくする仕組みへつなげます。</p>
    </section>
  );
}
