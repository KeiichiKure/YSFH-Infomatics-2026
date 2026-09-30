'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import Image from 'next/image';
import thinking from '@/public/mascots/student-thinking.png';
import understood from '@/public/mascots/student-understood.png';
import celebrating from '@/public/mascots/student-celebrating.png';
import praise from '@/public/mascots/teacher-praise.png';
import {terms} from './model';

export function Guide({children,mood='thinking'}:{children:ReactNode;mood?:'thinking'|'understood'|'celebrating'|'praise'}){
  const images={thinking,understood,celebrating,praise};
  const labels={thinking:'考える生徒',understood:'気づいた生徒',celebrating:'喜ぶ生徒',praise:'先生'};
  return <div className="in-guide"><Image src={images[mood]} alt={labels[mood]}/><div>{children}</div></div>;
}
export function Section({id,n,title,blank,page,children}:{id:string;n:number;title:string;blank:string;page:string;children:ReactNode}){
  return <section id={id} className="in-section"><div className="in-kicker"><span>{n}</span><p>見て、動かして、理由を説明しよう</p><small>教科書 {page}</small></div><div className="in-heading"><h2>{title}</h2><span className="in-badge"><small>プリント09</small><b>{blank}</b></span></div>{children}</section>;
}
export function Terms({section}:{section:number}){
  return <div className="in-terms"><h3>この体験から、プリントへ</h3><p>丸数字はプリント09の空欄番号です。</p><div className="in-term-grid">{terms.filter(t=>t[3]===section).map(([blank,term,detail])=><article key={blank} data-print-blank={blank}><b className="in-blank">{blank}</b><div><h4>{term}</h4><p>{detail}</p></div></article>)}</div></div>;
}
export function Frame({title,id,children,controls}:{title:string;id:string;children:ReactNode;controls?:ReactNode}){
  const ref=useRef<HTMLDivElement>(null);
  return <div className="in-frame" id={id} ref={ref}><header><h3>{title}</h3><button className="in-fit" type="button" onClick={()=>ref.current?.scrollIntoView({block:'start',behavior:'smooth'})}>画面に合わせる</button></header>{controls&&<div className="in-controls" role="group" aria-label={`${title}の操作`}>{controls}</div>}<div className="in-body">{children}</div></div>;
}
export function Notice({title,children}:{title:string;children:ReactNode}){return <div className="in-notice" role="status"><b>{title}</b><p>{children}</p></div>}
export function useSteps(max:number){
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false);
  useEffect(()=>{if(!playing||step>=max)return;const timer=window.setTimeout(()=>setStep(s=>Math.min(max,s+1)),3000);return()=>window.clearTimeout(timer)},[playing,step,max]);
  return {step,playing:playing&&step<max,move:(delta:number)=>{setPlaying(false);setStep(s=>Math.min(max,Math.max(0,s+delta)))},reset:()=>{setPlaying(false);setStep(0)},toggle:()=>{if(step===max){setStep(0);setPlaying(true)}else setPlaying(v=>!v)}};
}
export function StepControls({player,max}:{player:ReturnType<typeof useSteps>;max:number}){
  return <><button type="button" onClick={()=>player.move(-1)} disabled={player.step===0}>← 戻る</button><button type="button" className="in-primary" onClick={()=>player.move(1)} disabled={player.step===max}>次へ →</button><button type="button" onClick={player.toggle}>{player.playing?'一時停止':player.step===max?'もう一度再生':'自動で再生'}</button><span className="in-counter">{player.step+1} / {max+1}</span><button type="button" onClick={player.reset}>最初へ</button></>;
}
