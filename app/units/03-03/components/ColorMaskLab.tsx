'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import classroomPhoto from '@/public/images/02-02/mr-classroom-photo.jpg';
import { colorBits, colorCSS, colorMissionMet, maskColor, quantizeRGB, type RGB4, type ColorOperation } from './colorMaskModels';

const channels = ['R 赤', 'G 緑', 'B 青'];
const initialPixel: RGB4 = [6, 10, 12];
const missions = [
  { title: 'すべて黒色にしよう', goal: 'R・G・Bをすべて0にする。', hint: 'ANDでは、マスクの0がその位置を0にします。', operation: 'AND', mask: [0, 0, 0] },
  { title: 'すべて白色にしよう', goal: 'R・G・Bをすべて15にする。', hint: 'ORでは、マスクの1がその位置を1にします。', operation: 'OR', mask: [15, 15, 15] },
  { title: '赤みを強くしよう', goal: 'Rだけ15にする。GとBは元のまま。', hint: 'ORで赤の4ビットだけを1にし、ほかはそのままにできます。', operation: 'OR', mask: [15, 0, 0] },
  { title: '色を反転しよう', goal: '各成分を15−元の値にする。明暗や色合いはどう変わる？', hint: 'XORでは、マスクの1がその位置を反転します。', operation: 'XOR', mask: [15, 15, 15] },
] as const;
type Run = { source: RGB4; result: RGB4; mask: RGB4; operation: ColorOperation };
type PhotoData = { pixels: Uint8ClampedArray; width: number; height: number };

function PixelCard({ color, title, children }: { color: RGB4; title: string; children: ReactNode }) {
  return <article className="color-pixel-card"><h5>{title}</h5><div className="pixel-swatch" style={{ backgroundColor: colorCSS(color) }} aria-label={`色：赤${color[0]}、緑${color[1]}、青${color[2]}`} /><div className="pixel-values">{channels.map((channel, i) => <div key={channel}><b>{channel}</b><code>{colorBits(color[i])}</code><span>{color[i]}/15</span></div>)}</div>{children}</article>;
}

