'use client';

import { useEffect, useRef } from 'react';

const width = 480;
const height = 280;

// All frames share the house, tree and ground. Only the sky,
// person and bird vary; pixel comparison also includes erasing their old positions.
function drawFrame(context: CanvasRenderingContext2D, frame: number) {
  const evening = frame >= 8;
  context.fillStyle = evening ? '#e99a72' : '#bfe7ef';
  context.fillRect(0, 0, width, 208);
  context.fillStyle = evening ? '#efc28b' : '#bfe7ef';
  context.fillRect(0, 150, width, 58);
  context.fillStyle = '#81ba70';
  context.fillRect(0, 208, width, 72);

  context.fillStyle = '#fff5dd';
  context.fillRect(54, 138, 128, 70);
  context.strokeStyle = '#203e39';
  context.lineWidth = 4;
  context.strokeRect(56, 140, 124, 66);
  context.fillStyle = '#d77758';
  context.beginPath();
  context.moveTo(43, 138);
  context.lineTo(118, 83);
  context.lineTo(193, 138);
  context.closePath();
  context.fill();
  context.fillStyle = '#875b38';
  context.fillRect(400, 165, 16, 43);
  context.fillStyle = '#287968';
  context.beginPath();
  context.ellipse(408, 128, 33, 57, 0, 0, Math.PI * 2);
  context.fill();

  const personX = 70 + frame * 25;
  context.fillStyle = '#203e39';
  context.beginPath();
  context.arc(personX, 220, 8, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#d77758';
  context.beginPath();
  context.roundRect(personX - 11, 229, 22, 31, [10, 10, 4, 4]);
  context.fill();

  if (frame >= 3) {
    const birdX = 441 - (frame - 3) * 45;
    const birdY = 44 + (frame % 3) * 5;
    context.strokeStyle = '#203e39';
    context.lineWidth = 4;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(birdX - 14, birdY);
    context.quadraticCurveTo(birdX - 7, birdY - 9, birdX, birdY + 3);
    context.quadraticCurveTo(birdX + 7, birdY - 9, birdX + 14, birdY);
    context.stroke();
  }
}

function framePixels(frame: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  drawFrame(context, frame);
  return context.getImageData(0, 0, width, height);
}

export function VideoDifferenceScene({ frame }: { frame: number }) {
  const playback = useRef<HTMLCanvasElement>(null);
  const difference = useRef<HTMLCanvasElement>(null);
  const changeMarkers = frame === 1 ? [] : [
    { kind: 'restore', label: '1', x: 70 + (frame - 1) * 25, y: 239, dx: -28, dy: -23 },
    { kind: 'draw', label: '2', x: 70 + frame * 25, y: 239, dx: 28, dy: -23 },
    ...(frame > 3 ? [{ kind: 'restore', label: '1', x: 441 - (frame - 4) * 45, y: 44 + ((frame - 1) % 3) * 5, dx: 0, dy: 28 }] : []),
    ...(frame >= 3 ? [{ kind: 'draw', label: '2', x: 441 - (frame - 3) * 45, y: 44 + (frame % 3) * 5, dx: 0, dy: 28 }] : []),
  ];

  useEffect(() => {
    const playbackContext = playback.current?.getContext('2d');
    const differenceContext = difference.current?.getContext('2d');
    const keyframe = framePixels(1);
    if (!playbackContext || !differenceContext || !keyframe) return;
    const reconstructed = new ImageData(new Uint8ClampedArray(keyframe.data), width, height);
    let delta = keyframe;
    // Rebuild from the keyframe, applying only changed pixels at each step.
    // A transparent delta pixel means “leave the previous pixel unchanged”.
    for (let nextFrame = 2; nextFrame <= frame; nextFrame += 1) {
      const next = framePixels(nextFrame);
      if (!next) return;
      delta = new ImageData(width, height);
      for (let offset = 0; offset < next.data.length; offset += 4) {
        if (next.data[offset] === reconstructed.data[offset]
          && next.data[offset + 1] === reconstructed.data[offset + 1]
          && next.data[offset + 2] === reconstructed.data[offset + 2]) continue;
        for (let channel = 0; channel < 4; channel += 1) {
          delta.data[offset + channel] = next.data[offset + channel];
          reconstructed.data[offset + channel] = next.data[offset + channel];
        }
      }
    }
    playbackContext.putImageData(reconstructed, 0, 0);
    differenceContext.putImageData(delta, 0, 0);
  }, [frame]);

  return <div className="keyframe-compare">
    <div className="video-scene-frame">
      <span>{frame === 1 ? 'フレーム1：キーフレーム' : `復元した画面 ${frame}${frame === 8 ? '：夕方へ' : ''}`}</span>
      <canvas ref={playback} width={width} height={height} role="img" aria-label={`フレーム${frame}の復元画面。家と木はそのまま残り、${frame >= 8 ? '夕方の空と昼から続く緑の地面' : '昼の背景'}に人${frame >= 3 ? 'と鳥' : ''}がいる。`} />
      <p>{frame === 1 ? '最初の画面を丸ごと保存' : '前の画面に、差分のある場所だけを上書き'}</p>
    </div>
    <i aria-hidden="true">←</i>
    <div className="video-scene-frame is-difference">
      <span>{frame === 1 ? '保存するもの：全体' : `フレーム${frame}で保存する差分`}</span>
      <div className="video-canvas-stack"><canvas ref={difference} width={width} height={height} role="img" aria-label={frame === 1 ? '家と木を含む全体を保存。' : `1は移動前の場所を背景色に戻す変更。2は移動先の${frame >= 3 ? '人と鳥' : '人'}。2人・2羽を保存しているのではありません。家・木・緑の地面は更新しません。`} />
        {frame > 1 && <svg className="difference-markers" viewBox="0 0 480 280" aria-hidden="true">{changeMarkers.map(({ kind, label, x, y, dx, dy }, index) => <g className={`is-${kind}`} key={index}><path d={`M${x},${y} L${x + dx},${y + dy}`} /><circle cx={x + dx} cy={y + dy} r="12" /><text x={x + dx} y={y + dy + 5}>{label}</text></g>)}</svg>}
      </div>
      {frame > 1 && <div className="difference-marker-key"><span><b>1</b> 移動前を背景色に戻す</span><span><b>2</b> 移動先の姿を描く</span><small>番号と線は説明用です。保存データには含みません。</small></div>}
      <p>{frame === 1 ? 'キーフレームには家・木も含む' : frame === 8 ? '家・木・地面は網目＝上書きしない' : '移動先と、移動前の場所の変化だけ'}</p>
    </div>
  </div>;
}
