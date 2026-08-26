'use client';

import { useEffect, useRef, useState } from 'react';

type ImageFormat = 'BMP' | 'GIF' | 'JPEG' | 'PNG';
type Scene = 'illustration' | 'photo';

function drawSource(context: CanvasRenderingContext2D, width: number, height: number, scene: Scene) {
  context.clearRect(0, 0, width, height);
  const sky = context.createLinearGradient(0, 0, 0, height);
  if (scene === 'illustration') {
    sky.addColorStop(0, '#3d62b8'); sky.addColorStop(.34, '#ffffff'); sky.addColorStop(.56, '#58ad43'); sky.addColorStop(.78, '#172435'); sky.addColorStop(1, '#db3d3d');
  } else {
    sky.addColorStop(0, '#26356e'); sky.addColorStop(.38, '#914b73'); sky.addColorStop(.68, '#f48252'); sky.addColorStop(1, '#ffd96d');
  }
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);
  if (scene === 'illustration') {
    context.fillStyle = '#fff'; context.fillRect(0, height * .28, width, height * .12);
    context.fillStyle = '#55ad3e'; context.fillRect(0, height * .45, width, height * .14);
    context.fillStyle = '#141c28'; context.fillRect(0, height * .62, width, height * .15);
    context.fillStyle = '#df3c3c'; context.fillRect(0, height * .8, width, height * .2);
    context.strokeStyle = '#f2c14e'; context.lineWidth = width * .018; context.strokeRect(width * .72, height * .13, width * .1, width * .1);
  } else {
    context.fillStyle = 'rgba(255,233,148,.9)'; context.beginPath(); context.arc(width * .68, height * .48, height * .18, 0, Math.PI * 2); context.fill();
    context.fillStyle = 'rgba(31,48,72,.62)'; context.beginPath(); context.moveTo(0, height); context.quadraticCurveTo(width * .25, height * .48, width * .54, height * .85); context.quadraticCurveTo(width * .76, height * .61, width, height * .76); context.lineTo(width, height); context.closePath(); context.fill();
    for (let index = 0; index < 160; index += 1) {
      const x = (index * 83) % width; const y = (index * 47) % height;
      context.fillStyle = `rgba(255,255,255,${.05 + (index % 5) * .025})`; context.fillRect(x, y, 2 + index % 3, 2 + index % 3);
    }
  }
}

function quantize(context: CanvasRenderingContext2D, width: number, height: number, palette: number) {
  const data = context.getImageData(0, 0, width, height);
  const levels = Math.max(2, Math.floor(Math.cbrt(palette)));
  const step = 255 / (levels - 1);
  for (let index = 0; index < data.data.length; index += 4) {
    data.data[index] = Math.round(data.data[index] / step) * step;
    data.data[index + 1] = Math.round(data.data[index + 1] / step) * step;
    data.data[index + 2] = Math.round(data.data[index + 2] / step) * step;
  }
  context.putImageData(data, 0, 0);
}

function formatBytes(bytes: number) {
  return bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
}

const formatNotes = {
  BMP: ['非圧縮', 'すべての画素を保存', 'データ量が大きい'],
  GIF: ['可逆圧縮', 'おもに256色以下', '色数の少ない図に向く'],
  JPEG: ['非可逆圧縮', '24ビットフルカラー', '写真に向く'],
  PNG: ['可逆圧縮', 'フルカラー・透明にも対応', '保存を繰り返しても劣化しない'],
} as const;

