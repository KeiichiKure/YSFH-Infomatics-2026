'use client';
import {useState,useEffect,useRef,type ReactNode} from 'react';
import Image from 'next/image';
import thinking from '@/public/mascots/student-thinking.png';
import understood from '@/public/mascots/student-understood.png';
import celebrating from '@/public/mascots/student-celebrating.png';
import praise from '@/public/mascots/teacher-praise.png';
import {terms} from './model';

export function Guide({children,mood='thinking'}:{children:ReactNode;mood?:'thinking'|'understood'|'celebrating'|'praise'}) {
  return <div className="in-guide"><Image src={{thinking,understood,celebrating,praise}[mood]} alt={{thinking:'考える生徒',understood:'気づいた生徒',celebrating:'喜ぶ生徒',praise:'先生'}[mood]} /><div>{children}</div></div>;
}
export function Section({id,n,title,blank,page,children}:{id:string;n:number;title:string;blank:string;page:string;children:ReactNode}) {
  return <section id={id} className="in-section"><div className="in-kicker"><span>{n}</span><p>体験して、しくみをつかもう</p><small>教科書 {page}</small></div><div className="in-heading"><h2>{title}</h2><span className="in-badge"><small>プリント08</small><b>{blank}</b></span></div>{children}</section>;
}
export function Terms({section,showBlanks=true}:{section:number;showBlanks?:boolean}) {
  return <div className="in-terms"><h3>この体験から、プリントへ</h3><p>{showBlanks?'丸数字はプリントの空欄番号です。':'数値の答えを覚えるより、用語と計算のしかたを確認しよう。'}</p><div className="in-term-grid">{terms.filter(t=>t[3]===section).map(t=><article key={t[0]} data-print-blank={t[0]}>{showBlanks&&<b className="in-blank">{t[0]}</b>}<div><h4>{t[1]}</h4><p>{t[2]}</p></div></article>)}</div></div>;
}
export function usePlayer(max:number) {
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false);
  useEffect(()=>{if(!playing||step>=max)return;const t=setTimeout(()=>setStep(s=>Math.min(max,s+1)),2400);return()=>clearTimeout(t)},[playing,step,max]);
  return {step,playing:playing&&step<max,reset:()=>{setStep(0);setPlaying(false)},move:(n:number)=>{setPlaying(false);setStep(s=>Math.max(0,Math.min(max,s+n)))},toggle:()=>{if(step===max){setStep(0);setPlaying(true)}else setPlaying(p=>!p)}};
}
export function Player({p,max}:{p:ReturnType<typeof usePlayer>;max:number}) {
  return <><button onClick={()=>p.move(-1)} disabled={!p.step}>← 戻る</button><button className="in-primary" onClick={p.toggle}>{p.playing?'一時停止':p.step===max?'もう一度再生':'自動で再生'}</button><button onClick={()=>p.move(1)} disabled={p.step===max}>次へ →</button><span className="in-counter">{p.step+1} / {max+1}</span><button onClick={p.reset}>最初へ</button></>;
}
export function Frame({id,title,children,controls}:{id:string;title:string;children:ReactNode;controls?:ReactNode}) {
  const ref=useRef<HTMLDivElement>(null);
  return <div id={id} className="in-frame" ref={ref}><header><h3>{title}</h3><button className="in-fit" onClick={()=>ref.current?.scrollIntoView({block:'start',behavior:'smooth'})}>画面に合わせる</button></header>{controls&&<div className="in-controls" role="group" aria-label={`${title}の操作`}>{controls}</div>}<div className="in-body">{children}</div></div>;
}
export function Notice({title,children}:{title:string;children:ReactNode}) { return <div className="in-notice" role="status"><b>{title}</b><p>{children}</p></div>; }
export function Details({title,children}:{title:string;children:ReactNode}) { return <details className="in-details"><summary>{title}</summary><div>{children}</div></details>; }
export function Device({kind='pc',label,sub,active=false,children}:{kind?:'pc'|'router'|'server'|'cloud';label:string;sub?:string;active?:boolean;children?:ReactNode}) {
  return <div className={`in-device ${active?'is-active':''}`}><svg viewBox="0 0 100 70" aria-hidden="true">{kind==='pc'?<><rect x="12" y="5" width="76" height="47" rx="5"/><path d="M7 60h86l-7-8H14Z M45 53v7M55 53v7"/><path className="in-screen" d="M20 13h60v30H20Z"/></>:kind==='router'?<><path d="M20 38V8M80 38V8"/><rect x="7" y="35" width="86" height="27" rx="6"/><path d="M18 48h9m8 0h9m8 0h9m8 0h9"/></>:kind==='server'?<><rect x="22" y="4" width="56" height="61" rx="6"/><path d="M30 18h32m-32 14h32m-32 14h32"/><circle cx="65" cy="56" r="3"/></>:<path d="M22 57C-1 51 7 25 25 25 26 2 61-2 69 20 94 13 107 51 82 57Z"/>}</svg><b>{label}</b>{sub&&<code>{sub}</code>}{children}</div>;
}
