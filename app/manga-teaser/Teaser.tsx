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
  { name: '入力装置さん', en: 'INPUT', image: input, color: '#ffc06b' },
  { name: '制御装置くん', en: 'CONTROL', image: control, color: '#86baff' },
  { name: '演算装置くん', en: 'ARITHMETIC', image: arithmetic, color: '#d2a5ff' },
  { name: '主記憶ちゃん', en: 'MEMORY', image: memory, color: '#91e9b6' },
  { name: '出力装置くん', en: 'OUTPUT', image: output, color: '#ff9fab' },
];
const panels = [page1, page3, page5];
const assets = [...cast.map(c => c.image.src), ...panels.map(p => p.src)];
const duration = 32;
export default function Teaser() {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
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
    let last = performance.now();
    const tick = (now: number) => {
      position.current = Math.min(duration, position.current + (now - last) / 1000);
      last = now; setTime(position.current);
      if (position.current >= duration) setPlaying(false); else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const hide = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', hide);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', hide); };
  }, [playing]);
  const seek = (value: number) => { position.current = value; setTime(value); };
  const toggle = () => { if (!ready) return; if (position.current >= duration) seek(0); setPlaying(p => !p); };
  const index = Math.min(4, Math.max(0, Math.floor((time - 3) / 2)));
  const person = cast[index];
  const panelIndex = Math.min(2, Math.max(0, Math.floor((time - 23.5) / (3.5 / 3))));
  const local = (time - 3) % 2;
  const motion = reduced ? 0 : Math.min(1, local / .45);
  const group = <div className="teaser-cast">{cast.map(c => <div key={c.en} style={{ backgroundImage: `url("${c.image.src}")` }} />)}</div>;
  return <main className="teaser-page">
    <div className={`teaser-player ${playing ? 'is-playing' : ''}`} ref={player}>
      <div className="teaser-screen" role="img" aria-label="こちら、電脳ワークス！ 漫画化告知映像">
        <div className="teaser-grain" />
        {time < 3 && <section className="teaser-scene teaser-intro">{group}<div className="teaser-center"><p className="teaser-eyebrow">SPECIAL ANNOUNCEMENT</p><h1>大人気<span>５大装置キャラクター</span></h1><i /></div></section>}
        {time >= 3 && time < 13 && <section className="teaser-scene teaser-character" style={{ '--accent': person.color } as CSSProperties}>
          <div className="teaser-number">0{index + 1}</div><div className="teaser-stripe" />
          <div className="teaser-portrait" style={{ backgroundImage: `url("${person.image.src}")`, transform: `translateX(${(1-motion)*12}%) scale(${1 + Math.max(0,local)*.025})`, opacity: reduced ? 1 : Math.max(.15,motion) }} />
          <div className="teaser-name"><p>{person.en}</p><h2>{person.name}</h2><i /></div>
        </section>}
        {time >= 13 && time < 14.7 && <section className="teaser-scene teaser-center teaser-anticipation">ついに</section>}
        {time >= 15.5 && time < 19.5 && <section className="teaser-scene teaser-reveal">{group}<div className="teaser-center" style={{ transform: `scale(${reduced ? 1 : 1 + .18 * Math.max(0, 1-(time-15.5)/.35)})` }}><p className="teaser-eyebrow">THE STORY BEGINS.</p><h2>漫画化決定！</h2><i /></div></section>}
        {time >= 19.5 && time < 21.5 && <section className="teaser-scene teaser-center teaser-credit">原作・監修：呉桂一</section>}
        {time >= 21.5 && time < 23.5 && <section className="teaser-scene teaser-center teaser-credit teaser-credit-long">脚本・作画：GPT-6 Astra L/M</section>}
        {time >= 23.5 && time < 27 && <section className="teaser-scene teaser-preview"><div style={{ backgroundImage: `url("${panels[panelIndex].src}")`, backgroundPosition: `center ${panelIndex === 0 ? 8 : panelIndex === 1 ? 35 : 16}%`, transform: `scale(${reduced ? 1 : 1.03 + ((time-23.5)%(3.5/3))*.045})` }} /><span>制作中の漫画より</span></section>}
        {time >= 27 && time < 30 && <section className="teaser-scene teaser-center teaser-title"><p className="teaser-eyebrow">DENNO WORKS</p><h2>こちら、電脳ワークス！</h2><i /><p className="teaser-volume">Vol.1 「放課後、フリーズ」</p></section>}
        {time >= 30 && <section className="teaser-scene teaser-center teaser-ending"><h2>Coming soon...</h2><p>©呉桂一 w/ Astra</p></section>}
        {!playing && time === 0 && <div className="teaser-start"><button disabled={!ready} onClick={toggle}>{error ? '読み込みエラー' : ready ? '▶ 特報を再生' : '画像を読み込み中…'}</button><span>32秒 / 映像のみ</span></div>}
      </div>
      <div className="teaser-controls">
        <button disabled={!ready} onClick={toggle}>{playing ? '一時停止' : time >= duration ? 'もう一度再生' : '再生'}</button>
        <button disabled={!ready} onClick={() => { seek(0); setPlaying(true); }}>最初から</button>
        <input aria-label="再生位置（秒）" type="range" min="0" max={duration} step="0.05" value={time} disabled={!ready} onChange={e => seek(Number(e.target.value))} />
        <span>{Math.floor(time).toString().padStart(2,'0')} / 32</span>
        <button onClick={async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await player.current?.requestFullscreen(); } catch { setError('このブラウザーでは全画面表示を利用できません。'); } }}>全画面</button>
      </div>
    </div>
    <footer className="teaser-footer"><span>こちら、電脳ワークス！</span><span>VOL.1 — SPECIAL TEASER</span></footer>
    {error && <p className="teaser-error" role="alert">{error} {!ready && <button onClick={() => { setError(''); setAttempt(a => a+1); }}>再読み込み</button>}</p>}
  </main>;
}