export function ImageCompressionLab() {
  const [format, setFormat] = useState<ImageFormat>('GIF');
  const [scene, setScene] = useState<Scene>('illustration');
  const [quality, setQuality] = useState(38);
  const [palette, setPalette] = useState(64);
  const [bytes, setBytes] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const displayWidth = Math.max(320, Math.round(canvas.getBoundingClientRect().width));
      const displayHeight = Math.round(displayWidth * .58);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(displayWidth * dpr); canvas.height = Math.round(displayHeight * dpr);
      const context = canvas.getContext('2d');
      if (!context) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const source = document.createElement('canvas'); source.width = 480; source.height = 280;
      const sourceContext = source.getContext('2d');
      if (!sourceContext) return;
      drawSource(sourceContext, source.width, source.height, scene);
      if (format === 'GIF') quantize(sourceContext, source.width, source.height, palette);
      context.clearRect(0, 0, displayWidth, displayHeight);
      context.imageSmoothingEnabled = format !== 'GIF';
      if (format === 'JPEG') {
        const url = source.toDataURL('image/jpeg', quality / 100);
        setBytes(Math.round((url.length - url.indexOf(',') - 1) * .75));
        const image = new Image();
        image.onload = () => context.drawImage(image, 0, 0, displayWidth, displayHeight);
        image.src = url;
      } else {
        context.drawImage(source, 0, 0, displayWidth, displayHeight);
        if (format === 'BMP') setBytes(source.width * source.height * 3);
        if (format === 'GIF') setBytes(Math.round(source.width * source.height * Math.max(1, Math.log2(palette)) / 8 * .52 + palette * 3));
        if (format === 'PNG') {
          const url = source.toDataURL('image/png');
          setBytes(Math.round((url.length - url.indexOf(',') - 1) * .75));
        }
      }
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [format, palette, quality, scene]);

  return (
    <section className="learning-section" id="images-compression">
      <div className="section-kicker"><span>04</span><p>画像の圧縮形式と特徴 · 教科書 p.65</p></div>
      <div className="section-title-row">
        <div><p className="step-label">見え方と用途を比べる</p><h2>写真とイラストに、同じ形式を使う？</h2></div>
        <p className="section-question">色の境界とグラデーションを観察し、形式ごとの得意・不得意を見つけよう。</p>
      </div>

      <div className="image-compression-lab">
        <div className="lab-heading"><div><p className="step-label">IMAGE FORMAT LAB</p><h3>BMP・GIF・JPEG・PNGを比較</h3></div><span className="print-badge"><small>プリント</small><b>14〜18</b></span></div>
        <div className="image-lab-toolbar">
          <div aria-label="画像の種類"><button type="button" className={scene === 'illustration' ? 'is-active' : ''} onClick={() => setScene('illustration')}>色数の少ない図</button><button type="button" className={scene === 'photo' ? 'is-active' : ''} onClick={() => setScene('photo')}>写真・グラデーション</button></div>
          <div aria-label="画像形式">{(['BMP', 'GIF', 'JPEG', 'PNG'] as ImageFormat[]).map((item) => <button type="button" className={format === item ? 'is-active' : ''} key={item} onClick={() => setFormat(item)}>{item}</button>)}</div>
        </div>
        <div className="image-format-stage">
          <div className="image-canvas-frame"><canvas ref={canvasRef} aria-label={`${scene === 'illustration' ? '色数の少ない図' : '写真風のグラデーション'}を${format}形式の特徴に合わせて表示`} /></div>
          <div className="format-inspector">
            <span>現在の形式</span><h4>{format}</h4>
            <ul>{formatNotes[format].map((note) => <li key={note}>{note}</li>)}</ul>
            <div><small>同じ元画像から作った比較値</small><strong>{formatBytes(bytes)}</strong><em>{format === 'BMP' ? '非圧縮の計算値' : format === 'GIF' ? '色数と圧縮をモデル化した目安' : 'ブラウザで生成した画像の値'}</em></div>
          </div>
        </div>
        {format === 'JPEG' && <label className="image-quality-control"><span>JPEG品質 <output>{quality}%</output></span><input type="range" min="5" max="95" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /><small>下げると小さくなりますが、境界付近ににじみやブロック状の変化が出ます。</small></label>}
        {format === 'GIF' && <label className="image-quality-control"><span>使う色数 <output>{palette}色</output></span><input type="range" min="0" max="2" value={[16, 64, 256].indexOf(palette)} onChange={(event) => setPalette([16, 64, 256][Number(event.target.value)])} /><small>色数を減らすと、グラデーションに帯状の段差が現れます。</small></label>}
        <div className="format-observation" role="status">
          {scene === 'illustration' && format === 'GIF' && <p><b>相性がよい：</b>少ない色と明確な境界を保ちやすい組合せです。</p>}
          {scene === 'photo' && format === 'GIF' && <p><b>段差を観察：</b>使える色が限られるため、徐々に変化する色が帯状になります。</p>}
          {scene === 'illustration' && format === 'JPEG' && <p><b>境界を観察：</b>急に色が変わる輪郭の周囲に、にじみが現れやすい組合せです。</p>}
          {scene === 'photo' && format === 'JPEG' && <p><b>相性がよい：</b>多くの色が滑らかに変化する写真を小さくしやすい組合せです。</p>}
          {format === 'BMP' && <p><b>すべて保存：</b>画素をそのまま持つため見た目は保てますが、データ量が大きくなります。</p>}
          {format === 'PNG' && <p><b>可逆でフルカラー：</b>輪郭も色も保てますが、写真ではJPEGより大きくなる傾向があります。</p>}
        </div>
        <div className="print-callout print-callout-four">
          <span className="print-number"><small>プリント</small><b>14</b></span><strong>BMP</strong><em>非圧縮で大きい</em>
          <span className="print-number"><small>プリント</small><b>15・16</b></span><strong>GIF・256色</strong><em>色数の少ない図向き</em>
          <span className="print-number"><small>プリント</small><b>17</b></span><strong>JPEG</strong><em>非可逆で写真向き</em>
          <span className="print-number"><small>プリント</small><b>18</b></span><strong>PNG</strong><em>可逆でフルカラー</em>
        </div>
      </div>
    </section>
  );
}
