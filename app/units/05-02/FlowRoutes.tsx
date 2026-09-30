'use client';
import {useEffect,useState,type CSSProperties} from 'react';
import {Section,Frame,Guide,Notice} from './Parts';
import {RoutingExperience} from './RoutingExperience';

const people=[{id:'A',name:'Aさん',wish:'メールを送る',to:'メールサーバ'},{id:'B',name:'Bさん',wish:'資料を印刷する',to:'プリンター'},{id:'C',name:'Cさん',wish:'Webページを見る',to:'Webサーバ'}] as const;
const contents:Record<string,{text:string;direction:'out'|'back'}>={A1:{text:'宛先と件名',direction:'out'},A2:{text:'メール本文',direction:'out'},A3:{text:'受付の返事',direction:'back'},B1:{text:'印刷設定',direction:'out'},B2:{text:'印刷データ',direction:'out'},B3:{text:'完了の返事',direction:'back'},C1:{text:'ページ要求',direction:'out'},C2:{text:'HTML',direction:'back'},C3:{text:'画像',direction:'back'}};
const circuit=['A1','A2','A3','B1','B2','B3','C1','C2','C3'];
const packet=['A1','B1','C1','A2','B2','C2','A3','B3','C3'];
const attachmentIds=Array.from({length:6},(_,i)=>`A2-${i+1}`);
for(const [i,id] of attachmentIds.entries())contents[id]={text:`添付 ${i+1}/6`,direction:'out'};
function order(mode:'circuit'|'packet',attachment:boolean){if(!attachment)return mode==='circuit'?circuit:packet;return mode==='circuit'?['A1',...attachmentIds,'A3','B1','B2','B3','C1','C2','C3']:['A1','B1','C1',attachmentIds[0],'B2','C2',attachmentIds[1],'B3','C3',...attachmentIds.slice(2),'A3']}
const laneY=(id:string)=>id==='A'?'19%':id==='B'?'50%':'81%';
function SharingScene({mode,onMode,attachment,onAttachment}:{mode:'circuit'|'packet';onMode:(v:'circuit'|'packet')=>void;attachment:boolean;onAttachment:(v:boolean)=>void}){
 const [step,setStep]=useState(0),[arrived,setArrived]=useState(0),[moving,setMoving]=useState(false);
 const slots=order(mode,attachment),max=slots.length,active=step>arrived?slots[step-1]:null,done=slots.slice(0,arrived),aEnd=attachment?8:3,bEnd=aEnd+3;
 const focus=mode==='circuit'?(active?.[0]|| (arrived===0||arrived===aEnd||arrived===bEnd||arrived===max?'':arrived<aEnd?'A':arrived<bEnd?'B':'C')):'all';
 const occupancy=mode==='packet'?'3人で交代して使用':focus?`${focus}さんが使用中`:arrived===max?'全員終了 · 回線が空いた':arrived===0?'3人が送信待ち · 回線は空き':`${arrived===aEnd?'A':'B'}さんが手放した · 回線は空き`;
 useEffect(()=>{if(!moving)return;const timer=setTimeout(()=>{setArrived(step);setMoving(false)},2050);return()=>clearTimeout(timer)},[moving,step]);
 const next=()=>{if(moving||step>=max)return;setStep(v=>v+1);setMoving(true)};
 const back=()=>{if(moving||step===0)return;setStep(v=>v-1);setArrived(v=>v-1)};
 const cargoStyle=active?({'--lane-y':laneY(active[0])} as CSSProperties):undefined;
 return <Frame id="sharing-lab" title="1本の回線を、3人がどう使う？" controls={<><button disabled={step===0||moving} onClick={back}>← 戻る</button><button className="in-primary" disabled={moving||step===max} onClick={next}>次へ →</button><span className="in-counter">{arrived} / {max} 個到着</span></>}>
  <div className="in-buttons in-sharing-switch"><button aria-pressed={mode==='circuit'} onClick={()=>onMode('circuit')}>回線交換 · 1人が占有</button><button aria-pressed={mode==='packet'} onClick={()=>onMode('packet')}>パケット交換 · 交代</button><button className="in-attachment-toggle" aria-pressed={attachment} onClick={()=>onAttachment(!attachment)}>{attachment?'📎 添付ファイルあり · Aの箱6個':'📎 Aのメールに添付ファイルを付ける'}</button></div>
  <p className="in-small">3人とも送信待ち。{attachment?'Aさんは添付を6箱に分けて送ります。':'Aさんに添付を付けると箱が増えます。'} 左は送る箱、右の青い箱は相手が後から作る返事です。</p>
  <div className="in-flow-visual in-forked-flow"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{people.map((x,i)=><g key={x.id}><path d={`M27 ${17+i*33} L44 50`} className={mode==='packet'||focus===x.id?'is-sharing-active':''}/><path d={`M56 50 L73 ${17+i*33}`} className={mode==='packet'||focus===x.id?'is-sharing-active':''}/></g>)}<path d="M44 50 L56 50" className={focus?'is-sharing-active in-common-trunk':'in-common-trunk'}/></svg>
   <div className="in-flow-people"><div>{people.map(x=><div key={x.id} className={`in-flow-person from-${x.id.toLowerCase()}`}><b>{x.name}</b><small>{x.wish}</small><span className="in-flow-queue">{(x.id==='A'&&attachment?['A1',...attachmentIds]:[`${x.id}1`,`${x.id}2`]).map(id=><em key={id} className={done.includes(id)?'is-gone':''}>{id} {contents[id].text}</em>)}</span><span className="in-return-queue">{done.filter(id=>id[0]===x.id&&contents[id].direction==='back').map(id=><em key={id}>{id} {contents[id].text} ✓</em>)}</span><strong className="in-flow-finish">{mode==='circuit'&&arrived>=(x.id==='A'?aEnd:x.id==='B'?bEnd:max)?'終了 · 回線を手放した':attachment&&x.id==='A'?'':'送信待ち'}</strong></div>)}</div><div className="in-flow-trunk"><b>共通回線</b><small>{occupancy}</small></div><div>{people.map(x=>{const sent=done.filter(id=>id[0]===x.id&&contents[id].direction==='out'),readyReply=sent.length===(x.id==='A'&&attachment?7:2)||x.id==='C'&&sent.length===1;return <div key={x.id} className={`in-flow-person from-${x.id.toLowerCase()}`}><b>{x.to}</b><span className="in-flow-queue">{sent.map(id=><em key={id}>{id} {contents[id].text} ✓</em>)}</span><span className="in-return-queue">{readyReply&&Object.entries(contents).filter(([id,v])=>id[0]===x.id&&v.direction==='back'&&!done.includes(id)).map(([id,v])=><em key={id}>{id} {v.text} · 返事待ち</em>)}</span></div>})}</div></div>
   {active&&<div key={`${mode}-${step}`} className={`in-flow-moving ${contents[active].direction==='back'?'is-return':''} from-${active[0].toLowerCase()}`} style={cargoStyle}><b>{active}</b><small>{contents[active].text}</small></div>}
  </div>
  <div className="in-slots in-nine-slots">{slots.map((id,i)=><span key={id} className={i<arrived?`from-${id[0].toLowerCase()} ${i===arrived-1?'current-slot':''}`:'future-slot'}>{i<arrived?id:'·'}</span>)}</div>
  <div className="in-flow-outcomes"><div><b>Aさんがメールを終える</b><span>{attachment?'占有なら8番目 ／ 交代なら14番目':'占有なら3番目 ／ 交代なら7番目'}</span></div><div><b>B・Cが初めて送る</b><span>{attachment?'占有なら9・12番目 ／ 交代なら2・3番目':'占有なら4・7番目 ／ 交代なら2・3番目'}</span></div></div>
  <Notice title={mode==='circuit'?'回線交換：使用後に回線を手放す':'パケット交換：箱ごとに交代'}>{moving&&active?`${active}「${contents[active].text}」が回線を移動中。着いてから相手側に残ります。`:step===max?`${max}個が順に到着。帰りのデータも同じ回線を逆向きに通りました。`:mode==='circuit'?focus?`${focus}さんが使用中。返事まで終えたら共通回線を次の人へ渡します。`:arrived===0?'3人が送るのを待っています。「次へ」でAさんの箱から流そう。':'前の人が回線を手放しました。「次へ」で次の人が使えます。':'共通回線を3人で共有し、送る箱を1個ずつ交代します。'}</Notice>
 </Frame>;
}
function Sharing(){const [mode,setMode]=useState<'circuit'|'packet'>('circuit'),[attachment,setAttachment]=useState(false);return <SharingScene key={`${mode}-${attachment}`} mode={mode} onMode={setMode} attachment={attachment} onAttachment={setAttachment}/>}

export function FlowRoutes(){return <Section id="routes" n={6} title="回線を分け、次の道を選ぶ" blank="通信の比較" page="p.135"><p className="in-lead">3人の箱を同じ回線に流し、経路を調べる会話とWeb要求の道を追おう。</p><Sharing/><RoutingExperience/><Guide mood="understood"><b>番号が分かっても、届く道が必要。</b><p>DNSで名前から宛先IPを調べ、ルータは宛先IPと経路表を比べて次の道を選びます。</p></Guide></Section>}
