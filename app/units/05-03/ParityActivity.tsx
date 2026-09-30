'use client';
import {useEffect,useState} from 'react';
import {Frame,Notice} from './LessonParts';

type ParityMode='even'|'odd';
const rounds=[
 {data:[1,0,0,1,0,1,1],flips:[] as number[]},
 {data:[1,1,0,1,0,0,0],flips:[3]},
 {data:[0,1,1,0,1,1,0],flips:[1,5]},
 {data:[1,0,1,1,0,0,0],flips:[0]},
];
const modeName=(mode:ParityMode)=>mode==='even'?'偶数パリティ':'奇数パリティ';
const countName=(mode:ParityMode)=>mode==='even'?'偶数':'奇数';
function Bits({bits,compare}:{bits:number[];compare?:number[]}){
 return <div className="s03-parity-bitrow">{bits.map((bit,i)=><span key={i} className={compare?bit===compare[i]?'is-match':'is-different':''}>{bit}</span>)}</div>;
}
export function ParityLab(){
 const [mode,setMode]=useState<ParityMode>('even');
 const [round,setRound]=useState(0);
 const [phase,setPhase]=useState<'choose'|'received'|'result'>('choose');
 const [parityChoice,setParityChoice]=useState<number|null>(null);
 const [decision,setDecision]=useState<'error'|'unknown'|'correct'|null>(null);
 const [completed,setCompleted]=useState<Record<ParityMode,boolean[]>>({even:Array(rounds.length).fill(false),odd:Array(rounds.length).fill(false)});
 const item=rounds[round];
 const dataOnes=item.data.reduce((sum,bit)=>sum+bit,0);
 const targetRemainder=mode==='even'?0:1;
 const parity=(targetRemainder-dataOnes%2+2)%2;
 const sent=[...item.data,parity];
 const received=sent.map((bit,i)=>item.flips.includes(i)?1-bit:bit);
 const ones=received.reduce((sum,bit)=>sum+bit,0);
 const detected=ones%2!==targetRemainder;
 const decisionOK=decision===(detected?'error':'unknown');
 useEffect(()=>{
  if(phase!=='choose'||parityChoice!==parity)return;
  const timer=window.setTimeout(()=>setPhase('received'),1100);
  return()=>window.clearTimeout(timer);
 },[phase,parityChoice,parity]);
 const resetRound=()=>{setPhase('choose');setParityChoice(null);setDecision(null)};
 const changeMode=(nextMode:ParityMode)=>{if(nextMode===mode)return;setMode(nextMode);setRound(0);resetRound()};
 const next=()=>{setRound((round+1)%rounds.length);resetRound()};
 return <Frame id="parity-lab" title="パリティビットを付けて、受信データを調べる">
  <p>7ビットに1ビットを足し、「1」の数を偶数または奇数にそろえます。方式を選んで送信し、受信側で誤りを調べよう。</p>
  <div className="s03-parity-mode" role="group" aria-label="パリティの方式を選ぶ"><b>検査の約束</b>{(['even','odd'] as const).map(value=><button type="button" key={value} aria-pressed={mode===value} onClick={()=>changeMode(value)}>{modeName(value)}</button>)}</div>
  <div className="s03-case-header"><span>{modeName(mode)} · 通信 {round+1}/{rounds.length}　体験済み {completed[mode].filter(Boolean).length}/{rounds.length}</span></div>
  {phase==='choose'?<>
   <div className="s03-parity-side s03-parity-before"><b>送信前の7ビット ＋ 決めるパリティビット</b><div className="s03-parity-bitrow">{item.data.map((bit,i)=><span key={i}>{bit}</span>)}<span className="is-unset">{parityChoice??'？'}</span></div><small>左の7ビットにある「1」は {dataOnes} 個。8ビット全体が{countName(mode)}個になるように選ぼう。</small></div>
   <div className="s03-two-buttons" role="group" aria-label="パリティビットを選ぶ">{[0,1].map(bit=><button type="button" key={bit} aria-pressed={parityChoice===bit} onClick={()=>setParityChoice(bit)}>{bit}</button>)}</div>
   <Notice title={parityChoice===null?'パリティビットはいくつ？':parityChoice===parity?'✓ 正解！ 自動で送信します':'× もう一度数えよう'}>{parityChoice===null?`8ビット全体の「1」が${countName(mode)}個になる値を選ぼう。`:parityChoice===parity?`末尾に${parity}を付けて送信します。`:'「1」の数を数え直してみよう。'}</Notice>
  </>:<>
   <div className="s03-parity-transfer"><div className="s03-parity-side"><b>送信した8ビット</b>{phase==='received'?<div className="s03-hidden-bits" aria-label="送信データは判定するまで隠しています">🔒<strong>判定するまで隠す</strong></div>:<Bits bits={sent} compare={received}/>}</div><div className="s03-parity-arrow" aria-hidden="true">➡</div><div className="s03-parity-side"><b>受信した8ビット</b><Bits bits={received} compare={phase==='result'?sent:undefined}/><small>「1」は{ones}個（{ones%2===0?'偶数':'奇数'}）。約束は{countName(mode)}個。</small></div></div>
   {phase==='result'&&<div className="s03-parity-legend"><span>🟩 同じビット</span><span>🟥 変わったビット</span></div>}
   <p className="s03-parity-question">受信したデータは正しいと言える？</p>
   <div className="s03-options s03-parity-options" role="group" aria-label="受信データの判断">{([['error','誤りを検出した'],['unknown','検出できない。正しさは断定できない'],['correct','正しいと断定できる']] as const).map(([value,label])=><button type="button" key={value} aria-pressed={decision===value} disabled={phase==='result'} onClick={()=>{setDecision(value);setPhase('result');setCompleted(old=>({...old,[mode]:old[mode].map((v,i)=>i===round?true:v)}))}}>{label}</button>)}</div>
   <Notice title={phase==='received'?'パリティだけで判断しよう':decisionOK?'✓ 判断は正しい':'× 判断を見直そう'}>{phase==='received'?`「1」が${countName(mode)}個でも、本当に元どおりかはまだ分かりません。`:<>{detected?`「1」の数が${countName(mode)}個ではないため、誤りを検出しました。`:`「1」の数が${countName(mode)}個なので、この検査では誤りを検出できません。`}<br/><b>送信時と比べると：{item.flips.length===0?'同じで、実際に正しかった':`${item.flips.length}ビット違っていた`}</b>{item.flips.length===2?'。2ビットの反転は約束した偶数・奇数を保つため見逃します。':''}</>}</Notice>
   {phase==='result'&&<button type="button" onClick={next}>{round===rounds.length-1?'最初の通信へ':'次の通信へ'} →</button>}
  </>}
  {completed[mode].every(Boolean)&&<div className="s03-celebrate" role="status">✦ {modeName(mode)}で4通りを体験！ 約束どおりでも正しいとは断定できない ✦</div>}
 </Frame>;
}
