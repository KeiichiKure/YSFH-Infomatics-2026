'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import input from '@/public/images/03-01-mascot-input.png';
import control from '@/public/images/03-01-mascot-control.png';
import arithmetic from '@/public/images/03-01-mascot-arithmetic.png';
import memory from '@/public/images/03-01-memory-centered.png';
import output from '@/public/images/03-01-mascot-output.png';
import page1 from '@/public/images/manga-teaser/page-01.png';
import page3 from '@/public/images/manga-teaser/page-03.png';
import page5 from '@/public/images/manga-teaser/page-05.png';
const cast = [
  { name: '入力装置さん', en: 'INPUT', role: ['文字も、写真も、音も。', '外からのデータを受け取る窓口。'], image: input, color: '#ffc06b' },
  { name: '制御装置くん', en: 'CONTROL', role: ['命令を読み取り、みんなに指示。', '処理の順番を導く司令塔。'], image: control, color: '#86baff' },
  { name: '演算装置くん', en: 'ARITHMETIC', role: ['計算も、大小の比較も。', 'データを処理する計算のエース。'], image: arithmetic, color: '#d2a5ff' },
  { name: '主記憶ちゃん', en: 'MEMORY', role: ['今使うデータとプログラムを記憶。', '作業を支える、一時的な置き場所。'], image: memory, color: '#91e9b6' },
  { name: '出力装置くん', en: 'OUTPUT', role: ['処理した結果を、画面や音に。', 'コンピュータの答えを外へ届ける。'], image: output, color: '#ff9fab' },
];
const panels = [page1, page3, page5];
const assets = [...cast.map(c => c.image.src), ...panels.map(p => p.src)];
const duration = 50;
const scoreUrl = `${input.src.split('/_next/')[0]}/audio/manga-teaser/denno-works-score.wav?v=original-restored`;
export default function Teaser() {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [reduced, setReduced] = useState(false);
  const position = useRef(0);
  const player = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;

    Promise.all(assets.map(src => new Promise<void>((resolve, reject) => {
      const img = new window.Image(); img.onload = () => resolve(); img.onerror = reject; img.src = src;
    }))).then(() => { if (active) { setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches); setReady(true); setError(''); } }).catch(() => { if (active) setError('画像を読み込めませんでした。再読み込みしてください。'); });
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    if (!playing) return;
    let frame: number;

    const tick = () => {
      position.current = Math.min(duration, audio.current?.currentTime ?? 0);
      setTime(position.current);
      if (position.current >= duration) setPlaying(false); else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const hide = () => { if (document.hidden) { audio.current?.pause(); setPlaying(false); } };
    document.addEventListener('visibilitychange', hide);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', hide); };
  }, [playing]);
  const seek = (value: number) => { position.current = value; if (audio.current) audio.current.currentTime = value; setTime(value); };
  const start = async (restart = false) => {
    if (!ready || !audioReady || !audio.current) return;
    if (restart || position.current >= duration) seek(0);
    try { await audio.current.play(); setPlaying(true); setError(''); }
    catch { setError('音声を再生できませんでした。もう一度「再生」を押してください。'); }
  };
  const toggle = () => { if (playing) { audio.current?.pause(); setPlaying(false); } else void start(); };
  const index = Math.min(4, Math.max(0, Math.floor((time - 3) / 5)));
  const person = cast[index];
  const panelIndex = Math.min(2, Math.max(0, Math.floor((time - 41) / (4 / 3))));
  const local = Math.max(0, (time - 3) % 5);
  const reverse = index % 2 === 1;
  const motion = reduced ? 1 : 1 - Math.pow(1 - Math.min(1, local / .7), 3);
  const group = <div className="teaser-cast">{cast.map(c => <div key={c.en} style={{ backgroundImage: `url("${c.image.src}")` }} />)}</div>;
  return <main className="teaser-page">
    <audio ref={audio} src={scoreUrl} preload="auto" muted={muted} onCanPlayThrough={() => setAudioReady(true)} onEnded={() => { seek(duration); setPlaying(false); }} onError={() => setError('音声を読み込めませんでした。ページを再読み込みしてください。')} />
    <div className={`teaser-player ${playing ? 'is-playing' : ''}`} ref={player}>
      <div className="teaser-screen" role="img" aria-label="こちら、電脳ワークス！ 漫画化告知映像">
        <div className="teaser-grain" />
        {time < 3 && <section className="teaser-scene teaser-intro">{group}<div className="teaser-center"><p className="teaser-eyebrow">SPECIAL ANNOUNCEMENT</p><h1>大人気<span>５大装置キャラクター</span></h1><i /></div></section>}
        {time >= 3 && time < 28 && <section className={`teaser-scene teaser-character ${reverse ? 'is-reversed' : ''}`} style={{ '--accent': person.color } as CSSProperties}>
          <div className="teaser-number">0{index + 1}</div><div className="teaser-stripe" />
          <div className="teaser-portrait" style={{ backgroundImage: `url("${person.image.src}")`, transform: `translateX(${(1-motion)*20*(reverse ? -1 : 1)}%) scale(${1 + (reduced ? 0 : local*.012)})`, opacity: reduced ? 1 : Math.max(.15,motion) }} />
          <div className="teaser-name" style={{ transform: `translateX(${(1-motion)*18*(reverse ? 1 : -1)}%)`, opacity: motion }}><p>{person.en}</p><h2>{person.name}</h2><i /><div className="teaser-role">{person.role.map(line => <span key={line}>{line}</span>)}</div></div>
        </section>}
        {time >= 28 && time < 30.1 && <section className="teaser-scene teaser-center teaser-anticipation">ついに</section>}
        {time >= 31 && time < 36 && <section className="teaser-scene teaser-reveal">{group}<div className="teaser-center" style={{ transform: `scale(${reduced ? 1 : 1 + .18 * Math.max(0, 1-(time-31)/.35)})` }}><p className="teaser-eyebrow">THE STORY BEGINS.</p><h2>漫画化決定！</h2><i /></div></section>}
        {time >= 36 && time < 38.5 && <section className="teaser-scene teaser-center teaser-credit">原作・監修：呉桂一</section>}
        {time >= 38.5 && time < 41 && <section className="teaser-scene teaser-center teaser-credit teaser-credit-long">脚本・作画：GPT-6 Astra L/M</section>}
        {time >= 41 && time < 45 && <section className="teaser-scene teaser-preview"><div style={{ backgroundImage: `url("${panels[panelIndex].src}")`, backgroundPosition: `center ${panelIndex === 0 ? 8 : panelIndex === 1 ? 35 : 16}%`, transform: `scale(${reduced ? 1 : 1.03 + ((time-41)%(4/3))*.045})` }} /><span>制作中の漫画より</span></section>}
        {time >= 45 && time < 48 && <section className="teaser-scene teaser-center teaser-title"><p className="teaser-eyebrow">DENNO WORKS</p><h2>こちら、電脳ワークス！</h2><i /><p className="teaser-volume">Vol.1 「放課後、フリーズ」</p></section>}
        {time >= 48 && <section className="teaser-scene teaser-center teaser-ending"><h2>Coming soon...</h2><p>©呉桂一 w/ Astra</p></section>}
        {!playing && time === 0 && <div className="teaser-start"><button disabled={!ready || !audioReady} onClick={toggle}>{error ? '読み込みエラー' : ready && audioReady ? '▶ 特報を再生' : '映像と音楽を準備中…'}</button><span>50秒 / 音楽・効果音あり</span></div>}
      </div>
      <div className="teaser-controls">
        <button disabled={!ready || !audioReady} onClick={toggle}>{playing ? '一時停止' : time >= duration ? 'もう一度再生' : '再生'}</button>
        <button disabled={!ready || !audioReady} onClick={() => void start(true)}>最初から</button>
        <input aria-label="再生位置（秒）" type="range" min="0" max={duration} step="0.05" value={time} disabled={!ready || !audioReady} onChange={e => seek(Number(e.target.value))} />
        <span>{Math.floor(time).toString().padStart(2,'0')} / 50</span>
        <button aria-pressed={muted} onClick={() => setMuted(m => !m)}>{muted ? '音声 OFF' : '音声 ON'}</button>
        <button onClick={async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await player.current?.requestFullscreen(); } catch { setError('このブラウザーでは全画面表示を利用できません。'); } }}>全画面</button>
      </div>
    </div>
    <footer className="teaser-footer"><span>こちら、電脳ワークス！</span><span>VOL.1 — SPECIAL TEASER</span></footer>
    {error && <p className="teaser-error" role="alert">{error} {!ready && <button onClick={() => { setError(''); setAttempt(a => a+1); }}>再読み込み</button>}</p>}
  </main>;
}



