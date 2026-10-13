'use client';
import {Fragment,useState} from 'react';
import {projects} from './lessonData';
import {rankProjects} from './designModels';
import {Frame,KeyText} from './LessonParts';
import {SequenceQuiz,type Question} from './SequenceQuiz';
export const latchLabels=['Location｜ロケーション（位置）','Alphabet｜アルファベット（五十音）','Time｜時間','Category｜カテゴリー（分野）','Hierarchy｜階層（待ち時間が短い順）'];
const missions=[['「光の工作」の名前を知っている。どの並び方が探しやすい？',1,'五十音順なら「ひ」から企画名を探せます。'],['今、1階にいる。近くの企画を探すなら？',0,'ロケーションなら1階の企画を同じまとまりで探せます。'],['14時以降に始まる企画を探すなら？',2,'時間順なら14時以降の企画が続けて並びます。'],['自分で試せる体験企画を探すなら？',3,'カテゴリーなら「体験」に絞って探せます。'],['待ち時間が最も短いものから候補を見たいなら？',4,'階層（待ち時間が短い順）なら順位と数値を比べられます。']] as const;
type Project=typeof projects[number];
const kana=(p:Project)=>p.reading[0]<='お'?'あ行':p.reading[0]<='こ'?'か行':p.reading[0]<='そ'?'さ行':p.reading[0]<='ど'?'た行':p.reading[0]<='ぽ'?'は行':p.reading[0]<='も'?'ま行':'ら行';
export function LatchView({mode,compact=false}:{mode:number;compact?:boolean}){
 let order=rankProjects(compact?projects.slice(0,4):projects,mode);if(mode===0)order=order.sort((a,b)=>b.floor-a.floor);
 const group=(p:Project)=>mode===0?`${p.floor}階`:mode===1?kana(p):mode===2?p.time<'12:00'?'10時〜（午前）':p.time<'15:00'?'12時〜（昼以降）':'15時〜':mode===3?`${p.category}のグループ`:p.wait<=10?'ほとんど待たない（0〜10分）':p.wait<=30?'待ち時間が長い（11〜30分）':'とても長い（31分〜）';
 const fields=mode===2?['開始','企画名','よみ','階','種類','待ち時間']:mode===4?['待ち時間','企画名','よみ','階','開始','種類']:['企画名','よみ','階','開始','種類','待ち時間'];
 return <div className="id-latch-complete"><h4>文化祭の企画一覧 {compact?'（4件抜粋）':'（全12件・架空）'}</h4><table className={`id-data-table id-latch-table mode-${mode}`}><thead><tr>{fields.map(f=><th key={f}>{f}</th>)}</tr></thead><tbody>{order.map((p,i)=>{const start=i===0||group(order[i-1])!==group(p);return <Fragment key={p.name}>{start&&(mode===2||mode===4)&&<tr className="id-latch-band"><th colSpan={6}>{group(p)}</th></tr>}<LatchRow project={p} fields={fields} group={start&&mode!==2&&mode!==4?group(p):''}/></Fragment>;})}</tbody></table></div>;
}
function LatchRow({project:p,group,fields}:{project:Project;group:string;fields:string[]}){
 const values:Record<string,string>={'企画名':p.name,'よみ':p.reading,'階':`${p.floor}階`,'開始':p.time,'種類':p.category,'待ち時間':`${p.wait}分`};
 return <tr data-project={p.name} className={group?'id-group-start':''}>{fields.map((field,i)=>i===0?<th key={field} data-field={field==='階'?'場所':field}>{group&&<span className="id-group-label">{group}</span>}<span>{values[field]}</span></th>:<td key={field} data-field={field==='階'?'場所':field}>{values[field]}</td>)}</tr>;
}
const quiz:Question[]=missions.map(([prompt,correct,why],i)=>({prompt,correct,options:latchLabels,optionKeys:['L','A','T','C','H'],why:latchLabels.map((_,j)=>j===correct?why:`${['ロケーションは場所でまとめる方法。','アルファベットは名前の文字順で並べる方法。','時間は時刻の順で並べる方法。','カテゴリーは種類でまとめる方法。','階層は大きさや順位などで並べる方法。'][j]} 探す人が知っていること・調べたいことを読み直して、もう一度選ぼう。`),visual:<div className="id-evidence-card"><span>文化祭の企画を探す人</span><h4>{['企画名を知っている','今いる場所から探す','これから始まる企画','興味のある種類','待たずに参加したい'][i]}</h4><p>{prompt}</p><p className="id-compact">5つの選択肢は L・A・T・C・H。手法の頭文字から考えよう。</p></div>}));
export function LatchLab(){const [mode,setMode]=useState(0);return <><Frame id="latch-overview" title="LATCH（ラッチ）で分けてみよう"><div className="id-latch-tabs" role="group" aria-label="LATCHの5観点">{latchLabels.map((label,i)=><button key={label} type="button" aria-pressed={mode===i} onClick={()=>setMode(i)}><b>{'LATCH'[i]}</b><span>{label.split('｜')[0]}</span><small>{label.split('｜')[1]}</small></button>)}</div><p className="id-compact"><KeyText>{['ロケーション：3階を上、1階を下に置く。近くの企画を探す。','アルファベット：五十音順。あ行・か行…を手がかりに名前を探す。','時間：開始時刻が早い順に、一列で並べる。','カテゴリー：展示・体験・発表を、枠で分ける。','階層：この例は待ち時間が短い順。順位を付けて比較する。'][mode]}</KeyText></p><LatchView mode={mode}/><p className="id-compact"><KeyText>構造化では、同じ情報の並びとまとまりを変えます。12件の名前・場所・時間・種類・待ち時間は、すべての表示で同じです。</KeyText></p></Frame><SequenceQuiz id="latch-quiz" title="探す人に合うLATCHは？ 5問チェック" questions={quiz}/></>;}
