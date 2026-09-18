'use client';
import type {FlowStep} from './experienceModel';
export function HopRoute({s,server,request}:{s:FlowStep;server:string;request:string}){
 const names=['端末','スイッチングハブ','学校ルータ','校外ルータ',server];const reverse=s.response&&!s.ack;const order=reverse?[4,3,2,1,0]:[0,1,2,3,4];const active=s.side==='wire'?order[s.hop??0]:s.side==='client'?0:4;
 return <div className={`hop-route ${reverse?'reverse':''}`} aria-label="端末からサーバまでの経路"><div className="hop-stations">{names.map((name,i)=><div className={active===i?'active':''} key={i}><span aria-hidden="true">{i===0?'▣':i===1?'▤':i===4?'▥':'⇄'}</span><b>{name}</b></div>)}</div><div className="hop-track"><span key={`${s.title}-${s.hop}-${s.response}`} style={{left:`${active*22+6}%`}}>{s.ack?'確認応答':(s.lost||s.received.length===2&&!s.title.includes('再送'))?'①　②×　③':s.title.includes('再送')||s.title==='②が端末へ届く'?'② 再送':s.response?'①②③':request}</span></div><small>イーサネットの有線LAN ／ ハブは中継、ルータでMACを交換</small></div>
}
