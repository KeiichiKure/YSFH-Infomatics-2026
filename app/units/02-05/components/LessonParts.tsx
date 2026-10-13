'use client';
import Image from 'next/image';
import { Fragment,cloneElement,isValidElement,useEffect,useRef,useState,type ReactNode,type ReactElement } from 'react';
import thinking from '@/public/mascots/student-thinking.png';
import understood from '@/public/mascots/student-understood.png';
import celebrating from '@/public/mascots/student-celebrating.png';
import praise from '@/public/mascots/teacher-praise.png';
import { sections, terms } from './lessonData';

export function Guide({ children, mood = 'thinking' }: { children: ReactNode; mood?: 'thinking' | 'understood' | 'celebrating' | 'praise' }) {
  return <aside className="id-guide"><Image src={{ thinking, understood, celebrating, praise }[mood]} alt={{ thinking: '考える生徒', understood: '気づいた生徒', celebrating: '喜ぶ生徒', praise: '先生' }[mood]} /><div>{markText(children)}</div></aside>;
}
export function Section({ n, lead, children }: { n: number; lead: string; children: ReactNode }) {
  const s = sections[n - 1];
  return <section id={s.id} className="id-section"><div className="id-kicker"><span>{n}</span><p>体験して、理由をつかもう</p><small>教科書 {s.page}</small></div><div className="id-heading"><h2>{s.title}</h2><span className="id-print"><small>プリント11</small><b>{s.blanks}</b></span></div><p className="id-lead"><KeyText>{lead}</KeyText></p>{children}<Terms n={n} /></section>;
}
export function Terms({ n }: { n: number }) {
  const selected = terms.filter(t => t.sectionNumber === n || n === 1 && ['可視化', '構造化', '抽象化'].includes(t.term));
  return <div className="id-terms"><h3>この体験から、プリントへ</h3><p className="id-small">丸数字はプリントの空欄番号です。</p><div className="id-term-grid">{selected.map(t => <article key={t.id}>{t.worksheetBlanks.length > 0 && <span className="id-blank"><small>プリント</small>{t.worksheetBlanks.join('・')}</span>}<div><h4>{t.term}</h4><p><KeyText>{t.definition}</KeyText></p><p className="id-example">例では：<KeyText>{t.example}</KeyText></p></div></article>)}</div></div>;
}
export function Frame({ id, title, children, footer, note }: { id: string; title: string; children: ReactNode; footer?: ReactNode; note?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return <div className="id-frame" id={id} ref={ref}><header><h3>{title}</h3><button type="button" className="id-fit" onClick={() => ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>画面に合わせる</button></header>{children}{note && <p className="id-small id-frame-note">{note}</p>}{footer && <footer className="id-player">{footer}</footer>}</div>;
}
export function Feedback({ title, children, tone = 'wait', example }: { title: string; children: ReactNode; tone?: 'wait' | 'good' | 'bad' | 'neutral'; example?: ReactNode }) {
  return <div className={`id-feedback ${tone}`} role="status">{title.startsWith('✓ 全問正解')&&<Image className="id-celebration" src={celebrating} alt="全問正解を喜ぶ生徒" width={32} height={40}/>}<strong>{title}</strong><p>{typeof children === 'string' ? <KeyText>{children}</KeyText> : children}</p>{example}</div>;
}
export function KeyText({children}:{children:string}) {
  const keys=[...new Set([...terms.map(t=>t.term),'ちらばり','散らばり','ベン図','状態遷移図','フローチャート','カテゴリー','ロケーション','アルファベット','階層','時系列','割合','比較'])].sort((a,b)=>b.length-a.length);
  const patterns=keys.map(k=>k==='表'?'(?<![発代公])表(?![現示題記すし情])':k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  return <>{children.split(new RegExp(`(${patterns.join('|')})`,'g')).map((s,i)=>keys.includes(s)?<b className="id-keyword" key={i}>{s}</b>:s)}</>;
}
export function Tabs({ labels, value, onChange, label }: { labels: readonly string[]; value: number; onChange: (i: number) => void; label: string }) {
  return <div className="id-tabs" role="group" aria-label={label}>{labels.map((text, i) => <button type="button" key={text} aria-pressed={value === i} onClick={() => onChange(i)}>{text}</button>)}</div>;
}
export function Choice({ question, options, correct, explanations, onAnswer }: { question: string; options: readonly string[]; correct: number; explanations: readonly string[]; onAnswer?: (answer: number | null) => void }) {
  const [answer, setAnswer] = useState<number | null>(null);
  const choose=(value:number|null)=>{setAnswer(value);onAnswer?.(value);};
  return <div className="id-choice"><h4>{question}</h4><div className="id-options">{options.map((o, i) => <button type="button" key={o} aria-pressed={answer === i} onClick={() => choose(i)}><span>{'ABCDEF'[i]}</span>{o}</button>)}</div><Feedback tone={answer === null ? 'wait' : answer === correct ? 'good' : 'bad'} title={answer === null ? '図を根拠に選ぼう' : answer === correct ? '✓ 正解！' : '× もう一度考えよう'}>{answer === null ? '選ぶと、理由を確認できます。' : explanations[answer]}</Feedback><button className="id-text-button" type="button" onClick={() => choose(null)}>回答を消す</button></div>;
}
export function usePlayer(max: number) {
  const [step, setStep] = useState(0), [playing, setPlaying] = useState(false);
  useEffect(() => { if (!playing || step >= max) return; const t = setTimeout(() => setStep(s => Math.min(max, s + 1)), 2300); return () => clearTimeout(t); }, [playing, step, max]);
  return { step, playing: playing && step < max, move: (n: number) => { setPlaying(false); setStep(s => Math.max(0, Math.min(max, s + n))); }, reset: () => { setStep(0); setPlaying(false); }, toggle: () => { if (step >= max) { setStep(0); setPlaying(true); } else setPlaying(p => !p); } };
}
export function Player({ p, max }: { p: ReturnType<typeof usePlayer>; max: number }) {
  return <><button type="button" disabled={p.step === 0} onClick={() => p.move(-1)}>← 戻る</button><button type="button" onClick={p.toggle}>{p.playing ? '一時停止' : p.step === max ? 'もう一度再生' : '自動で再生'}</button><button type="button" disabled={p.step === max} onClick={() => p.move(1)}>{p.step === 0 ? '始める' : '次へ →'}</button><span>{p.step + 1} / {max + 1}</span><button type="button" onClick={p.reset}>最初へ</button></>;
}
function markText(node:ReactNode):ReactNode {
  if(typeof node==='string')return <KeyText>{node}</KeyText>;
  if(Array.isArray(node))return node.map((child,i)=><Fragment key={i}>{markText(child)}</Fragment>);
  if(isValidElement(node)&&typeof node.type==='string'&&(/^(h[1-6]|button|label|summary|b|strong)$/.test(node.type)))return node;
  if(isValidElement(node)&&node.type!==KeyText){const element=node as ReactElement<{children?:ReactNode}>;return element.props.children===undefined?node:cloneElement(element,{children:markText(element.props.children)});}
  return node;
}
export function Note({ title, children }: { title: string; children: ReactNode }) { return <details className="id-note"><summary>{title}</summary><div>{markText(children)}</div></details>; }
