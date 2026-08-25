'use client';

import { useEffect, useRef, useState } from 'react';

function setupCanvas(canvas: HTMLCanvasElement, height: number) {
  const width = Math.max(280, canvas.getBoundingClientRect().width);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  return { context, width, height };
}

function drawScene(context: CanvasRenderingContext2D, width: number, height: number, zoom = 1) {
  context.save();
  context.translate(width / 2, height / 2);
  context.scale(zoom, zoom);
  context.translate(-width / 2, -height / 2);
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#bfe7ef');
  sky.addColorStop(0.68, '#f7e6a7');
  sky.addColorStop(1, '#f6cf7a');
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#ffe07a';
  context.beginPath();
  context.arc(width * 0.78, height * 0.22, height * 0.11, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#84b89a';
  context.beginPath();
  context.moveTo(0, height * 0.78);
  context.quadraticCurveTo(width * 0.18, height * 0.46, width * 0.42, height * 0.75);
  context.quadraticCurveTo(width * 0.7, height * 0.48, width, height * 0.7);
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fill();
  context.fillStyle = '#397c70';
  context.beginPath();
  context.moveTo(0, height * 0.88);
  context.quadraticCurveTo(width * 0.25, height * 0.65, width * 0.53, height * 0.88);
  context.quadraticCurveTo(width * 0.72, height * 0.7, width, height * 0.83);
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fill();
  context.fillStyle = '#e88466';
  context.beginPath();
  context.arc(width * 0.45, height * 0.36, height * 0.16, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#f4c44f';
  context.beginPath();
  context.moveTo(width * 0.45, height * 0.2);
  context.lineTo(width * 0.45, height * 0.52);
  context.lineTo(width * 0.35, height * 0.36);
  context.closePath();
  context.fill();
  context.strokeStyle = '#203553';
  context.lineWidth = Math.max(1.5, width * 0.008);
  context.beginPath();
  context.moveTo(width * 0.4, height * 0.5);
  context.lineTo(width * 0.43, height * 0.65);
  context.moveTo(width * 0.5, height * 0.5);
  context.lineTo(width * 0.47, height * 0.65);
  context.stroke();
  context.fillStyle = '#9a633d';
  context.fillRect(width * 0.41, height * 0.63, width * 0.08, height * 0.07);
  context.restore();
}

function quantizeScene(context: CanvasRenderingContext2D, width: number, height: number, bits: number) {
  const data = context.getImageData(0, 0, width, height);
  const channelLevels = 2 ** bits;
  const step = 255 / Math.max(1, channelLevels - 1);
  for (let index = 0; index < data.data.length; index += 4) {
    data.data[index] = Math.round(data.data[index] / step) * step;
    data.data[index + 1] = Math.round(data.data[index + 1] / step) * step;
    data.data[index + 2] = Math.round(data.data[index + 2] / step) * step;
  }
  context.putImageData(data, 0, 0);
}

const zoomLevels = [1, 2, 4, 8, 16, 32];
const densityLevels = [8, 16, 32, 64, 128, 256];

export function ImageLab() {
  const [zoomIndex, setZoomIndex] = useState(0);
  const [red, setRed] = useState(255);
  const [green, setGreen] = useState(130);
  const [blue, setBlue] = useState(255);
  const [cyan, setCyan] = useState(20);
  const [magenta, setMagenta] = useState(60);
  const [yellow, setYellow] = useState(0);
  const [densityIndex, setDensityIndex] = useState(4);
  const [gradationBits, setGradationBits] = useState(8);
  const [quantRed, setQuantRed] = useState(0.82);
  const [quantGreen, setQuantGreen] = useState(0.38);
  const [quantBlue, setQuantBlue] = useState(1);
  const rasterCanvasRef = useRef<HTMLCanvasElement>(null);
  const vectorCanvasRef = useRef<HTMLCanvasElement>(null);
  const resolutionCanvasRef = useRef<HTMLCanvasElement>(null);
  const gradationCanvasRef = useRef<HTMLCanvasElement>(null);
  const zoom = zoomLevels[zoomIndex];
  const density = densityLevels[densityIndex];
  const gradations = 2 ** gradationBits;
  const quantMax = gradations - 1;
  const quantRedLevel = Math.round(quantRed * quantMax);
  const quantGreenLevel = Math.round(quantGreen * quantMax);
  const quantBlueLevel = Math.round(quantBlue * quantMax);
  const quantRedValue = Math.round(quantRedLevel / quantMax * 255);
  const quantGreenValue = Math.round(quantGreenLevel / quantMax * 255);
  const quantBlueValue = Math.round(quantBlueLevel / quantMax * 255);
  const subtractiveRed = Math.round(255 * (1 - cyan / 100));
  const subtractiveGreen = Math.round(255 * (1 - magenta / 100));
  const subtractiveBlue = Math.round(255 * (1 - yellow / 100));

  useEffect(() => {
    const rasterCanvas = rasterCanvasRef.current;
    const vectorCanvas = vectorCanvasRef.current;
    if (!rasterCanvas || !vectorCanvas) return;
    const draw = () => {
      const raster = setupCanvas(rasterCanvas, 230);
      const vector = setupCanvas(vectorCanvas, 230);
      if (!raster || !vector) return;
      const source = document.createElement('canvas');
      source.width = 180;
      source.height = 120;
      const sourceContext = source.getContext('2d');
      if (!sourceContext) return;
      drawScene(sourceContext, source.width, source.height);
      const cropWidth = source.width / zoom;
      const cropHeight = source.height / zoom;
      raster.context.imageSmoothingEnabled = zoom === 1;
      raster.context.drawImage(source, (source.width - cropWidth) / 2, (source.height - cropHeight) / 2, cropWidth, cropHeight, 0, 0, raster.width, raster.height);
      drawScene(vector.context, vector.width, vector.height, zoom);
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [zoom]);

  useEffect(() => {
    const canvas = resolutionCanvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const output = setupCanvas(canvas, 260);
      if (!output) return;
      const source = document.createElement('canvas');
      source.width = density;
      source.height = Math.max(6, Math.round(density * 0.67));
      const sourceContext = source.getContext('2d');
      if (!sourceContext) return;
      drawScene(sourceContext, source.width, source.height);
      quantizeScene(sourceContext, source.width, source.height, gradationBits);
      output.context.imageSmoothingEnabled = false;
      output.context.drawImage(source, 0, 0, output.width, output.height);
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [density, gradationBits]);

  useEffect(() => {
    const canvas = gradationCanvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const output = setupCanvas(canvas, 180);
      if (!output) return;
      const bandHeight = output.height / 3;
      for (let band = 0; band < 3; band += 1) {
        for (let x = 0; x < output.width; x += 1) {
          const ratio = x / Math.max(1, output.width - 1);
          const value = Math.round(ratio * (gradations - 1)) / Math.max(1, gradations - 1) * 255;
          output.context.fillStyle = band === 0 ? 'rgb(' + value + ',0,0)' : band === 1 ? 'rgb(0,' + value + ',0)' : 'rgb(0,0,' + value + ')';
          output.context.fillRect(x, band * bandHeight, 1, bandHeight);
        }
        output.context.fillStyle = 'rgba(255,255,255,.92)';
        output.context.font = '900 13px "BIZ UDPGothic", sans-serif';
        output.context.fillText(['R 赤', 'G 緑', 'B 青'][band], 10, band * bandHeight + 21);
      }
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [gradations]);

  return (
    <section className="learning-section" id="images">
      <div className="section-kicker"><span>02</span><p>画像のデジタル化 · 教科書 pp.58–59</p></div>
      <div className="section-title-row">
        <div><p className="step-label">点と色を比べる</p><h2>画像を拡大すると何が見える？</h2></div>
        <p className="section-question">画像形式、光と色の三原色、解像度、階調を別々に動かして確かめよう。</p>
      </div>

      <div className="image-format-lab">
        <div className="lab-heading"><div><p className="step-label">ZOOM</p><h3>ラスタ形式とベクタ形式</h3></div><output className="zoom-output">{zoom}倍</output></div>
        <div className="zoom-steps" aria-label="拡大率を選ぶ">{zoomLevels.map((value, index) => <button type="button" className={zoomIndex === index ? 'is-active' : ''} key={value} onClick={() => setZoomIndex(index)}>{value}×</button>)}</div>
        <label className="zoom-slider"><span>拡大率</span><input type="range" min="0" max={zoomLevels.length - 1} value={zoomIndex} onChange={(event) => setZoomIndex(Number(event.target.value))} /></label>
        <div className="format-compare format-canvas-compare">
          <div><span>ラスタ形式</span><div className="format-canvas-frame"><canvas ref={rasterCanvasRef} aria-label={zoom + '倍に拡大したラスタ画像'} /></div><b>{zoom === 1 ? 'ふつうに見ると滑らか' : '画素の角がギザギザに見える'}</b><small>写真向き · bmp / jpg / gif / png</small></div>
          <div><span>ベクタ形式</span><div className="format-canvas-frame"><canvas ref={vectorCanvasRef} aria-label={zoom + '倍に拡大して描き直したベクタ画像'} /></div><b>何倍でも輪郭を描き直して滑らか</b><small>ロゴ・図形向き · svg / dxf</small></div>
        </div>
        <p className="zoom-note">外側の枠と見出しは固定したまま、同じ風景の中央だけを拡大しています。</p>
        <div className="print-callout"><span className="print-number"><small>プリント</small><b>11</b></span><strong>画素（ピクセル）</strong><em>ラスタ画像をつくる点</em></div>
      </div>

      <div className="rgb-lab">
        <div className="lab-heading"><div><p className="step-label">COLOR MIXER</p><h3>光の三原色を混ぜる</h3></div><span className="print-badge"><small>プリント</small><b>12・13</b></span></div>
        <div className="rgb-stage">
          <div className="rgb-circles" aria-label="赤、緑、青の光を重ねる模式図"><i className="red" style={{ opacity: red / 255 }} /><i className="green" style={{ opacity: green / 255 }} /><i className="blue" style={{ opacity: blue / 255 }} /><span className="mix-focus" aria-hidden="true" /></div>
          <div className="rgb-controls">
            <label className="red"><span>R 赤 <output>{red}</output></span><input type="range" min="0" max="255" value={red} onChange={(event) => setRed(Number(event.target.value))} /></label>
            <label className="green"><span>G 緑 <output>{green}</output></span><input type="range" min="0" max="255" value={green} onChange={(event) => setGreen(Number(event.target.value))} /></label>
            <label className="blue"><span>B 青 <output>{blue}</output></span><input type="range" min="0" max="255" value={blue} onChange={(event) => setBlue(Number(event.target.value))} /></label>
            <div className="mixed-color" style={{ background: 'rgb(' + red + ',' + green + ',' + blue + ')' }}><span>混ぜた光</span><code>rgb({red}, {green}, {blue})</code></div>
          </div>
        </div>
        <p className="data-tradeoff">0にするとその光が消え、255に近づくほど明るくなります。光は混ぜるほど白へ近づく<strong>加法混色</strong>です。</p>

        <div className="subtractive-lab">
          <div className="lab-heading"><div><p className="step-label">INK MIXER</p><h3>色の三原色を混ぜる</h3></div><span className="mixing-type">減法混色</span></div>
          <div className="rgb-stage">
            <div className="cmy-circles" aria-label="シアン、マゼンタ、イエローの色材を重ねる模式図"><i className="cyan" style={{ opacity: cyan / 100 }} /><i className="magenta" style={{ opacity: magenta / 100 }} /><i className="yellow" style={{ opacity: yellow / 100 }} /><span className="mix-focus dark" aria-hidden="true" /></div>
            <div className="rgb-controls cmy-controls">
              <label className="cyan"><span>C シアン <output>{cyan}%</output></span><input type="range" min="0" max="100" value={cyan} onChange={(event) => setCyan(Number(event.target.value))} /></label>
              <label className="magenta"><span>M マゼンタ <output>{magenta}%</output></span><input type="range" min="0" max="100" value={magenta} onChange={(event) => setMagenta(Number(event.target.value))} /></label>
              <label className="yellow"><span>Y イエロー <output>{yellow}%</output></span><input type="range" min="0" max="100" value={yellow} onChange={(event) => setYellow(Number(event.target.value))} /></label>
              <div className="mixed-color" style={{ background: 'rgb(' + subtractiveRed + ',' + subtractiveGreen + ',' + subtractiveBlue + ')' }}><span>紙に重ねた色</span><code>CMY({cyan}, {magenta}, {yellow})</code></div>
            </div>
          </div>
          <p className="data-tradeoff">インクは光を吸収するため、混ぜるほど暗くなります。印刷では締まった黒を表すKを加えてCMYKとします。</p>
        </div>
      </div>

      <div className="resolution-lab">
        <div className="lab-heading"><div><p className="step-label">PIXEL &amp; GRADATION</p><h3>画素数と色の段階を変える</h3></div><span className="print-badge"><small>プリント</small><b>14～17</b></span></div>
        <div className="resolution-controls">
          <div className="range-card"><span>横の画素数 <output>{density}画素</output></span><input type="range" min="0" max={densityLevels.length - 1} value={densityIndex} onChange={(event) => setDensityIndex(Number(event.target.value))} /><div className="preset-row">{densityLevels.map((value, index) => <button type="button" className={densityIndex === index ? 'is-active' : ''} key={value} onClick={() => setDensityIndex(index)}>{value}</button>)}</div></div>
          <div className="range-card"><span>1色の量子化ビット数 <output>{gradationBits} bit</output></span><input type="range" min="1" max="8" value={gradationBits} onChange={(event) => setGradationBits(Number(event.target.value))} /><div className="preset-row">{[1, 2, 4, 5, 8].map((value) => <button type="button" className={gradationBits === value ? 'is-active' : ''} key={value} onClick={() => setGradationBits(value)}>{value} bit</button>)}</div></div>
        </div>
        <div className="resolution-stage resolution-stage-rich">
          <div><div className="resolution-canvas-frame"><canvas ref={resolutionCanvasRef} aria-label={density + '画素、1色' + gradationBits + 'ビットで表した風景'} /></div><b>{density} × {Math.round(density * 0.67)}画素の見え方</b><small>画素を減らすと輪郭が四角くなります</small></div>
          <div><canvas ref={gradationCanvasRef} className="gradation-canvas rgb-gradation-canvas" aria-label={gradationBits + 'ビット、' + gradations + '階調の赤緑青グラデーション'} /><b>RGBそれぞれ {gradationBits} bit ＝ {gradations}階調</b><small>{gradationBits >= 8 ? '各色256段階では境目がほぼ見えない滑らかなグラデーション' : '赤・緑・青それぞれの段階の境目を探してみよう'} · RGB各8 bitなら24ビットフルカラー</small></div>
        </div>
        <div className="quantized-rgb-lab">
          <div className="lab-heading"><div><p className="step-label">BIT-DEPTH COLOR MIXER</p><h3>{gradationBits} bitの光を混ぜてみる</h3></div><output>各色 {gradations}段階</output></div>
          <p>上で選んだ量子化ビット数が、この3本のレバーにも反映されます。1 bitなら各色は消灯／点灯の2段階だけです。</p>
          <div className="rgb-stage">
            <div className="rgb-circles quantized-circles" aria-label={gradationBits + 'ビットで赤緑青を混ぜる模式図'}><i className="red" style={{ opacity: quantRedValue / 255 }} /><i className="green" style={{ opacity: quantGreenValue / 255 }} /><i className="blue" style={{ opacity: quantBlueValue / 255 }} /><span className="mix-focus" aria-hidden="true" /></div>
            <div className="rgb-controls quantized-controls">
              <label className="red"><span>R 赤 <output>段階 {quantRedLevel}/{quantMax} → {quantRedValue}</output></span><input type="range" min="0" max={quantMax} value={quantRedLevel} onChange={(event) => setQuantRed(Number(event.target.value) / quantMax)} /></label>
              <label className="green"><span>G 緑 <output>段階 {quantGreenLevel}/{quantMax} → {quantGreenValue}</output></span><input type="range" min="0" max={quantMax} value={quantGreenLevel} onChange={(event) => setQuantGreen(Number(event.target.value) / quantMax)} /></label>
              <label className="blue"><span>B 青 <output>段階 {quantBlueLevel}/{quantMax} → {quantBlueValue}</output></span><input type="range" min="0" max={quantMax} value={quantBlueLevel} onChange={(event) => setQuantBlue(Number(event.target.value) / quantMax)} /></label>
              <div className="mixed-color" style={{ background: 'rgb(' + quantRedValue + ',' + quantGreenValue + ',' + quantBlueValue + ')' }}><span>{gradationBits} bitで混ぜた光</span><code>rgb({quantRedValue}, {quantGreenValue}, {quantBlueValue})</code></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