export function ColorMaskLab() {
  const [source, setSource] = useState<RGB4>(initialPixel);
  const [mask, setMask] = useState<RGB4>([0, 0, 0]);
  const [operation, setOperation] = useState<ColorOperation>('OR');
  const [mission, setMission] = useState(0);
  const [run, setRun] = useState<Run | null>(null);
  const [photoRun, setPhotoRun] = useState<Run | null>(null);
  const [photo, setPhoto] = useState<PhotoData | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [selected, setSelected] = useState<{ x: number; y: number } | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const originalCanvas = useRef<HTMLCanvasElement>(null);
  const outputCanvas = useRef<HTMLCanvasElement>(null);
  const info = missions[mission];

  useEffect(() => {
    let active = true;
    const image = new window.Image();
    image.onload = () => {
      if (!active) return;
      const canvas = document.createElement('canvas');
      canvas.width = 240; canvas.height = Math.round(240 * image.height / image.width);
      const ctx = canvas.getContext('2d');
      if (!ctx) { setPhotoError(true); return; }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < data.data.length; i += 4) {
        const rgb = quantizeRGB(data.data[i], data.data[i + 1], data.data[i + 2]);
        rgb.forEach((value, channel) => { data.data[i + channel] = value * 17; });
      }
      setPhoto({ pixels: data.data, width: canvas.width, height: canvas.height });
    };
    image.onerror = () => { if (active) setPhotoError(true); };
    image.src = classroomPhoto.src;
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!photo) return;
    [originalCanvas.current, outputCanvas.current].forEach((canvas, index) => {
      if (!canvas) return;
      canvas.width = photo.width; canvas.height = photo.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const pixels = new Uint8ClampedArray(photo.pixels);
      if (index === 1 && photoRun) {
        for (let i = 0; i < pixels.length; i += 4) {
          const result = maskColor([pixels[i] / 17, pixels[i + 1] / 17, pixels[i + 2] / 17], photoRun.mask, photoRun.operation);
          result.forEach((value, channel) => { pixels[i + channel] = value * 17; });
        }
      }
      ctx.putImageData(new ImageData(pixels, photo.width, photo.height), 0, 0);
    });
  });

  function invalidate() { setRun(null); setPhotoRun(null); }
  function toggleBit(channel: number, bit: number) {
    setMask(previous => previous.map((value, i) => i === channel ? value ^ (1 << (3 - bit)) : value) as unknown as RGB4);
    invalidate();
  }
  function execute() {
    const result = maskColor(source, mask, operation);
    setRun({ source, result, mask, operation }); setPhotoRun(null);
    if (colorMissionMet(mission, source, result)) setDone(previous => previous.includes(mission) ? previous : [...previous, mission]);
  }
  function selectPhotoPixel(x: number, y: number) {
    if (!photo) return;
    const px = Math.max(0, Math.min(photo.width - 1, x));
    const py = Math.max(0, Math.min(photo.height - 1, y));
    const offset = (py * photo.width + px) * 4;
    setSource([photo.pixels[offset] / 17, photo.pixels[offset + 1] / 17, photo.pixels[offset + 2] / 17]);
    setSelected({ x: px, y: py }); invalidate();
  }
  const success = run && colorMissionMet(mission, run.source, run.result);
  return <section className="color-mask-lab" aria-labelledby="color-mask-title">
    <p className="logic-step-label">COLOR MASK STUDIO</p><h4 id="color-mask-title">実際のプログラムでは、なぜマスクを使う？</h4>
    <p>1画素の色を変え、その操作を写真の全画素にも広げてみよう。ここでは<strong>赤・緑・青が各4ビット、合計12ビット</strong>。各成分は0〜15、4096色の学習用モデルです。</p>
    <div className="color-missions" aria-label="色のマスク演習">{missions.map((item, index) => <button type="button" key={item.title} aria-pressed={mission === index} onClick={() => { setMission(index); invalidate(); }}><small>演習{index + 1}{done.includes(index) ? ' ✓' : ''}</small>{item.title}</button>)}</div>
    <div className="color-studio-workspace">
      <div className="color-visual-zone">
        <div className="color-pixel-comparison">
          <PixelCard title="元の1画素（拡大）" color={source}>
            <div className="photo-practice"><b><span>実践演習 1</span>写真から1画素を選ぶ</b><div className="photo-pixel-selector"><canvas ref={originalCanvas} tabIndex={0} role="button" aria-label="元の写真から画素を選ぶ。クリック、または矢印キーで移動" onClick={event => { if (!photo) return; const rect = event.currentTarget.getBoundingClientRect(); selectPhotoPixel(Math.floor((event.clientX - rect.left) / rect.width * photo.width), Math.floor((event.clientY - rect.top) / rect.height * photo.height)); }} onKeyDown={event => { if (!photo || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); const point = selected ?? { x: Math.floor(photo.width / 2), y: Math.floor(photo.height / 2) }; selectPhotoPixel(point.x + (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0), point.y + (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0)); }} />{selected && photo && <i className="selected-photo-pixel" style={{ left: `${(selected.x + .5) / photo.width * 100}%`, top: `${(selected.y + .5) / photo.height * 100}%` }} />}</div><small>{selected ? `選択中（${selected.x}, ${selected.y}）` : '写真を押すと、その画素を上に表示'}</small></div>
          </PixelCard>
          <span className="pixel-arrow" aria-hidden="true">→</span>
          <PixelCard title={run ? '実行後の1画素（拡大）' : '実行後の1画素（実行待ち）'} color={run?.result ?? source}>
            <div className="photo-practice"><b><span>実践演習 2</span>同じマスクを全画素へ</b><canvas ref={outputCanvas} role="img" aria-label={photoRun ? `${photoRun.operation}で全画素を変えた写真` : 'まだマスクを適用していない写真'} /><button type="button" disabled={!run || !photo} onClick={() => setPhotoRun(run)}>写真全体に実行</button></div>
          </PixelCard>
        </div>
        <div className="pixel-source-controls"><span>{selected ? '写真の1画素を入力中' : '練習用の1画素を入力中'}</span><button type="button" onClick={() => { setSource(initialPixel); setSelected(null); invalidate(); }}>練習色に戻す</button>{run && <button type="button" onClick={() => { setSource(run.result); setSelected(null); invalidate(); }}>結果をもう一度使う</button>}</div>
        <p className="photo-mask-status" role="status">{photoError ? '写真を読み込めませんでした。1画素の実験は続けられます。' : !photo ? '写真を読み込み中…' : photoRun ? `${photoRun.operation}・${photoRun.mask.map(colorBits).join(' ')}を${photo.width * photo.height}画素へ適用しました。` : '実践1で画素を選び、演習後に実践2で写真全体へ広げよう。'}</p>
      </div>
      <div className="color-control-zone">
        <div className="color-goal"><strong>{info.title}</strong><span>{info.goal}</span><b>達成 {done.length}/4</b></div>
        <div className="color-operations" aria-label="色に使う論理演算">{(['AND', 'OR', 'XOR'] as const).map(item => <button type="button" key={item} aria-pressed={operation === item} onClick={() => { setOperation(item); invalidate(); }}><b>{item}</b><small>{item === 'AND' ? '0で消す' : item === 'OR' ? '1にする' : '1で反転'}</small></button>)}</div>
        <div className="color-mask-bits">{channels.map((channel, i) => <fieldset key={channel}><legend>{channel}</legend><div>{[0, 1, 2, 3].map(bit => <button type="button" key={bit} className={mask[i] & (1 << (3 - bit)) ? 'mask-one' : 'mask-zero'} aria-label={`${channel}のマスク、${[8, 4, 2, 1][bit]}の位`} aria-pressed={!!(mask[i] & (1 << (3 - bit)))} onClick={() => toggleBit(i, bit)}><small>{[8, 4, 2, 1][bit]}</small>{colorBits(mask[i])[bit]}</button>)}</div><output>{colorBits(mask[i])} = {mask[i]}</output></fieldset>)}</div>
        <button type="button" className="color-execute" onClick={execute}>1画素に実行・答え合わせ</button>
        <div className={`color-feedback ${run ? success ? 'is-correct' : 'is-wrong' : ''}`} role="status">{run ? <><b>{success ? '✓ 達成！' : '× もう一度。色とビットを比べよう。'}</b><span>{run.operation}：{run.mask.map(colorBits).join(' ')} → RGB {run.result.join('・')}</span><span>{run.operation === 'XOR' ? '1の位置だけ反転。同じマスクを2回使うと元に戻ります。' : run.operation === 'OR' ? '1の位置を1にし、元が1なら変わりません。' : '0の位置を0にし、1の位置は元を残します。'}</span></> : '演算と12個のマスクを決めて実行しよう。'}</div>
        <details className="color-hint" key={mission}><summary>ヒント・操作例</summary><p>{info.hint}</p><button type="button" onClick={() => { setOperation(info.operation); setMask(info.mask); invalidate(); }}>操作例をセット</button></details>
      </div>
    </div>
    {done.length === 4 && <p className="color-all-complete">✓ 4つの演習を達成！ 小さなビット操作が、画像全体の色の変更につながりました。</p>}
  </section>;
}
