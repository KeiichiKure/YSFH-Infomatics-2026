'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import thinking from '@/public/mascots/student-thinking.png';
import understood from '@/public/mascots/student-understood.png';
import celebrating from '@/public/mascots/student-celebrating.png';
import praise from '@/public/mascots/teacher-praise.png';
import { sections, terms, circled } from './lessonData';

export function Guide({ children, mood = 'thinking' }: { children: ReactNode; mood?: 'thinking' | 'understood' | 'celebrating' | 'praise' }) {
  return <aside className="cm-guide"><Image src={{ thinking, understood, celebrating, praise }[mood]} alt={{ thinking: '考える生徒', understood: '気づいた生徒', celebrating: '喜ぶ生徒', praise: '先生' }[mood]} /><div>{children}</div></aside>;
}
export function Section({ number, question, children }: { number: number; question: string; children: ReactNode }) {
  const s = sections[number - 1];
  return <section id={s.id} className="cm-section"><div className="cm-kicker"><span>{number}</span><p>体験して、理由を説明しよう</p><small>教科書 {s.page}</small></div><div className="cm-heading"><h2>{s.title}</h2><span className="cm-print"><small>プリント10</small><b>{s.blanks}</b></span></div><p className="cm-question">{question}</p>{children}<Terms number={number} /></section>;
}
export function Terms({ number }: { number: number }) {
  return <div className="cm-terms"><h3>この体験から、プリントへ</h3><p>丸数字はプリントの空欄番号です。</p><div className="cm-term-grid">{terms.filter(t => t.sectionNumber === number).map(t => <article key={t.id} data-worksheet-blanks={t.worksheetBlanks.join(',')}><div className="cm-term-title"><h4>{t.term}</h4>{t.worksheetBlanks.length > 0 && <span className="cm-blank">プリント {t.worksheetBlanks.map(circled).join('・')}</span>}</div><p>{t.definition}</p><p className="cm-example">体験では：{t.example}</p></article>)}</div></div>;
}
export function Frame({ id, title, children, controls }: { id: string; title: string; children: ReactNode; controls?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return <div id={id} className="cm-frame" ref={ref}><header><h3>{title}</h3><button type="button" onClick={() => ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>画面に合わせる</button></header><div className="cm-body">{children}</div>{controls && <footer aria-label={`${title}の操作`}>{controls}</footer>}</div>;
}
export function usePlayer(max: number) {
  const [step, setStep] = useState(0), [playing, setPlaying] = useState(false);
  useEffect(() => { if (!playing || step >= max) return; const timer = window.setTimeout(() => setStep(s => Math.min(max, s + 1)), 2200); return () => clearTimeout(timer); }, [step, playing, max]);
  return { step, playing: playing && step < max, move: (d: number) => { setPlaying(false); setStep(s => Math.max(0, Math.min(max, s + d))); }, reset: () => { setPlaying(false); setStep(0); }, toggle: () => { if (step === max) { setStep(0); setPlaying(true); } else setPlaying(v => !v); } };
}
export function Player({ player, max }: { player: ReturnType<typeof usePlayer>; max: number }) {
  return <><button type="button" disabled={!player.step} onClick={() => player.move(-1)}>← 戻る</button><button type="button" className="cm-primary" onClick={player.toggle}>{player.playing ? '一時停止' : player.step === max ? 'もう一度再生' : '自動で再生'}</button><button type="button" disabled={player.step === max} onClick={() => player.move(1)}>{player.step === 0 ? '始める' : '次へ →'}</button><span className="cm-counter">{player.step + 1} / {max + 1}</span><button type="button" onClick={player.reset}>最初へ</button></>;
}
export function Feedback({ children, state = 'waiting' }: { children: ReactNode; state?: 'waiting' | 'good' | 'bad' }) {
  return <div className={`cm-feedback is-${state}`} role="status" aria-live="polite">{children}</div>;
}
export function Note({ title, children }: { title: string; children: ReactNode }) { return <details className="cm-note"><summary>{title}</summary><div>{children}</div></details>; }
export function Person({ label, active = false }: { label: string; active?: boolean }) {
  return <div className={`cm-person ${active ? 'is-active' : ''}`}><span className="cm-person-icon" aria-hidden="true"><i /></span><b>{label}</b></div>;
}
export function useAnswers(length: number) {
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(length).fill(null));
  return { answers, set: (i: number, result: boolean) => setAnswers(a => a.map((v, k) => k === i ? result : v)), reset: () => setAnswers(Array(length).fill(null)) };
}
export function Stats({ answers }: { answers: (boolean | null)[] }) {
  const answered = answers.filter(a => a !== null).length, correct = answers.filter(a => a === true).length;
  return <div className="cm-stats" aria-label="学習の進み具合">{[['回答済み', `${answered}/${answers.length}`], ['正解', `${correct}/${answers.length}`], ['残り', String(answers.length - answered)], ['正答率', answered ? `${Math.round(correct / answered * 100)}%` : '—']].map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>;
}
export function Celebration({ text = '根拠を確かめて、すべて判断できました。' }: { text?: string }) {
  return <div className="cm-celebration" role="status"><Image src={celebrating} alt="喜ぶ生徒のマスコット" /><div><b>✓ 全問正解！</b><p>{text}</p></div></div>;
}
