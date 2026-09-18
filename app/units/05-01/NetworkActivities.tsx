'use client';
import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import teacher from '@/public/mascots/teacher-praise.png';
import understood from '@/public/mascots/student-understood.png';
import celebrating from '@/public/mascots/student-celebrating.png';
import { terms } from './networkModel';
function Heading({n,title,sub,children}:{n:number;title:string;sub:string;children?:ReactNode}) {return <><div className="net-kicker"><span>{n}</span><p>{sub}</p></div><div className="net-heading"><h2>{title}</h2>{children}</div></>;}
function Guide({children}:{children:ReactNode}) {return <aside className="net-guide compact"><Image src={teacher} alt="学びを案内する先生のマスコット"/><div>{children}</div></aside>;}
export { NetworkLab, ServerLab, ProtocolLab } from './NetworkExperience';
const quickQuestions=[
 {section:1,text:'校内ファイルは開くのに、外部のWebはどれも開かない。次に調べる場所は？',choices:['校外への回線・ルータ','画面の明るさ','ファイルの文字色'],answer:0,reason:'校内通信ができたので、次は外への経路を確認しよう。'},
 {section:3,text:'違う機器同士でも依頼の意味が伝わるために、共有するものは？',choices:['同じ本体の色','通信の取り決め（プロトコル）','同じ画面サイズ'],answer:1,reason:'書く場所や意味などの取り決めを、送る側と受け取る側で共有する。'},
 {section:3,text:'TCPで①と③だけ届いた。欠けた②を届けるためにすることは？',choices:['順序を無視する','画面を明るくする','確認応答などをもとに再送する'],answer:2,reason:'順序番号や確認応答などで欠落を見つけ、送信側が再送する。'},
];
export function Checkpoint(){
 const [answers,setAnswers]=useState<(number|null)[]>([null,null,null]);const answered=answers.filter(a=>a!==null).length,correct=answers.filter((a,i)=>a===quickQuestions[i].answer).length,complete=correct===3;
 return <section id="checkpoint" className="net-section"><Heading n={4} title="3問で、データの旅を振り返ろう" sub="CHECKPOINT · プリント07"/><details className="net-note"><summary>プリントの重要語を確認する</summary><p>緑の数字はWebページの学習番号1〜3です。</p><div className="net-terms">{[1,2,3].map(section=><div key={section}>{terms.filter(t=>t.section===section).map(t=><details key={t.name}><summary><span>{section}</span><b>{t.name}</b></summary><p>{t.detail}</p></details>)}</div>)}</div></details><div className="quick-check net-panel"><div className="net-stats"><span>回答済み<b>{answered}</b></span><span>正解<b>{correct}</b></span><span>残り<b>{3-answered}</b></span><span>正答率<b>{answered?Math.round(correct/answered*100):0}%</b></span></div><div className="quick-grid">{quickQuestions.map((q,i)=><fieldset key={i}><legend><span>問{i+1}</span>{q.text}</legend><div>{q.choices.map((choice,j)=><button key={j} aria-pressed={answers[i]===j} onClick={()=>setAnswers(old=>old.map((v,k)=>k===i?j:v))}>{choice}</button>)}</div><p role="status" className={answers[i]===null?'':answers[i]===q.answer?'right':'wrong'}>{answers[i]===null?'選ぶと結果と理由が出るよ。':answers[i]===q.answer?`✓ 正解！ ${q.reason}`:'× もう一度。体験したデータの流れを思い出そう。'}</p></fieldset>)}</div><button onClick={()=>setAnswers([null,null,null])}>解答をリセット</button></div><div className={`net-finale ${complete?'complete':''}`}><Image src={complete?celebrating:understood} alt={complete?'全問正解を喜ぶ生徒':'学びを振り返る生徒'}/><div aria-live="polite"><span className="eyebrow">MISSION {complete?'COMPLETE':'CHECK'}</span><h3>{complete?'✓ 全3問正解！':'データの旅を、自分の言葉で。'}</h3><p>機器をつなぐ → 依頼を送る → ルールに従って届ける。</p></div></div><Guide><b>最初の疑問に戻ろう。</b><p>「Wi-Fi接続済み」だけでWebが開くとは限らない。校内の通信はできる？ 別のWebサイトは開ける？ 結果を根拠に、次に調べる場所を説明してみよう。</p></Guide></section>;
}
